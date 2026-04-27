const PROHIBITED_TERMS = [
  "diagnosis",
  "disorder",
  "syndrome",
  "clinical",
  "pathology",
  "treatment",
  "therapy",
  "toxic",
  "narcissist",
  "bipolar",
  "depressed",
  "anxious",
  "ADHD",
  "autistic",
  "incompatible",
  "doomed",
  "perfect match",
  "soulmate",
  "100% match",
  "guaranteed",
  "score",
  "ranking",
  "tier",
  "league",
  "out of your league",
  "better than",
  "worse than",
  "alpha",
  "beta",
  "high value",
  "low value",
];

function containsProhibitedLanguage(text: string): boolean {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return PROHIBITED_TERMS.some((term) => lowerText.includes(term));
}

function validateStringFields(obj: any) {
  if (!obj) return;
  for (const key in obj) {
    if (typeof obj[key] === "string") {
      if (containsProhibitedLanguage(obj[key])) {
        throw new Error(
          `Output contains prohibited language in field '${key}'.`,
        );
      }
    } else if (typeof obj[key] === "object") {
      validateStringFields(obj[key]);
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
    if (
      !output ||
      !output.weights ||
      typeof output.weights.attraction_weight !== "number"
    ) {
      throw new Error("Invalid Taste Profile output: missing weights.");
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
    if (!output) {
      throw new Error("Invalid Date Planner output: empty.");
    }

    // Handle fallback if model returns suggested_venues instead of venues
    if (output.suggested_venues && !output.venues) {
      output.venues = output.suggested_venues;
    }

    if (!output.venues || !Array.isArray(output.venues)) {
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

  validateRephrase(output: any) {
    if (!output || !output.original) {
      throw new Error("Invalid Rephrase output: missing original text.");
    }
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
    if (!output || !output.shared_strengths_he || !output.friction_loops) {
      throw new Error(
        "Invalid Compatibility Reflection output: missing required fields.",
      );
    }
    validateStringFields(output);
    return output;
  },

  validateWhyMatch(output: any) {
    if (!output || !output.reasons_he || !Array.isArray(output.reasons_he)) {
      throw new Error("Invalid Why Match output: missing reasons array.");
    }
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
