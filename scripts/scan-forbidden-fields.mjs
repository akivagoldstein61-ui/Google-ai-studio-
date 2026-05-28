#!/usr/bin/env node
/**
 * scan-forbidden-fields.mjs
 *
 * Scans TypeScript, JavaScript, and JSON source files for field names and
 * string patterns that violate the Kesher Personality Dimension forbidden
 * patterns policy (docs/personality/forbidden-patterns.md).
 *
 * Usage:  node scripts/scan-forbidden-fields.mjs
 *         npm run scan:forbidden-fields
 *
 * Exits with code 1 if any forbidden pattern is found.
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname, relative } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = join(__dirname, "..");

// ---------------------------------------------------------------------------
// Forbidden patterns catalogue
// Each entry: { id, rule, patterns: Array<string|RegExp> }
// ---------------------------------------------------------------------------
const FORBIDDEN = [
  {
    id: "FP-01",
    rule: "No compatibility score",
    patterns: [
      /compatibilityScore/i,
      /compatibility_score/i,
      /matchScore/i,
      /match_score/i,
      /compatibilityPercentage/i,
      /compatibility_percentage/i,
      /% compatible/i,
      /compatibility rating/i,
      /match rating/i,
    ],
  },
  {
    id: "FP-02",
    rule: "No soulmate score",
    patterns: [
      /soulmateScore/i,
      /soulmate_score/i,
      /isSoulmate/i,
      /bashert score/i,
      /perfect match/i,
    ],
  },
  {
    id: "FP-03",
    rule: "No marriage probability",
    patterns: [
      /marriageProbability/i,
      /marriage_probability/i,
      /weddingProbability/i,
      /marriage probability/i,
      /likely to marry/i,
      /wedding likelihood/i,
    ],
  },
  {
    id: "FP-04",
    rule: "No desirability score",
    patterns: [
      /desirabilityScore/i,
      /desirability_score/i,
      /attractivenessScore/i,
      /attractiveness_score/i,
      /hotScore/i,
      /popularityScore/i,
      /likeabilityScore/i,
      /desirability/i,
      /attractiveness score/i,
      /popularity score/i,
    ],
  },
  {
    id: "FP-05",
    rule: "No public trait rank",
    patterns: [
      /traitRank/i,
      /trait_rank/i,
      /personalityRank/i,
      /personality_rank/i,
      /bigFiveRank/i,
      /opennessRank/i,
      /conscientiousnessRank/i,
      /you rank #/i,
      /top \d+% in/i,
      /higher than average/i,
    ],
  },
  {
    id: "FP-06",
    rule: "No raw trait public exposure",
    patterns: [
      /rawTraitScore/i,
      /raw_trait_score/i,
      /traitVector/i,
      /trait_vector/i,
    ],
  },
  {
    id: "FP-07",
    rule: "No hidden personality ranking leakage",
    patterns: [
      /personalityBoost/i,
      /personality_boost/i,
      /traitWeightedRank/i,
    ],
  },
  {
    id: "FP-08",
    rule: "No diagnosis or clinical inference",
    patterns: [
      /\bclinicalLabel\b/i,
      /clinical_label/i,
      /mentalHealthScore/i,
      /\bdiagnosis\b/i,
      /\bdisorder\b/i,
      /\bpathology\b/i,
    ],
  },
  {
    id: "FP-09",
    rule: "No protected-trait inference from proxies",
    patterns: [
      /inferredReligion/i,
      /inferred_religion/i,
      /inferredEthnicity/i,
      /inferred_ethnicity/i,
      /inferredSexuality/i,
      /inferred_sexuality/i,
      /inferredPolitics/i,
    ],
  },
  {
    id: "FP-10",
    rule: "No AI auto-send",
    patterns: [
      /autoSend/i,
      /auto_send/i,
      /automaticMessage/i,
      /automaticallySend/i,
    ],
  },
  {
    id: "FP-11",
    rule: "No AI impersonation",
    patterns: [
      /aiGenerated.*?false/i,
    ],
  },
  {
    id: "FP-12",
    rule: "No public attractiveness scoring",
    patterns: [
      /attractivenessScore/i,
      /photoScore/i,
      /photo_score/i,
      /lookScore/i,
    ],
  },
  {
    id: "FP-13",
    rule: "No hidden throttling or ranking manipulation",
    patterns: [
      /personalityBoost/i,
      /personality_boost/i,
      /traitWeightedRank/i,
    ],
  },
  {
    id: "FP-14",
    rule: "No raw inferred personality dossier sharing",
    patterns: [
      /exportFullDossier/i,
      /sharePersonalityDossier/i,
      /fullPersonalityExport/i,
    ],
  },
  {
    id: "FP-15",
    rule: "No coercive mutual unlock",
    patterns: [
      /mutualUnlockRequired/i,
      /mutual_unlock_required/i,
      /coerciveMutualUnlock/i,
    ],
  },
  {
    id: "FP-16",
    rule: "No paywalled privacy/safety controls",
    patterns: [
      /isPremiumFeature.*(?:delete|reset|export|revoke|safety)/i,
      /(?:delete|reset|export|revoke|safety).*isPremiumFeature/i,
    ],
  },
];

// ---------------------------------------------------------------------------
// File extensions to scan
// ---------------------------------------------------------------------------
const SCAN_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".json", ".mjs", ".cjs"]);

// Directories to exclude entirely (governance infrastructure, dependencies, build output)
const EXCLUDE_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  ".vercel",
  ".next",
  "build",
  "coverage",
  // Governance scripts and docs contain forbidden strings intentionally as definitions/tests
  "scripts",
  "docs",
]);

// Sub-paths excluded because they contain forbidden strings in a prohibitory or enforcement context
// (AI policy enforcement layer — these files DEFINE the constraints, they don't violate them)
const EXCLUDE_PATH_PREFIXES = [
  "src/ai/outputValidators",
  "src/ai/policies",
  "src/ai/prompts",
  "src/ai/dataClassification",
  "src/lib/explanationSchema",
];

// Files that define the policy itself should not be self-flagged
const EXCLUDE_FILES = new Set([
  "scan-forbidden-fields.mjs",
  "forbidden-patterns.md",
]);

// Lines are skipped if they contain negation context — the pattern appears in a prohibition statement
const NEGATION_PREFIXES = [
  /never\s/i,
  /\bnot?\s+a\b/i,
  /\bno\s+\w+\s+(?:score|rank|diagnosis|probability|inference)/i,
  /prohibited/i,
  /forbidden/i,
  /must\s+not/i,
  /do\s+not/i,
  /\/\//,    // comment lines
  /\*\s/,    // JSDoc / block comment lines
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function shouldSkipDir(name) {
  return EXCLUDE_DIRS.has(name);
}

function shouldSkipFile(filePath) {
  const base = filePath.split("/").pop();
  if (EXCLUDE_FILES.has(base)) return true;
  const rel = relative(ROOT, filePath).replace(/\\/g, "/");
  if (/\.(test|spec)\.[cm]?[jt]sx?$/.test(rel)) return true;
  if (EXCLUDE_PATH_PREFIXES.some((prefix) => rel.startsWith(prefix))) return true;
  return false;
}

function isNegationContext(line) {
  const trimmed = line.trim();
  return NEGATION_PREFIXES.some((p) => p.test(trimmed));
}

function isAllowedInstrumentSource(relPath, id, line) {
  return relPath === "src/personality/ipipBfas.ts" &&
    id === "FP-08" &&
    line.includes("Am not bothered by disorder.");
}

function* walkFiles(dir) {
  for (const entry of readdirSync(dir)) {
    if (shouldSkipDir(entry)) continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      yield* walkFiles(full);
    } else if (SCAN_EXTENSIONS.has(extname(entry))) {
      yield full;
    }
  }
}

// ---------------------------------------------------------------------------
// Scan
// ---------------------------------------------------------------------------
let findings = [];

for (const filePath of walkFiles(ROOT)) {
  if (shouldSkipFile(filePath)) continue;

  let content;
  try {
    content = readFileSync(filePath, "utf8");
  } catch {
    continue;
  }

  const lines = content.split("\n");
  const relPath = relative(ROOT, filePath);

  for (const { id, rule, patterns } of FORBIDDEN) {
    for (const pattern of patterns) {
      lines.forEach((line, idx) => {
        if (isNegationContext(line)) return;
        if (isAllowedInstrumentSource(relPath, id, line)) return;
        if (pattern instanceof RegExp ? pattern.test(line) : line.includes(pattern)) {
          findings.push({ id, rule, file: relPath, line: idx + 1, text: line.trim() });
        }
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
if (findings.length === 0) {
  console.log("✅  scan-forbidden-fields: no violations found.");
  process.exit(0);
} else {
  console.error(`❌  scan-forbidden-fields: ${findings.length} violation(s) found.\n`);
  for (const f of findings) {
    console.error(`  [${f.id}] ${f.rule}`);
    console.error(`    ${f.file}:${f.line}`);
    console.error(`    > ${f.text}\n`);
  }
  process.exit(1);
}
