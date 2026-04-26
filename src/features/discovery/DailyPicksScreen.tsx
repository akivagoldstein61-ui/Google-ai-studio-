import React, { useState, useEffect } from 'react';
import { CandidateProfile, RecommendationResult, UserDiscoveryPreferences } from '../../types';
import { rankingService } from '../../services/rankingService';
import { explanationService } from '../../services/explanationService';
import { CandidateCard } from '../../components/discovery/CandidateCard';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { tasteProfileService } from '../../services/tasteProfileService';

export const DailyPicksScreen = () => {
  const [candidates, setCandidates] = useState<{profile: CandidateProfile, result: RecommendationResult, explanation?: string}[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Default mock preference
  const prefs: UserDiscoveryPreferences = {
    ageRange: [20, 35],
    maxDistanceMiles: 50,
    relationshipIntent: ['serious_relationship', 'marriage_minded'],
    observance: ['secular', 'traditional', 'dati'],
    familyPlans: [],
    verifiedOnly: false,
    languages: [],
    dealbreakers: ['age'],
    softPreferences: [],
    recommendationMode: 'values_first'
  };

  useEffect(() => {
    loadPicks();
  }, []);

  const loadPicks = async () => {
    setLoading(true);
    const picks = await rankingService.getDailyPicks(prefs);
    
    // fetch explanations
    const withExplanations = await Promise.all(picks.map(async p => {
      const explanation = await explanationService.getWhyMatchExplanation(p.profile, p.result);
      return { ...p, explanation };
    }));
    
    setCandidates(withExplanations);
    setLoading(false);
  };

  const handleNext = () => {
    setCurrentIndex(prev => prev + 1);
  };

  const handleFeedback = async (type: string) => {
    // Only 'more' and 'less' update taste directly in MVP
    if (type === 'more' || type === 'less') {
      const cand = candidates[currentIndex].profile;
      await tasteProfileService.addPattern({
        category: "Content Interaction",
        value: type === 'more' ? `Likes ${cand.observance} profiles` : `Avoids ${cand.observance} profiles`,
        sourceClass: "explicit_feedback",
        provenanceSummary: `You clicked '${type === 'more' ? 'More' : 'Less'} like this' on a profile.`,
        confidence: 0.6,
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
      // Optionally show toast
    }
    handleNext();
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-500 font-medium">Curating your Daily Picks...</p>
      </div>
    );
  }

  if (currentIndex >= candidates.length) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-gray-50">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-2xl font-serif text-gray-900 mb-2">That's all for today</h2>
        <p className="text-gray-500 max-w-xs mx-auto">
          You've reviewed your finite set of Daily Picks. Check back tomorrow for more quality matches, or browse Explore.
        </p>
      </div>
    );
  }

  const current = candidates[currentIndex];

  return (
    <div className="h-full flex flex-col pt-3 px-3 pb-0 relative">
      <div className="flex items-center justify-between px-2 mb-3">
        <h1 className="text-xl font-serif text-gray-900">Daily Picks</h1>
        <span className="text-xs font-medium text-gray-400 bg-white px-2 py-1 rounded-full shadow-sm">
          {currentIndex + 1} of {candidates.length}
        </span>
      </div>
      
      <div className="flex-1 relative">
        <CandidateCard
          candidate={current.profile}
          result={current.result}
          explanation={current.explanation}
          surface="daily_picks"
          onLike={() => handleNext()}
          onPass={() => handleNext()}
          onMoreLikeThis={() => handleFeedback('more')}
          onLessLikeThis={() => handleFeedback('less')}
        />
      </div>
    </div>
  );
};
