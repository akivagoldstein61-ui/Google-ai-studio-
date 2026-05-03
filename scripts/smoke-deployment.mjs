#!/usr/bin/env node

const baseUrl = process.env.SMOKE_BASE_URL;
const expectedSha = process.env.EXPECTED_COMMIT_SHA || '';

if (!baseUrl) {
  console.error('SMOKE_BASE_URL is required');
  process.exit(1);
}

const rootUrl = new URL('/', baseUrl).toString();
const prototypeUrl = new URL('/prototype', baseUrl).toString();
const demoUrl = new URL('/demo?demo=1', baseUrl).toString();

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

  const demo = await fetchText(demoUrl);
  checks.push(`/demo?demo=1 reachable (${demo.response.status})`);

  if (requiredShaPatterns.length > 0) {
    const hasSha = requiredShaPatterns.some((sha) => prototype.text.includes(sha));
    if (!hasSha) {
      throw new Error(`/prototype does not include expected commit SHA marker (${expectedSha})`);
    }
    checks.push('commit marker verified on /prototype');
  }

  if (!/Demo mode/i.test(demo.text)) {
    throw new Error('/demo?demo=1 did not render expected Demo mode banner text');
  }
  checks.push('demo mode banner verified');

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
