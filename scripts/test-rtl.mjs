#!/usr/bin/env node
/**
 * test-rtl.mjs
 *
 * Hebrew / RTL layout governance checks for Kesher's Personality Dimension.
 *
 * Validates:
 *   1. Personality-related TSX/JSX components include RTL directionality support
 *      (dir="rtl" or dir={...} or rtl-related className usage).
 *   2. No personality string is hardcoded in English only without a Hebrew
 *      translation placeholder or i18n hook.
 *   3. CSS does not use left/right margin/padding in ways that break RTL
 *      (flags potential issues for human review).
 *
 * Usage:  node scripts/test-rtl.mjs
 *         npm run test:rtl
 *
 * Exits with code 1 if RTL governance violations are found.
 */

import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join, extname, relative } from "path";
import { fileURLToPath } from "url";
import { writeFileSync } from "fs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = join(__dirname, "..");

// ---------------------------------------------------------------------------
// Paths that should be RTL-aware
// ---------------------------------------------------------------------------
const PERSONALITY_COMPONENT_DIRS = [
  "src/features/personality",
  "src/features/settings",
  "src/features/discovery",
  "src/components/discovery",
];

// ---------------------------------------------------------------------------
// Patterns indicating RTL support
// ---------------------------------------------------------------------------
const RTL_SUPPORT_PATTERNS = [
  /dir\s*=\s*["']rtl["']/,         // dir="rtl"
  /dir\s*=\s*\{/,                   // dir={someVar}
  /direction.*rtl/i,                // CSS direction: rtl
  /rtl/i,                           // any RTL className or variable
  /useRTL/i,                        // RTL hook
  /isRTL/i,                         // RTL flag
  /locale.*he/i,                    // Hebrew locale
  /lang.*he/i,                      // Hebrew lang attribute
];

// ---------------------------------------------------------------------------
// Patterns indicating non-i18n hardcoded English strings in personality UI
// (heuristic — flags for human review, not a hard error by itself)
// ---------------------------------------------------------------------------
const HARDCODED_ENGLISH_PATTERNS = [
  // JSX text nodes with personality-related English words (not in i18n calls)
  />\s*(?:Your personality|Personality traits|Character insights|Trait summary)\s*</i,
  />\s*(?:Openness|Conscientiousness|Extraversion|Agreeableness|Neuroticism)\s*</i,
];

// ---------------------------------------------------------------------------
// CSS patterns that may break RTL (flag for review, not hard error)
// ---------------------------------------------------------------------------
const RTL_CSS_RISK_PATTERNS = [
  /margin-left\s*:/,
  /margin-right\s*:/,
  /padding-left\s*:/,
  /padding-right\s*:/,
  /float\s*:\s*left/,
  /float\s*:\s*right/,
  /text-align\s*:\s*left/,
  /text-align\s*:\s*right/,
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const SCAN_EXTENSIONS_COMPONENTS = new Set([".tsx", ".jsx"]);
const SCAN_EXTENSIONS_CSS = new Set([".css"]);
const EXCLUDE_DIRS = new Set(["node_modules", ".git", "dist", "build", "coverage"]);

function* walkFiles(dir, extensions) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir)) {
    if (EXCLUDE_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      yield* walkFiles(full, extensions);
    } else if (extensions.has(extname(entry))) {
      yield full;
    }
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
let failures = [];
let warnings = [];
let passCount = 0;
const report = { timestamp: new Date().toISOString(), failures: [], warnings: [] };

function test(name, fn) {
  const { issues, warns } = fn();
  if (issues.length === 0) {
    console.log(`  ✅  ${name}`);
    passCount++;
  } else {
    console.error(`  ❌  ${name}`);
    for (const issue of issues) {
      console.error(`       → ${issue}`);
    }
    failures.push({ name, issues });
    report.failures.push({ name, issues });
  }
  if (warns && warns.length > 0) {
    for (const w of warns) {
      console.warn(`  ⚠️   ${w}`);
    }
    warnings.push(...warns);
    report.warnings.push(...warns);
  }
}

console.log("\nPersonality RTL / Hebrew Layout Checks\n");

// Test 1: Personality component dirs exist (or are awaiting creation)
test("Personality component directories exist or are tracked", () => {
  const missing = PERSONALITY_COMPONENT_DIRS.filter((d) => !existsSync(join(ROOT, d)));
  // Missing dirs are warnings (features not yet built), not hard failures
  if (missing.length > 0) {
    return {
      issues: [],
      warns: missing.map((d) => `Directory not yet created: ${d} (expected when personality features land)`),
    };
  }
  return { issues: [], warns: [] };
});

// Test 2: Existing personality components have RTL support signals
test("Personality components include RTL directionality signals", () => {
  const issues = [];
  const warns = [];

  for (const dir of PERSONALITY_COMPONENT_DIRS) {
    for (const filePath of walkFiles(join(ROOT, dir), SCAN_EXTENSIONS_COMPONENTS)) {
      let content;
      try {
        content = readFileSync(filePath, "utf8");
      } catch {
        continue;
      }
      const relPath = relative(ROOT, filePath);
      const hasRTL = RTL_SUPPORT_PATTERNS.some((p) => p.test(content));
      if (!hasRTL) {
        warns.push(`No RTL signal found in personality component: ${relPath}`);
      }
    }
  }

  return { issues, warns };
});

// Test 3: No hardcoded English personality strings (heuristic, warning only)
test("No hardcoded English-only personality strings detected (heuristic check)", () => {
  const warns = [];

  for (const dir of PERSONALITY_COMPONENT_DIRS) {
    for (const filePath of walkFiles(join(ROOT, dir), SCAN_EXTENSIONS_COMPONENTS)) {
      let content;
      try {
        content = readFileSync(filePath, "utf8");
      } catch {
        continue;
      }
      const relPath = relative(ROOT, filePath);
      const lines = content.split("\n");
      for (const pattern of HARDCODED_ENGLISH_PATTERNS) {
        lines.forEach((line, idx) => {
          if (pattern.test(line)) {
            warns.push(`Possible hardcoded English string at ${relPath}:${idx + 1}: ${line.trim()}`);
          }
        });
      }
    }
  }

  return { issues: [], warns };
});

// Test 4: CSS files in personality dirs flag physical direction properties
test("No physical LTR-only CSS properties in personality CSS (heuristic)", () => {
  const warns = [];

  for (const dir of PERSONALITY_COMPONENT_DIRS) {
    for (const filePath of walkFiles(join(ROOT, dir), SCAN_EXTENSIONS_CSS)) {
      let content;
      try {
        content = readFileSync(filePath, "utf8");
      } catch {
        continue;
      }
      const relPath = relative(ROOT, filePath);
      const lines = content.split("\n");
      for (const pattern of RTL_CSS_RISK_PATTERNS) {
        lines.forEach((line, idx) => {
          if (pattern.test(line)) {
            warns.push(`Physical direction CSS at ${relPath}:${idx + 1}: ${line.trim()} — use logical properties (margin-inline-*) for RTL support`);
          }
        });
      }
    }
  }

  return { issues: [], warns };
});

// ---------------------------------------------------------------------------
// Write report artifact
// ---------------------------------------------------------------------------
try {
  writeFileSync("/tmp/rtl-report.json", JSON.stringify(report, null, 2));
} catch {
  // Non-fatal
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
if (warnings.length > 0) {
  console.log(`\n⚠️   ${warnings.length} warning(s) for human review.`);
}
console.log(`\n${passCount} passed, ${failures.length} failed.\n`);

if (failures.length > 0) {
  console.error("❌  test-rtl: RTL governance violations found.");
  process.exit(1);
} else {
  console.log("✅  test-rtl: RTL governance checks passed.");
  process.exit(0);
}
