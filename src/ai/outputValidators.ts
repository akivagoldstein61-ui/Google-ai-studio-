import {
  WHY_MATCH_ALLOWED_SIGNALS,
  WHY_MATCH_FORBIDDEN_SIGNALS,
  containsBannedPhrase,
} from './dataClassification';

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

    // Banned phrases — protect against soulmate/score regressions even when
    // structured-output guards pass.
    for (const reason of output.reasons) {
      if (typeof reason !== 'string') continue;
      const bad = containsBannedPhrase(reason);
      if (bad) {
        throw new Error(`Invalid Why Match output: banned phrase "${bad}" in reason.`);
      }
    }
    if (typeof output.first_question === 'string') {
      const bad = containsBannedPhrase(output.first_question);
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
