#!/usr/bin/env node
/**
 * personality-smoke-tests.mjs
 *
 * Lightweight smoke tests for Kesher's Personality Dimension governance scaffold.
 *
 * Verifies that all required governance files exist and are non-empty,
 * and that all required package.json scripts are present.
 *
 * This is the default test suite run by `npm test`.
 *
 * Usage:  node scripts/personality-smoke-tests.mjs
 *         npm test
 *
 * Exits with code 1 if any required file or script is missing.
 */

import { existsSync, readFileSync, statSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = join(__dirname, "..");

// ---------------------------------------------------------------------------
// Required governance files
// ---------------------------------------------------------------------------
const REQUIRED_FILES = [
  // Issue templates
  ".github/ISSUE_TEMPLATE/personality-feature.yml",
  ".github/ISSUE_TEMPLATE/privacy-risk.yml",
  ".github/ISSUE_TEMPLATE/ai-redteam-finding.yml",
  // PR template
  ".github/pull_request_template.md",
  // CODEOWNERS
  ".github/CODEOWNERS",
  // Workflows
  ".github/workflows/personality-ci.yml",
  ".github/workflows/redteam-personality.yml",
  ".github/workflows/schema-validation.yml",
  ".github/workflows/rtl-snapshots.yml",
  // Docs
  "docs/personality/release-gates.md",
  "docs/personality/forbidden-patterns.md",
  "docs/personality/claim-registry.md",
  "docs/personality/data-classification.md",
  "docs/personality/agent-instructions.md",
  // Scripts
  "scripts/scan-forbidden-fields.mjs",
  "scripts/scan-logs.mjs",
  "scripts/test-personality-schemas.mjs",
  "scripts/test-personality-scoring.mjs",
  "scripts/redteam-personality.mjs",
  "scripts/test-rtl.mjs",
  "scripts/personality-smoke-tests.mjs",
];

// ---------------------------------------------------------------------------
// Required package.json scripts
// ---------------------------------------------------------------------------
const REQUIRED_SCRIPTS = [
  "typecheck",
  "test",
  "test:schemas",
  "test:scoring",
  "redteam:personality",
  "test:rtl",
  "scan:forbidden-fields",
  "scan:logs",
];

// ---------------------------------------------------------------------------
// Required release gate sections in release-gates.md
// ---------------------------------------------------------------------------
const REQUIRED_GATE_SECTIONS = [
  "Gate 1",
  "Gate 2",
  "Gate 3",
  "Gate 4",
  "Gate 5",
  "Gate 6",
];

// ---------------------------------------------------------------------------
// Required forbidden pattern IDs in forbidden-patterns.md
// ---------------------------------------------------------------------------
const REQUIRED_FORBIDDEN_PATTERN_IDS = [
  "FP-01", "FP-02", "FP-03", "FP-04", "FP-05", "FP-06",
  "FP-07", "FP-08", "FP-09", "FP-10", "FP-11", "FP-12",
  "FP-13", "FP-14", "FP-15", "FP-16",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function fileExists(relPath) {
  return existsSync(join(ROOT, relPath));
}

function fileNonEmpty(relPath) {
  try {
    const stat = statSync(join(ROOT, relPath));
    return stat.size > 0;
  } catch {
    return false;
  }
}

function readFile(relPath) {
  try {
    return readFileSync(join(ROOT, relPath), "utf8");
  } catch {
    return "";
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
let failures = [];
let passCount = 0;

function test(name, fn) {
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
}

console.log("\nPersonality Dimension Governance Smoke Tests\n");

// Test 1: All required files exist and are non-empty
test("All required governance files exist and are non-empty", () => {
  const issues = [];
  for (const relPath of REQUIRED_FILES) {
    if (!fileExists(relPath)) {
      issues.push(`Missing file: ${relPath}`);
    } else if (!fileNonEmpty(relPath)) {
      issues.push(`Empty file: ${relPath}`);
    }
  }
  return issues;
});

// Test 2: package.json has all required scripts
test("package.json contains all required personality CI scripts", () => {
  const pkgContent = readFile("package.json");
  let pkg;
  try {
    pkg = JSON.parse(pkgContent);
  } catch {
    return ["Could not parse package.json"];
  }
  const scripts = pkg.scripts || {};
  const missing = REQUIRED_SCRIPTS.filter((s) => !(s in scripts));
  return missing.map((s) => `Missing script: "${s}"`);
});

// Test 3: release-gates.md contains all gate sections
test("release-gates.md contains all 6 gate sections", () => {
  const content = readFile("docs/personality/release-gates.md");
  const missing = REQUIRED_GATE_SECTIONS.filter((g) => !content.includes(g));
  return missing.map((g) => `Missing gate section: "${g}"`);
});

// Test 4: forbidden-patterns.md contains all FP IDs
test("forbidden-patterns.md contains all 16 forbidden pattern entries", () => {
  const content = readFile("docs/personality/forbidden-patterns.md");
  const missing = REQUIRED_FORBIDDEN_PATTERN_IDS.filter((id) => !content.includes(id));
  return missing.map((id) => `Missing forbidden pattern: "${id}"`);
});

// Test 5: PR template has forbidden patterns checklist
test("PR template contains forbidden patterns checklist", () => {
  const content = readFile(".github/pull_request_template.md");
  const required = [
    "No compatibility score",
    "No soulmate score",
    "No AI auto-send",
    "Required Reviewers",
  ];
  const missing = required.filter((s) => !content.includes(s));
  return missing.map((s) => `PR template missing: "${s}"`);
});

// Test 6: Personality CI workflow references all scripts
test("personality-ci.yml references all validation scripts", () => {
  const content = readFile(".github/workflows/personality-ci.yml");
  const required = [
    "scan-forbidden-fields.mjs",
    "scan-logs.mjs",
    "test-personality-schemas.mjs",
    "test-personality-scoring.mjs",
    "personality-smoke-tests.mjs",
  ];
  const missing = required.filter((s) => !content.includes(s));
  return missing.map((s) => `personality-ci.yml missing reference to: ${s}`);
});

// Test 7: CODEOWNERS references personality paths
test("CODEOWNERS contains personality path rules", () => {
  const content = readFile(".github/CODEOWNERS");
  const required = [
    "src/ai/**",
    "docs/personality/**",
    "scripts/**",
    "@org/privacy-reviewers",
    "@org/safety-reviewers",
  ];
  const missing = required.filter((s) => !content.includes(s));
  return missing.map((s) => `CODEOWNERS missing: "${s}"`);
});

// Test 8: agent-instructions.md has the 13 prohibited actions
test("agent-instructions.md contains prohibition list", () => {
  const content = readFile("docs/personality/agent-instructions.md");
  const required = [
    "Never merge",
    "Never bypass CODEOWNERS",
    "Never deploy",
    "Never generate personality scores using an LLM",
    "Never commit real assessment item text",
    "Never infer protected characteristics",
    "Never write code that auto-sends",
    "Never expose raw trait scores",
  ];
  const missing = required.filter((s) => !content.includes(s));
  return missing.map((s) => `agent-instructions.md missing: "${s}"`);
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n${passCount} passed, ${failures.length} failed.\n`);

if (failures.length > 0) {
  console.error("❌  personality-smoke-tests: governance scaffold is incomplete.");
  process.exit(1);
} else {
  console.log("✅  personality-smoke-tests: governance scaffold is complete.");
  process.exit(0);
}
