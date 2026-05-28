import {
  COMPATIBILITY_ALLOWED_SIGNALS,
  WHY_MATCH_ALLOWED_SIGNALS,
  WHY_MATCH_FORBIDDEN_SIGNALS,
} from "./outputValidators";

/**
 * Structured Output Schemas for Gemini
 *
 * Keep this file dependency-free for client imports. Server routes pass these
 * plain JSON-compatible schema objects to the Gemini SDK; browser bundles must
 * not import @google/genai or any API-key-aware client code.
 */

const Type = {
  STRING: "STRING",
  NUMBER: "NUMBER",
  INTEGER: "INTEGER",
  BOOLEAN: "BOOLEAN",
  ARRAY: "ARRAY",
  OBJECT: "OBJECT",
  NULL: "NULL",
} as const;

export const EvidenceLabelEnum = [
  "verified",
  "inferred",
  "heuristic",
  "unknown",
];

export const BaseSchemaProperties = {
  schemaVersion: {
    type: Type.STRING,
    description: "Version of the schema, e.g., '1.0'",
  },
  confidence: {
    type: Type.NUMBER,
    description: "Confidence score from 0 to 1",
  },
  evidenceLabel: { type: Type.STRING, enum: EvidenceLabelEnum },
  userSafeSummary_he: {
    type: Type.STRING,
    description: "Optional user-safe summary in Hebrew",
  },
  userSafeSummary_en: {
    type: Type.STRING,
    description: "Optional user-safe summary in English",
  },
};

export const TraitProfileSchema = {
  type: Type.OBJECT,
  properties: {
    ...BaseSchemaProperties,
    extraversion: { type: Type.NUMBER, description: "0-100" },
    extraversion_enthusiasm: { type: Type.NUMBER, description: "0-100" },
    extraversion_assertiveness: { type: Type.NUMBER, description: "0-100" },
    neuroticism: { type: Type.NUMBER, description: "0-100" },
    neuroticism_withdrawal: { type: Type.NUMBER, description: "0-100" },
    neuroticism_volatility: { type: Type.NUMBER, description: "0-100" },
    agreeableness: { type: Type.NUMBER, description: "0-100" },
    agreeableness_compassion: { type: Type.NUMBER, description: "0-100" },
    agreeableness_politeness: { type: Type.NUMBER, description: "0-100" },
    conscientiousness: { type: Type.NUMBER, description: "0-100" },
    conscientiousness_industriousness: {
      type: Type.NUMBER,
      description: "0-100",
    },
    conscientiousness_orderliness: { type: Type.NUMBER, description: "0-100" },
    openness: { type: Type.NUMBER, description: "0-100" },
    openness_openness: { type: Type.NUMBER, description: "0-100" },
    openness_intellect: { type: Type.NUMBER, description: "0-100" },
  },
  required: [
    "schemaVersion",
    "confidence",
    "evidenceLabel",
    "extraversion",
    "neuroticism",
    "agreeableness",
    "conscientiousness",
    "openness",
  ],
};

export const PersonalityInsightCardSchema = {
  type: Type.OBJECT,
  properties: {
    ...BaseSchemaProperties,
    domain_name: { type: Type.STRING },
    percentile: { type: Type.INTEGER },
    description_he: { type: Type.STRING },
    aspects: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          aspect_name: { type: Type.STRING },
          percentile: { type: Type.INTEGER },
          strengths_he: { type: Type.ARRAY, items: { type: Type.STRING } },
          friction_he: { type: Type.ARRAY, items: { type: Type.STRING } },
          communication_notes_he: { type: Type.STRING },
        },
        required: [
          "aspect_name",
          "percentile",
          "strengths_he",
          "friction_he",
          "communication_notes_he",
        ],
      },
    },
  },
  required: [
    "schemaVersion",
    "confidence",
    "evidenceLabel",
    "domain_name",
    "percentile",
    "description_he",
    "aspects",
  ],
};

export const DatingImplicationCardSchema = {
  type: Type.OBJECT,
  properties: {
    ...BaseSchemaProperties,
    dating_superpower_he: { type: Type.STRING },
    growth_area_he: { type: Type.STRING },
    likely_friction_loops_he: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    repair_suggestions_he: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: [
    "schemaVersion",
    "confidence",
    "evidenceLabel",
    "dating_superpower_he",
    "growth_area_he",
    "likely_friction_loops_he",
    "repair_suggestions_he",
  ],
};

export const PersonalitySummarySchema = {
  type: Type.OBJECT,
  properties: {
    ...BaseSchemaProperties,
    summary_he: {
      type: Type.STRING,
      description:
        "2-sentence warm summary. Traits are tendencies, not destiny.",
    },
    implication_card: DatingImplicationCardSchema,
    domains: {
      type: Type.ARRAY,
      items: PersonalityInsightCardSchema,
    },
  },
  required: [
    "schemaVersion",
    "confidence",
    "evidenceLabel",
    "summary_he",
    "implication_card",
    "domains",
  ],
};

export const CompatibilityInsightSchema = {
  type: Type.OBJECT,
  properties: {
    ...BaseSchemaProperties,
    dynamic_he: {
      type: Type.STRING,
      description: "e.g., Planner vs Spontaneous",
    },
    advice_he: { type: Type.STRING, description: "How to navigate it" },
  },
  required: [
    "schemaVersion",
    "confidence",
    "evidenceLabel",
    "dynamic_he",
    "advice_he",
  ],
};

export const PairInsightReportSchema = {
  type: Type.OBJECT,
  properties: {
    ...BaseSchemaProperties,
    shared_strengths_he: { type: Type.ARRAY, items: { type: Type.STRING } },
    friction_loops: {
      type: Type.ARRAY,
      items: CompatibilityInsightSchema,
    },
    question_to_explore_he: { type: Type.STRING },
    micro_habit_he: { type: Type.STRING },
    gentle_boundary_he: { type: Type.STRING },
    signals_used: {
      type: Type.ARRAY,
      minItems: 1,
      items: { type: Type.STRING, enum: [...COMPATIBILITY_ALLOWED_SIGNALS] },
      description: "Only mutually shared or approved inputs used for compatibility reflection.",
    },
  },
  required: [
    "schemaVersion",
    "confidence",
    "evidenceLabel",
    "shared_strengths_he",
    "friction_loops",
    "question_to_explore_he",
    "micro_habit_he",
    "gentle_boundary_he",
    "signals_used",
  ],
};

export const WhyThisMatchPayloadSchema = {
  type: Type.OBJECT,
  properties: {
    ...BaseSchemaProperties,
    reasons_he: {
      type: Type.ARRAY,
      minItems: 2,
      maxItems: 3,
      items: { type: Type.STRING },
      description: "Short, honest reasons based on whitelisted signals only.",
    },
    first_question_he: { type: Type.STRING },
    gentle_clarification_he: {
      type: Type.STRING,
      description: "Gentle mismatch to explore",
    },
    signals_used: {
      type: Type.ARRAY,
      minItems: 1,
      items: { type: Type.STRING, enum: [...WHY_MATCH_ALLOWED_SIGNALS] },
      description: "Only visible whitelisted signals used for the explanation.",
    },
    signals_not_used: {
      type: Type.ARRAY,
      minItems: WHY_MATCH_FORBIDDEN_SIGNALS.length,
      items: { type: Type.STRING, enum: [...WHY_MATCH_FORBIDDEN_SIGNALS] },
      description: "Private, hidden, or sensitive signals explicitly not used.",
    },
    uncertainty_he: {
      type: Type.STRING,
      description: "A gentle uncertainty note. Must not claim certainty.",
    },
  },
  required: [
    "schemaVersion",
    "confidence",
    "evidenceLabel",
    "reasons_he",
    "first_question_he",
    "signals_used",
    "signals_not_used",
    "uncertainty_he",
  ],
};

export const PrivateTasteAdjustmentSchema = {
  type: Type.OBJECT,
  properties: {
    ...BaseSchemaProperties,
    values_weight: { type: Type.NUMBER },
    stability_weight: { type: Type.NUMBER },
    pacing_weight: { type: Type.NUMBER },
    explanation_he: { type: Type.STRING },
  },
  required: [
    "schemaVersion",
    "confidence",
    "evidenceLabel",
    "values_weight",
    "stability_weight",
    "pacing_weight",
    "explanation_he",
  ],
};

export const AIDraftDisclosureStateSchema = {
  type: Type.OBJECT,
  properties: {
    ...BaseSchemaProperties,
    is_ai_drafted: { type: Type.BOOLEAN },
    user_edited: { type: Type.BOOLEAN },
    disclosure_message_he: { type: Type.STRING },
  },
  required: [
    "schemaVersion",
    "confidence",
    "evidenceLabel",
    "is_ai_drafted",
    "user_edited",
  ],
};

// Keeping existing schemas for compatibility, but updating them where necessary
export const BioCoachSchema = {
  type: Type.OBJECT,
  properties: {
    drafts: {
      type: Type.ARRAY,
      minItems: 3,
      maxItems: 3,
      items: {
        type: Type.OBJECT,
        properties: {
          bio_he: { type: Type.STRING, description: "The bio draft in Hebrew" },
          hooks_he: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Optional conversation starters",
          },
          what_changed: {
            type: Type.STRING,
            description: "Explanation of improvements",
          },
        },
        required: ["bio_he", "what_changed"],
      },
    },
    questions_to_confirm: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Clarifying questions for the user",
    },
  },
  required: ["drafts"],
};

export const TasteProfileSchema = {
  type: Type.OBJECT,
  properties: {
    hard_dealbreakers: { type: Type.ARRAY, items: { type: Type.STRING } },
    soft_preferences: { type: Type.ARRAY, items: { type: Type.STRING } },
    things_to_avoid: { type: Type.ARRAY, items: { type: Type.STRING } },
    weights: {
      type: Type.OBJECT,
      properties: {
        values_weight: { type: Type.NUMBER, description: "0 to 1" },
        stability_weight: { type: Type.NUMBER, description: "0 to 1" },
        pacing_weight: { type: Type.NUMBER, description: "0 to 1" },
      },
      required: ["values_weight", "stability_weight", "pacing_weight"],
    },
    explanation: {
      type: Type.STRING,
      description:
        "A brief, user-friendly explanation of how this profile was formed from explicit and weak first-party activity.",
    },
  },
  required: ["hard_dealbreakers", "soft_preferences", "weights", "explanation"],
};

export const WHY_MATCH_SCHEMA_VERSION = "why_match.v2";

export const WhyMatchSchema = {
  type: Type.OBJECT,
  properties: {
    schema_version: { type: Type.STRING, description: "Always 'why_match.v2'." },
    reasons: {
      type: Type.ARRAY,
      minItems: 2,
      maxItems: 3,
      items: { type: Type.STRING },
      description: "Short, honest reasons grounded only in whitelisted visible signals."
    },
    first_question: { type: Type.STRING },
    possible_mismatch_to_clarify: {
      type: Type.STRING,
      description: "One gentle clarification the user might want to ask, or empty string if none."
    },
    signals_used: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Whitelisted signals that informed the reasons. Subset of the input signals."
    },
    signals_not_used: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Whitelisted signals that were available but did not contribute."
    },
    confidence: {
      type: Type.NUMBER,
      description: "Self-reported confidence between 0 and 1. Treat as heuristic, not a score."
    },
    evidence_label: {
      type: Type.STRING,
      enum: ["VERIFIED", "INFERRED", "HEURISTIC", "UNKNOWN"],
      description: "How firm the underlying signals are."
    }
  },
  required: [
    "schema_version",
    "reasons",
    "first_question",
    "signals_used",
    "signals_not_used",
    "confidence",
    "evidence_label"
  ]
};

export const RephraseMessageSchema = {
  type: Type.OBJECT,
  properties: {
    options: {
      type: Type.ARRAY,
      minItems: 2,
      maxItems: 4,
      items: { type: Type.STRING },
      description: "Alternative phrasings of the user's draft. Same meaning, no invented facts."
    },
    what_changed: {
      type: Type.STRING,
      description: "Brief explanation of how the alternatives differ from the original."
    }
  },
  required: ["options", "what_changed"]
};

export const SafetyScanSchema = {
  type: Type.OBJECT,
  properties: {
    risk_level: {
      type: Type.STRING,
      enum: ["low", "medium", "high", "uncertain"],
    },
    categories: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
        enum: ["harassment", "hate", "sexual", "danger", "scam", "none"],
      },
    },
    recommended_action: {
      type: Type.STRING,
      enum: [
        "allow",
        "warn",
        "user_nudge",
        "block_and_report",
        "needs_human_review",
      ],
    },
    short_rationale: { type: Type.STRING },
  },
  required: ["risk_level", "categories", "recommended_action"],
};

export const DateIdeasSchema = {
  type: Type.OBJECT,
  properties: {
    venues: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          why_good: { type: Type.STRING },
          safety_note: { type: Type.STRING },
          suggested_meeting_time_window: { type: Type.STRING },
          source_url: { type: Type.STRING },
        },
        required: ["name", "why_good"],
      },
    },
    how_to_choose_tip: { type: Type.STRING },
  },
  required: ["venues", "how_to_choose_tip"],
};

export const DailyPicksIntroSchema = {
  type: Type.OBJECT,
  properties: {
    headline_en: { type: Type.STRING },
    headline_he: { type: Type.STRING },
    body_en: { type: Type.STRING },
    body_he: { type: Type.STRING },
  },
  required: ["headline_en", "headline_he", "body_en", "body_he"],
};

export const ProfileCompletenessSchema = {
  type: Type.OBJECT,
  properties: {
    completeness_score: { type: Type.NUMBER, description: "0 to 100" },
    missing_areas: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          area: {
            type: Type.STRING,
            description: "e.g., 'Photos', 'Bio', 'Prompts'",
          },
          importance: {
            type: Type.STRING,
            enum: ["critical", "recommended", "optional"],
          },
          suggestion: { type: Type.STRING },
        },
        required: ["area", "importance", "suggestion"],
      },
    },
    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
    overall_tip: { type: Type.STRING },
  },
  required: ["completeness_score", "missing_areas", "strengths", "overall_tip"],
};

export const OpenersSchema = {
  type: Type.ARRAY,
  description: "Array of 2-3 opener drafts",
  items: {
    type: Type.OBJECT,
    properties: {
      text_he: { type: Type.STRING, description: "Hebrew draft" },
      text_en: { type: Type.STRING, description: "English draft" },
      rationale: {
        type: Type.STRING,
        description: "Why this is a respectful, good opener",
      },
    },
    required: ["text_he", "text_en", "rationale"],
  },
};

export const RephraseSchema = {
  type: Type.OBJECT,
  properties: {
    original: { type: Type.STRING },
    softer_he: { type: Type.STRING },
    softer_en: { type: Type.STRING },
    clearer_he: { type: Type.STRING },
    clearer_en: { type: Type.STRING },
    notes: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["original"],
};

export const MessageSafetyScanSchema = {
  type: Type.OBJECT,
  properties: {
    level: { type: Type.STRING, enum: ["none", "warn", "scam_risk"] },
    userFacingNoteHe: { type: Type.STRING },
    userFacingNoteEn: { type: Type.STRING },
    reasons: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["level", "userFacingNoteHe", "userFacingNoteEn", "reasons"],
};

export const PhotoAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    is_appropriate: { type: Type.BOOLEAN },
    clarity_score: { type: Type.STRING, enum: ["low", "medium", "high"] },
    flags: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          reason_code: {
            type: Type.STRING,
            enum: [
              "privacy_leak",
              "visible_contact_info",
              "screenshot",
              "consent_risk",
              "inappropriate_content",
              "low_clarity",
            ],
          },
          explanation_he: { type: Type.STRING },
          explanation_en: { type: Type.STRING },
        },
        required: ["reason_code", "explanation_he", "explanation_en"],
      },
    },
    overall_feedback_he: { type: Type.STRING },
    overall_feedback_en: { type: Type.STRING },
  },
  required: [
    "is_appropriate",
    "clarity_score",
    "flags",
    "overall_feedback_he",
    "overall_feedback_en",
  ],
};

export const ModerationSummarySchema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    claims: { type: Type.ARRAY, items: { type: Type.STRING } },
    evidence: { type: Type.ARRAY, items: { type: Type.STRING } },
    riskLevel: { type: Type.STRING, enum: ["low", "medium", "high"] },
    escalationRecommended: { type: Type.BOOLEAN },
  },
  required: [
    "summary",
    "claims",
    "evidence",
    "riskLevel",
    "escalationRecommended",
  ],
};

export const PersonalityProfileSchema = {
  type: Type.OBJECT,
  properties: {
    summary_he: { type: Type.STRING, description: "2-sentence warm summary" },
    dating_superpower_he: { type: Type.STRING },
    growth_area_he: {
      type: Type.STRING,
      description: "Gentle framing of a liability",
    },
    domains: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          domain_name: { type: Type.STRING },
          percentile: { type: Type.INTEGER },
          description_he: { type: Type.STRING },
        },
        required: ["domain_name", "percentile", "description_he"],
      },
    },
  },
  required: ["summary_he", "dating_superpower_he", "growth_area_he", "domains"],
};

export const PersonalityAspectCardSchema = {
  type: Type.OBJECT,
  properties: {
    aspect_name: { type: Type.STRING },
    percentile: { type: Type.INTEGER },
    strengths_he: { type: Type.ARRAY, items: { type: Type.STRING } },
    friction_he: { type: Type.ARRAY, items: { type: Type.STRING } },
    communication_notes_he: { type: Type.STRING },
  },
  required: [
    "aspect_name",
    "percentile",
    "strengths_he",
    "friction_he",
    "communication_notes_he",
  ],
};

export const CompatibilityReflectionSchema = {
  type: Type.OBJECT,
  properties: {
    shared_strengths_he: { type: Type.ARRAY, items: { type: Type.STRING } },
    friction_loops_he: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          dynamic_he: {
            type: Type.STRING,
            description: "e.g., Planner vs Spontaneous",
          },
          advice_he: { type: Type.STRING, description: "How to navigate it" },
        },
        required: ["dynamic_he", "advice_he"],
      },
    },
  },
  required: ["shared_strengths_he", "friction_loops_he"],
};

export const PacingInterventionSchema = {
  type: Type.OBJECT,
  properties: {
    message_he: {
      type: Type.STRING,
      description: "Gentle prompt to take a break",
    },
    reflection_prompt_he: {
      type: Type.STRING,
      description: "A question to reflect on",
    },
  },
  required: ["message_he", "reflection_prompt_he"],
};

export const SHARE_CARD_SCOPES = [
  "summary",
  "strengths",
  "watch_outs",
  "communication_notes",
  "compatibility_reflection",
] as const;

export type ShareCardScope = (typeof SHARE_CARD_SCOPES)[number];

export interface ShareCardRecord {
  cardId: string;
  ownerUid: string;
  recipientUid: string;
  scope: ShareCardScope[];
  expiresAt: string;
  revokedAt: string | null;
  createdAt: string;
  lastViewedAt: string | null;
  payload: {
    summary_he?: string;
    strengths_he?: string[];
    watch_outs_he?: string[];
    communication_notes_he?: string;
    compatibility_reflection_he?: string;
  };
}

export const PERSONALITY_VISIBILITY_FIELDS = [
  "trait_summary",
  "strengths",
  "watch_outs",
  "communication_notes",
] as const;

export type PersonalityVisibilityField =
  (typeof PERSONALITY_VISIBILITY_FIELDS)[number];

export type PersonalityVisibilityScope = "private" | "public" | "mutual";

export interface PersonalityVisibilityRecord {
  fields: Record<PersonalityVisibilityField, PersonalityVisibilityScope>;
  updatedAt: string;
}

export const DEFAULT_PERSONALITY_VISIBILITY: PersonalityVisibilityRecord = {
  fields: {
    trait_summary: "private",
    strengths: "private",
    watch_outs: "private",
    communication_notes: "private",
  },
  updatedAt: new Date(0).toISOString(),
};
