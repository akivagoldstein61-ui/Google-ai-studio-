#!/usr/bin/env node
/**
 * scan-logs.mjs
 *
 * Scans source files for console.log / logger calls that may inadvertently
 * emit raw personality scores, trait vectors, or other P0/P1 personality data.
 *
 * Usage:  node scripts/scan-logs.mjs
 *         npm run scan:logs
 *
 * Exits with code 1 if any risky log pattern is found.
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname, relative } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = join(__dirname, "..");

// ---------------------------------------------------------------------------
// Patterns that indicate a log statement may be emitting sensitive data
// ---------------------------------------------------------------------------
const RISKY_LOG_PATTERNS = [
  // Log calls that include personality-related field names
  /console\.(log|warn|error|info|debug).*(?:traitScore|trait_score|rawTrait|raw_trait)/i,
  /console\.(log|warn|error|info|debug).*(?:openness|conscientiousness|extraversion|agreeableness|neuroticism)/i,
  /console\.(log|warn|error|info|debug).*(?:personalityScore|personality_score)/i,
  /console\.(log|warn|error|info|debug).*(?:personalityVector|personality_vector)/i,
  /console\.(log|warn|error|info|debug).*(?:fullDossier|dossier)/i,
  /console\.(log|warn|error|info|debug).*(?:assessmentResponse|assessment_response)/i,
  // logger.* equivalents
  /logger\.(log|warn|error|info|debug).*(?:traitScore|trait_score|rawTrait|personality)/i,
];

const SCAN_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
const EXCLUDE_DIRS = new Set(["node_modules", ".git", "dist", "build", "coverage"]);
const EXCLUDE_FILES = new Set(["scan-logs.mjs"]);

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

let findings = [];

for (const filePath of walkFiles(ROOT)) {
  const base = filePath.split("/").pop();
  if (EXCLUDE_FILES.has(base)) continue;

  let content;
  try {
    content = readFileSync(filePath, "utf8");
  } catch {
    continue;
  }

  const lines = content.split("\n");
  const relPath = relative(ROOT, filePath);

  for (const pattern of RISKY_LOG_PATTERNS) {
    lines.forEach((line, idx) => {
      if (pattern.test(line)) {
        findings.push({ file: relPath, line: idx + 1, text: line.trim(), pattern: pattern.toString() });
      }
    });
  }
}

if (findings.length === 0) {
  console.log("✅  scan-logs: no risky log patterns found.");
  process.exit(0);
} else {
  console.error(`❌  scan-logs: ${findings.length} risky log pattern(s) found.\n`);
  console.error("  Raw personality data must not appear in logs. Remove or redact the following:\n");
  for (const f of findings) {
    console.error(`  ${f.file}:${f.line}`);
    console.error(`    > ${f.text}\n`);
  }
  process.exit(1);
}
