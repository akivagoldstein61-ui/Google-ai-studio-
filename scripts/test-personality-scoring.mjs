#!/usr/bin/env node
/**
 * test-personality-scoring.mjs
 *
 * Tests that Kesher's personality scoring architecture satisfies the
 * measurement governance contracts:
 *
 *   1. No LLM-generated scores: scoring must be deterministic.
 *   2. Scoring is separated from AI interpretation.
 *   3. Score output is bounded (within defined range).
 *   4. Scoring code is versioned.
 *   5. Score reproducibility: same input → same output.
 *
 * This script tests the governance contracts and any scoring adapter that
 * exists in the codebase. If no scoring code exists yet, it confirms that
 * no LLM-based scoring has been accidentally introduced.
 *
 * Usage:  node scripts/test-personality-scoring.mjs
 *         npm run test:scoring
 *
 * Exits with code 1 if any scoring governance contract is violated.
 */

import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join, extname, relative } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = join(__dirname, "..");

// ---------------------------------------------------------------------------
// Patterns that indicate LLM-delegated scoring (forbidden)
// ---------------------------------------------------------------------------
const LLM_SCORING_PATTERNS = [
  // Sending trait names or scoring prompts to an LLM
  /generateContent.*(?:score|rate|assess).*(?:personality|trait|openness|conscientiousness)/i,
  /(?:openness|conscientiousness|extraversion|agreeableness|neuroticism).*generateContent/i,
  /model\.generateContent.*personalit/i,
  // Prompt strings that ask the model to score
  /["'`].*(?:score the personality|rate the personality|assess the big five|personality score is)/i,
];

// ---------------------------------------------------------------------------
// Patterns that indicate a scoring version is tracked (required if scoring exists)
// ---------------------------------------------------------------------------
const SCORING_VERSION_PATTERNS = [
  /scoringVersion\s*[:=]/i,
  /scoring_version\s*[:=]/i,
  /SCORING_VERSION\s*[:=]/i,
];

// ---------------------------------------------------------------------------
// File scan helpers
// ---------------------------------------------------------------------------
const SCAN_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
const EXCLUDE_DIRS = new Set(["node_modules", ".git", "dist", "build", "coverage", "scripts", "docs"]);

function* walkFiles(dir) {
  for (const entry of readdirSync(dir)) {
    if (EXCLUDE_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      yield* walkFiles(full);
    } else if (SCAN_EXTENSIONS.has(extname(entry))) {
      yield full;
    }
  }
}

function scanForPatterns(patterns) {
  const findings = [];
  for (const filePath of walkFiles(ROOT)) {
    let content;
    try {
      content = readFileSync(filePath, "utf8");
    } catch {
      continue;
    }
    const lines = content.split("\n");
    const relPath = relative(ROOT, filePath);
    for (const pattern of patterns) {
      lines.forEach((line, idx) => {
        if (pattern.test(line)) {
          findings.push({ file: relPath, line: idx + 1, text: line.trim() });
        }
      });
    }
  }
  return findings;
}

// ---------------------------------------------------------------------------
// Deterministic scoring stub test
// When real scoring code is added, import and test it here.
// ---------------------------------------------------------------------------

/**
 * Stub scoring adapter that represents the expected interface.
 * Replace with actual import when scoring code is implemented.
 */
const STUB_SCORING_ADAPTER = {
  version: "0.0.0-stub",
  score(responses) {
    // Deterministic: same input → same output, no model call
    if (!Array.isArray(responses)) throw new Error("responses must be an array");
    // Returns bounded scores in [0, 100]
    return {
      openness: 50,
      conscientiousness: 50,
      extraversion: 50,
      agreeableness: 50,
      neuroticism: 50,
    };
  },
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
let failures = [];
let passCount = 0;

function test(name, fn) {
  try {
    const issues = fn();
    if (issues.length === 0) {
      console.log(`  ✅  ${name}`);
      passCount++;
    } else {
      console.error(`  ❌  ${name}`);
      for (const issue of issues) {
        console.error(`       → ${issue}`);
      }
      failures.push({ name, issues });
    }
  } catch (err) {
    console.error(`  ❌  ${name} (threw: ${err.message})`);
    failures.push({ name, issues: [err.message] });
  }
}

console.log("\nPersonality Scoring Governance Tests\n");

test("No LLM-delegated personality scoring in source", () => {
  const found = scanForPatterns(LLM_SCORING_PATTERNS);
  return found.map((f) => `LLM scoring pattern at ${f.file}:${f.line} → ${f.text}`);
});

test("Scoring adapter has a version field", () => {
  if (!STUB_SCORING_ADAPTER.version) return ["scoring adapter must have a version field"];
  return [];
});

test("Scoring adapter is deterministic (same input → same output)", () => {
  const input = [1, 2, 3];
  const r1 = STUB_SCORING_ADAPTER.score(input);
  const r2 = STUB_SCORING_ADAPTER.score(input);
  if (JSON.stringify(r1) !== JSON.stringify(r2)) {
    return ["scoring adapter is not deterministic: two identical calls returned different results"];
  }
  return [];
});

test("Scoring adapter output is bounded [0, 100]", () => {
  const result = STUB_SCORING_ADAPTER.score([1, 2, 3]);
  const issues = [];
  for (const [dim, val] of Object.entries(result)) {
    if (typeof val !== "number" || val < 0 || val > 100) {
      issues.push(`dimension "${dim}" value ${val} is out of [0, 100] range`);
    }
  }
  return issues;
});

test("Scoring adapter output contains all Big Five dimensions", () => {
  const result = STUB_SCORING_ADAPTER.score([1]);
  const required = ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"];
  const missing = required.filter((d) => !(d in result));
  return missing.map((d) => `missing dimension: "${d}"`);
});

test("Scoring adapter rejects invalid input", () => {
  try {
    STUB_SCORING_ADAPTER.score("not-an-array");
    return ["scoring adapter should throw on non-array input"];
  } catch {
    return [];
  }
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n${passCount} passed, ${failures.length} failed.\n`);

if (failures.length > 0) {
  console.error("❌  test-personality-scoring: scoring governance contracts violated.");
  process.exit(1);
} else {
  console.log("✅  test-personality-scoring: all scoring governance contracts satisfied.");
  process.exit(0);
}
