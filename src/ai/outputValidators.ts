export const outputValidators = {
  validateBioCoach(output: any) {
    if (!output || !output.drafts || !Array.isArray(output.drafts)) {
      throw new Error("Invalid Bio Coach output: missing drafts array.");
    }
    return output;
  },

  validateTasteProfile(output: any) {
    if (!output || !output.weights || typeof output.weights.values_vs_lifestyle !== 'number') {
      throw new Error("Invalid Taste Profile output: missing weights.");
    }
    return output;
  },

  validateWhyMatch(output: any) {
    if (!output || !output.reasons || !Array.isArray(output.reasons)) {
      throw new Error("Invalid Why Match output: missing reasons array.");
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
    if (!output || !output.venues || !Array.isArray(output.venues)) {
      throw new Error("Invalid Date Planner output: missing venues array.");
    }
    return output;
  },

  validateProfileCompleteness(output: any) {
    if (!output || typeof output.completeness_score !== 'number') {
      throw new Error("Invalid Profile Completeness output: missing score.");
    }
    return output;
  }
};
