#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';

const baseUrl = process.env.SMOKE_BASE_URL;
const expectedSha = process.env.EXPECTED_COMMIT_SHA || '';
const vercelProtectionBypassSecret = (process.env.VERCEL_AUTOMATION_BYPASS_SECRET || '').trim();

if (!baseUrl) {
  console.error('SMOKE_BASE_URL is required');
  process.exit(1);
}

const rootUrl = new URL('/', baseUrl).toString();
const prototypeUrl = new URL('/prototype', baseUrl).toString();
const personalityPrototypeUrl = new URL('/prototype/personality', baseUrl).toString();
const skillsRouteUrl = new URL('/skills', baseUrl).toString();
const skillsHubUrl = new URL('/skills-hub', baseUrl).toString();
const staticSkillsUrl = new URL('/prototype/skills.html', baseUrl).toString();
const demoUrl = new URL('/demo?demo=1', baseUrl).toString();
const dailyUrl = new URL('/daily', baseUrl).toString();
const versionUrl = new URL('/__version', baseUrl).toString();
const buildUrl = new URL('/__build', baseUrl).toString();
const apiVersionUrl = new URL('/api/version', baseUrl).toString();
const healthUrl = new URL('/api/health', baseUrl).toString();
const unknownApiUrl = new URL('/api/smoke-missing-route', baseUrl).toString();
const isVercelTarget = new URL(baseUrl).hostname.endsWith('.vercel.app');

const secretPatterns = [
  /DATABASE_URL/i,
  /DIRECT_DATABASE_URL/i,
  /GEMINI_API_KEY/i,
  /FIREBASE_PRIVATE_KEY/i,
  /FIREBASE_CLIENT_EMAIL/i,
  /PRIVATE KEY/i,
  /SERVICE_ACCOUNT/i,
  /postgres:\/\//i,
  /postgresql:\/\//i,
  /NEON_API_KEY/i,
  /VERCEL_TOKEN/i,
  /NETLIFY_AUTH_TOKEN/i,
  /@google\/genai/i,
  /GoogleGenAI/i,
];

const requiredShaPatterns = expectedSha
  ? [expectedSha, expectedSha.slice(0, 7)].filter(Boolean)
  : [];

async function fetchText(url) {
  const response = await fetch(url, {
    redirect: 'follow',
    headers: getVercelProtectionHeaders(),
  });
  if (!response.ok) {
    throwIfVercelProtectionBlocked(url, response);
    throw new Error(`Unreachable URL ${url}: ${response.status}`);
  }
  const text = await response.text();
  return { response, text };
}

async function fetchJson(url, expectedStatus = 200) {
  const response = await fetch(url, {
    redirect: 'manual',
    cache: 'no-store',
    headers: getVercelProtectionHeaders(),
  });

  if (response.status !== expectedStatus) {
    throwIfVercelProtectionBlocked(url, response);
    throw new Error(`Unexpected status for ${url}: got ${response.status}, expected ${expectedStatus}`);
  }

  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();
  if (!contentType.toLowerCase().includes('application/json')) {
    throw new Error(`${url} did not return JSON (content-type: ${contentType || 'missing'})`);
  }

  if (/<!doctype\s*html|<html/i.test(text)) {
    throw new Error(`${url} returned the SPA HTML shell instead of API JSON`);
  }

  try {
    return { response, json: JSON.parse(text), text };
  } catch {
    throw new Error(`${url} returned invalid JSON`);
  }
}

function getVercelProtectionHeaders() {
  if (!vercelProtectionBypassSecret) return {};
  return {
    'x-vercel-protection-bypass': vercelProtectionBypassSecret,
  };
}

function throwIfVercelProtectionBlocked(url, response) {
  const hostname = new URL(url).hostname;
  if (!hostname.endsWith('.vercel.app')) return;
  if (response.status !== 401 && response.status !== 403) return;

  throw new Error(
    `${url} is blocked by Vercel Deployment Protection (${response.status}). ` +
    'Set VERCEL_AUTOMATION_BYPASS_SECRET in GitHub/Vercel and expose it to this smoke job, ' +
    'or make the target deployment publicly reachable before verification.'
  );
}

async function fetchClientBundleText(pageText) {
  const scriptSrcs = Array.from(pageText.matchAll(/<script[^>]+src="([^"]+)"/gi)).map((match) => match[1]);
  const assetTexts = await Promise.all(scriptSrcs.map(async (src) => {
    const assetUrl = new URL(src, baseUrl).toString();
    try {
      const { text } = await fetchText(assetUrl);
      return text;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Unable to fetch client asset ${assetUrl}: ${message}`);
    }
  }));
  return assetTexts.join('\n');
}

function getLocalSourceVisibilityText(pageText) {
  if (!pageText.includes('/@vite/client')) return '';
  const paths = [
    'src/App.tsx',
    'src/features/prototype/PrototypeScreen.tsx',
    'src/features/prototype/PersonalityPrototypeScreen.tsx',
    'src/features/skills/SkillsHub.tsx',
  ];
  return paths
    .filter((path) => existsSync(path))
    .map((path) => readFileSync(path, 'utf8'))
    .join('\n');
}

async function getVisibilityText(pageText) {
  const bundleText = await fetchClientBundleText(pageText);

  // Vercel serves a static SPA shell, so smoke verification reads the deployed
  // JavaScript bundle to confirm the visible prototype/skills strings shipped.
  // Local Vite dev serves source modules instead of bundled assets; source text
  // fallback keeps the same smoke script useful for local verification.
  const localSourceText = getLocalSourceVisibilityText(pageText);

  return {
    bundleText,
    visibilityText: `${bundleText}\n${localSourceText}`,
  };
}

function assertNoSecrets(label, text) {
  for (const pattern of secretPatterns) {
    if (pattern.test(text)) {
      throw new Error(`${label} contains potential secret pattern: ${pattern}`);
    }
  }
}

function findChromeExecutable() {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
  ].filter(Boolean);

  return candidates.find((candidate) => {
    return existsSync(candidate);
  });
}

async function runBrowserChecks(checks) {
  let puppeteer;
  try {
    puppeteer = await import('puppeteer');
  } catch {
    checks.push('browser smoke skipped (puppeteer not installed)');
    return;
  }

  const executablePath = findChromeExecutable();
  let browser;
  try {
    browser = await puppeteer.default.launch({
      headless: true,
      ...(executablePath ? { executablePath } : {}),
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unable to launch browser';
    checks.push(`browser smoke skipped (${message.split('\n')[0]})`);
    return;
  }

  try {
    const page = await browser.newPage();
    const vercelProtectionHeaders = getVercelProtectionHeaders();
    if (Object.keys(vercelProtectionHeaders).length > 0) {
      await page.setExtraHTTPHeaders(vercelProtectionHeaders);
    }
    await page.setViewport({ width: 1366, height: 900 });

    await page.goto(skillsHubUrl, { waitUntil: 'load', timeout: 30000 });
    await page.waitForFunction(() => document.body.innerText.includes('Kesher Skills Hub'), { timeout: 15000 });

    const skillsState = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('[data-testid^="skill-card-"]'));
      const countElement = document.querySelector('[data-testid="skills-hub-count"]');
      const declaredCount = Number(countElement?.getAttribute('data-skill-count') || 0);
      const statusBadges = cards
        .map((card) => card.querySelector('[data-skill-status]')?.getAttribute('data-skill-status') || '')
        .filter(Boolean);
      return {
        headingVisible: document.body.innerText.includes('Kesher Skills Hub'),
        declaredCount,
        visibleCards: cards.length,
        plannedCards: statusBadges.filter((status) => status === 'planned').length,
        gatedCards: statusBadges.filter((status) => status === 'gated').length,
        operationalCards: statusBadges.filter((status) => status === 'live' || status === 'prototype').length,
        cardTitles: cards.map((card) => card.querySelector('h3')?.textContent?.trim() || '').filter(Boolean),
        hasLegacyFallbackCopy: /coming soon|implementation is coming soon/i.test(document.body.innerText),
      };
    });

    if (!skillsState.headingVisible) {
      throw new Error('/skills-hub did not render the Kesher Skills Hub heading');
    }
    if (skillsState.declaredCount < 1 || skillsState.visibleCards !== skillsState.declaredCount) {
      throw new Error(`/skills-hub invalid skill count: expected visible cards to match declared count, got ${skillsState.visibleCards}/${skillsState.declaredCount}`);
    }
    if (skillsState.operationalCards < 1 || (
      skillsState.operationalCards + skillsState.gatedCards + skillsState.plannedCards
    ) !== skillsState.visibleCards) {
      throw new Error(`/skills-hub status mismatch: ${skillsState.operationalCards} operational, ${skillsState.gatedCards} gated, ${skillsState.plannedCards} planned`);
    }
    if (skillsState.hasLegacyFallbackCopy) {
      throw new Error('/skills-hub exposed legacy coming-soon fallback copy');
    }
    checks.push(`/skills-hub browser rendered ${skillsState.visibleCards} clickable product skill cards`);

    for (const [index, title] of skillsState.cardTitles.entries()) {
      await page.evaluate((cardIndex) => {
        const cards = Array.from(document.querySelectorAll('[data-testid^="skill-card-"]'));
        const launchButton = cards[cardIndex]?.querySelector('button');
        if (launchButton instanceof HTMLButtonElement) launchButton.click();
      }, index);
      await page.waitForFunction((expectedTitle) => {
        const header = document.querySelector('header h1')?.textContent || '';
        return header.includes(expectedTitle);
      }, { timeout: 15000 }, title);
      const pageState = await page.evaluate(() => ({
        hasLegacyFallbackCopy: /coming soon|implementation is coming soon/i.test(document.body.innerText),
      }));
      if (pageState.hasLegacyFallbackCopy) {
        throw new Error(`Skill page for "${title}" exposed legacy coming-soon fallback copy`);
      }
      await page.evaluate(() => {
        const backButton = document.querySelector('header button');
        if (backButton instanceof HTMLButtonElement) backButton.click();
      });
      await page.waitForFunction(() => document.body.innerText.includes('Kesher Skills Hub'), { timeout: 15000 });
    }
    checks.push(`all ${skillsState.visibleCards} skills opened as app-native skill experiences`);

    await page.goto(prototypeUrl, { waitUntil: 'load', timeout: 30000 });
    await page.waitForSelector('[data-testid="prototype-skills-hub-link"]', { timeout: 15000 });
    await page.waitForSelector('[data-testid="prototype-personality-link"]', { timeout: 15000 });
    checks.push('/prototype browser rendered skills hub link');

    await page.goto(personalityPrototypeUrl, { waitUntil: 'load', timeout: 30000 });
    await page.waitForSelector('[data-testid="personality-prototype-screen"]', { timeout: 15000 });
    await page.click('[data-testid="load-sample-responses"]');
    await page.waitForSelector('[data-testid="private-reflection-output"]', { timeout: 15000 });
    await page.click('[data-testid="create-share-card"]');
    await page.waitForSelector('[data-testid="share-card-created"]', { timeout: 15000 });
    await page.click('[data-testid="open-mutual-reflection"]');
    await page.waitForSelector('[data-testid="mutual-reflection-output"]', { timeout: 15000 });
    const personalityCopySafe = await page.evaluate(() => {
      const text = document.body.innerText;
      return !/compatibility score|soulmate|marriage probability|destiny|personality-based ranking/i.test(text);
    });
    if (!personalityCopySafe) {
      throw new Error('/prototype/personality exposed banned score or destiny language');
    }
    checks.push('/prototype/personality browser flow verified');
  } finally {
    await browser.close();
  }
}

(async () => {
  const checks = [];

  const root = await fetchText(rootUrl);
  checks.push(`root reachable (${root.response.status})`);

  const prototype = await fetchText(prototypeUrl);
  checks.push(`/prototype reachable (${prototype.response.status})`);

  const personalityPrototype = await fetchText(personalityPrototypeUrl);
  checks.push(`/prototype/personality reachable (${personalityPrototype.response.status})`);

  const skillsRoute = await fetchText(skillsRouteUrl);
  checks.push(`/skills reachable (${skillsRoute.response.status})`);

  const skillsHub = await fetchText(skillsHubUrl);
  checks.push(`/skills-hub reachable without auth redirect (${skillsHub.response.status})`);

  const staticSkills = await fetchText(staticSkillsUrl);
  const staticSkillCards = (staticSkills.text.match(/class="skill"/g) || []).length;
  if (staticSkillCards < 1 || !staticSkills.text.includes('/prototype/personality')) {
    throw new Error(`/prototype/skills.html rendered ${staticSkillCards} static skill cards`);
  }
  checks.push(`/prototype/skills.html static bundle exposes ${staticSkillCards} skills`);

  const demo = await fetchText(demoUrl);
  checks.push(`/demo?demo=1 reachable (${demo.response.status})`);

  const daily = await fetchText(dailyUrl);
  checks.push(`/daily deep link reachable (${daily.response.status})`);

  const health = await fetchJson(healthUrl);
  if (health.json.status !== 'ok' || health.json.service !== 'kesher') {
    throw new Error('/api/health returned unexpected JSON payload');
  }
  if (isVercelTarget && health.json.source !== 'vercel-api-function') {
    throw new Error(`/api/health source was ${health.json.source}; expected vercel-api-function`);
  }
  checks.push(`/api/health JSON verified (${health.json.source || 'unknown source'})`);

  const apiVersion = await fetchJson(apiVersionUrl);
  if (apiVersion.json.status !== 'ok' || apiVersion.json.repository !== 'akivagoldstein61-ui/Google-ai-studio-') {
    throw new Error('/api/version did not return deployment metadata');
  }
  if (isVercelTarget && apiVersion.json.source !== 'vercel-api-function') {
    throw new Error(`/api/version source was ${apiVersion.json.source}; expected vercel-api-function`);
  }
  checks.push(`/api/version JSON verified (${apiVersion.json.source || 'unknown source'})`);

  const version = await fetchJson(versionUrl);
  if (version.json.status !== 'ok' || version.json.repository !== 'akivagoldstein61-ui/Google-ai-studio-') {
    throw new Error('/__version did not return deployment metadata');
  }
  if (isVercelTarget && version.json.source !== 'vercel-api-function') {
    throw new Error(`/__version source was ${version.json.source}; expected vercel-api-function`);
  }
  checks.push(`/__version JSON verified (${version.json.source || 'unknown source'})`);

  const build = await fetchJson(buildUrl);
  if (build.json.status !== 'ok' || build.json.repository !== 'akivagoldstein61-ui/Google-ai-studio-') {
    throw new Error('/__build did not return deployment metadata');
  }
  if (isVercelTarget && build.json.source !== 'vercel-api-function') {
    throw new Error(`/__build source was ${build.json.source}; expected vercel-api-function`);
  }
  checks.push(`/__build JSON verified (${build.json.source || 'unknown source'})`);

  const missingApi = await fetchJson(unknownApiUrl, 404);
  if (missingApi.json.source !== 'vercel-api-function' && missingApi.json.source !== 'express-server') {
    throw new Error('/api/* missing route did not return API JSON from a backend handler (expected source vercel-api-function or express-server)');
  }
  checks.push('/api/* fallback JSON verified');

  const { bundleText, visibilityText } = await getVisibilityText(prototype.text);
  if (!visibilityText.includes('/skills') || !visibilityText.includes('Kesher Skills Hub')) {
    throw new Error('/prototype client bundle does not expose the visible Kesher Skills Hub link');
  }
  if (!visibilityText.includes('/prototype/personality') || !visibilityText.includes('IPIP-BFAS 100')) {
    throw new Error('/prototype client bundle does not expose the personality prototype journey');
  }
  if (!visibilityText.includes('Integrated relationship readiness system')) {
    throw new Error('/prototype client bundle does not expose the skills hub surface');
  }
  checks.push('skills hub link and surface verified in client bundle');

  if (requiredShaPatterns.length > 0) {
    const hasSha = requiredShaPatterns.some((sha) => (
      prototype.text.includes(sha) ||
      bundleText.includes(sha) ||
      version.text.includes(sha) ||
      apiVersion.text.includes(sha) ||
      build.text.includes(sha)
    ));
    if (!hasSha) {
      throw new Error(`Deployment metadata does not include expected commit SHA marker (${expectedSha})`);
    }
    checks.push('commit marker verified in deployment metadata');
  }

  // Match rendered HTML attributes (`data-demo-mode=`) and bundled/source code
  // object keys or JSX props (`"data-demo-mode":`) used by local/dev fallback.
  const demoModeMarkerPattern = /data-demo-mode["']?\s*(?:=|:)/i;
  const hasDemoModeMarker = demoModeMarkerPattern.test(demo.text) || demoModeMarkerPattern.test(visibilityText);
  if (!hasDemoModeMarker) {
    throw new Error('/demo?demo=1 did not expose the rendered data-demo-mode marker or its client implementation');
  }
  checks.push('demo mode marker verified');

  assertNoSecrets('root page', root.text);
  assertNoSecrets('prototype page', prototype.text);
  assertNoSecrets('skills route page', skillsRoute.text);
  assertNoSecrets('skills hub page', skillsHub.text);

  await runBrowserChecks(checks);

  console.log('✅ Smoke checks passed');
  for (const item of checks) {
    console.log(`- ${item}`);
  }
})().catch((error) => {
  console.error(`❌ Smoke checks failed: ${error.message}`);
  process.exit(1);
});
