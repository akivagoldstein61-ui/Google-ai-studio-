import { CandidateProfile, UserDiscoveryPreferences, RecommendationResult } from '../types';
import { mockCandidates } from './mockCandidates';
import { tasteProfileService } from './tasteProfileService';

export const rankingService = {
  async getDailyPicks(preferences: UserDiscoveryPreferences): Promise<{ profile: CandidateProfile, result: RecommendationResult }[]> {
    const allCands = [...mockCandidates];
    const filtered = allCands.filter(c => this.passesHardFilters(c, preferences));
    
    // Sort based on soft preferences and learned taste
    const scored = await this.scoreCandidates(filtered, preferences);
    
    // Return top 5 for Daily Picks
    return scored.sort((a, b) => b.result.score - a.result.score).slice(0, 5);
  },

  async getExploreCandidates(preferences: UserDiscoveryPreferences): Promise<{ profile: CandidateProfile, result: RecommendationResult }[]> {
    const allCands = [...mockCandidates];
    // In explore, we might show candidates that fail age/distance if they aren't dealbreakers and widening is allowed
    // But for MVP we will just return all and score them
    const scored = await this.scoreCandidates(allCands, preferences);
    return scored.sort((a, b) => b.result.score - a.result.score);
  },

  passesHardFilters(candidate: CandidateProfile, prefs: UserDiscoveryPreferences): boolean {
    if (candidate.age < prefs.ageRange[0] || candidate.age > prefs.ageRange[1]) {
      if (prefs.dealbreakers.includes('age')) return false;
    }
    if (candidate.distanceMiles > prefs.maxDistanceMiles) {
      if (prefs.dealbreakers.includes('distance')) return false;
    }
    if (prefs.dealbreakers.includes('observance') && prefs.observance.length > 0 && !prefs.observance.includes(candidate.observance)) {
      return false;
    }
    if (prefs.dealbreakers.includes('relationshipIntent') && prefs.relationshipIntent.length > 0 && !prefs.relationshipIntent.includes(candidate.relationshipIntent)) {
      return false;
    }
    return true;
  },

  async scoreCandidates(candidates: CandidateProfile[], prefs: UserDiscoveryPreferences): Promise<{ profile: CandidateProfile, result: RecommendationResult }[]> {
    const tastePatterns = await tasteProfileService.getTasteProfile();
    
    return candidates.map(c => {
      let score = 50; // base score
      let reasons: string[] = [];
      let disclosures: string[] = [];
      
      const isHardEligible = this.passesHardFilters(c, prefs);
      
      if (!isHardEligible) {
        disclosures.push("Outside your typical filters");
        score -= 20;
      } else {
        reasons.push("Meets your age and distance preferences.");
      }

      if (prefs.observance.includes(c.observance)) {
        score += 10;
        reasons.push(`Shares your observance level of ${c.observance}`);
      }
      
      if (prefs.relationshipIntent.includes(c.relationshipIntent)) {
        score += 10;
        reasons.push("Looking for a similar relationship type");
      }

      // Apply soft preferences
      prefs.softPreferences.forEach(sp => {
        if (c.lifestyleTags.includes(sp.label) || c.interests.includes(sp.label)) {
          score += 5;
          reasons.push(`Matches your preference for ${sp.label}`);
        }
      });

      // Apply Taste Profile if eligible
      if (isHardEligible) {
        tastePatterns.forEach(tp => {
          if (!tp.userHidden) {
            // Very naive scoring for MVP
            score += Math.min(10 * tp.confidence * tp.rankWeightCap, 15);
            reasons.push(`Matches a learned preference: ${tp.category}`);
          }
        });
      }

      return {
        profile: c,
        result: {
          candidateId: c.id,
          surface: "discovery",
          hardFilterEligible: isHardEligible,
          score,
          reasons: reasons.slice(0, 3), // limit reasons
          disclosures
        }
      };
    });
  }
};
