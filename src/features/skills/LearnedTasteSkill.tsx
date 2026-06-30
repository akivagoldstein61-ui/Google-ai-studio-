import React, { useState } from 'react';
import { ChevronLeft, Activity, Check, X, Info, RotateCcw, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/context/AppContext';
import { aiService } from '@/services/aiService';
import {
  authority,
  signOf,
  applyEvent,
  implicitAffinity,
  emptyTasteState,
  FAST_HALFLIFE_MS,
  SLOW_HALFLIFE_MS,
  type EventName,
  type TasteState,
} from '@/lib/learnedTaste';
import { cloneTasteState } from '@/lib/tastePersistence';
import type { TasteProfileDraft } from '@/types';

const EVENT_CLASS_COLORS: Record<string, string> = {
  policy_consent: 'bg-slate-50 text-slate-700 border-slate-200',
  explicit_preference: 'bg-green-50 text-green-700 border-green-200',
  high_signal_implicit: 'bg-blue-50 text-blue-700 border-blue-200',
  context: 'bg-gray-50 text-gray-700 border-gray-200',
};

type DemoEventRow = { name: EventName; label: string; classLabel: string };
const DEMO_EVENTS: DemoEventRow[] = [
  { name: 'more_like_this', label: 'More like this', classLabel: 'explicit_preference' },
  { name: 'like', label: 'Like', classLabel: 'explicit_preference' },
  { name: 'reply_received', label: 'Reply received', classLabel: 'explicit_preference' },
  { name: 'long_dwell', label: 'Long dwell (8 s)', classLabel: 'high_signal_implicit' },
  { name: 'profile_open', label: 'Profile open', classLabel: 'high_signal_implicit' },
  { name: 'pass', label: 'Pass', classLabel: 'explicit_preference' },
  { name: 'less_like_this', label: 'Less like this', classLabel: 'explicit_preference' },
  { name: 'block', label: 'Block', classLabel: 'explicit_preference' },
];

const CANDIDATE_FEATURES = ['intent_serious', 'observance_dati', 'tag_travel', 'tag_music'];

type TasteListKey = 'soft_preferences' | 'things_to_avoid' | 'hard_dealbreakers';

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

/**
 * LIVE: grounds the learning model in the user's real captured signals and
 * persists recomputed category summaries to the owner-only taste profile.
 */
const LiveLearnedSignals: React.FC = () => {
  const { user, interactions, tasteProfile, setTasteProfile, trackEvent } = useApp();
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
          </>
        )}
      </div>
    </section>
  );
};

export const LearnedTasteSkill: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [tasteState, setTasteState] = useState<TasteState>(emptyTasteState(Date.now()));
  const [log, setLog] = useState<string[]>([]);

  const fireEvent = (ev: DemoEventRow) => {
    const next = cloneTasteState(tasteState);
    applyEvent(next, {
      name: ev.name,
      class: ev.classLabel as any,
      candidateFeatures: CANDIDATE_FEATURES,
      value: ev.name === 'long_dwell' ? 8000 : undefined,
      occurredAt: Date.now(),
    });
    setTasteState(next);
    const sign = signOf(ev.name);
    const authorityValue = authority(ev.name);
    setLog(prev => [`${ev.label} (auth=${authorityValue.toFixed(2)}, sign=${sign > 0 ? '+' : sign < 0 ? '-' : '0'})`, ...prev.slice(0, 9)]);
  };

  const reset = () => {
    setTasteState(emptyTasteState(Date.now()));
    setLog([]);
  };

  const affinity = implicitAffinity(tasteState, CANDIDATE_FEATURES);

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
                {DEMO_EVENTS.map(ev => {
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
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Taste State Sandbox</h2>
            <Button variant="ghost" size="sm" onClick={reset} className="text-[10px] uppercase tracking-widest flex items-center gap-1">
              <RotateCcw size={12} /> Reset
            </Button>
          </div>
          <p className="text-xs text-[#6B5E52] italic">
            This sandbox is isolated from your saved profile and exists only to show the update math on demo features: <code className="font-mono text-[9px]">{CANDIDATE_FEATURES.join(', ')}</code>
          </p>
          <div className="flex flex-wrap gap-2">
            {DEMO_EVENTS.map(ev => (
              <button
                key={ev.name}
                onClick={() => fireEvent(ev)}
                className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full border border-[#F3EFEA] bg-[#F7F2EE] hover:border-green-300 hover:bg-green-50 transition-all"
              >
                {ev.label}
              </button>
            ))}
          </div>

          <div className="p-4 bg-[#F7F2EE] rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold">Implicit affinity (70% fast + 30% slow)</span>
              <span className={`font-mono font-bold ${affinity > 0.1 ? 'text-green-700' : affinity < -0.1 ? 'text-red-700' : 'text-[#8C7E6E]'}`}>
                {affinity.toFixed(3)}
              </span>
            </div>
            <div className="h-2 bg-[#E5E0DB] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${affinity >= 0 ? 'bg-green-400' : 'bg-red-400'}`}
                style={{ width: `${Math.abs(affinity) * 100}%`, marginLeft: affinity >= 0 ? '50%' : `${50 - Math.abs(affinity) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-[#8C7E6E]">
              <span>Away -1</span>
              <span>Neutral 0</span>
              <span>Toward +1</span>
            </div>
          </div>

          {log.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">Event log</p>
              {log.map((entry, i) => (
                <div key={i} className="text-[10px] font-mono text-[#6B5E52] p-2 bg-[#F7F2EE] rounded-lg">
                  {entry}
                </div>
              ))}
            </div>
          )}
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
