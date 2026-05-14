#!/usr/bin/env node
import { existsSync } from 'node:fs';

const baseUrl = process.env.SMOKE_BASE_URL;
const expectedSha = process.env.EXPECTED_COMMIT_SHA || '';

if (!baseUrl) {
  console.error('SMOKE_BASE_URL is required');
  process.exit(1);
}

const rootUrl = new URL('/', baseUrl).toString();
const prototypeUrl = new URL('/prototype', baseUrl).toString();
const skillsHubUrl = new URL('/skills-hub', baseUrl).toString();
const versionUrl = new URL('/__version', baseUrl).toString();
const apiVersionUrl = new URL('/api/version', baseUrl).toString();
const healthUrl = new URL('/api/health', baseUrl).toString();
const dailyUrl = new URL('/daily', baseUrl).toString();

const secretPatterns = [
  /DATABASE_URL/i,
  /DIRECT_DATABASE_URL/i,
  /GEMINI_API_KEY/i,
  /FIREBASE_PRIVATE_KEY/i,
  /PRIVATE KEY/i,
  /postgres:\/\//i,
  /postgresql:\/\//i,
  /NEON_API_KEY/i,
  /VERCEL_TOKEN/i,
  /NETLIFY_AUTH_TOKEN/i,
];

const requiredShaPatterns = expectedSha
  ? [expectedSha, expectedSha.slice(0, 7)].filter(Boolean)
  : [];

async function fetchText(url) {
  const response = await fetch(url, { redirect: 'follow' });
  if (!response.ok) {
    throw new Error(`Unreachable URL ${url}: ${response.status}`);
  }
  const text = await response.text();
  return { response, text };
}

async function fetchJson(url) {
  const { response, text } = await fetchText(url);
  if (/<!doctype html>/i.test(text)) {
    throw new Error(`${url} returned the SPA HTML shell instead of JSON`);
  }

  try {
    return { response, json: JSON.parse(text), text };
  } catch {
    throw new Error(`${url} did not return valid JSON`);
  }
}

function getModuleScriptUrls(html, fromUrl) {
  const urls = [];
  const scriptPattern = /<script\b[^>]*\bsrc=["']([^"']+\.js(?:\?[^"']*)?)["'][^>]*>/gi;
  let match;

  while ((match = scriptPattern.exec(html)) !== null) {
    urls.push(new URL(match[1], fromUrl).toString());
  }

  return urls;
}

function assertNoSecrets(label, text) {
  for (const pattern of secretPatterns) {
    if (pattern.test(text)) {
      throw new Error(`${label} contains potential secret pattern: ${pattern}`);
    }
  }
}

async function assertBundleContainsMarker(html, fromUrl, marker, label) {
  if (html.includes(marker)) return;

  const scriptUrls = getModuleScriptUrls(html, fromUrl);
  if (scriptUrls.length === 0) {
    throw new Error(`${label} did not expose an app bundle to inspect`);
  }

  const bundles = await Promise.all(
    scriptUrls.map(async (scriptUrl) => ({
      scriptUrl,
      text: (await fetchText(scriptUrl)).text,
    }))
  );

  if (!bundles.some(({ text }) => text.includes(marker))) {
    throw new Error(`${label} bundle is missing marker: ${marker}`);
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
    await page.setViewport({ width: 1366, height: 900 });

    await page.goto(skillsHubUrl, { waitUntil: 'networkidle0', timeout: 30000 });
    await page.waitForFunction(() => document.body.innerText.includes('Kesher Skills Hub'), { timeout: 15000 });

    const skillsState = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('main section.grid > button'));
      const declaredCount = Number(document.body.innerText.match(/(\d+)\s+interconnected capabilities/)?.[1] || 0);
      return {
        headingVisible: document.body.innerText.includes('Kesher Skills Hub'),
        declaredCount,
        visibleCards: cards.length,
        plannedCards: cards.filter((card) => card.querySelector('span')?.textContent?.trim().toLowerCase() === 'planned').length,
        prototypeCards: cards.filter((card) => card.querySelector('span')?.textContent?.trim().toLowerCase() === 'prototype').length,
      };
    });

    if (!skillsState.headingVisible) {
      throw new Error('/skills-hub did not render the Kesher Skills Hub heading');
    }
    if (skillsState.declaredCount < 20 || skillsState.visibleCards !== skillsState.declaredCount) {
      throw new Error(`/skills-hub rendered ${skillsState.visibleCards}/${skillsState.declaredCount} skill cards`);
    }
    checks.push(`/skills-hub browser rendered ${skillsState.visibleCards} skill cards (${skillsState.prototypeCards} prototype, ${skillsState.plannedCards} planned)`);

    await page.evaluate(() => {
      const card = Array.from(document.querySelectorAll('main section.grid > button'))
        .find((button) => button.textContent?.includes('Personality Assessment'));
      card?.click();
    });
    await page.waitForFunction(() => document.body.innerText.toLowerCase().includes('interactive demo'), { timeout: 15000 });
    checks.push('implemented skill page opened');

    await page.goto(skillsHubUrl, { waitUntil: 'networkidle0', timeout: 30000 });
    await page.evaluate(() => {
      const card = Array.from(document.querySelectorAll('main section.grid > button'))
        .find((button) => button.textContent?.toLowerCase().includes('planned'));
      card?.click();
    });
    await page.waitForFunction(() => document.body.innerText.includes('interactive prototype') || document.body.innerText.includes('implementation is coming soon'), { timeout: 15000 });
    checks.push('planned skill page opened');

    await page.goto(prototypeUrl, { waitUntil: 'networkidle0', timeout: 30000 });
    await page.waitForSelector('[data-testid="prototype-skills-hub-link"]', { timeout: 15000 });
    checks.push('/prototype browser rendered skills hub link');
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

  const skillsHub = await fetchText(skillsHubUrl);
  checks.push(`/skills-hub reachable (${skillsHub.response.status})`);

  const daily = await fetchText(dailyUrl);
  checks.push(`/daily deep link reachable (${daily.response.status})`);

  const version = await fetchJson(versionUrl);
  if (version.json.repository !== 'akivagoldstein61-ui/Google-ai-studio-') {
    throw new Error('/__version returned unexpected repository metadata');
  }
  checks.push(`/__version JSON verified (${version.json.source || 'unknown source'})`);

  const apiVersion = await fetchJson(apiVersionUrl);
  if (apiVersion.json.repository !== 'akivagoldstein61-ui/Google-ai-studio-') {
    throw new Error('/api/version returned unexpected repository metadata');
  }
  checks.push(`/api/version JSON verified (${apiVersion.json.source || 'unknown source'})`);

  const health = await fetchJson(healthUrl);
  if (health.json.status !== 'ok' || health.json.source !== 'vercel-api-function' || health.json.service !== 'kesher') {
    throw new Error('/api/health returned unexpected health payload');
  }
  checks.push('/api/health JSON verified from Vercel Function');

  if (requiredShaPatterns.length > 0) {
    const hasSha = requiredShaPatterns.some((sha) => (
      prototype.text.includes(sha) ||
      version.text.includes(sha) ||
      apiVersion.text.includes(sha)
    ));
    if (!hasSha) {
      throw new Error(`deployment does not include expected commit SHA marker (${expectedSha})`);
    }
    checks.push('commit marker verified');
  }

  await assertBundleContainsMarker(skillsHub.text, skillsHubUrl, 'Kesher Skills Hub', '/skills-hub');
  await assertBundleContainsMarker(prototype.text, prototypeUrl, 'prototype-skills-hub-link', '/prototype');
  checks.push('SPA bundle markers verified for skills hub and prototype link');

  assertNoSecrets('root page', root.text);
  assertNoSecrets('prototype page', prototype.text);
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
