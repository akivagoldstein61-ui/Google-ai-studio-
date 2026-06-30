import {
  WHY_MATCH_ALLOWED_SIGNALS,
  WHY_MATCH_FORBIDDEN_SIGNALS,
  containsBannedPhrase,
} from './dataClassification.ts';
import { assertNoForbiddenPersonalityFields } from '@/personality/privacy';

// Re-export for backward compatibility (schemas.ts imports these from outputValidators)
export { WHY_MATCH_ALLOWED_SIGNALS, WHY_MATCH_FORBIDDEN_SIGNALS } from './dataClassification.ts';

export const COMPATIBILITY_ALLOWED_SIGNALS = [
  "mutually_shared_values",
  "mutually_visible_intent",
  "mutually_visible_observance",
  "mutually_visible_lifestyle",
  "mutually_visible_interests",
  "mutually_visible_prompts",
  "mutually_approved_share_card",
] as const;

const WHY_MATCH_ALLOWED_SIGNAL_SET = new Set<string>(WHY_MATCH_ALLOWED_SIGNALS);
const WHY_MATCH_FORBIDDEN_SIGNAL_SET = new Set<string>(WHY_MATCH_FORBIDDEN_SIGNALS);
const COMPATIBILITY_ALLOWED_SIGNAL_SET = new Set<string>(COMPATIBILITY_ALLOWED_SIGNALS);

const PROHIBITED_PATTERNS: { code: string; pattern: RegExp; message: string }[] = [
  {
    code: "compatibility_score",
    pattern: /(\b\d{1,3}\s*%\b)|(\b(?:compatibility|match)\s*(?:score|percent(?:age)?|rating)\b)|(\b(?:score|rate|rank)\s+(?:this|the)\s+(?:match|compatibility)\b)|(ציון\s+התאמה|אחוז(?:י)?\s+התאמה|\d{1,3}\s*%)/i,
    message: "Output must not include compatibility scores, match percentages, or score-like claims.",
  },
  {
    code: "destiny_claim",
    pattern: /\b(?:soulmate(?:s)?|soul\s*mate(?:s)?|destiny|destined|meant\s+to\s+be|bashert|perfect\s+match)\b|(נשמה\s+תאומה|גורל|נועדתם|באשערט|זיווג\s+משמים|התאמה\s+מושלמת)/i,
    message: "Output must not include soulmate, destiny, or perfect-match claims.",
  },
  {
    code: "negative_verdict",
    pattern: /\b(?:doomed|incompatible|not\s+compatible|will\s+not\s+work)\b|(חסרי\s+סיכוי|לא\s+מתאימים|זה\s+לא\s+יעבוד)/i,
    message: "Output must not include fixed negative compatibility verdicts.",
  },
  {
    code: "attractiveness_or_desirability",
    pattern: /\b(?:attractiveness|desirability|hotness|looks)\s*(?:score|rating|tier|rank)\b|\b(?:desirability\s+tier|more\s+desirable|less\s+desirable|out\s+of\s+your\s+league|high\s+value|low\s+value)\b|(ציון\s+(?:יופי|מראה|משיכה)|דירוג\s+(?:יופי|מראה|משיכה))/i,
    message: "Output must not include attractiveness, desirability, hotness, or looks scores.",
  },
  {
    code: "hidden_or_private_signal_leak",
    pattern: /\b(?:private[_\s-]?taste(?:[_-]?profile)?|hidden[_\s-]?(?:ranking|dealbreaker|weight)(?:[_-]?signals?)?|raw[_\s-]?(?:personality|bfas|aspect)[_\s-]?scores?|(?:personality|bfas|aspect)[_\s-]?scores?|private[_\s-]?messages?|exact[_\s-]?location)\b|(טעם\s+פרטי|דירוג\s+נסתר|מסר(?:ים)?\s+פרטי(?:ים)?|מיקום\s+מדויק)/i,
    message: "Output must not reveal private taste, hidden ranking, raw scores, private messages, or exact location.",
  },
  {
    code: "clinical_or_fixed_identity",
    pattern: /\b(?:diagnos(?:e|is|ed)|clinical(?:ly)?|pathology|syndrome|therapy|treatment|toxic|narcissist(?:ic)?|borderline|bipolar|adhd|autistic|depressed|anxious|personality\s+disorder|you\s+are\s+(?:always|never))\b|(אבחון|מאובחנ(?:ת|ים|ות)?|טיפול|הפרעת\s+אישיות|נרקיסיסט(?:ית)?)/i,
    message: "Output must not include diagnosis, treatment framing, clinical labels, or fixed identity claims.",
  },
  {
    code: "protected_trait_inference",
    pattern: /\b(?:I\s+infer(?:red)?|I\s+can\s+tell|looks\s+like)\s+(?:their|your)?\s*(?:ethnicity|race|religion|politics|sexuality|disability|health)\b|(אני\s+מסיק|אפשר\s+לראות\s+את\s+(?:הדת|המוצא|הפוליטיקה|הבריאות))/i,
    message: "Output must not infer protected or sensitive traits.",
  },
  {
    code: "impersonation_or_auto_send",
    pattern: /\b(?:auto[-\s]?send|sent\s+(?:it|this)\s+for\s+you|pretend\s+to\s+be\s+you|as\s+if\s+I\s+(?:am|were)\s+you|I\s+will\s+send)\b|(שלחתי\s+בשבילך|אשלח\s+בשמך|להעמיד\s+פנים\s+שאני\s+את(?:ה)?)/i,
    message: "Messaging help must be draft-only and must not impersonate or auto-send.",
  },
];

export function containsProhibitedLanguage(text: string): boolean {
  if (!text) return false;
  return PROHIBITED_PATTERNS.some(({ pattern }) => pattern.test(text));
}

export function getProhibitedLanguageViolations(text: string) {
  if (!text) return [];
  return PROHIBITED_PATTERNS.filter(({ pattern }) => pattern.test(text)).map(
    ({ code, message }) => ({ code, message }),
  );
}

function validateStringFields(obj: any) {
  if (!obj) return;
  assertNoForbiddenPersonalityFields(obj);
  for (const key in obj) {
    if (key === "signals_used" || key === "signals_not_used") continue;
    if (typeof obj[key] === "string") {
      if (containsProhibitedLanguage(obj[key])) {
        const violations = getProhibitedLanguageViolations(obj[key]);
        throw new Error(
          `Output contains prohibited language / banned phrase in field '${key}': ${violations.map(v => v.code).join(", ")}.`,
        );
      }
    } else if (typeof obj[key] === "object") {
      validateStringFields(obj[key]);
    }
  }
}

function arrayOfStrings(value: any): string[] {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0.5;
  return Math.max(0, Math.min(1, value));
}

export function sanitizeWhyMatchSignals(signals: string[] = []) {
  const normalizedSignals = signals
    .map((signal) => String(signal).trim())
    .filter(Boolean);
  const allowed = normalizedSignals.filter((signal) =>
    WHY_MATCH_ALLOWED_SIGNAL_SET.has(signal),
  );

  return Array.from(new Set(allowed.length > 0 ? allowed : [
    "visible_values",
    "visible_intent",
    "visible_observance",
    "visible_interests",
  ]));
}

function validateWhyMatchSignals(output: any) {
  const signalsUsed = arrayOfStrings(output?.signals_used);
  const signalsNotUsed = arrayOfStrings(output?.signals_not_used);

  if (signalsUsed.length === 0) {
    throw new Error("Invalid Why Match output: missing signals_used.");
  }

  for (const signal of signalsUsed) {
    if (WHY_MATCH_FORBIDDEN_SIGNAL_SET.has(signal)) {
      throw new Error(`Invalid Why Match output: forbidden signal used '${signal}'.`);
    }
    if (!WHY_MATCH_ALLOWED_SIGNAL_SET.has(signal)) continue;
  }

  for (const signal of WHY_MATCH_FORBIDDEN_SIGNALS) {
    if (!signalsNotUsed.includes(signal)) {
      throw new Error(`Invalid Why Match output: missing excluded signal '${signal}'.`);
    }
  }
}

function validateCompatibilitySignals(output: any) {
  const signalsUsed = arrayOfStrings(output?.signals_used);

  if (signalsUsed.length === 0) {
    throw new Error("Invalid Compatibility Reflection output: missing signals_used.");
  }

  for (const signal of signalsUsed) {
    if (WHY_MATCH_FORBIDDEN_SIGNAL_SET.has(signal)) {
      throw new Error(`Invalid Compatibility Reflection output: forbidden signal used '${signal}'.`);
    }
    if (!COMPATIBILITY_ALLOWED_SIGNAL_SET.has(signal)) {
      throw new Error(`Invalid Compatibility Reflection output: unapproved signal '${signal}'.`);
    }
  }
}

export const outputValidators = {
  validateBioCoach(output: any) {
    if (!output || !output.drafts || !Array.isArray(output.drafts)) {
      throw new Error("Invalid Bio Coach output: missing drafts array.");
    }
    return output;
  },

  validateTasteProfile(output: any) {
    const weights = output?.weights;
    if (
      !output ||
      !weights ||
      typeof weights !== "object" ||
      typeof (weights.values_weight ?? weights.values_vs_lifestyle) !== "number" ||
      typeof weights.stability_weight !== "number" ||
      typeof weights.pacing_weight !== "number"
    ) {
      throw new Error("Invalid Taste Profile output: missing weights.");
    }
    return {
      ...output,
      hard_dealbreakers: [],
      weights: {
        values_weight: clamp01(weights.values_weight ?? weights.values_vs_lifestyle),
        stability_weight: clamp01(weights.stability_weight),
        pacing_weight: clamp01(weights.pacing_weight),
      },
    };
  },

  validateWhyMatch(output: any) {
    const reasons = Array.isArray(output?.reasons)
      ? output.reasons
      : Array.isArray(output?.reasons_he)
        ? output.reasons_he
        : null;

    if (!output || !reasons) {
      throw new Error("Invalid Why Match output: missing reasons array.");
    }

    validateStringFields(output);
    validateWhyMatchSignals(output);

    // Banned phrases — protect against soulmate/score regressions even when
    // structured-output guards pass.
    for (const reason of reasons) {
      if (typeof reason !== 'string') continue;
      const bad = containsBannedPhrase(reason);
      if (bad) {
        throw new Error(`Invalid Why Match output: banned phrase "${bad}" in reason.`);
      }
    }
    const firstQuestion = output.first_question ?? output.first_question_he;
    if (typeof firstQuestion === 'string') {
      const bad = containsBannedPhrase(firstQuestion);
      if (bad) {
        throw new Error(`Invalid Why Match output: banned phrase "${bad}" in first_question.`);
      }
    }

    // signals_used / signals_not_used — must be arrays if present, and
    // must NOT include any forbidden signal name.
    const allowed = new Set<string>(WHY_MATCH_ALLOWED_SIGNALS);
    const forbidden = new Set<string>(WHY_MATCH_FORBIDDEN_SIGNALS);
    const checkSignalArray = (arr: unknown, fieldName: string): string[] => {
      if (arr === undefined) return [];
      if (!Array.isArray(arr)) {
        throw new Error(`Invalid Why Match output: ${fieldName} must be an array.`);
      }
      if (fieldName === 'signals_not_used') {
        return arr.filter((s): s is string => typeof s === 'string');
      }
      const out: string[] = [];
      for (const s of arr) {
        if (typeof s !== 'string') continue;
        if (forbidden.has(s)) {
          throw new Error(`Invalid Why Match output: forbidden signal "${s}" in ${fieldName}.`);
        }
        // Drop unknown signals silently rather than fail — model may emit
        // a label not in the allowlist; we just don't surface it.
        if (allowed.has(s)) out.push(s);
      }
      return out;
    };

    const signalsUsed = checkSignalArray(output.signals_used, 'signals_used');
    const signalsNotUsed = checkSignalArray(output.signals_not_used, 'signals_not_used');

    return {
      ...output,
      reasons,
      first_question: firstQuestion,
      reasons_he: output.reasons_he ?? reasons,
      first_question_he: output.first_question_he ?? firstQuestion,
      signals_used: signalsUsed,
      signals_not_used: signalsNotUsed,
    };
  },

  validateRephrase(output: any) {
    if (!output || !Array.isArray(output.options) || output.options.length < 1) {
      throw new Error("Invalid Rephrase output: missing options array.");
    }
    if (output.options.length > 4) {
      throw new Error("Invalid Rephrase output: too many options (max 4).");
    }
    for (const opt of output.options) {
      if (typeof opt !== 'string') {
        throw new Error("Invalid Rephrase output: options must be strings.");
      }
    }
    if (typeof output.what_changed !== 'string') {
      throw new Error("Invalid Rephrase output: what_changed must be a string.");
    }
    return output;
  },


  validateSafetyScan(output: any) {
    if (!output || !output.risk_level) {
      throw new Error("Invalid Safety Scan output: missing risk_level.");
    }
    return output;
  },

  validateDatePlanner(output: any) {
    // Handle fallback if model returns suggested_venues instead of venues
    if (output?.suggested_venues && !output?.venues) {
      output.venues = output.suggested_venues;
    }

    if (!output || !output.venues || !Array.isArray(output.venues)) {
      throw new Error("Invalid Date Planner output: missing venues array.");
    }

    // Handle fallback for meeting_window
    output.venues = output.venues.map((v: any) => ({
      ...v,
      suggested_meeting_time_window:
        v.suggested_meeting_time_window || v.meeting_window || "Flexible",
    }));

    if (!output.how_to_choose_tip) {
      output.how_to_choose_tip =
        "Choose a venue that feels comfortable and allows for easy conversation.";
    }

    return output;
  },

  validateProfileCompleteness(output: any) {
    if (!output || typeof output.completeness_score !== "number") {
      throw new Error("Invalid Profile Completeness output: missing score.");
    }
    return output;
  },

  validateDailyPicksIntro(output: any) {
    if (!output || !output.headline_en || !output.headline_he) {
      throw new Error("Invalid Daily Picks Intro output: missing headlines.");
    }
    return output;
  },

  validateOpeners(output: any) {
    if (!output || !Array.isArray(output) || output.length === 0) {
      throw new Error("Invalid Openers output: missing or empty array.");
    }
    validateStringFields(output);
    return output;
  },

  validateMessageSafetyScan(output: any) {
    if (
      !output ||
      !output.level ||
      !output.userFacingNoteHe ||
      !output.userFacingNoteEn
    ) {
      throw new Error(
        "Invalid Message Safety Scan output: missing required fields.",
      );
    }
    return output;
  },

  validatePhotoAnalysis(output: any) {
    if (!output || typeof output.is_appropriate !== "boolean") {
      throw new Error(
        "Invalid Photo Analysis output: missing is_appropriate flag.",
      );
    }
    return output;
  },

  validateModerationSummary(output: any) {
    if (!output || !output.summary || !output.riskLevel) {
      throw new Error(
        "Invalid Moderation Summary output: missing required fields.",
      );
    }
    return output;
  },

  validatePersonalityProfile(output: any) {
    if (!output || !output.summary_he || !output.domains) {
      throw new Error(
        "Invalid Personality Profile output: missing required fields.",
      );
    }
    validateStringFields(output);
    return output;
  },

  validateCompatibilityReflection(output: any) {
    if (!output || !Array.isArray(output.shared_strengths_he) || !Array.isArray(output.friction_loops)) {
      throw new Error(
        "Invalid Compatibility Reflection output: missing required fields.",
      );
    }
    if (!output.question_to_explore_he || typeof output.question_to_explore_he !== "string") {
      throw new Error("Invalid Compatibility Reflection output: missing question_to_explore_he.");
    }
    if (!output.micro_habit_he || typeof output.micro_habit_he !== "string") {
      throw new Error("Invalid Compatibility Reflection output: missing micro_habit_he.");
    }
    if (!output.gentle_boundary_he || typeof output.gentle_boundary_he !== "string") {
      throw new Error("Invalid Compatibility Reflection output: missing gentle_boundary_he.");
    }
    if (
      output.source &&
      (output.source.kind !== "mutually_approved_share_card" ||
        output.source.verified !== true)
    ) {
      throw new Error("Invalid Compatibility Reflection output: invalid source.");
    }
    validateCompatibilitySignals(output);
    validateStringFields(output);
    return output;
  },

  validatePacingIntervention(output: any) {
    if (!output || !output.message_he) {
      throw new Error(
        "Invalid Pacing Intervention output: missing required fields.",
      );
    }
    validateStringFields(output);
    return output;
  },
};
