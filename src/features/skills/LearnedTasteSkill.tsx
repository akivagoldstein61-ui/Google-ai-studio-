import React, { useMemo, useState } from 'react';
import { ChevronLeft, Activity, Check, X, Info, Sparkles, Loader2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { aiService } from '@/services/aiService';
import {
  authority,
  signOf,
  implicitAffinity,
  FAST_HALFLIFE_MS,
  SLOW_HALFLIFE_MS,
  type EventClass,
  type EventName,
  type TasteState,
} from '@/lib/learnedTaste';
import { profileToFeatureTags } from '@/lib/tastePersistence';
import type { Profile, TasteProfileDraft } from '@/types';

const EVENT_CLASS_COLORS: Record<string, string> = {
  policy_consent: 'bg-slate-50 text-slate-700 border-slate-200',
  explicit_preference: 'bg-green-50 text-green-700 border-green-200',
  high_signal_implicit: 'bg-blue-50 text-blue-700 border-blue-200',
  context: 'bg-gray-50 text-gray-700 border-gray-200',
};

type EventRow = { name: EventName; label: string; classLabel: EventClass };
const EVENT_ROWS: EventRow[] = [
  { name: 'more_like_this', label: 'More like this', classLabel: 'explicit_preference' },
  { name: 'like', label: 'Like', classLabel: 'explicit_preference' },
  { name: 'reply_received', label: 'Reply received', classLabel: 'high_signal_implicit' },
  { name: 'long_dwell', label: 'Long dwell (8 s)', classLabel: 'high_signal_implicit' },
  { name: 'profile_open', label: 'Profile open', classLabel: 'high_signal_implicit' },
  { name: 'pass', label: 'Pass', classLabel: 'explicit_preference' },
  { name: 'less_like_this', label: 'Less like this', classLabel: 'explicit_preference' },
  { name: 'block', label: 'Block', classLabel: 'explicit_preference' },
];

type TasteListKey = 'soft_preferences' | 'things_to_avoid' | 'hard_dealbreakers';

type FeatureSummary = {
  feature: string;
  direction: 'toward' | 'away';
  strength: 'weak' | 'medium' | 'strong';
  memory: 'fast' | 'slow';
};

function normalizeTasteProfileDraft(raw: any): TasteProfileDraft {
  const input = raw && typeof raw === 'object' ? raw : {};
  const weights = input.weights && typeof input.weights === 'object' ? input.weights : {};
  return {
    hard_dealbreakers: Array.isArray(input.hard_dealbreakers) ? input.hard_dealbreakers : [],
    soft_preferences: Array.isArray(input.soft_preferences) ? input.soft_preferences : [],
    things_to_avoid: Array.isArray(input.things_to_avoid) ? input.things_to_avoid : [],
    weights: {
      values_weight: typeof weights.values_weight === 'number'
        ? weights.values_weight
        : typeof weights.values_vs_lifestyle === 'number'
          ? weights.values_vs_lifestyle
          : 0.5,
      stability_weight: typeof weights.stability_weight === 'number' ? weights.stability_weight : 0.5,
      pacing_weight: typeof weights.pacing_weight === 'number' ? weights.pacing_weight : 0.5,
    },
    learning: {
      paused: input.learning?.paused === true,
      optedOut: input.learning?.optedOut === true,
      lastUpdatedAt: typeof input.learning?.lastUpdatedAt === 'string' ? input.learning.lastUpdatedAt : null,
    },
    provenance: input.provenance && typeof input.provenance === 'object' ? input.provenance : {},
    lockedItems: Array.isArray(input.lockedItems) ? input.lockedItems : [],
    removedItems: Array.isArray(input.removedItems) ? input.removedItems : [],
    explanation: typeof input.explanation === 'string' ? input.explanation : '',
  };
}

function mergeManualControls(raw: any, current: TasteProfileDraft): TasteProfileDraft {
  const next = normalizeTasteProfileDraft(raw);
  const merged: TasteProfileDraft = {
    ...next,
    learning: current.learning,
    provenance: { ...next.provenance, ...current.provenance },
    lockedItems: [...(current.lockedItems ?? [])],
    removedItems: [...(current.removedItems ?? [])],
  };

  for (const lockKey of current.lockedItems ?? []) {
    const [key, ...valueParts] = lockKey.split(':') as [TasteListKey, ...string[]];
    const value = valueParts.join(':');
    if (key in merged && Array.isArray(merged[key]) && value) {
      merged[key] = Array.from(new Set([...(merged[key] as string[]), value])) as any;
    }
  }

  for (const removedKey of current.removedItems ?? []) {
    const [key, ...valueParts] = removedKey.split(':') as [TasteListKey, ...string[]];
    const value = valueParts.join(':');
    if (key in merged && Array.isArray(merged[key]) && value) {
      merged[key] = (merged[key] as string[]).filter((item) => item !== value) as any;
    }
  }

  return merged;
}

function authorityBar(authorityValue: number) {
  if (authorityValue === 0) return <span className="text-[9px] text-[#8C7E6E]">0.00</span>;
  return (
    <div className="flex items-center gap-1">
      <div className="h-1.5 bg-[#F3EFEA] rounded-full overflow-hidden w-16">
        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${authorityValue * 100}%` }} />
      </div>
      <span className="text-[9px] font-mono text-[#8C7E6E]">{authorityValue.toFixed(2)}</span>
    </div>
  );
}

function uniqueProfiles(profiles: Profile[]) {
  const seen = new Set<string>();
  return profiles.filter((profile) => {
    const key = profile.uid ?? profile.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function strengthLabel(value: number): FeatureSummary['strength'] {
  const abs = Math.abs(value);
  if (abs >= 1) return 'strong';
  if (abs >= 0.35) return 'medium';
  return 'weak';
}

function summarizeTasteMap(map: Map<string, number>, memory: FeatureSummary['memory']): FeatureSummary[] {
  return [...map.entries()]
    .filter(([, value]) => Math.abs(value) >= 0.05)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, 8)
    .map(([feature, value]) => ({
      feature,
      memory,
      direction: value >= 0 ? 'toward' : 'away',
      strength: strengthLabel(value),
    }));
}

const ChipList: React.FC<{ label: string; items: string[]; tone: 'toward' | 'away' }> = ({ label, items, tone }) => (
  <div className="space-y-1.5">
    <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">{label}</p>
    <div className="flex flex-wrap gap-1.5">
      {items.length > 0 ? items.map((x) => (
        <span key={x} className={`px-2 py-0.5 rounded-md text-[10px] border ${tone === 'away' ? 'bg-red-500/15 text-red-300 border-red-500/20' : 'bg-green-500/15 text-green-300 border-green-500/20'}`}>
          {x}
        </span>
      )) : <span className="text-[11px] text-white/40 italic">None yet</span>}
    </div>
  </div>
);

const FeaturePill: React.FC<{ item: FeatureSummary }> = ({ item }) => (
  <span className={`px-2 py-1 rounded-lg text-[10px] border ${item.direction === 'away' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
    {item.feature.replace(/_/g, ' ')} · {item.direction} · {item.strength}
  </span>
);

/**
 * LIVE: grounds the learning model in the user's real captured signals and
 * persists recomputed category summaries to the owner-only taste profile.
 */
const LiveLearnedSignals: React.FC = () => {
  const {
    user,
    interactions,
    tasteProfile,
    tasteState,
    dailyPicks,
    exploreProfiles,
    setTasteProfile,
    trackEvent,
  } = useApp();
  const [loading, setLoading] = useState(false);
  const [attempted, setAttempted] = useState(false);

  const counts = {
    likes: interactions?.likes?.length ?? 0,
    passes: interactions?.passes?.length ?? 0,
    more: interactions?.moreLikeThis?.length ?? 0,
    less: interactions?.lessLikeThis?.length ?? 0,
  };
  const total = counts.likes + counts.passes + counts.more + counts.less;
  const learningPaused = tasteProfile.learning.paused || tasteProfile.learning.optedOut;

  const liveCandidates = useMemo(
    () => uniqueProfiles([...dailyPicks, ...exploreProfiles]).slice(0, 6),
    [dailyPicks, exploreProfiles],
  );

  const candidateAffinities = useMemo(
    () => liveCandidates
      .map((candidate) => ({
        candidate,
        affinity: implicitAffinity(tasteState, profileToFeatureTags(candidate)),
      }))
      .sort((a, b) => Math.abs(b.affinity) - Math.abs(a.affinity)),
    [liveCandidates, tasteState],
  );

  const fastSignals = useMemo(() => summarizeTasteMap(tasteState.fast, 'fast'), [tasteState]);
  const slowSignals = useMemo(() => summarizeTasteMap(tasteState.slow, 'slow'), [tasteState]);
  const hasVectorSignals = fastSignals.length + slowSignals.length > 0;

  const recompute = async () => {
    setLoading(true);
    setAttempted(true);
    try {
      const result = await aiService.analyzeTasteProfile(interactions, tasteProfile);
      if (result) {
        const persisted = mergeManualControls(result, {
          ...tasteProfile,
          learning: {
            ...tasteProfile.learning,
            lastUpdatedAt: new Date().toISOString(),
          },
        });
        setTasteProfile(persisted);
        trackEvent?.('skill_completed', { skillId: 'learned-taste', hasResult: true, signals: total, persisted: true });
      } else {
        trackEvent?.('skill_completed', { skillId: 'learned-taste', hasResult: false, signals: total, persisted: false });
      }
    } catch {
      trackEvent?.('skill_completed', { skillId: 'learned-taste', hasResult: false, signals: total, persisted: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="p-6 bg-[#2D2926] rounded-[28px] text-white space-y-4 relative overflow-hidden">
      <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-[#D4AF37]/10 blur-3xl" />
      <div className="relative z-10 space-y-4">
        <div className="flex items-center gap-2 text-[#D4AF37]"><Sparkles size={16} /><span className="text-[10px] font-bold uppercase tracking-widest">Your live signals</span></div>
        {!user ? (
          <p className="text-sm text-white/70 italic">Sign in to see what Kesher has learned from your real interactions.</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {[
                { k: 'Likes', v: counts.likes }, { k: 'Passes', v: counts.passes },
                { k: 'More-like-this', v: counts.more }, { k: 'Less-like-this', v: counts.less },
              ].map((s) => (
                <span key={s.k} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-white/70">{s.k}: <span className="text-[#D4AF37]">{s.v}</span></span>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
              <ChipList label="Dealbreakers" items={tasteProfile.hard_dealbreakers} tone="away" />
              <ChipList label="Leans toward" items={tasteProfile.soft_preferences} tone="toward" />
              <ChipList label="Leans away" items={tasteProfile.things_to_avoid} tone="away" />
            </div>

            <div className={`p-3 rounded-xl text-xs border ${learningPaused ? 'bg-amber-500/10 text-amber-100 border-amber-500/20' : 'bg-green-500/10 text-green-100 border-green-500/20'}`}>
              <span className="font-bold">Learning {learningPaused ? 'paused' : 'active'}</span> - recompute saves category summaries, but event learning only updates while active.
            </div>

            {total === 0 ? (
              <p className="text-sm text-white/70 italic leading-relaxed">Like or pass on profiles in Daily Picks first. Messages, location, and protected traits are never used.</p>
            ) : (
              <button onClick={recompute} disabled={loading || learningPaused} className="h-10 px-5 rounded-full bg-[#D4AF37] text-[#2D2926] hover:bg-[#B8962E] font-bold uppercase tracking-widest text-[10px] inline-flex items-center gap-2 disabled:opacity-50">
                {loading ? <><Loader2 size={14} className="animate-spin" /> Recomputing</> : 'Recompute and save'}
              </button>
            )}
            {attempted && !loading && (
              <p className="text-[9px] text-white/40 italic">If the model service returns no result, Kesher leaves your saved taste profile unchanged.</p>
            )}
            <p className="text-[9px] text-white/40 italic">Owner-only. Category-level leanings only - exact authority weights are never shown to anyone.</p>

            <div className="bg-white border border-[#F3EFEA] rounded-[24px] p-5 space-y-4 text-[#2D2926]">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Live Taste State Inspector</h2>
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#D4AF37]">{liveCandidates.length} live candidates</span>
              </div>
              <p className="text-xs text-[#6B5E52] italic">
                This reads your current fast/slow taste vectors and scores profiles already loaded from Daily Picks and Explore. It does not use demo features or write new events.
              </p>

              {hasVectorSignals ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-[#F7F2EE] rounded-2xl space-y-2 border border-[#E5DED5]">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">Fast memory signals</p>
                    <div className="flex flex-wrap gap-1.5">
                      {fastSignals.length > 0 ? fastSignals.map((item) => <FeaturePill key={`fast-${item.feature}`} item={item} />) : <span className="text-xs text-[#8C7E6E] italic">No fast-memory leanings yet</span>}
                    </div>
                  </div>
                  <div className="p-3 bg-[#F7F2EE] rounded-2xl space-y-2 border border-[#E5DED5]">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">Slow memory signals</p>
                    <div className="flex flex-wrap gap-1.5">
                      {slowSignals.length > 0 ? slowSignals.map((item) => <FeaturePill key={`slow-${item.feature}`} item={item} />) : <span className="text-xs text-[#8C7E6E] italic">No slow-memory leanings yet</span>}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-[#F7F2EE] border border-[#E5DED5] rounded-2xl text-sm text-[#6B5E52] italic">
                  No taste vector has been learned yet. Turn learning on, then interact with Daily Picks or Explore to populate this inspector.
                </div>
              )}

              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">Live candidate affinity</p>
                {candidateAffinities.length > 0 ? candidateAffinities.map(({ candidate, affinity }) => (
                  <div key={candidate.uid ?? candidate.id} className="p-3 bg-[#F7F2EE] border border-[#E5DED5] rounded-2xl space-y-2">
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="font-bold text-[#2D2926]">{candidate.displayName}</span>
                      <span className={`font-bold ${affinity > 0.1 ? 'text-green-700' : affinity < -0.1 ? 'text-red-700' : 'text-[#8C7E6E]'}`}>
                        {affinity > 0.1 ? 'Toward' : affinity < -0.1 ? 'Away' : 'Neutral'}
                      </span>
                    </div>
                    <div className="h-2 bg-[#E5E0DB] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${affinity >= 0 ? 'bg-green-400' : 'bg-red-400'}`}
                        style={{ width: `${Math.abs(affinity) * 100}%`, marginLeft: affinity >= 0 ? '50%' : `${50 - Math.abs(affinity) * 100}%` }}
                      />
                    </div>
                  </div>
                )) : (
                  <p className="text-xs text-[#6B5E52] italic">Open Daily Picks or Explore to load candidates for live affinity inspection.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export const LearnedTasteSkill: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2D2926]">
      <header className="sticky top-0 z-10 bg-[#FDFCFB]/95 backdrop-blur-sm px-6 py-4 flex items-center gap-4 border-b border-[#F3EFEA]">
        <button onClick={onBack} className="p-2 hover:bg-[#F7F2EE] rounded-full transition-all">
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center border border-green-200">
            <Activity size={16} />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-lg font-serif italic">Learned Taste</h1>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#8C7E6E]">Implicit & Explicit Preference Learning</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <LiveLearnedSignals />

        <section className="p-6 bg-green-50 rounded-[24px] border border-green-100 space-y-2">
          <div className="flex items-center gap-2 text-green-700">
            <Info size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">What this is</span>
          </div>
          <p className="text-xs text-green-800 leading-relaxed">
            Consent-gated implicit and explicit preference learning with dual-memory fast and slow state. Update rule: authority x confidence x sign. Message text, photos, and protected traits are never captured.
          </p>
        </section>

        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Event Authority Hierarchy</h2>
          <p className="text-xs text-[#6B5E52] italic">Higher authority means a more trusted signal. Explicit always outranks implicit.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#F3EFEA]">
                  <th className="text-left py-2 pr-4 font-bold text-[#2D2926]">Event</th>
                  <th className="text-left py-2 pr-4 font-bold text-[#2D2926]">Class</th>
                  <th className="text-left py-2 pr-4 font-bold text-[#2D2926]">Authority</th>
                  <th className="text-left py-2 font-bold text-[#2D2926]">Sign</th>
                </tr>
              </thead>
              <tbody>
                {EVENT_ROWS.map(ev => {
                  const authorityValue = authority(ev.name);
                  const sign = signOf(ev.name);
                  return (
                    <tr key={ev.name} className="border-b border-[#F3EFEA]/50">
                      <td className="py-2 pr-4 font-medium">{ev.label}</td>
                      <td className="py-2 pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${EVENT_CLASS_COLORS[ev.classLabel]}`}>
                          {ev.classLabel.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-2 pr-4">{authorityBar(authorityValue)}</td>
                      <td className="py-2">
                        <span className={`font-bold ${sign > 0 ? 'text-green-600' : sign < 0 ? 'text-red-600' : 'text-[#8C7E6E]'}`}>
                          {sign > 0 ? '+' : sign < 0 ? '-' : '0'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Dual Memory Half-Lives</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-700">Fast Memory</p>
              <p className="text-xl font-bold text-blue-900">{Math.round(FAST_HALFLIFE_MS / 86_400_000)} days</p>
              <p className="text-[10px] text-blue-700 italic">Captures mood and recent activity</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-purple-700">Slow Memory</p>
              <p className="text-xl font-bold text-purple-900">{Math.round(SLOW_HALFLIFE_MS / 86_400_000)} days</p>
              <p className="text-[10px] text-purple-700 italic">Captures durable preferences</p>
            </div>
          </div>
          <p className="text-xs text-[#6B5E52] italic">
            Slow memory integrates at 40% the rate of fast memory. Both decay continuously via exponential decay.
          </p>
        </section>

        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Privacy Rules</h2>
          {[
            { ok: false, text: 'Message content captured in taste profile' },
            { ok: false, text: 'Photo metadata or exact location as taste signals' },
            { ok: false, text: 'Protected traits as taste features' },
            { ok: true,  text: 'Explicit signals always outrank implicit' },
            { ok: true,  text: 'Taste reset clears vectors but preserves safety records' },
            { ok: true,  text: 'Owner-visible summaries only - raw weights never shown' },
          ].map((item, i) => (
            <div key={i} className={`flex items-start gap-2 p-3 rounded-xl text-xs border ${item.ok ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
              {item.ok ? <Check size={12} className="mt-0.5 shrink-0 text-green-600" /> : <X size={12} className="mt-0.5 shrink-0 text-red-600" />}
              <span className={item.ok ? 'text-green-800' : 'text-red-800 line-through'}>{item.text}</span>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};
