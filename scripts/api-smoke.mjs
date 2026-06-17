#!/usr/bin/env node
/**
 * api-smoke.mjs
 *
 * Post-deploy smoke test for Kesher's Express API on Vercel.
 *
 * Verifies that /api/* routes are actually mounted (i.e. the Vercel
 * serverless catch-all is wired correctly) rather than falling through
 * to the SPA HTML.
 *
 * Usage:
 *   node scripts/api-smoke.mjs                       (defaults to production URL)
 *   node scripts/api-smoke.mjs http://localhost:3000
 *   KESHER_BASE_URL=https://preview.example.app node scripts/api-smoke.mjs
 *   EXPECTED_COMMIT_SHA=<sha> node scripts/api-smoke.mjs <preview-url>
 *
 * Exits 0 on success, 1 on any failure.
 */

const DEFAULT_BASE = "https://google-ai-studio-sage-sigma.vercel.app";
const baseUrl =
  process.argv[2] ?? process.env.KESHER_BASE_URL ?? DEFAULT_BASE;

const cleanBase = baseUrl.replace(/\/+$/, "");
const expectedCommitSha = (process.env.EXPECTED_COMMIT_SHA || "").trim();
const vercelProtectionBypassSecret = (process.env.VERCEL_AUTOMATION_BYPASS_SECRET || "").trim();

function getVercelProtectionHeaders() {
  if (!vercelProtectionBypassSecret) return {};
  return {
    "x-vercel-protection-bypass": vercelProtectionBypassSecret,
  };
}

function wasRequestBlockedByVercelProtection(url, status) {
  return new URL(url).hostname.endsWith(".vercel.app") && (status === 401 || status === 403);
}

function createExpectedCommitMarkers() {
  if (!expectedCommitSha) return [];
  return [expectedCommitSha, expectedCommitSha.slice(0, 7)].filter(Boolean);
}

const expectedCommitMarkers = createExpectedCommitMarkers();

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function assertNoHtml(label, text) {
  if (/<!doctype\s*html|<html/i.test(text)) {
    throw new Error(`${label} returned the SPA HTML shell instead of API JSON`);
  }
}

function assertJsonContentType(label, contentType, expectedContentType, text) {
  if (!contentType.toLowerCase().includes(expectedContentType)) {
    const summary = summarizeBody(text);
    throw new Error(`${label} returned ${contentType || "missing content-type"} instead of ${expectedContentType}${summary ? `: ${summary}` : ""}`);
  }
}

function summarizeBody(text) {
  const firstLine = text.split("\n").find((line) => line.trim().length > 0) ?? "";
  return firstLine.slice(0, 160);
}

/**
 * Each check states the expected behaviour. We do NOT supply auth tokens —
 * the goal is to confirm the routes exist and produce JSON, not to exercise
 * Gemini. A 401 from an auth-gated route is therefore a healthy signal: it
 * proves the auth middleware ran, which means the Express app ran.
 */
const CHECKS = [
  {
    name: "health endpoint returns JSON",
    method: "GET",
    path: "/api/health",
    expectStatus: [200],
    expectContentType: "application/json",
    validateJson: (json) => {
      if (!isObject(json) || json.status !== "ok" || json.service !== "kesher") {
        throw new Error("/api/health returned unexpected JSON payload");
      }
    },
  },
  {
    name: "API version endpoint returns deployment metadata",
    method: "GET",
    path: "/api/version",
    expectStatus: [200],
    expectContentType: "application/json",
    validateJson: (json) => {
      assertDeploymentMetadata("/api/version", json);
    },
  },
  {
    name: "__version alias returns deployment metadata",
    method: "GET",
    path: "/__version",
    expectStatus: [200],
    expectContentType: "application/json",
    validateJson: (json) => {
      assertDeploymentMetadata("/__version", json);
    },
  },
  {
    name: "unknown API route returns backend JSON 404",
    method: "GET",
    path: "/api/smoke-missing-route",
    expectStatus: [404],
    expectContentType: "application/json",
    validateJson: (json) => {
      if (!isObject(json) || json.status !== "not_found") {
        throw new Error("/api/* missing route did not return not_found JSON");
      }
      if (json.source !== "vercel-api-function" && json.source !== "express-server") {
        throw new Error(`/api/* missing route source was ${json.source || "missing"}; expected vercel-api-function or express-server`);
      }
    },
  },
  {
    name: "AI openers route is mounted (auth-gated)",
    method: "POST",
    path: "/api/ai/openers",
    body: {},
    // 401 = auth missing (route reached). 400 = missing body (route reached).
    expectStatus: [401, 400],
    expectContentType: "application/json",
  },
  {
    name: "personality visibility route is mounted (auth-gated)",
    method: "POST",
    path: "/api/profile/personality/visibility",
    body: {},
    expectStatus: [401, 400, 403],
    expectContentType: "application/json",
  },
  {
    name: "share-card create route is mounted (auth-gated)",
    method: "POST",
    path: "/api/share/create",
    body: {},
    expectStatus: [401, 400, 403],
    expectContentType: "application/json",
  },
];

function assertDeploymentMetadata(label, json) {
  if (!isObject(json) || json.status !== "ok" || json.repository !== "akivagoldstein61-ui/Google-ai-studio-") {
    throw new Error(`${label} did not return Kesher deployment metadata`);
  }

  if (expectedCommitMarkers.length === 0) return;

  const values = [
    json.commitSha,
    json.shortCommitSha,
    json.commitUrl,
    json.branch,
    json.buildTime,
  ]
    .filter((value) => typeof value === "string")
    .join("\n");

  const hasExpectedCommit = expectedCommitMarkers.some((marker) => values.includes(marker));
  if (!hasExpectedCommit) {
    throw new Error(`${label} deployment metadata does not include expected commit ${expectedCommitSha}`);
  }
}

let failures = 0;
const passedChecks = [];

for (const check of CHECKS) {
  const url = `${cleanBase}${check.path}`;
  process.stdout.write(`→ ${check.method} ${check.path} … `);
  let responseStatus = null;
  try {
    const res = await fetch(url, {
      method: check.method,
      headers: {
        "Content-Type": "application/json",
        ...getVercelProtectionHeaders(),
      },
      body: check.body ? JSON.stringify(check.body) : undefined,
    });

    responseStatus = res.status;
    const contentType = res.headers.get("content-type") ?? "";
    const text = await res.text();
    const statusOk = check.expectStatus.includes(res.status);
    let json = null;

    assertNoHtml(check.path, text);
    assertJsonContentType(check.path, contentType, check.expectContentType, text);
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(`${check.path} returned invalid JSON: ${summarizeBody(text)}`);
    }

    if (!statusOk) {
      throw new Error(`expected status one of ${JSON.stringify(check.expectStatus)}, got ${res.status}`);
    }

    if (check.validateJson) {
      check.validateJson(json);
    }

    console.log(`PASS (${res.status} ${contentType})`);
    passedChecks.push(check.name);
  } catch (err) {
    failures++;
    console.log("FAIL");
    const message = err instanceof Error ? err.message : String(err);
    console.log(`    ${message}`);
    if (responseStatus !== null && wasRequestBlockedByVercelProtection(url, responseStatus)) {
      console.log("    Vercel Deployment Protection blocked this smoke request.");
      console.log("    Set VERCEL_AUTOMATION_BYPASS_SECRET for automation or make the target deployment publicly reachable.");
    }
  }
}

if (failures > 0) {
  console.error(`\nAPI smoke: ${failures} check(s) failed against ${cleanBase}`);
  process.exit(1);
}

console.log(`\nAPI smoke: all ${CHECKS.length} checks passed against ${cleanBase}`);
if (expectedCommitSha) {
  console.log(`API smoke: deployment metadata matched expected commit ${expectedCommitSha}`);
}
for (const item of passedChecks) {
  console.log(`- ${item}`);
}
