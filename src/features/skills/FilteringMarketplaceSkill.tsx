import React, { useState } from 'react';
import { ChevronLeft, ShoppingBag, Check, X, Info, AlertTriangle } from 'lucide-react';
import {
  violatesHardFilters,
  directionalScore,
  reciprocalScore,
  fairnessMultiplier,
  adjustedFinalScore,
  type HardFilterId,
  type SoftPreferenceId,
  type FairnessState,
} from '@/lib/filteringGrammar';
import { MOCK_PROFILES } from '@/data/mockProfiles';

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
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${value * 100}%` }} />
      </div>
      <span className="text-[10px] font-mono text-[#8C7E6E]">{value.toFixed(3)}</span>
    </div>
  );
}

export const FilteringMarketplaceSkill: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [requireVerified, setRequireVerified] = useState(false);
  const [requireShabbat, setRequireShabbat] = useState(false);
  const [maxAge, setMaxAge] = useState(40);

  // Demo candidate — use first mock profile as the "viewer" context
  const candidate = MOCK_PROFILES[0];

  const hardCtx = {
    ageRange: [22, maxAge] as [number, number],
    verifiedOnly: requireVerified,
    requireShomerShabbat: requireShabbat,
  };
  const violation = violatesHardFilters(candidate, hardCtx);

  const softWeights: Partial<Record<SoftPreferenceId, number>> = {
    shared_interests: 0.7,
    similar_age: 0.5,
    same_city: 0.4,
    shared_observance_label: 0.6,
  };

  const viewerScore = directionalScore({
    viewer: candidate,
    candidate: MOCK_PROFILES[1] ?? candidate,
    hardCtx: {},
    softWeights,
    implicitAffinity: 0.3,
  });
  const candidateScore = directionalScore({
    viewer: MOCK_PROFILES[1] ?? candidate,
    candidate,
    hardCtx: {},
    softWeights,
    implicitAffinity: 0.2,
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
        {/* Purpose */}
        <section className="p-6 bg-lime-50 rounded-[24px] border border-lime-100 space-y-2">
          <div className="flex items-center gap-2 text-lime-700">
            <Info size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">What this is</span>
          </div>
          <p className="text-xs text-lime-800 leading-relaxed">
            Filtering grammar with hard dealbreakers, soft ranking preferences, and reciprocal
            harmonic-mean scoring. Exposure fairness multipliers prevent starvation and popularity
            monopolies. All logic is deterministic — no AI.
          </p>
        </section>

        {/* Hard filters */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Hard Filters (Dealbreakers)</h2>
          <p className="text-xs text-[#6B5E52] italic">Toggle these to test hard-filter violations on a demo candidate.</p>

          <div className="space-y-3">
            {/* Max age slider */}
            <div className="flex items-center gap-4 p-3 bg-[#F7F2EE] rounded-xl">
              <span className="text-xs font-medium min-w-[100px]">Max age</span>
              <input type="range" min={20} max={60} value={maxAge}
                onChange={e => { const v = Number(e.target.value); if (!Number.isNaN(v)) setMaxAge(Math.max(20, Math.min(60, v))); }}
                className="flex-1 accent-lime-500"
              />
              <span className="text-xs font-mono w-8">{maxAge}</span>
            </div>

            {/* Toggle: verified only */}
            <button
              onClick={() => setRequireVerified(v => !v)}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-xs transition-all ${requireVerified ? 'bg-lime-50 border-lime-200 border' : 'bg-[#F7F2EE]'}`}
            >
              <span className="font-medium">Verified only</span>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${requireVerified ? 'bg-lime-100 text-lime-700' : 'bg-[#E5E0DB] text-[#8C7E6E]'}`}>
                {requireVerified ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* Toggle: shomer shabbat */}
            <button
              onClick={() => setRequireShabbat(v => !v)}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-xs transition-all ${requireShabbat ? 'bg-lime-50 border-lime-200 border' : 'bg-[#F7F2EE]'}`}
            >
              <span className="font-medium">Shomer Shabbat required</span>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${requireShabbat ? 'bg-lime-100 text-lime-700' : 'bg-[#E5E0DB] text-[#8C7E6E]'}`}>
                {requireShabbat ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>

          {/* Violation result */}
          <div className={`p-4 rounded-2xl border flex items-center gap-3 text-xs ${violation.violates ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
            {violation.violates
              ? <X size={16} className="text-red-600 shrink-0" />
              : <Check size={16} className="text-green-600 shrink-0" />}
            <span className={violation.violates ? 'text-red-800' : 'text-green-800'}>
              {violation.violates
                ? `Hard filter violated: "${HARD_FILTER_LABELS[violation.reason]}" → candidate excluded (score = 0)`
                : 'No hard filter violations — candidate is admissible'}
            </span>
          </div>
        </section>

        {/* Soft preference scoring */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Soft Preference Scoring (Demo)</h2>
          <p className="text-xs text-[#6B5E52] italic">
            Score = 0.5 × explicit_match + 0.4 × implicit_affinity + 0.1 × context_boost
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-[#F7F2EE] rounded-xl text-xs">
              <span className="font-medium">Viewer → Candidate score</span>
              <ScoreBar value={viewerScore.score} />
            </div>
            <div className="flex items-center justify-between p-3 bg-[#F7F2EE] rounded-xl text-xs">
              <span className="font-medium">Candidate → Viewer score</span>
              <ScoreBar value={candidateScore.score} />
            </div>
            <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-100 rounded-xl text-xs">
              <span className="font-bold">Reciprocal harmonic mean</span>
              <ScoreBar value={reciprocal} color="bg-amber-500" />
            </div>
          </div>
          {viewerScore.reasonCodes.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {viewerScore.reasonCodes.map(c => (
                <span key={c} className="px-2 py-0.5 bg-lime-50 border border-lime-200 text-lime-800 rounded-full text-[9px] font-bold">{c}</span>
              ))}
            </div>
          )}
        </section>

        {/* Fairness multiplier */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Exposure Fairness Multiplier</h2>
          <p className="text-xs text-[#6B5E52] italic">Adjust these to see how new-user boost, anti-starvation, and popularity cool-down affect the final score.</p>

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
                ×{fMultiplier.toFixed(2)}
              </p>
              <p className="text-[9px] text-[#8C7E6E] italic">
                {candidateAgeMs < 72 ? 'New-user boost' : imp24h > 500 ? 'Popularity cool-down' : imp7d < 10 ? 'Anti-starvation boost' : 'Neutral'}
              </p>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-xs space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700">Adjusted final score</p>
              <p className="text-lg font-bold text-amber-900">{finalScore.toFixed(3)}</p>
              <p className="text-[9px] text-amber-700 italic">reciprocal × multiplier</p>
            </div>
          </div>
        </section>

        {/* Fairness rules */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-600" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Fairness Rules</h2>
          </div>
          {[
            'Hard filter violations → candidate excluded entirely (score = 0)',
            'Reciprocal scoring via harmonic mean — mutual interest required for high scores',
            'New users get a 1.5× boost for the first 72 hours',
            'Candidates with >500 impressions in 24 h get a 0.5× cool-down',
            'Anti-starvation: candidates with <10 impressions in 7 days get a boost',
            '"Verified only" is a hard filter — never a hidden downrank',
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
