import assert from "node:assert/strict";
import { test } from "vitest";

import {
  FORBIDDEN_PERSONALITY_FIELDS,
  assertNoForbiddenPersonalityFields,
  redactPersonalityLogPayload,
} from "../src/personality/privacy.ts";
import {
  buildPrivatePersonalityProfileSummary,
  buildPersonalityExport,
  KESHER_PERSONALITY_ITEMS,
  EMPTY_PERSONALITY_STATE,
  scoreKesherPersonalityAssessment,
} from "../src/personality/scoring.ts";
import {
  ConsentReceiptSchema,
  PersonalityProfileSummarySchema,
  ProvenanceLedgerSchema,
  SafetyClassificationResultSchema,
  ShareGrantSchema,
  WhyThisMatchCardSchema,
} from "../src/personality/zodSchemas.ts";
import {
  buildWhitelistedExplanationBundle,
  createFallbackWhyThisMatchCard,
  validateWhyThisMatchCard,
} from "../src/personality/whyMatch.ts";

test("forbidden personality fields fail validation at any nesting depth", () => {
  for (const field of FORBIDDEN_PERSONALITY_FIELDS) {
    assert.throws(
      () => assertNoForbiddenPersonalityFields({ safe: { [field]: true } }),
      new RegExp(field),
    );
  }
});

test("personality log redaction removes raw answers and message drafts", () => {
  const redacted = redactPersonalityLogPayload({
    event: "assessment_saved",
    rawAnswers: { kesher_extraversion_enthusiasm_1: 5 },
    personalityAnswers: { kesher_extraversion_enthusiasm_1: 5 },
    messageDraft: "Want to meet tonight?",
    nested: {
      rawMessage: "private message",
      safeValue: "kept",
    },
  });

  assert.equal(redacted.rawAnswers, "[REDACTED]");
  assert.equal(redacted.personalityAnswers, "[REDACTED]");
  assert.equal(redacted.messageDraft, "[REDACTED]");
  assert.equal(redacted.nested.rawMessage, "[REDACTED]");
  assert.equal(redacted.nested.safeValue, "kept");
});

test("deterministic Kesher-original scoring stores instrument and score versions", () => {
  const answers = Object.fromEntries(
    KESHER_PERSONALITY_ITEMS.map((item, index) => [item.id, (index % 5) + 1]),
  );

  const result = scoreKesherPersonalityAssessment(answers);

  assert.equal(result.instrument_version, "kesher-reflection-v1");
  assert.equal(result.score_version, "kesher-aspect-key-v1");
  assert.equal(result.item_text_source, "kesher_original");
  assert.equal(result.is_partial, false);
  assert.equal(result.domains.length, 5);
  assert.equal(result.aspects.length, 10);
  assert.equal(result.completion.percent, 100);
  assert.equal(result.privacy.visibility_default, "private");
  assert.equal(result.privacy.raw_answers_stored, false);
  assert.equal(result.privacy.llm_scoring, false);
  assert.ok(result.domains.every((domain) => domain.score >= 0 && domain.score <= 100));
  assert.ok(result.aspects.every((aspect) => aspect.item_count === 2));
  assert.ok(result.domains.every((domain) => domain.aspect_ids.length === 2));
});

test("partial deterministic report is labeled partial", () => {
  const result = scoreKesherPersonalityAssessment({
    kesher_extraversion_enthusiasm_1: 5,
    kesher_agreeableness_compassion_1: 4,
  });

  assert.equal(result.is_partial, true);
  assert.equal(result.completion.answered, 2);
  assert.equal(result.completion.total, KESHER_PERSONALITY_ITEMS.length);
  assert.equal(result.aspects.find((aspect) => aspect.id === "enthusiasm")?.item_count, 1);
  assert.match(result.summary_he, /דוח לא מלא/);
});

test("reverse keyed Kesher items change aspect direction deterministically", () => {
  const high = scoreKesherPersonalityAssessment({
    kesher_extraversion_enthusiasm_1: 5,
    kesher_extraversion_enthusiasm_2r: 1,
  });
  const low = scoreKesherPersonalityAssessment({
    kesher_extraversion_enthusiasm_1: 1,
    kesher_extraversion_enthusiasm_2r: 5,
  });

  assert.equal(high.aspects.find((aspect) => aspect.id === "enthusiasm")?.band, "higher");
  assert.equal(low.aspects.find((aspect) => aspect.id === "enthusiasm")?.band, "lower");
});

test("private personality summary is schema-compatible and excludes raw answers", () => {
  const report = scoreKesherPersonalityAssessment(
    Object.fromEntries(KESHER_PERSONALITY_ITEMS.map((item) => [item.id, 4])),
  );
  const summary = PersonalityProfileSummarySchema.parse(buildPrivatePersonalityProfileSummary(report));

  assert.equal(summary.instrument_version, "kesher-reflection-v1");
  assert.equal(summary.report_status, "complete");
  assert.equal(summary.domains.length, 5);
  assert.equal(JSON.stringify(summary).includes("answers"), false);
  assert.equal(JSON.stringify(summary).includes("raw"), false);
});

test("personality export excludes raw answers", () => {
  const exportPayload = buildPersonalityExport({
    ...EMPTY_PERSONALITY_STATE,
    answers: { kesher_extraversion_enthusiasm_1: 5 },
    report: scoreKesherPersonalityAssessment({
      kesher_extraversion_enthusiasm_1: 5,
    }),
  });

  assert.equal("answers" in exportPayload, false);
  assert.equal(exportPayload.report?.item_text_source, "kesher_original");
});

test("Why This Match bundle excludes private personality, hidden rank, safety flags, private taste, and raw messages", () => {
  const bundle = buildWhitelistedExplanationBundle({
    userProfile: {
      displayName: "A",
      tags: ["hiking", "learning"],
      privateTaste: { soft_preferences: ["hidden"] },
      personalityScores: scoreKesherPersonalityAssessment({
        kesher_openness_openness_1: 5,
        kesher_openness_openness_2r: 1,
      }),
      hidden_personality_rank: 1,
    },
    candidateProfile: {
      displayName: "B",
      tags: ["hiking", "coffee"],
      safetyFlags: ["moderation"],
      rawMessages: ["private"],
    },
    requestedSignals: [
      "interests",
      "intent",
      "observance",
      "private_personality",
      "hidden_rank",
      "raw_messages",
    ],
  });

  assert.deepEqual(bundle.signals_used.sort(), ["interests"]);
  assert.ok(bundle.signals_not_used.includes("private_personality"));
  assert.ok(bundle.signals_not_used.includes("hidden_rank"));
  assert.ok(bundle.signals_not_used.includes("raw_messages"));
  assert.equal(JSON.stringify(bundle).includes("personalityScores"), false);
  assert.equal(JSON.stringify(bundle).includes("privateTaste"), false);
  assert.equal(JSON.stringify(bundle).includes("rawMessages"), false);
});

test("Why This Match validator rejects leaked fields and fallback is deterministic", () => {
  assert.throws(
    () =>
      validateWhyThisMatchCard({
        schema_version: "1.0",
        reasons_he: ["עניין משותף בטיולים", "כוונות דומות"],
        first_question_he: "מה מקום הקפה האהוב עליך?",
        signals_used: ["interests"],
        signals_not_used: [],
        compatibility_score: 97,
      }),
    /compatibility_score/,
  );

  const fallback = createFallbackWhyThisMatchCard({
    signals_used: ["interests"],
    signals_not_used: ["private_personality"],
    publicFacts: {
      sharedInterests: ["hiking"],
      sharedIntent: "serious_relationship",
      sharedObservance: undefined,
    },
  });

  assert.deepEqual(fallback.signals_used, ["interests"]);
  assert.deepEqual(fallback.signals_not_used, ["private_personality"]);
  assert.ok(fallback.reasons_he.length >= 2);
});

test("structured personality schemas accept safe cards and reject unsafe cards", () => {
  const profile = PersonalityProfileSummarySchema.parse({
    schema_version: "1.0",
    report_status: "partial",
    instrument_version: "kesher-reflection-v1",
    score_version: "kesher-aspect-key-v1",
    item_text_source: "kesher_original",
    summary_he: "זהו סיכום פרטי ועדין של נטיות תקשורת.",
    domains: [
      {
        id: "agreeableness",
        label_he: "נעימות",
        band: "balanced",
        description_he: "נטייה לשים לב לצרכים של אחרים.",
        evidence_label: "heuristic",
      },
    ],
  });
  assert.equal(profile.report_status, "partial");

  assert.throws(
    () =>
      WhyThisMatchCardSchema.parse({
        schema_version: "1.0",
        reasons_he: ["עניין משותף"],
        first_question_he: "מה מעניין אותך השבוע?",
        signals_used: ["interests"],
        signals_not_used: [],
        raw_trait_public: true,
      }),
    /raw_trait_public/,
  );
});

test("consent, share grant, privacy disclosure, risk flags, ledger, and safety schemas validate", () => {
  ConsentReceiptSchema.parse({
    id: "consent_1",
    user_id: "user_1",
    feature_id: "personality_assessment",
    consent_version: "1.0",
    granted_at: "2026-04-28T00:00:00.000Z",
    scopes: ["private_assessment"],
    item_text_source: "kesher_original",
  });

  ShareGrantSchema.parse({
    id: "grant_1",
    owner_user_id: "user_1",
    recipient_user_id: "user_2",
    scopes: ["personality_share_card"],
    created_at: "2026-04-28T00:00:00.000Z",
    revoked_at: null,
  });

  ProvenanceLedgerSchema.parse({
    id: "ledger_1",
    user_id: "user_1",
    action: "reset",
    occurred_at: "2026-04-28T00:00:00.000Z",
    actor: "user",
    raw_payload_logged: false,
    affected_records: ["personality_report", "share_grants"],
  });

  SafetyClassificationResultSchema.parse({
    schema_version: "1.0",
    level: "none",
    categories: [],
    user_facing_note_he: "",
    user_facing_note_en: "",
  });
});

test("reset and delete cascades revoke grants and clear derived records", () => {
  const resetLedger = EMPTY_PERSONALITY_STATE.cascade("reset", "user_1");
  assert.deepEqual(resetLedger.affected_records, [
    "personality_answers",
    "personality_report",
    "personality_share_cards",
    "personality_share_grants",
    "why_match_personality_provenance",
  ]);
  assert.equal(resetLedger.raw_payload_logged, false);

  const deleteLedger = EMPTY_PERSONALITY_STATE.cascade("delete", "user_1");
  assert.equal(deleteLedger.action, "delete");
  assert.ok(deleteLedger.affected_records.includes("personality_consent_receipts"));
});
