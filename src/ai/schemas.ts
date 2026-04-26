import { Type } from "@google/genai";

/**
 * Structured Output Schemas for Gemini
 */

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
            description: "Optional conversation starters"
          },
          what_changed: { type: Type.STRING, description: "Explanation of improvements" }
        },
        required: ["bio_he", "what_changed"]
      }
    },
    questions_to_confirm: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Clarifying questions for the user"
    }
  },
  required: ["drafts"]
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
        values_vs_lifestyle: { type: Type.NUMBER, description: "0 to 1" },
        distance_tolerance: { type: Type.NUMBER, description: "0 to 1" }
      },
      required: ["values_vs_lifestyle", "distance_tolerance"]
    },
    explanation: { type: Type.STRING, description: "A brief, user-friendly explanation of how this profile was formed based on their recent interactions." }
  },
  required: ["hard_dealbreakers", "soft_preferences", "weights", "explanation"]
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
    risk_level: { type: Type.STRING, enum: ["low", "medium", "high", "uncertain"] },
    categories: {
      type: Type.ARRAY,
      items: { type: Type.STRING, enum: ["harassment", "hate", "sexual", "danger", "scam", "none"] }
    },
    recommended_action: {
      type: Type.STRING,
      enum: ["allow", "warn", "user_nudge", "block_and_report", "needs_human_review"]
    },
    short_rationale: { type: Type.STRING }
  },
  required: ["risk_level", "categories", "recommended_action"]
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
          suggested_meeting_time_window: { type: Type.STRING }
        },
        required: ["name", "why_good"]
      }
    },
    how_to_choose_tip: { type: Type.STRING }
  },
  required: ["venues", "how_to_choose_tip"]
};

export const DailyPicksIntroSchema = {
  type: Type.OBJECT,
  properties: {
    headline_en: { type: Type.STRING },
    headline_he: { type: Type.STRING },
    body_en: { type: Type.STRING },
    body_he: { type: Type.STRING }
  },
  required: ["headline_en", "headline_he", "body_en", "body_he"]
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
          area: { type: Type.STRING, description: "e.g., 'Photos', 'Bio', 'Prompts'" },
          importance: { type: Type.STRING, enum: ["critical", "recommended", "optional"] },
          suggestion: { type: Type.STRING }
        },
        required: ["area", "importance", "suggestion"]
      }
    },
    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
    overall_tip: { type: Type.STRING }
  },
  required: ["completeness_score", "missing_areas", "strengths", "overall_tip"]
};
