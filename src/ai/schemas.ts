import { Type } from "@google/genai";

/**
 * Structured Output Schemas for Gemini
 */

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
  },
  required: [
    "schemaVersion",
    "confidence",
    "evidenceLabel",
    "shared_strengths_he",
    "friction_loops",
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
  },
  required: [
    "schemaVersion",
    "confidence",
    "evidenceLabel",
    "reasons_he",
    "first_question_he",
  ],
};

export const PrivateTasteAdjustmentSchema = {
  type: Type.OBJECT,
  properties: {
    ...BaseSchemaProperties,
    attraction_weight: { type: Type.NUMBER },
    stability_weight: { type: Type.NUMBER },
    pacing_weight: { type: Type.NUMBER },
    explanation_he: { type: Type.STRING },
  },
  required: [
    "schemaVersion",
    "confidence",
    "evidenceLabel",
    "attraction_weight",
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
        attraction_weight: { type: Type.NUMBER, description: "0 to 1" },
        stability_weight: { type: Type.NUMBER, description: "0 to 1" },
        pacing_weight: { type: Type.NUMBER, description: "0 to 1" },
      },
      required: ["attraction_weight", "stability_weight", "pacing_weight"],
    },
    explanation: {
      type: Type.STRING,
      description:
        "A brief, user-friendly explanation of how this profile was formed based on their recent interactions.",
    },
  },
  required: ["hard_dealbreakers", "soft_preferences", "weights", "explanation"],
};

export const WhyMatchSchema = {
  type: Type.OBJECT,
  properties: {
    reasons: {
      type: Type.ARRAY,
      minItems: 2,
      maxItems: 3,
      items: { type: Type.STRING },
    },
    first_question: { type: Type.STRING },
    gentle_clarification: { type: Type.STRING },
  },
  required: ["reasons", "first_question"],
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
