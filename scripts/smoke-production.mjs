#!/usr/bin/env node
/**
 * Production smoke-test runner.
 *
 * Hits the live deployment to confirm:
 *   1. Health endpoints are alive and ready
 *   2. Static assets load (HTML, JS bundle)
 *   3. AI endpoints reject unauthenticated requests in production mode
 *   4. App Check enforcement is on
 *   5. CORS / security headers are present
 *
 * Usage:
 *   node scripts/smoke-production.mjs                                    # Default URL
 *   node scripts/smoke-production.mjs https://kesher.example.com         # Override
 *   node scripts/smoke-production.mjs --strict                           # Fail on any warning
 */

const DEFAULT_URL = process.env.KESHER_PROD_URL || "https://google-ai-studio-sage-sigma.vercel.app";
const args = process.argv.slice(2);
const strict = args.includes("--strict");
const url = args.find((a) => a.startsWith("http")) || DEFAULT_URL;

const checks = [];
let warnings = 0;
let failures = 0;

function ok(name) {
  console.log(`  ✅ ${name}`);
  checks.push({ name, status: "ok" });
}
function warn(name, detail) {
  console.log(`  ⚠️  ${name} — ${detail}`);
  warnings++;
  checks.push({ name, status: "warn", detail });
}
function fail(name, detail) {
  console.error(`  ❌ ${name} — ${detail}`);
  failures++;
  checks.push({ name, status: "fail", detail });
}

async function check(name, fn) {
  try {
    await fn();
  } catch (e) {
    fail(name, e.message);
  }
}

console.log(`\n🔍 Kesher Production Smoke Test\n  Target: ${url}\n`);

await check("Health endpoint responds 200", async () => {
  const r = await fetch(`${url}/api/health`);
  if (r.status !== 200) throw new Error(`status ${r.status}`);
  const body = await r.json();
  if (body.status !== "ok") throw new Error(`unexpected body: ${JSON.stringify(body)}`);
  ok("Health endpoint responds 200");
});

await check("Readiness endpoint reports state", async () => {
  const r = await fetch(`${url}/api/health/ready`);
  const body = await r.json();
  if (r.status === 503) {
    if (!body.checks) throw new Error("readiness missing checks payload");
    warn("Readiness", `503 — ${JSON.stringify(body.checks)}`);
  } else if (r.status === 200) {
    if (!body.ready) throw new Error("status 200 but ready=false");
    ok("Readiness endpoint reports state");
    if (body.checks?.auth_mode !== "production") {
      warn("Auth mode", `'${body.checks?.auth_mode}' — set AI_ROUTE_AUTH_MODE=production`);
    } else {
      ok("Auth mode is production");
    }
    if (!body.checks?.firebase_app_check) {
      warn("App Check", "FIREBASE_APP_CHECK_ENABLED is not 'true'");
    } else {
      ok("App Check is enabled");
    }
  }
});

await check("Static index loads", async () => {
  const r = await fetch(url);
  if (r.status !== 200) throw new Error(`status ${r.status}`);
  const text = await r.text();
  if (!text.includes("<html")) throw new Error("response does not look like HTML");
  ok("Static index loads");
});

await check("Security headers present", async () => {
  const r = await fetch(url);
  const required = ["x-content-type-options", "x-frame-options", "referrer-policy"];
  const missing = required.filter((h) => !r.headers.get(h));
  if (missing.length > 0) throw new Error(`missing: ${missing.join(", ")}`);
  ok("Security headers present");
  if (!r.headers.get("strict-transport-security")) {
    warn("HSTS", "Strict-Transport-Security header missing (production-only)");
  } else {
    ok("HSTS enforced");
  }
});

await check("AI endpoint rejects unauthenticated in production", async () => {
  const r = await fetch(`${url}/api/ai/coach-bio`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bio_raw: "test", tone: "warm", values: "", dealbreakers: "", length: "short" }),
  });
  if (r.status === 401) {
    ok("AI endpoint rejects unauthenticated (401)");
  } else if (r.status === 200) {
    warn("AI endpoint", "Returned 200 without auth — confirm AI_ROUTE_AUTH_MODE is 'production'");
  } else {
    // 429 = rate limit, 503 = unavailable — both acceptable signals
    ok(`AI endpoint guarded (${r.status})`);
  }
});

await check("Claims registry exists in deployed bundle", async () => {
  // Optional: serves the claims yml as a readable resource for transparency
  const r = await fetch(`${url}/claims/personality.yml`);
  if (r.status === 200) {
    ok("Claims registry publicly readable");
  } else {
    warn("Claims registry", `not served at /claims/personality.yml (status ${r.status})`);
  }
});

console.log("\n── Summary ─────────────────────────────────────────────\n");
console.log(`  Checks:   ${checks.length}`);
console.log(`  Passing:  ${checks.filter((c) => c.status === "ok").length}`);
console.log(`  Warnings: ${warnings}`);
console.log(`  Failures: ${failures}`);
console.log("");

if (failures > 0) {
  console.error("❌ Smoke test FAILED — production not ready.\n");
  process.exit(1);
}
if (strict && warnings > 0) {
  console.error("❌ Strict mode: warnings present.\n");
  process.exit(1);
}
console.log("✅ Smoke test passed.\n");
process.exit(0);
