import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ShoppingBag, Check, X, Info, AlertTriangle, Sparkles } from 'lucide-react';
import {
  violatesHardFilters,
  directionalScore,
  reciprocalScore,
  fairnessMultiplier,
  adjustedFinalScore,
  type HardFilterContext,
  type HardFilterId,
  type SoftPreferenceId,
  type FairnessState,
} from '@/lib/filteringGrammar';
import { estimateDistanceKm } from '@/lib/integratedRanking';
import { implicitAffinity } from '@/lib/learnedTaste';
import { profileToFeatureTags } from '@/lib/tastePersistence';
import { MOCK_PROFILES } from '@/data/mockProfiles';
import { useApp } from '@/context/AppContext';
import type { DiscoveryPreferences, Profile, RecommendationMode } from '@/types';

const REC_MODES: { value: RecommendationMode; label: string; blurb: string }[] = [
  { value: 'values_first', label: 'Values-first', blurb: 'Prioritize shared values and intent' },
  { value: 'balanced', label: 'Balanced', blurb: 'Even weight across signals' },
  { value: 'serendipity', label: 'Serendipity', blurb: 'Gentle surprise, still in-bounds' },
  { value: 'open_exploration', label: 'Open', blurb: 'Widest in-bounds pool' },
];

type DealbreakerKey = keyof NonNullable<DiscoveryPreferences['dealbreakers']>;
type EditableSoftPreferenceId = 'shared_interests' | 'same_city' | 'similar_observance' | 'similar_age';

const HARD_CONTROLS: Array<{
  id: DealbreakerKey;
  label: string;
  detail: string;
  hardFilterId?: string;
}> = [
  { id: 'age', label: 'Age range', detail: 'Daily Picks exclude profiles outside the saved range.' },
  { id: 'gender', label: 'Gender preference', detail: 'Strictly applies your selected gender preferences.' },
  { id: 'intent', label: 'Intent alignment', detail: 'Only shows people whose relationship intent matches.' },
  { id: 'observance', label: 'Observance fit', detail: 'Treats selected observance labels as strict eligibility.' },
  { id: 'verified', label: 'Verified only', detail: 'Requires ID verification before someone appears.', hardFilterId: 'verified' },
];

const SOFT_CONTROLS: Array<{
  id: EditableSoftPreferenceId;
  grammarId: SoftPreferenceId;
  label: string;
  detail: string;
}> = [
  { id: 'shared_interests', grammarId: 'shared_interests', label: 'Shared interests', detail: 'Boosts profiles with overlapping tags.' },
  { id: 'same_city', grammarId: 'same_city', label: 'Same city', detail: 'Boosts nearby local overlap without excluding others.' },
  { id: 'similar_observance', grammarId: 'shared_observance_label', label: 'Similar observance', detail: 'Boosts matching observance labels.' },
  { id: 'similar_age', grammarId: 'similar_age', label: 'Similar age', detail: 'Boosts profiles closer to your age.' },
];

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function clampAgeRange(range: [number, number]): [number, number] {
  const min = Math.max(18, Math.min(80, Math.round(range[0])));
  const max = Math.max(min, Math.min(80, Math.round(range[1])));
  return [min, max];
}

function impactTier(remainingPercent: number): 'low' | 'medium' | 'high' | 'very_high' {
  if (remainingPercent < 35) return 'very_high';
  if (remainingPercent < 55) return 'high';
  if (remainingPercent < 75) return 'medium';
  return 'low';
}

function evaluatePoolImpact(pool: Profile[], prefs: DiscoveryPreferences) {
  const total = pool.length;
  const admitted = pool.filter(profile => !violatesHardFilters(profile, prefs).violates).length;
  const remainingPercent = total > 0 ? Math.round((admitted / total) * 100) : 0;
  return {
    total,
    admitted,
    excluded: Math.max(0, total - admitted),
    remainingPercent,
    tier: impactTier(remainingPercent),
  };
}

function profileKey(profile: Profile): string {
  return profile.uid || profile.id;
}

function uniqueProfiles(profiles: Profile[]): Profile[] {
  const seen = new Set<string>();
  const output: Profile[] = [];
  for (const profile of profiles) {
    const key = profileKey(profile);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    output.push(profile);
  }
  return output;
}

function practiceTags(profile: Profile): string[] {
  return [...profile.tags, profile.observance]
    .map((tag) => tag.toLowerCase().trim().replace(/\s+/g, '_'));
}

function softWeightsFromPreferences(preferences: DiscoveryPreferences): Partial<Record<SoftPreferenceId, number>> {
  return {
    shared_interests: preferences.softPreferenceWeights?.shared_interests ??
      (preferences.softPreferences.includes('shared_interests') ? 0.5 : undefined),
    same_city: preferences.softPreferenceWeights?.same_city ??
      (preferences.softPreferences.includes('same_city') ? 0.5 : undefined),
    shared_observance_label: preferences.softPreferenceWeights?.similar_observance ??
      (preferences.softPreferences.includes('similar_observance') ? 0.5 : undefined),
    similar_age: preferences.softPreferenceWeights?.similar_age ??
      (preferences.softPreferences.includes('similar_age') ? 0.5 : undefined),
  };
}

/**
 * LIVE: real discovery preferences. Hard filters strictly narrow the pool;
 * soft preferences only re-rank. No hidden overrides.
 */
const LiveFiltering: React.FC = () => {
  const { user, preferences, setPreferences, exploreProfiles, trackEvent } = useApp();
  const [draft, setDraft] = useState<DiscoveryPreferences>(preferences);
  const [saving, setSaving] = useState(false);
  const candidatePool = exploreProfiles.length > 0 ? exploreProfiles : MOCK_PROFILES;

  useEffect(() => {
    setDraft(preferences);
  }, [preferences]);

  const poolImpact = useMemo(
    () => evaluatePoolImpact(candidatePool, draft),
    [candidatePool, draft],
  );

  const updateAgeBound = (index: 0 | 1, value: number) => {
    const nextRange: [number, number] = [...draft.ageRange] as [number, number];
    nextRange[index] = value;
    setDraft({ ...draft, ageRange: clampAgeRange(nextRange) });
  };

  const updateDealbreaker = (id: DealbreakerKey, enabled: boolean, hardFilterId?: string) => {
    const hardFilters = new Set(draft.hardFilters ?? []);
    if (hardFilterId) {
      if (enabled) hardFilters.add(hardFilterId);
      else hardFilters.delete(hardFilterId);
    }
    setDraft({
      ...draft,
      hardFilters: Array.from(hardFilters),
      dealbreakers: {
        ...(draft.dealbreakers ?? {}),
        [id]: enabled,
      },
    });
  };

  const updateSoftPreference = (id: EditableSoftPreferenceId, enabled: boolean) => {
    const softPreferences = new Set(draft.softPreferences ?? []);
    if (enabled) softPreferences.add(id);
    else softPreferences.delete(id);
    setDraft({ ...draft, softPreferences: Array.from(softPreferences) });
  };

  const updateSoftWeight = (id: EditableSoftPreferenceId, value: number) => {
    setDraft({
      ...draft,
      softPreferenceWeights: {
        ...(draft.softPreferenceWeights ?? {}),
        [id]: clamp01(value),
      },
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      const next: DiscoveryPreferences = {
        ...draft,
        ageRange: clampAgeRange(draft.ageRange),
        poolImpact: {
          ...(draft.poolImpact ?? {}),
          current_pool: poolImpact.tier,
        },
      };
      await Promise.resolve(setPreferences(next));
      trackEvent('skill_applied', {
        skillId: 'filtering-marketplace',
        recommendationMode: next.recommendationMode,
        hardFilterCount: Object.values(next.dealbreakers ?? {}).filter(Boolean).length,
        softPreferenceCount: next.softPreferences.length,
        poolRemaining: poolImpact.remainingPercent,
      });
    } finally {
      setSaving(false);
    }
  };

  const resetDraft = () => setDraft(preferences);

  return (
    <section className="p-6 bg-[#2D2926] rounded-[28px] text-white space-y-5 relative overflow-hidden">
      <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-[#D4AF37]/10 blur-3xl" />
      <div className="relative z-10 space-y-5">
        <div className="flex items-center gap-2 text-[#D4AF37]"><Sparkles size={16} /><span className="text-[10px] font-bold uppercase tracking-widest">Your live discovery controls</span></div>
        {!user ? (
          <p className="text-sm text-white/70 italic">Sign in to tune how your finite daily pool is ranked.</p>
        ) : (
          <>
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Recommendation mode</p>
              <div className="grid grid-cols-2 gap-2">
                {REC_MODES.map((m) => {
                  const active = draft.recommendationMode === m.value;
                  return (
                    <button key={m.value} onClick={() => setDraft({ ...draft, recommendationMode: m.value })} disabled={saving}
                      className={`text-left p-3 rounded-2xl border transition-all ${active ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-white/10 bg-white/5 hover:border-white/25'}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white/90">{m.label}</span>
                        {active && <Check size={13} className="text-[#D4AF37]" />}
                      </div>
                      <p className="text-[10px] text-white/55 italic mt-0.5">{m.blurb}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">Hard filters - strict</p>
                  <p className="text-[10px] text-white/45 italic">These can exclude candidates from Daily Picks.</p>
                </div>
                <div className="space-y-2">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] text-white/60">
                      <span>Age range</span>
                      <span>{draft.ageRange[0]}-{draft.ageRange[1]}</span>
                    </div>
                    <input type="range" min={18} max={80} value={draft.ageRange[0]}
                      onChange={e => updateAgeBound(0, Number(e.target.value))}
                      className="w-full accent-[#D4AF37]" />
                    <input type="range" min={18} max={80} value={draft.ageRange[1]}
                      onChange={e => updateAgeBound(1, Number(e.target.value))}
                      className="w-full accent-[#D4AF37]" />
                  </div>
                  {HARD_CONTROLS.map(control => {
                    const active = draft.dealbreakers?.[control.id] === true;
                    return (
                      <button key={control.id} onClick={() => updateDealbreaker(control.id, !active, control.hardFilterId)}
                        className={`w-full text-left p-3 rounded-xl border transition-all ${active ? 'border-red-400/40 bg-red-500/10' : 'border-white/10 bg-white/5'}`}>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs font-bold text-white/90">{control.label}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${active ? 'bg-red-500/20 text-red-200' : 'bg-white/10 text-white/45'}`}>{active ? 'STRICT' : 'SOFT'}</span>
                        </div>
                        <p className="text-[10px] text-white/45 italic mt-1">{control.detail}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">Soft prefs - re-rank only</p>
                  <p className="text-[10px] text-white/45 italic">Weights change order, not eligibility.</p>
                </div>
                <div className="space-y-2">
                  {SOFT_CONTROLS.map(control => {
                    const active = draft.softPreferences.includes(control.id);
                    const weight = draft.softPreferenceWeights?.[control.id] ?? 0.5;
                    return (
                      <div key={control.id} className={`p-3 rounded-xl border ${active ? 'border-green-400/40 bg-green-500/10' : 'border-white/10 bg-white/5'}`}>
                        <button className="w-full text-left" onClick={() => updateSoftPreference(control.id, !active)}>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xs font-bold text-white/90">{control.label}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${active ? 'bg-green-500/20 text-green-200' : 'bg-white/10 text-white/45'}`}>{active ? 'ON' : 'OFF'}</span>
                          </div>
                          <p className="text-[10px] text-white/45 italic mt-1">{control.detail}</p>
                        </button>
                        <div className="flex items-center gap-3 mt-2">
                          <input type="range" min={0} max={1} step={0.05} value={weight}
                            disabled={!active}
                            onChange={e => updateSoftWeight(control.id, Number(e.target.value))}
                            className="flex-1 accent-[#D4AF37] disabled:opacity-30" />
                          <span className="text-[10px] font-mono text-white/55 w-8 text-right">{weight.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div data-testid="pool-impact-preview" className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">Pool impact preview</p>
                  <p className="text-[10px] text-white/45 italic">Current candidate pool after strict filters.</p>
                </div>
                <span className="text-lg font-bold text-[#D4AF37]">{poolImpact.remainingPercent}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#D4AF37] rounded-full" style={{ width: `${poolImpact.remainingPercent}%` }} />
              </div>
              <p className="text-[10px] text-white/55">
                {poolImpact.admitted} admitted, {poolImpact.excluded} excluded from {poolImpact.total}. Impact: {poolImpact.tier.replace('_', ' ')}.
              </p>
              <p className="text-[9px] text-white/40 italic">Daily Picks stay strict. Explore can disclose spillover only when a setting, such as age, is not a dealbreaker.</p>
            </div>

            <div className="flex gap-2">
              <button onClick={resetDraft} disabled={saving} className="flex-1 p-3 rounded-2xl border border-white/10 bg-white/5 text-xs font-bold uppercase tracking-widest text-white/60 hover:border-white/25">Reset draft</button>
              <button onClick={save} disabled={saving} className="flex-1 p-3 rounded-2xl bg-[#D4AF37] text-[#2D2926] text-xs font-bold uppercase tracking-widest hover:bg-[#E2BE48] disabled:opacity-70">{saving ? 'Saving...' : 'Save controls'}</button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

const HARD_FILTER_LABELS: Record<HardFilterId, string> = {
  age_range: 'Age range',
  age: 'Age range',
  max_distance: 'Max distance (km)',
  distance: 'Distance',
  observance_floor: 'Observance floor',
  shomer_shabbat: 'Shomer Shabbat',
  kashrut: 'Keeps kashrut',
  gender: 'Gender preference',
  intent_alignment: 'Intent alignment',
  intent: 'Intent alignment',
  observance: 'Observance',
  verified_only: 'Verified only',
  verified: 'Verified only',
};

const SOFT_PREFERENCE_LABELS: Record<SoftPreferenceId, string> = {
  shared_interests: 'Shared interests',
  shared_observance_label: 'Same observance label',
  communication_style_match: 'Communication style',
  more_like_recent_likes: 'Like recent likes',
  similar_age: 'Similar age',
  same_city: 'Same city',
  community_active: 'Community active',
};

function ScoreBar({ value, color = 'bg-amber-400' }: { value: number; color?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 bg-[#F3EFEA] rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }} />
      </div>
      <span className="text-[10px] font-mono text-[#8C7E6E]">{value.toFixed(3)}</span>
    </div>
  );
}

export const FilteringMarketplaceSkill: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { user, preferences, dailyPicks, exploreProfiles, tasteState } = useApp();
  const currentCandidatePool = useMemo(() => {
    const live = uniqueProfiles([...dailyPicks, ...exploreProfiles]);
    return live.length > 0 ? live : MOCK_PROFILES;
  }, [dailyPicks, exploreProfiles]);
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [requireVerified, setRequireVerified] = useState(false);
  const [requireShabbat, setRequireShabbat] = useState(false);
  const [maxAge, setMaxAge] = useState(preferences.ageRange[1]);

  useEffect(() => {
    setMaxAge(preferences.ageRange[1]);
  }, [preferences.ageRange]);

  useEffect(() => {
    if (currentCandidatePool.length === 0) return;
    if (!currentCandidatePool.some((profile) => profileKey(profile) === selectedCandidateId)) {
      setSelectedCandidateId(profileKey(currentCandidatePool[0]));
    }
  }, [currentCandidatePool, selectedCandidateId]);

  const candidate = currentCandidatePool.find((profile) => profileKey(profile) === selectedCandidateId) ??
    currentCandidatePool[0] ??
    MOCK_PROFILES[0];
  const viewer = user ?? MOCK_PROFILES.find((profile) => profileKey(profile) !== profileKey(candidate)) ?? candidate;
  const comparisonProfile = currentCandidatePool.find((profile) => profileKey(profile) !== profileKey(candidate)) ?? viewer;
  const inspectorMaxAge = Math.max(preferences.ageRange[0], maxAge);
  const candidateDistanceKm = estimateDistanceKm(viewer, candidate);

  const savedViolation = violatesHardFilters(candidate, preferences);
  const hardCtx: HardFilterContext = {
    ageRange: [preferences.ageRange[0], inspectorMaxAge],
    maxDistanceKm: preferences.dealbreakers?.distance === false ? undefined : preferences.maxDistance,
    candidateDistanceKm: candidateDistanceKm ?? undefined,
    genderPreference: preferences.dealbreakers?.gender === false ? undefined : preferences.genderPreference,
    intentPreference: preferences.dealbreakers?.intent === false ? undefined : preferences.intentPreference,
    verifiedOnly: requireVerified || preferences.dealbreakers?.verified === true || preferences.hardFilters.includes('verified'),
    requireShomerShabbat: requireShabbat,
    candidatePracticeTags: practiceTags(candidate),
  };
  const violation = violatesHardFilters(candidate, hardCtx);

  const softWeights = softWeightsFromPreferences(preferences);
  const viewerAffinity = implicitAffinity(tasteState, profileToFeatureTags(candidate));
  const viewerScore = directionalScore({
    viewer,
    candidate,
    preferences,
    implicitAffinity: viewerAffinity,
  });
  const candidateScore = directionalScore({
    viewer: candidate,
    candidate: viewer,
    hardCtx: {},
    softWeights,
    implicitAffinity: 0,
  });
  const comparisonScore = directionalScore({
    viewer,
    candidate: comparisonProfile,
    preferences,
    implicitAffinity: implicitAffinity(tasteState, profileToFeatureTags(comparisonProfile)),
  });
  const reciprocal = reciprocalScore(viewerScore.score, candidateScore.score);

  const [candidateAgeMs, setCandidateAgeMs] = useState(200);
  const [imp7d, setImp7d] = useState(5);
  const [imp24h, setImp24h] = useState(10);

  const fairness: FairnessState = {
    candidateAccountAgeMs: candidateAgeMs * 60 * 60 * 1000,
    impressionsLast7d: imp7d,
    impressionsLast24h: imp24h,
  };
  const fMultiplier = fairnessMultiplier(fairness);
  const finalScore = adjustedFinalScore(reciprocal, fMultiplier);

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2D2926]">
      <header className="sticky top-0 z-10 bg-[#FDFCFB]/95 backdrop-blur-sm px-6 py-4 flex items-center gap-4 border-b border-[#F3EFEA]">
        <button onClick={onBack} className="p-2 hover:bg-[#F7F2EE] rounded-full transition-all">
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-lime-100 text-lime-700 rounded-full flex items-center justify-center border border-lime-200">
            <ShoppingBag size={16} />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-lg font-serif italic">Filtering & Marketplace</h1>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#8C7E6E]">Grammar, Reciprocal Ranking & Fairness</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <LiveFiltering />

        <section className="p-6 bg-lime-50 rounded-[24px] border border-lime-100 space-y-2">
          <div className="flex items-center gap-2 text-lime-700">
            <Info size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">What this is</span>
          </div>
          <p className="text-xs text-lime-800 leading-relaxed">
            Filtering grammar with hard dealbreakers, soft ranking preferences, and reciprocal
            harmonic-mean scoring. Exposure fairness multipliers prevent starvation and popularity
            monopolies. All logic is deterministic - no AI.
          </p>
        </section>

        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Candidate Admissibility Inspector</h2>
          <p className="text-xs text-[#6B5E52] italic">Inspect the active discovery pool against saved filters and stricter what-if constraints.</p>

          <div className="space-y-3">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]" htmlFor="filtering-candidate-select">
              Candidate
            </label>
            <select
              id="filtering-candidate-select"
              value={profileKey(candidate)}
              onChange={(event) => setSelectedCandidateId(event.target.value)}
              className="w-full p-3 rounded-xl bg-[#F7F2EE] border border-[#E5E0DB] text-xs font-medium outline-none focus:border-lime-300"
            >
              {currentCandidatePool.map((profile) => (
                <option key={profileKey(profile)} value={profileKey(profile)}>
                  {profile.displayName} · {profile.age} · {profile.city}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-[#F7F2EE] rounded-xl">
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#8C7E6E]">Saved policy</p>
                <p className={savedViolation.violates ? 'text-red-700 font-bold mt-1' : 'text-green-700 font-bold mt-1'}>
                  {savedViolation.violates ? HARD_FILTER_LABELS[savedViolation.reason] : 'Admissible'}
                </p>
              </div>
              <div className="p-3 bg-[#F7F2EE] rounded-xl">
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#8C7E6E]">Distance</p>
                <p className="text-[#2D2926] font-bold mt-1">{candidateDistanceKm == null ? 'Unknown' : `${candidateDistanceKm} km`}</p>
              </div>
              <div className="p-3 bg-[#F7F2EE] rounded-xl">
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#8C7E6E]">Pool source</p>
                <p className="text-[#2D2926] font-bold mt-1">{dailyPicks.length + exploreProfiles.length > 0 ? 'Live discovery' : 'Fallback seed'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 bg-[#F7F2EE] rounded-xl">
              <span className="text-xs font-medium min-w-[100px]">What-if max age</span>
              <input type="range" min={18} max={80} value={inspectorMaxAge}
                onChange={e => { const v = Number(e.target.value); if (!Number.isNaN(v)) setMaxAge(Math.max(18, Math.min(80, v))); }}
                className="flex-1 accent-lime-500"
              />
              <span className="text-xs font-mono w-8">{inspectorMaxAge}</span>
            </div>

            <button
              onClick={() => setRequireVerified(v => !v)}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-xs transition-all ${requireVerified ? 'bg-lime-50 border-lime-200 border' : 'bg-[#F7F2EE]'}`}
            >
              <span className="font-medium">Require verified in inspector</span>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${requireVerified ? 'bg-lime-100 text-lime-700' : 'bg-[#E5E0DB] text-[#8C7E6E]'}`}>
                {requireVerified ? 'ON' : 'OFF'}
              </span>
            </button>

            <button
              onClick={() => setRequireShabbat(v => !v)}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-xs transition-all ${requireShabbat ? 'bg-lime-50 border-lime-200 border' : 'bg-[#F7F2EE]'}`}
            >
              <span className="font-medium">Require Shomer Shabbat tag in inspector</span>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${requireShabbat ? 'bg-lime-100 text-lime-700' : 'bg-[#E5E0DB] text-[#8C7E6E]'}`}>
                {requireShabbat ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>

          <div className={`p-4 rounded-2xl border flex items-center gap-3 text-xs ${violation.violates ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
            {violation.violates
              ? <X size={16} className="text-red-600 shrink-0" />
              : <Check size={16} className="text-green-600 shrink-0" />}
            <span className={violation.violates ? 'text-red-800' : 'text-green-800'}>
              {violation.violates
                ? `Inspector hard filter violated: "${HARD_FILTER_LABELS[violation.reason]}" -> candidate excluded (score = 0)`
                : 'No inspector hard filter violations - candidate is admissible'}
            </span>
          </div>
        </section>

        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Live Preference Scoring</h2>
          <p className="text-xs text-[#6B5E52] italic">
            Viewer score uses your saved preferences and private taste state. Candidate-side score uses visible profile overlap because other members' private taste is not exposed in the client.
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-[#F7F2EE] rounded-xl text-xs">
              <span className="font-medium">You to {candidate.displayName}</span>
              <ScoreBar value={viewerScore.score} />
            </div>
            <div className="flex items-center justify-between p-3 bg-[#F7F2EE] rounded-xl text-xs">
              <span className="font-medium">Visible reciprocal estimate</span>
              <ScoreBar value={candidateScore.score} />
            </div>
            <div className="flex items-center justify-between p-3 bg-[#F7F2EE] rounded-xl text-xs">
              <span className="font-medium">Comparison: {comparisonProfile.displayName}</span>
              <ScoreBar value={comparisonScore.score} color="bg-lime-400" />
            </div>
            <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-100 rounded-xl text-xs">
              <span className="font-bold">Reciprocal harmonic mean</span>
              <ScoreBar value={reciprocal} color="bg-amber-500" />
            </div>
          </div>
          {viewerScore.reasonCodes.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {viewerScore.reasonCodes.map(c => (
                <span key={c} className="px-2 py-0.5 bg-lime-50 border border-lime-200 text-lime-800 rounded-full text-[9px] font-bold">{SOFT_PREFERENCE_LABELS[c as SoftPreferenceId] ?? c}</span>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Exposure Fairness Multiplier</h2>
          <p className="text-xs text-[#6B5E52] italic">Adjust these to see how new-user boost, anti-starvation, and popularity cool-down affect the selected candidate's final score.</p>

          <div className="space-y-3">
            {[
              { label: 'Account age (hours)', value: candidateAgeMs, setter: setCandidateAgeMs, min: 0, max: 500 },
              { label: 'Impressions last 7 days', value: imp7d, setter: setImp7d, min: 0, max: 600 },
              { label: 'Impressions last 24 hours', value: imp24h, setter: setImp24h, min: 0, max: 600 },
            ].map(({ label, value, setter, min, max }) => (
              <div key={label} className="flex items-center gap-4 p-3 bg-[#F7F2EE] rounded-xl">
                <span className="text-xs font-medium min-w-[160px]">{label}</span>
                <input type="range" min={min} max={max} value={value}
                  onChange={e => { const v = Number(e.target.value); if (!Number.isNaN(v)) setter(Math.max(min, Math.min(max, v))); }}
                  className="flex-1 accent-lime-500"
                />
                <span className="text-xs font-mono w-10 text-right">{value}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-[#F7F2EE] rounded-xl text-xs space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">Fairness multiplier</p>
              <p className={`text-lg font-bold ${fMultiplier > 1 ? 'text-green-700' : fMultiplier < 1 ? 'text-red-700' : 'text-[#2D2926]'}`}>
                x{fMultiplier.toFixed(2)}
              </p>
              <p className="text-[9px] text-[#8C7E6E] italic">
                {candidateAgeMs < 72 ? 'New-user boost' : imp24h > 500 ? 'Popularity cool-down' : imp7d < 10 ? 'Anti-starvation boost' : 'Neutral'}
              </p>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-xs space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700">Adjusted final score</p>
              <p className="text-lg font-bold text-amber-900">{finalScore.toFixed(3)}</p>
              <p className="text-[9px] text-amber-700 italic">reciprocal x multiplier</p>
            </div>
          </div>
        </section>

        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-600" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Fairness Rules</h2>
          </div>
          {[
            'Hard filter violations exclude candidates entirely (score = 0)',
            'Reciprocal scoring via harmonic mean - mutual interest required for high scores',
            'New users get a 1.5x boost for the first 72 hours',
            'Candidates with >500 impressions in 24 h get a 0.5x cool-down',
            'Anti-starvation: candidates with <10 impressions in 7 days get a boost',
            '"Verified only" is a hard filter - never a hidden downrank',
          ].map((rule, i) => (
            <div key={i} className="flex items-start gap-2 p-3 bg-[#F7F2EE] rounded-xl text-xs">
              <Check size={12} className="mt-0.5 shrink-0 text-lime-600" />
              <span>{rule}</span>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};
