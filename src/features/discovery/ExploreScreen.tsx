import React, { useState, useEffect } from 'react';
import { CandidateProfile, RecommendationResult, UserDiscoveryPreferences } from '../../types';
import { rankingService } from '../../services/rankingService';
import { explanationService } from '../../services/explanationService';
import { CandidateCard } from '../../components/discovery/CandidateCard';
import { Settings2, Loader2, Info } from 'lucide-react';
import { tasteProfileService } from '../../services/tasteProfileService';

export const ExploreScreen = () => {
  const [candidates, setCandidates] = useState<{profile: CandidateProfile, result: RecommendationResult, explanation?: string}[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // default mock prefs where age is NOT a dealbreaker so we can show widening
  const [prefs, setPrefs] = useState<UserDiscoveryPreferences>({
    ageRange: [20, 25], // Narrow age range to force widening on some candidates
    maxDistanceMiles: 50,
    relationshipIntent: ['serious_relationship', 'marriage_minded'],
    observance: ['secular', 'traditional', 'dati'],
    familyPlans: [],
    verifiedOnly: false,
    languages: [],
    dealbreakers: [], // Empty to allow widening
    softPreferences: [],
    recommendationMode: 'exploratory'
  });

  useEffect(() => {
    loadCandidates();
  }, [prefs]);

  const loadCandidates = async () => {
    setLoading(true);
    const picks = await rankingService.getExploreCandidates(prefs);
    
    // fetch explanations
    const withExplanations = await Promise.all(picks.map(async p => {
      const explanation = await explanationService.getWhyMatchExplanation(p.profile, p.result);
      return { ...p, explanation };
    }));
    
    setCandidates(withExplanations);
    setCurrentIndex(0);
    setLoading(false);
  };

  const handleNext = () => {
    setCurrentIndex(prev => prev + 1);
  };

  const handleFeedback = async (type: string) => {
    if (type === 'more' || type === 'less') {
      const cand = candidates[currentIndex].profile;
      await tasteProfileService.addPattern({
        category: "Content Interaction",
        value: type === 'more' ? `Likes ${cand.observance} profiles` : `Avoids ${cand.observance} profiles`,
        sourceClass: "explicit_feedback",
        provenanceSummary: `You clicked '${type === 'more' ? 'More' : 'Less'}' in Explore.`,
        confidence: 0.5,
        supportCount: 1,
        distinctSessionCount: 1,
        lastConfirmedAt: new Date().toISOString(),
        decayHalfLifeDays: 14,
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        userLocked: false,
        userHidden: false,
        rankWeightCap: 0.8,
        eligibleForRanking: true,
        sensitivityTier: 1
      });
    }
    handleNext();
  };

  return (
    <div className="h-full flex flex-col pt-3 px-3 pb-0 relative">
      <div className="flex items-center justify-between px-2 mb-3">
        <h1 className="text-xl font-serif text-gray-900">Explore</h1>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2 rounded-full transition-colors ${showFilters ? 'bg-blue-100 text-blue-600' : 'bg-white shadow-sm text-gray-500 hover:text-gray-900'}`}
        >
          <Settings2 size={20} />
        </button>
      </div>

      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 z-20">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Discovery Filters</h3>
          <p className="text-xs text-gray-500 mb-4">In Explore, we may show profiles slightly outside non-dealbreaker filters. We will always disclose this.</p>
          
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Age Range ({prefs.ageRange[0]} - {prefs.ageRange[1]})</label>
              <div className="flex items-center space-x-2">
                <input type="checkbox" checked={prefs.dealbreakers.includes('age')} onChange={(e) => {
                  const d = Array.from(new Set(e.target.checked ? [...prefs.dealbreakers, 'age'] : prefs.dealbreakers.filter(x => x !== 'age')));
                  setPrefs({...prefs, dealbreakers: d});
                }} className="rounded border-gray-300" />
                <span className="text-xs text-gray-600">Strict Dealbreaker (no widening)</span>
              </div>
            </div>
            <button onClick={() => setShowFilters(false)} className="w-full bg-gray-900 text-white rounded-lg py-2 text-sm font-medium mt-2">
              Apply
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
        </div>
      ) : currentIndex >= candidates.length ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400">
            <Info size={32} />
          </div>
          <h2 className="text-xl font-serif text-gray-900 mb-2">End of results</h2>
          <p className="text-gray-500 text-sm">You have seen all available profiles in Explore.</p>
        </div>
      ) : (
        <div className="flex-1 relative">
          <CandidateCard
            candidate={candidates[currentIndex].profile}
            result={candidates[currentIndex].result}
            explanation={candidates[currentIndex].explanation}
            surface="explore"
            onLike={() => handleNext()}
            onPass={() => handleNext()}
            onMoreLikeThis={() => handleFeedback('more')}
            onLessLikeThis={() => handleFeedback('less')}
          />
        </div>
      )}
    </div>
  );
};
