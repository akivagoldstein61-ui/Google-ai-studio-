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
 *   node scripts/api-smoke.mjs                     (defaults to production URL)
 *   node scripts/api-smoke.mjs http://localhost:3000
 *   KESHER_BASE_URL=https://preview.example.app node scripts/api-smoke.mjs
 *
 * Exits 0 on success, 1 on any failure.
 */

const DEFAULT_BASE = "https://google-ai-studio-sage-sigma.vercel.app";
const baseUrl =
  process.argv[2] ?? process.env.KESHER_BASE_URL ?? DEFAULT_BASE;

const cleanBase = baseUrl.replace(/\/+$/, "");
const vercelProtectionBypassSecret = (
  process.env.VERCEL_AUTOMATION_BYPASS_SECRET ||
  process.env.VERCEL_PROTECTION_BYPASS_SECRET ||
  ""
).trim();

function getVercelProtectionHeaders() {
  if (!vercelProtectionBypassSecret) return {};
  return {
    "x-vercel-protection-bypass": vercelProtectionBypassSecret,
  };
}

function isVercelProtectionBlocked(url, status) {
  return new URL(url).hostname.endsWith(".vercel.app") && (status === 401 || status === 403);
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

let failures = 0;

for (const check of CHECKS) {
  const url = `${cleanBase}${check.path}`;
  process.stdout.write(`→ ${check.method} ${check.path} … `);
  try {
    const res = await fetch(url, {
      method: check.method,
      headers: {
        "Content-Type": "application/json",
        ...getVercelProtectionHeaders(),
      },
      body: check.body ? JSON.stringify(check.body) : undefined,
    });

    const contentType = res.headers.get("content-type") ?? "";
    const statusOk = check.expectStatus.includes(res.status);
    const typeOk = contentType.includes(check.expectContentType);

    if (statusOk && typeOk) {
      console.log(`PASS (${res.status} ${contentType})`);
      continue;
    }

    failures++;
    console.log(`FAIL (${res.status} ${contentType})`);
    if (isVercelProtectionBlocked(url, res.status)) {
      console.log("    Vercel Deployment Protection blocked this smoke request.");
      console.log("    Set VERCEL_AUTOMATION_BYPASS_SECRET for automation or make the target deployment publicly reachable.");
    }
    console.log(`    expected status one of ${JSON.stringify(check.expectStatus)} with content-type ${check.expectContentType}`);

    // If we got HTML back, that's the classic "SPA caught the API route"
    // failure mode. Dump the first line for context.
    if (contentType.includes("text/html") || contentType.includes("text/plain")) {
      const body = await res.text();
      const firstLine = body.split("\n").find((line) => line.trim().length > 0) ?? "";
      console.log(`    response (first non-empty line): ${firstLine.slice(0, 120)}`);
    }
  } catch (err) {
    failures++;
    console.log("FAIL (network error)");
    console.log(`    ${err instanceof Error ? err.message : String(err)}`);
  }
}

if (failures > 0) {
  console.error(`\nAPI smoke: ${failures} check(s) failed against ${cleanBase}`);
  process.exit(1);
}

console.log(`\nAPI smoke: all ${CHECKS.length} checks passed against ${cleanBase}`);
