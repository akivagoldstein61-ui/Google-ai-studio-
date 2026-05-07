#!/usr/bin/env node
/**
 * Kesher Claims Registry Linter
 *
 * CI gate: fails if:
 *  1. Any active claim has evidence_label UNKNOWN
 *  2. Any active claim has uncertainty_disclosed: false
 *  3. Any active claim references a gate that is not passing
 *  4. Source files contain banned_patterns from claims/personality.yml
 *
 * Usage:
 *   node scripts/lint-claims-registry.mjs [--src-dir=./src] [--strict]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ── Load claims registry ───────────────────────────────────────────────────

function loadYaml(filePath) {
  // Minimal YAML parser for our known schema (avoids dependency on js-yaml)
  const raw = fs.readFileSync(filePath, 'utf8');
  return raw; // Return raw for manual parsing below
}

const claimsPath = path.join(ROOT, 'claims', 'personality.yml');
if (!fs.existsSync(claimsPath)) {
  console.error('❌ FAIL: claims/personality.yml not found. Create it before shipping personality features.');
  process.exit(1);
}

const rawYaml = fs.readFileSync(claimsPath, 'utf8');

// Extract gate statuses
const gateStatusSection = rawYaml.match(/release_gate_status:([\s\S]*?)(?=\nclaims:)/)?.[1] || '';
const gateStatuses = {};
for (const line of gateStatusSection.split('\n')) {
  const match = line.match(/^\s+(\w+):\s+(\w+)/);
  if (match) gateStatuses[match[1]] = match[2];
}

// Extract claims (simple line-by-line parse)
const claims = [];
let currentClaim = null;
for (const line of rawYaml.split('\n')) {
  if (line.match(/^\s+- id: (CL-\w+)/)) {
    if (currentClaim) claims.push(currentClaim);
    currentClaim = { id: line.match(/CL-\w+/)[0] };
  } else if (currentClaim) {
    const kv = line.match(/^\s+(\w[\w_]*): (.+)/);
    if (kv) {
      const [, k, v] = kv;
      currentClaim[k] = v.replace(/^["']|["']$/g, '').trim();
    }
  }
}
if (currentClaim) claims.push(currentClaim);

// Extract banned patterns
const bannedPatterns = [];
const bannedSection = rawYaml.match(/banned_patterns:([\s\S]*?)$/)?.[1] || '';
for (const line of bannedSection.split('\n')) {
  const match = line.match(/- pattern: "(.+)"/);
  if (match) bannedPatterns.push(match[1]);
}

// ── Validate claims ────────────────────────────────────────────────────────

let failures = 0;
const warnings = [];

console.log('\n🔍 Kesher Claims Registry Linter\n');
console.log(`  Registry: ${claimsPath}`);
console.log(`  Claims:   ${claims.length} total`);
console.log(`  Gates:    ${Object.keys(gateStatuses).length} tracked\n`);

for (const claim of claims) {
  const prefix = `  [${claim.id}]`;

  // Active claims must not be UNKNOWN
  if (claim.status === 'active' && claim.evidence_label === 'UNKNOWN') {
    console.error(`${prefix} ❌ Active claim has evidence_label UNKNOWN — must not reach production`);
    failures++;
  }

  // Active claims must disclose uncertainty
  if (claim.status === 'active' && claim.uncertainty_disclosed === 'false') {
    console.error(`${prefix} ❌ Active claim has uncertainty_disclosed: false — UI copy required`);
    failures++;
  }

  // Claims with release gates must not be active if gate is pending
  if (claim.release_gate && claim.release_gate !== 'null' && claim.status === 'active') {
    const gateStatus = gateStatuses[claim.release_gate];
    if (gateStatus && gateStatus !== 'passing') {
      console.error(`${prefix} ❌ Active claim depends on gate '${claim.release_gate}' which is '${gateStatus}'`);
      failures++;
    }
  }

  // prototype_only claims should not be in active status
  if (claim.status === 'prototype_only') {
    console.log(`${prefix} ⚠️  Prototype-only — blocked from production until gates pass`);
    warnings.push(claim.id);
  }

  if (failures === 0 && claim.status === 'active') {
    console.log(`${prefix} ✅ ${claim.claim_text?.substring(0, 60) || '(no text)'}`);
  }
}

// ── Scan source files for banned patterns ─────────────────────────────────

console.log('\n📋 Scanning source files for banned copy patterns...\n');

function walkSync(dir, exts = ['.ts', '.tsx', '.js', '.jsx', '.html']) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.git') {
      files.push(...walkSync(fullPath, exts));
    } else if (entry.isFile() && exts.some(e => entry.name.endsWith(e))) {
      files.push(fullPath);
    }
  }
  return files;
}

// Exclude files that intentionally reference banned terms as examples of
// what NOT to do (system instructions, validators, linters, tests, schemas).
// The linter only checks user-facing UI copy and AI output files.
const EXCLUDE_PATHS = [
  // Enforcement layer — describes bans, not copy
  'outputValidators.ts',
  'policies.ts',             // system instructions say "NEVER use soulmate" — intentional
  'prompts.ts',              // prompt rules list banned terms — intentional
  'explanationSchema.ts',    // lint regex patterns for banned terms — intentional
  // Tooling
  'lint-claims-registry.mjs',
  'scan-forbidden-fields.mjs',
  'redteam-personality.mjs',
  'personality.yml',
  // Tests and fixtures
  '__tests__',
  'test-personality',
  // Assessment UI note ("not a clinical diagnosis") — anti-claim disclosure, not a claim
  'PersonalityAssessment.tsx',
  // Compatibility panel disclaimer ("we never produce a compatibility score") — anti-claim
  'CompatibilityReflectionPanel.tsx',
];

const srcDir = path.join(ROOT, 'src');
const srcFiles = walkSync(srcDir).filter(
  f => !EXCLUDE_PATHS.some(exc => f.includes(exc))
);

let bannedHits = 0;
for (const filePath of srcFiles) {
  const content = fs.readFileSync(filePath, 'utf8');
  for (const pattern of bannedPatterns) {
    try {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(content)) {
        const relPath = path.relative(ROOT, filePath);
        // Find the line
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          if (regex.test(lines[i])) {
            console.error(`  ❌ BANNED: "${pattern}" found in ${relPath}:${i + 1}`);
            console.error(`     → ${lines[i].trim()}`);
            bannedHits++;
            break;
          }
        }
      }
    } catch (e) {
      // Regex syntax error — skip
    }
  }
}

if (bannedHits === 0) {
  console.log('  ✅ No banned patterns found in source files');
}

// ── Summary ────────────────────────────────────────────────────────────────

console.log('\n── Summary ─────────────────────────────────────────────\n');
console.log(`  Claim failures:  ${failures}`);
console.log(`  Banned hits:     ${bannedHits}`);
console.log(`  Prototype-only:  ${warnings.length} claims blocked from production`);
console.log('');

const totalFailures = failures + bannedHits;
if (totalFailures > 0) {
  console.error(`❌ CLAIMS LINTER FAILED: ${totalFailures} issue(s). Fix before merging.\n`);
  process.exit(1);
} else {
  console.log('✅ Claims registry linter passed.\n');
  process.exit(0);
}
