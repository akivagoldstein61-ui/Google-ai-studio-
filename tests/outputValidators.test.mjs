import test from "node:test";
import assert from "node:assert/strict";

import {
  COMPATIBILITY_ALLOWED_SIGNALS,
  WHY_MATCH_FORBIDDEN_SIGNALS,
  outputValidators,
  sanitizeWhyMatchSignals,
} from "../src/ai/outputValidators.ts";

test("validateWhyMatch accepts visible-signal provenance", () => {
  const output = outputValidators.validateWhyMatch({
    reasons_he: [
      "שניכם מציינים ערכים משפחתיים בפרופיל.",
      "הכוונה הזוגית שלכם מוצגת בצורה דומה.",
    ],
    first_question_he: "איך נראה לך דייט ראשון רגוע ונעים?",
    signals_used: ["visible_values", "visible_intent"],
    signals_not_used: [...WHY_MATCH_FORBIDDEN_SIGNALS],
    uncertainty_he: "זו נקודת פתיחה עדינה על סמך פרטים גלויים בלבד.",
  });

  assert.equal(output.reasons_he.length, 2);
});

test("validateWhyMatch blocks score and destiny language", () => {
  assert.throws(
    () =>
      outputValidators.validateWhyMatch({
        reasons_he: [
          "אתם 94% התאמה ונועדתם להיות יחד.",
          "שניכם אוהבים שיחות עומק.",
        ],
        first_question_he: "מה חשוב לך בקשר?",
        signals_used: ["visible_values"],
        signals_not_used: [...WHY_MATCH_FORBIDDEN_SIGNALS],
        uncertainty_he: "פרטים גלויים בלבד.",
      }),
    /prohibited language/,
  );
});

test("validateWhyMatch blocks private taste as a used signal", () => {
  assert.throws(
    () =>
      outputValidators.validateWhyMatch({
        reasons_he: [
          "יש לכם ערך משותף סביב משפחה.",
          "הפרופילים שלכם מזכירים תקשורת נעימה.",
        ],
        first_question_he: "מה עוזר לך להרגיש בנוח בהיכרות?",
        signals_used: ["visible_values", "private_taste_profile"],
        signals_not_used: [...WHY_MATCH_FORBIDDEN_SIGNALS],
        uncertainty_he: "פרטים גלויים בלבד.",
      }),
    /forbidden signal/,
  );
});

test("validateWhyMatch blocks private signal ids leaked in prose", () => {
  assert.throws(
    () =>
      outputValidators.validateWhyMatch({
        reasons_he: [
          "private_taste_profile אומר שיש כאן התאמה.",
          "שניכם מחפשים קשר רציני.",
        ],
        first_question_he: "מה חשוב לך בקשר?",
        signals_used: ["visible_intent"],
        signals_not_used: [...WHY_MATCH_FORBIDDEN_SIGNALS],
        uncertainty_he: "פרטים גלויים בלבד.",
      }),
    /hidden_or_private_signal_leak/,
  );
});

test("validateWhyMatch requires explicit private-signal exclusions", () => {
  assert.throws(
    () =>
      outputValidators.validateWhyMatch({
        reasons_he: [
          "שניכם מציינים עניין בלמידה.",
          "שניכם מחפשים קשר רציני.",
        ],
        first_question_he: "מה למדת לאחרונה?",
        signals_used: ["visible_interests", "visible_intent"],
        signals_not_used: ["private_taste_profile"],
        uncertainty_he: "פרטים גלויים בלבד.",
      }),
    /missing excluded signal/,
  );
});

test("sanitizeWhyMatchSignals drops unknown and forbidden signal ids", () => {
  assert.deepEqual(
    sanitizeWhyMatchSignals([
      "visible_values",
      "private_taste_profile",
      "Shared values",
      "visible_prompts",
    ]),
    ["visible_values", "visible_prompts"],
  );
});


test("validateCompatibilityReflection accepts consent-safe reflection shape", () => {
  const output = outputValidators.validateCompatibilityReflection({
    shared_strengths_he: ["שניכם מתארים תקשורת ישירה כמשהו חשוב."],
    friction_loops: [
      {
        schemaVersion: "1.0",
        confidence: 0.7,
        evidenceLabel: "heuristic",
        dynamic_he: "קצב תכנון שונה",
        advice_he: "כדאי לתאם ציפיות לפני שקובעים תוכניות.",
      },
    ],
    question_to_explore_he: "כמה זמן מראש עוזר לך להרגיש בנוח עם תוכנית?",
    micro_habit_he: "לסכם ציפיות קטנות לפני הדייט.",
    gentle_boundary_he: "זו הזמנה לשיחה, לא קביעה על הקשר.",
    signals_used: [COMPATIBILITY_ALLOWED_SIGNALS[0]],
  });

  assert.equal(output.friction_loops.length, 1);
});

test("validateCompatibilityReflection blocks scores and forbidden signals", () => {
  assert.throws(
    () =>
      outputValidators.validateCompatibilityReflection({
        shared_strengths_he: ["אתם 98% התאמה ונשמות תאומות."],
        friction_loops: [],
        question_to_explore_he: "מה חשוב לכם?",
        micro_habit_he: "לדבר ברור.",
        gentle_boundary_he: "זו קביעה סופית.",
        signals_used: ["private_taste_profile"],
      }),
    /(forbidden signal|prohibited language)/,
  );
});
