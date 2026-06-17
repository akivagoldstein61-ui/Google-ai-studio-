#!/usr/bin/env node
/**
 * Replit parity smoke for Kesher workshop previews.
 *
 * Replit is QA/workshop evidence only. This script verifies that a Replit URL
 * is externally reachable as Kesher, not just as a private ReplShield dev URL.
 *
 * Usage:
 *   npm run smoke:replit -- https://google-ai-studio-5.replit.app
 *   REPLIT_BASE_URL=https://example.replit.app npm run smoke:replit
 */

const baseUrl = (process.argv[2] || process.env.REPLIT_BASE_URL || "").trim();

if (!baseUrl) {
  console.error("REPLIT_BASE_URL or a positional Replit URL is required");
  process.exit(1);
}

const cleanBase = baseUrl.replace(/\/+$/, "");

const appChecks = [
  { name: "root app shell", path: "/", markers: ["Kesher", "root"] },
  { name: "daily route", path: "/daily", markers: ["Daily Picks", "Today's picks", "root"] },
  { name: "skills route", path: "/skills", markers: ["Skills", "Kesher", "root"] },
  { name: "skills hub route", path: "/skills-hub", markers: ["Kesher Skills Hub", "Integrated relationship readiness system", "root"] },
  { name: "prototype route", path: "/prototype", markers: ["Prototype", "Kesher", "root"] },
  { name: "mobile route", path: "/mobile/", markers: ["Kesher Mobile", "Kesher", "root"] },
];

const apiChecks = [
  {
    name: "health endpoint",
    method: "GET",
    path: "/api/health",
    statuses: [200],
    json: true,
  },
  {
    name: "version endpoint",
    method: "GET",
    path: "/api/version",
    statuses: [200],
    json: true,
  },
  {
    name: "__version alias",
    method: "GET",
    path: "/__version",
    statuses: [200],
    json: true,
  },
  {
    name: "unknown API route",
    method: "GET",
    path: "/api/smoke-missing-route",
    statuses: [404],
    json: true,
  },
  {
    name: "AI openers auth gate",
    method: "POST",
    path: "/api/ai/openers",
    statuses: [401, 400, 403],
    json: true,
    body: {},
  },
  {
    name: "personality visibility auth gate",
    method: "POST",
    path: "/api/profile/personality/visibility",
    statuses: [401, 400, 403],
    json: true,
    body: {},
  },
  {
    name: "share create auth gate",
    method: "POST",
    path: "/api/share/create",
    statuses: [401, 400, 403],
    json: true,
    body: {},
  },
];

let failures = 0;

for (const check of appChecks) {
  await runAppCheck(check);
}

for (const check of apiChecks) {
  await runApiCheck(check);
}

if (failures > 0) {
  console.error(`\nReplit parity smoke: ${failures} check(s) failed against ${cleanBase}`);
  process.exit(1);
}

console.log(`\nReplit parity smoke: all ${appChecks.length + apiChecks.length} checks passed against ${cleanBase}`);

async function runAppCheck(check) {
  const url = `${cleanBase}${check.path}`;
  process.stdout.write(`-> GET ${check.path} (${check.name}) ... `);

  try {
    const { response, text } = await fetchText(url, { redirect: "follow" });
    assertNotReplitShield(url, response, text);
    assertNoReplitPlatformHtml(url, response, text);

    if (!response.ok) {
      throw new Error(`expected 2xx app route, got ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("text/html")) {
      throw new Error(`expected HTML app route, got ${contentType || "missing content-type"}`);
    }

    assertAppMarker(check.path, text, check.markers);
    console.log(`PASS (${response.status})`);
  } catch (error) {
    failures++;
    console.log("FAIL");
    console.log(`   ${formatError(error)}`);
  }
}

async function runApiCheck(check) {
  const url = `${cleanBase}${check.path}`;
  process.stdout.write(`-> ${check.method} ${check.path} (${check.name}) ... `);

  try {
    const { response, text } = await fetchText(url, {
      method: check.method,
      redirect: "follow",
      headers: {
        "Content-Type": "application/json",
      },
      body: check.body ? JSON.stringify(check.body) : undefined,
    });
    assertNotReplitShield(url, response, text);
    assertNoReplitPlatformHtml(url, response, text);
    assertNoHtmlApi(check.path, text);

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("application/json")) {
      throw new Error(`expected application/json, got ${contentType || "missing content-type"}: ${summarize(text)}`);
    }

    if (!check.statuses.includes(response.status)) {
      throw new Error(`expected status ${JSON.stringify(check.statuses)}, got ${response.status}`);
    }

    try {
      JSON.parse(text);
    } catch {
      throw new Error(`invalid JSON: ${summarize(text)}`);
    }

    console.log(`PASS (${response.status})`);
  } catch (error) {
    failures++;
    console.log("FAIL");
    console.log(`   ${formatError(error)}`);
  }
}

async function fetchText(url, options = {}) {
  const response = await fetch(url, {
    cache: "no-store",
    ...options,
  });
  const text = await response.text();
  return { response, text };
}

function assertNotReplitShield(requestUrl, response, text) {
  const finalUrl = response.url || requestUrl;
  if (
    finalUrl.includes("replit.com/__replshield") ||
    finalUrl.includes("replit.com/silent-auth") ||
    /privateDevDomain=true|__replshield|Verifying session/i.test(text)
  ) {
    throw new Error(
      "blocked by Replit ReplShield/private dev auth; publish a public Replit App URL or provide authenticated screenshot evidence"
    );
  }
}

function assertNoReplitPlatformHtml(requestUrl, response, text) {
  const finalUrl = response.url || requestUrl;
  if (
    finalUrl.includes("replit.com") ||
    /This app isn(?:'|&#39;|&apos;|’)t live yet|We couldn(?:'|&#39;|&apos;|’)t find a Replit App|replit-ui-theme-root|window\.__CF\$cv|site-presence-loading/i.test(text)
  ) {
    throw new Error(`received Replit platform HTML instead of Kesher output: ${summarize(text)}`);
  }
}

function assertNoHtmlApi(path, text) {
  if (/<!doctype\s*html|<html/i.test(text)) {
    throw new Error(`${path} returned HTML instead of API JSON: ${summarize(text)}`);
  }
}

function assertAppMarker(path, text, markers) {
  const normalizedText = text.replace(/\s+/g, " ");
  const hasRoot = /id=["']root["']/.test(text);
  const hasMarker = markers.some((marker) => {
    if (marker === "root") return hasRoot;
    return normalizedText.includes(marker);
  });

  if (!hasMarker) {
    throw new Error(`${path} did not expose an expected Kesher app marker`);
  }
}

function summarize(text) {
  return text
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

function formatError(error) {
  return error instanceof Error ? error.message : String(error);
}
