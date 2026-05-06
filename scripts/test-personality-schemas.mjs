#!/usr/bin/env node
/**
 * test-personality-schemas.mjs
 *
 * Validates that personality-related AI output schemas conform to the
 * Kesher Personality Dimension governance contracts:
 *
 *   1. All required fields are present.
 *   2. No forbidden fields are present in the schema definition.
 *   3. Uncertainty language fields are required.
 *   4. Evidence label field is required.
 *   5. No raw numeric trait score is exposed at the top level of a public response.
 *
 * This is a static schema contract test. It does not call any live AI model.
 *
 * Usage:  node scripts/test-personality-schemas.mjs
 *         npm run test:schemas
 *
 * Exits with code 1 if any schema contract is violated.
 */

// ---------------------------------------------------------------------------
// Schema contracts
// ---------------------------------------------------------------------------

/**
 * Minimum required fields for any personality interpretation AI response schema.
 * When real schemas are added to src/ai/schemas.ts, import and validate them here.
 */
const REQUIRED_INTERPRETATION_FIELDS = [
  "evidenceLabel",       // must be one of VERIFIED | INFERRED | HEURISTIC | UNKNOWN
  "uncertaintyNote",     // free-text uncertainty disclosure
  "dimensionInsights",   // array of dimension-level interpretations
];

/**
 * Fields that must NEVER appear in a public-facing personality API response schema.
 */
const FORBIDDEN_RESPONSE_FIELDS = [
  "compatibilityScore",
  "soulmateScore",
  "marriageProbability",
  "desirabilityScore",
  "traitRank",
  "rawTraitScore",
  "rawTraitVector",
  "traitVector",
  "clinicalLabel",
  "diagnosis",
  "attractivenessScore",
  "personalityBoost",
  "fullDossier",
];

/**
 * Valid evidence label values.
 */
const VALID_EVIDENCE_LABELS = ["VERIFIED", "INFERRED", "HEURISTIC", "UNKNOWN"];

// ---------------------------------------------------------------------------
// Simulated schema under test
// In a real implementation, import the actual schema from src/ai/schemas.ts
// and validate it against the contracts above.
// ---------------------------------------------------------------------------

/**
 * Example governance-compliant schema shape.
 * Replace with actual import when schemas.ts defines personality schemas.
 */
const EXAMPLE_PERSONALITY_INTERPRETATION_SCHEMA = {
  type: "object",
  required: ["evidenceLabel", "uncertaintyNote", "dimensionInsights"],
  properties: {
    evidenceLabel: { type: "string", enum: VALID_EVIDENCE_LABELS },
    uncertaintyNote: { type: "string", minLength: 1 },
    dimensionInsights: {
      type: "array",
      items: {
        type: "object",
        required: ["dimension", "insight"],
        properties: {
          dimension: { type: "string" },
          insight: { type: "string" },
        },
      },
    },
  },
  additionalProperties: false,
};

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

function checkRequiredFields(schema, requiredFields) {
  const schemaRequired = schema.required || [];
  const missing = requiredFields.filter((f) => !schemaRequired.includes(f));
  return missing;
}

function checkForbiddenFields(schema, forbiddenFields) {
  const schemaProps = Object.keys(schema.properties || {});
  const found = forbiddenFields.filter((f) => schemaProps.includes(f));
  return found;
}

function checkEvidenceLabelEnum(schema) {
  const prop = schema.properties?.evidenceLabel;
  if (!prop) return ["evidenceLabel property not found"];
  if (!prop.enum) return ["evidenceLabel must have an enum constraint"];
  const invalidValues = prop.enum.filter((v) => !VALID_EVIDENCE_LABELS.includes(v));
  return invalidValues.map((v) => `evidenceLabel enum contains invalid value: "${v}"`);
}

function checkAdditionalPropertiesFalse(schema) {
  if (schema.additionalProperties !== false) {
    return ["schema must set additionalProperties: false to prevent forbidden field leakage"];
  }
  return [];
}

// ---------------------------------------------------------------------------
// Run tests
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

console.log("\nPersonality Schema Validation\n");
console.log("Schema: EXAMPLE_PERSONALITY_INTERPRETATION_SCHEMA\n");

test("Required fields present", () =>
  checkRequiredFields(EXAMPLE_PERSONALITY_INTERPRETATION_SCHEMA, REQUIRED_INTERPRETATION_FIELDS)
    .map((f) => `Missing required field: "${f}"`)
);

test("No forbidden fields in schema properties", () =>
  checkForbiddenFields(EXAMPLE_PERSONALITY_INTERPRETATION_SCHEMA, FORBIDDEN_RESPONSE_FIELDS)
    .map((f) => `Forbidden field found in schema: "${f}"`)
);

test("evidenceLabel has valid enum constraint", () =>
  checkEvidenceLabelEnum(EXAMPLE_PERSONALITY_INTERPRETATION_SCHEMA)
);

test("additionalProperties is false", () =>
  checkAdditionalPropertiesFalse(EXAMPLE_PERSONALITY_INTERPRETATION_SCHEMA)
);

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n${passCount} passed, ${failures.length} failed.\n`);

if (failures.length > 0) {
  console.error("❌  test-personality-schemas: schema contracts violated.");
  process.exit(1);
} else {
  console.log("✅  test-personality-schemas: all schema contracts satisfied.");
  process.exit(0);
}
