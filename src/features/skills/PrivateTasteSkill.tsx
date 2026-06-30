import React, { useMemo, useState } from 'react';
import { ChevronLeft, Fingerprint, Check, X, ToggleLeft, ToggleRight, RotateCcw, AlertTriangle, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/context/AppContext';
import { aiService } from '@/services/aiService';
import type { TasteProfileDraft } from '@/types';

type TasteListKey = 'soft_preferences' | 'things_to_avoid' | 'hard_dealbreakers';

const EVENT_TYPES = [
  { event: 'Like / Match', authority: 'High explicit', signal: 'Used' },
  { event: 'More like this', authority: 'Highest explicit', signal: 'Used' },
  { event: 'Less like this', authority: 'Highest explicit', signal: 'Used' },
  { event: 'Profile open after tap', authority: 'Medium implicit', signal: 'Used' },
  { event: 'Pass', authority: 'Explicit away signal', signal: 'Used' },
  { event: 'Impression only', authority: 'Not a dislike', signal: 'Ignored' },
];

const EXCLUDED_INPUTS = [
  'Private conversations',
  'Assessment answer text',
  'GPS-level location',
  'Sensitive trait guesses',
  'Ranking internals',
];

const EXPLANATION_RULES = [
  { rule: 'Never say your private taste prefers something about this person.', correct: 'Say based on what is visible on their profile.' },
  { rule: 'Never expose internal model values in UI.', correct: 'Show only editable category-level summaries.' },
  { rule: 'Never infer or display sensitive trait preferences.', correct: 'Keep sensitive-trait fields out of taste learning entirely.' },
  { rule: 'Never show other users any taste data.', correct: 'Taste is strictly owner-only.' },
];

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

const Chips: React.FC<{ label: string; items?: string[]; tone: 'toward' | 'away' }> = ({ label, items, tone }) => {
  return (
    <div className="space-y-1.5">
      <p className="text-[9px] font-bold uppercase tracking-widest text-[#8C7E6E]">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items && items.length > 0 ? items.map((it) => (
          <span
            key={it}
            className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${
              tone === 'away'
                ? 'bg-red-50 text-red-700 border-red-100'
                : 'bg-green-50 text-green-700 border-green-100'
            }`}
          >
            {it}
          </span>
        )) : <span className="text-xs text-[#8C7E6E] italic">None yet</span>}
      </div>
    </div>
  );
};

const SignalPills: React.FC<{ counts: Record<string, number> }> = ({ counts }) => (
  <div className="flex flex-wrap gap-2">
    {[
      { k: 'Likes', v: counts.likes },
      { k: 'Passes', v: counts.passes },
      { k: 'More-like-this', v: counts.more },
      { k: 'Less-like-this', v: counts.less },
    ].map((s) => (
      <span key={s.k} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-white/70">
        {s.k}: <span className="text-[#D4AF37]">{s.v}</span>
      </span>
    ))}
  </div>
);

const LiveTasteModel: React.FC<{ enabled: boolean }> = ({ enabled }) => {
  const { user, interactions, tasteProfile, setTasteProfile, resetTasteProfile, trackEvent } = useApp();
  const [loading, setLoading] = useState(false);
  const [attempted, setAttempted] = useState(false);

  const counts = {
    likes: interactions?.likes?.length ?? 0,
    passes: interactions?.passes?.length ?? 0,
    more: interactions?.moreLikeThis?.length ?? 0,
    less: interactions?.lessLikeThis?.length ?? 0,
  };
  const signalCount = counts.likes + counts.passes + counts.more + counts.less;
  const hasProfile = tasteProfile.hard_dealbreakers.length > 0 ||
    tasteProfile.soft_preferences.length > 0 ||
    tasteProfile.things_to_avoid.length > 0 ||
    tasteProfile.explanation.length > 0;

  const build = async () => {
    setLoading(true);
    setAttempted(true);
    try {
      const result = await aiService.analyzeTasteProfile(interactions, tasteProfile);
      if (result) {
        const mergedProfile = mergeManualControls(result, {
          ...tasteProfile,
          learning: {
            ...tasteProfile.learning,
            paused: false,
            optedOut: false,
            lastUpdatedAt: new Date().toISOString(),
          },
        });
        setTasteProfile(mergedProfile);
        trackEvent?.('skill_taste_model_built', { hasResult: true, signalCount, persisted: true });
      } else {
        trackEvent?.('skill_taste_model_built', { hasResult: false, signalCount, persisted: false });
      }
    } catch {
      trackEvent?.('skill_taste_model_built', { hasResult: false, signalCount, persisted: false });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    resetTasteProfile?.();
    setAttempted(false);
  };

  if (!enabled) {
    return (
      <section className="bg-white border border-dashed border-[#E5E0DB] rounded-[24px] p-6">
        <div className="flex items-center gap-2 text-[#8C7E6E]">
          <Sparkles size={16} />
          <p className="text-xs italic">Enable personalization above to build, persist, and edit your private taste model.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="p-6 bg-[#2D2926] rounded-[28px] text-white space-y-4 relative overflow-hidden">
      <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-[#D4AF37]/10 blur-3xl" />
      <div className="relative z-10 space-y-4">
        <div className="flex items-center gap-2 text-[#D4AF37]">
          <Sparkles size={16} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Your live taste model</span>
        </div>

        {!user ? (
          <p className="text-sm text-white/70 italic">Sign in to build your private taste model.</p>
        ) : (
          <>
            <SignalPills counts={counts} />

            {signalCount === 0 && !hasProfile ? (
              <p className="text-sm text-white/70 italic leading-relaxed">
                Like or pass on a few profiles first. Private conversations, precise location, and sensitive-trait guesses are never used.
              </p>
            ) : loading ? (
              <div className="flex items-center gap-3 text-white/70">
                <Loader2 size={18} className="animate-spin text-[#D4AF37]" />
                <span className="text-sm italic">Learning from your signals...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                  <Chips label="Dealbreakers" items={tasteProfile.hard_dealbreakers} tone="away" />
                  <Chips label="Leans toward" items={tasteProfile.soft_preferences} tone="toward" />
                  <Chips label="Leans away" items={tasteProfile.things_to_avoid} tone="away" />
                </div>
                {tasteProfile.explanation && (
                  <p className="text-sm text-white/85 leading-relaxed italic font-serif">{tasteProfile.explanation}</p>
                )}
                <p className="text-[9px] text-white/40 italic">
                  Category-level summary only. Internal scoring values are never shown, and this is visible to you alone.
                </p>
                <div className="flex gap-2">
                  <Button onClick={build} disabled={signalCount === 0} className="h-9 rounded-full bg-[#D4AF37] text-[#2D2926] hover:bg-[#B8962E] text-[10px] font-bold uppercase tracking-widest px-4 disabled:opacity-50">
                    {hasProfile ? 'Refresh and save' : 'Build and save'}
                  </Button>
                  <Button onClick={handleReset} variant="ghost" className="h-9 rounded-full text-white/70 hover:bg-white/10 text-[10px] font-bold uppercase tracking-widest px-4 gap-1.5">
                    <RotateCcw size={12} /> Reset
                  </Button>
                </div>
                {attempted && !hasProfile && signalCount > 0 && (
                  <p className="text-[10px] text-amber-200/90 italic">No model was saved. We never invent preferences when the service returns no result.</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export const PrivateTasteSkill: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { tasteProfile, pauseTasteLearning, optOutTasteLearning, trackEvent } = useApp();
  const [showConsentGate, setShowConsentGate] = useState(false);
  const [isSavingConsent, setIsSavingConsent] = useState(false);

  const tasteEnabled = !tasteProfile.learning.paused && !tasteProfile.learning.optedOut;
  const statusLabel = tasteProfile.learning.optedOut
    ? 'Opted out'
    : tasteEnabled
      ? 'Active'
      : 'Paused';
  const activeProfileCount = useMemo(() => (
    tasteProfile.hard_dealbreakers.length + tasteProfile.soft_preferences.length + tasteProfile.things_to_avoid.length
  ), [tasteProfile]);

  const enableTaste = async () => {
    setIsSavingConsent(true);
    try {
      await pauseTasteLearning(false);
      trackEvent?.('skill_taste_consent_changed', { enabled: true });
      setShowConsentGate(false);
    } finally {
      setIsSavingConsent(false);
    }
  };

  const disableTaste = async () => {
    setIsSavingConsent(true);
    try {
      await pauseTasteLearning(true);
      trackEvent?.('skill_taste_consent_changed', { enabled: false });
    } finally {
      setIsSavingConsent(false);
    }
  };

  const handleToggle = () => {
    if (tasteEnabled) {
      disableTaste();
      return;
    }
    setShowConsentGate(true);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2D2926]">
      <header className="sticky top-0 z-10 bg-[#FDFCFB]/95 backdrop-blur-sm px-6 py-4 flex items-center gap-4 border-b border-[#F3EFEA]">
        <button onClick={onBack} aria-label="Back to Skills Hub" className="p-2 hover:bg-[#F7F2EE] rounded-full transition-all">
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center border border-purple-200">
            <Fingerprint size={16} />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-lg font-serif italic">Private Taste</h1>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#8C7E6E]">Owner-Only Preference Learning</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Personalization</h2>
              <p className="text-xs text-[#6B5E52] mt-1 italic">Consent state is saved to your private profile and controls learning.</p>
            </div>
            <button
              onClick={handleToggle}
              disabled={isSavingConsent}
              aria-label={tasteEnabled ? 'Pause private taste personalization' : 'Open private taste consent gate'}
              className="transition-all disabled:opacity-60"
            >
              {tasteEnabled
                ? <ToggleRight size={36} className="text-purple-600" />
                : <ToggleLeft size={36} className="text-[#C5B8AE]" />
              }
            </button>
          </div>

          <div className={`p-3 rounded-xl text-xs border ${tasteEnabled ? 'bg-purple-50 text-purple-800 border-purple-100' : 'bg-[#F7F2EE] text-[#6B5E52] border-[#E5E0DB]'}`}>
            <span className="font-bold">{statusLabel}</span> - {tasteEnabled ? 'Kesher can learn from eligible profile interactions.' : 'Taste learning is not updating your model.'}
            {tasteEnabled && (
              <button onClick={disableTaste} className="ml-2 underline underline-offset-2" disabled={isSavingConsent}>
                Pause
              </button>
            )}
          </div>

          {showConsentGate && (
            <div className="p-5 bg-[#F7F2EE] rounded-2xl border border-[#E5E0DB] space-y-4">
              <h3 className="font-bold text-sm">Enable Personalization?</h3>
              <div className="text-xs space-y-2 text-[#2D2926]">
                <p>Kesher will learn from eligible profile interactions to improve Daily Picks and Explore ranking.</p>
                <p className="font-medium">Used signals:</p>
                <ul className="space-y-1 pl-4 text-[#6B5E52]">
                  <li>- Likes, passes, and matches</li>
                  <li>- Explicit more-like-this and less-like-this controls</li>
                  <li>- High-signal profile interactions such as opens or long dwell</li>
                </ul>
                <p className="font-medium mt-2">Never used:</p>
                <ul className="space-y-1 pl-4 text-[#6B5E52]">
                  {EXCLUDED_INPUTS.map((input) => (
                    <li key={input}>- {input}</li>
                  ))}
                </ul>
                <p className="text-[#8C7E6E] italic">This is private. Other users never see your taste profile.</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="rounded-full bg-[#2D2926] text-white text-[10px] uppercase tracking-widest"
                  onClick={enableTaste}
                  disabled={isSavingConsent}
                >
                  {isSavingConsent ? 'Saving...' : 'Enable Personalization'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-[10px] uppercase tracking-widest"
                  onClick={() => setShowConsentGate(false)}
                  disabled={isSavingConsent}
                >
                  Not Now
                </Button>
              </div>
            </div>
          )}
        </section>

        <LiveTasteModel enabled={tasteEnabled} />

        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Current Owner Profile</h2>
          <p className="text-xs text-[#6B5E52] italic">Persisted summary from your private profile. Manual edits and locks are respected when the model refreshes.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Chips label="Dealbreakers" items={tasteProfile.hard_dealbreakers} tone="away" />
            <Chips label="Leans toward" items={tasteProfile.soft_preferences} tone="toward" />
            <Chips label="Leans away" items={tasteProfile.things_to_avoid} tone="away" />
          </div>
          <div className="flex flex-wrap gap-2 pt-2 text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">
            <span>{activeProfileCount} saved categories</span>
            <span>{tasteProfile.lockedItems.length} locked</span>
            <span>{tasteProfile.removedItems.length} removed</span>
          </div>
        </section>

        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Event Signal Table</h2>
          <p className="text-xs text-[#6B5E52] italic">
            Explicit controls always outrank implicit signals. Seeing a profile and taking no action is not treated as dislike.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#F3EFEA]">
                  <th className="text-left py-2 pr-3 font-bold">Event</th>
                  <th className="text-left py-2 pr-3 font-bold">Authority</th>
                  <th className="text-left py-2 font-bold">Taste signal</th>
                </tr>
              </thead>
              <tbody>
                {EVENT_TYPES.map(row => (
                  <tr key={row.event} className="border-b border-[#F3EFEA]/50">
                    <td className="py-2 pr-3">{row.event}</td>
                    <td className="py-2 pr-3">
                      <span className="text-[9px] font-bold text-[#6B5E52]">{row.authority}</span>
                    </td>
                    <td className="py-2">
                      <span className={row.signal === 'Ignored' ? 'text-[#8C7E6E]' : 'text-green-600 font-bold'}>
                        {row.signal}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-600" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Explanation Boundary Rules</h2>
          </div>
          <p className="text-xs text-[#6B5E52] italic">
            The taste system influences ranking. The explanation layer must not reveal private taste mechanics.
          </p>
          <div className="space-y-3">
            {EXPLANATION_RULES.map((item, i) => (
              <div key={i} className="p-3 bg-[#F7F2EE] rounded-xl text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <X size={12} className="mt-0.5 shrink-0 text-red-600" />
                  <span className="text-red-700 line-through">{item.rule}</span>
                </div>
                <div className="flex items-start gap-2 pl-4">
                  <Check size={12} className="mt-0.5 shrink-0 text-green-600" />
                  <span className="text-green-700">{item.correct}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Taste Reset Semantics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-red-700 mb-2">Clears on reset</h3>
              {['Internal model state', 'Explicit anchors', 'Explanation history cache', 'On-device summaries'].map(s => (
                <div key={s} className="flex items-start gap-2 text-xs mb-1">
                  <RotateCcw size={12} className="mt-0.5 shrink-0 text-red-600" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-amber-700 mb-2">Preserved on reset</h3>
              {['Abuse reports', 'Safety retention records', 'Legal consent records', 'Block / report history'].map(s => (
                <div key={s} className="flex items-start gap-2 text-xs mb-1">
                  <Check size={12} className="mt-0.5 shrink-0 text-amber-600" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
          <Button
            onClick={optOutTasteLearning}
            variant="ghost"
            className="w-full h-11 rounded-full text-[#8C7E6E] hover:bg-[#F7F2EE] text-[10px] font-bold uppercase tracking-widest"
          >
            Opt Out of Taste Learning
          </Button>
        </section>
      </main>
    </div>
  );
};
