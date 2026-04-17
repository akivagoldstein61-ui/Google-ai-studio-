import test from "node:test";
import assert from "node:assert/strict";
import {
  adaptBioCoachResponse,
  adaptWhyMatchResponse,
  classifySafety,
  validateDatePlannerRequest,
} from "../server/aiTrustBackbone.js";

test("bio coach adapter attaches trust disclosure", () => {
  const output = {
    drafts: [
      { bio_he: "טקסט א", what_changed: "clearer" },
      { bio_he: "טקסט ב", what_changed: "warmer" },
      { bio_he: "טקסט ג", what_changed: "shorter" },
    ],
  };

  const adapted = adaptBioCoachResponse(output, "gemini-2.5-flash");
  assert.equal(adapted.trust.disclosure.ai_generated, true);
  assert.equal(adapted.trust.provenance.feature_id, "bio_coach");
});

test("values phrasing is softened in why-match output", () => {
  const output = {
    reasons: ["You are a perfect match", "This is definitely aligned"],
    first_question: "Are we guaranteed to click?",
    gentle_clarification: "This is a perfect match for values",
  };

  const adapted = adaptWhyMatchResponse(output, "gemini-2.5-flash");
  assert.equal(adapted.reasons[0].includes("perfect match"), false);
  assert.equal(adapted.reasons[1].includes("definitely"), false);
  assert.equal(adapted.first_question.includes("guaranteed"), false);
});

test("safety classifier flags common scam language", () => {
  const result = classifySafety(
    "Let's move to telegram and send money via crypto gift card"
  );

  assert.equal(result.risk_level, "high");
  assert.equal(result.categories.includes("scam"), true);
});

test("date planning request normalizes time to iso", () => {
  const validated = validateDatePlannerRequest({
    area: "Tel Aviv",
    time: "2026-05-01T19:30:00+03:00",
    preferences: "quiet cafe",
    budget: "medium",
  });

  assert.equal(validated.value.area, "Tel Aviv");
  assert.equal(validated.value.time, "2026-05-01T16:30:00.000Z");
});
