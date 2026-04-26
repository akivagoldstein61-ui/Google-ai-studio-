import { CandidateProfile, RecommendationResult } from '../types';

export const explanationService = {
  async getWhyMatchExplanation(candidate: CandidateProfile, result: RecommendationResult): Promise<string> {
    try {
      // Call server endpoint
      const response = await fetch('/api/ai/explain-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidate, result })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.explanation) return data.explanation;
      }
    } catch (e) {
      console.error("AI explanation failed, falling back", e);
    }
    
    // Deterministic fallback
    if (result.reasons.length > 0) {
      return "You're seeing this because: " + result.reasons.join(", ") + ".";
    }
    
    return "This profile is a potential match based on your preferences.";
  }
};
