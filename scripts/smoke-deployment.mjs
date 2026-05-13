#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';

const baseUrl = process.env.SMOKE_BASE_URL;
const expectedSha = process.env.EXPECTED_COMMIT_SHA || '';

if (!baseUrl) {
  console.error('SMOKE_BASE_URL is required');
  process.exit(1);
}

const rootUrl = new URL('/', baseUrl).toString();
const prototypeUrl = new URL('/prototype', baseUrl).toString();
const skillsHubUrl = new URL('/skills-hub', baseUrl).toString();
const demoUrl = new URL('/demo?demo=1', baseUrl).toString();
const healthUrl = new URL('/api/health', baseUrl).toString();
const apiVersionUrl = new URL('/api/version', baseUrl).toString();
const versionUrl = new URL('/__version', baseUrl).toString();
const unknownApiUrl = new URL('/api/__smoke_missing_route', baseUrl).toString();
const isVercelTarget = new URL(baseUrl).hostname.endsWith('.vercel.app');

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

async function fetchJson(url, expectedStatus = 200) {
  const response = await fetch(url, { redirect: 'manual', cache: 'no-store' });
  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();

  if (response.status !== expectedStatus) {
    throw new Error(`Unexpected status for ${url}: ${response.status}`);
  }
  if (!contentType.toLowerCase().includes('application/json')) {
    throw new Error(`${url} did not return JSON (content-type: ${contentType || 'missing'})`);
  }
  if (/<!doctype html|<html/i.test(text)) {
    throw new Error(`${url} returned the SPA HTML shell instead of API JSON`);
  }

  try {
    return { response, json: JSON.parse(text), text };
  } catch {
    throw new Error(`${url} returned invalid JSON`);
  }
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

(async () => {
  const checks = [];

  const root = await fetchText(rootUrl);
  checks.push(`root reachable (${root.response.status})`);

  const prototype = await fetchText(prototypeUrl);
  checks.push(`/prototype reachable (${prototype.response.status})`);

  const skillsHub = await fetchText(skillsHubUrl);
  checks.push(`/skills-hub reachable without auth redirect (${skillsHub.response.status})`);

  const demo = await fetchText(demoUrl);
  checks.push(`/demo?demo=1 reachable (${demo.response.status})`);

  const health = await fetchJson(healthUrl);
  if (health.json.status !== 'ok' || health.json.service !== 'kesher') {
    throw new Error('/api/health returned unexpected JSON payload');
  }
  if (isVercelTarget && health.json.source !== 'vercel-api-function') {
    throw new Error(`/api/health source was ${health.json.source}; expected vercel-api-function`);
  }
  checks.push('/api/health JSON verified');

  const apiVersion = await fetchJson(apiVersionUrl);
  if (apiVersion.json.status !== 'ok') {
    throw new Error('/api/version did not return deployment metadata');
  }
  if (isVercelTarget && apiVersion.json.source !== 'vercel-api-function') {
    throw new Error(`/api/version source was ${apiVersion.json.source}; expected vercel-api-function`);
  }
  checks.push('/api/version JSON verified');

  const version = await fetchJson(versionUrl);
  if (version.json.status !== 'ok') {
    throw new Error('/__version did not return deployment metadata');
  }
  if (isVercelTarget && version.json.source !== 'vercel-api-function') {
    throw new Error(`/__version source was ${version.json.source}; expected vercel-api-function`);
  }
  checks.push('/__version JSON verified');

  const missingApi = await fetchJson(unknownApiUrl, 404);
  if (missingApi.json.source !== 'vercel-api-function' && missingApi.json.source !== 'express-server') {
    throw new Error('/api/* missing route did not return API JSON from a backend handler');
  }
  checks.push('/api/* fallback JSON verified');

  const { bundleText, visibilityText } = await getVisibilityText(prototype.text);
  if (!visibilityText.includes('/skills-hub') || !visibilityText.includes('Kesher Skills Hub')) {
    throw new Error('/prototype client bundle does not expose the visible Kesher Skills Hub link');
  }
  if (!visibilityText.includes('Integrated Skill Modules')) {
    throw new Error('/skills-hub client bundle does not expose the skills hub surface');
  }
  checks.push('skills hub link and surface verified in client bundle');

  if (requiredShaPatterns.length > 0) {
    const hasSha = requiredShaPatterns.some((sha) => (
      prototype.text.includes(sha) ||
      bundleText.includes(sha) ||
      apiVersion.text.includes(sha) ||
      version.text.includes(sha)
    ));
    if (!hasSha) {
      throw new Error(`Deployment metadata does not include expected commit SHA marker (${expectedSha})`);
    }
    checks.push('commit marker verified in deployment metadata');
  }

  if (!/data-demo-mode="true"/i.test(demo.text) && !visibilityText.includes('data-demo-mode')) {
    throw new Error('/demo?demo=1 did not expose the rendered data-demo-mode marker or its client implementation');
  }
  checks.push('demo mode marker verified');

  assertNoSecrets('root page', root.text);
  assertNoSecrets('prototype page', prototype.text);

  console.log('✅ Smoke checks passed');
  for (const item of checks) {
    console.log(`- ${item}`);
  }
})().catch((error) => {
  console.error(`❌ Smoke checks failed: ${error.message}`);
  process.exit(1);
});
