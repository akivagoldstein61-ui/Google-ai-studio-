import React, { useState } from 'react';
import { ChevronLeft, Fingerprint, Check, X, ToggleLeft, ToggleRight, RotateCcw, AlertTriangle, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/context/AppContext';
import { aiService } from '@/services/aiService';

const SAMPLE_TASTE_PROFILE = [
  { signal: 'Serious relationship intent', source: 'explicit', direction: 'toward' },
  { signal: 'Traditional observance', source: 'explicit', direction: 'toward' },
  { signal: 'Long-distance', source: 'explicit', direction: 'away' },
  { signal: 'Intellectually curious profiles', source: 'implicit', direction: 'toward' },
  { signal: 'Profiles mentioning family', source: 'implicit', direction: 'toward' },
];

const EVENT_TYPES = [
  { event: 'Like / Match', authority: 'High explicit', signal: '✓' },
  { event: '"More like this"', authority: 'Highest explicit', signal: '✓' },
  { event: '"Less like this"', authority: 'Highest explicit', signal: '✓' },
  { event: 'Profile open after a visible profile tap', authority: 'Medium implicit', signal: '✓' },
  { event: 'Pass', authority: 'Low implicit', signal: '✓' },
  { event: 'Impression only (no action)', authority: 'Not a dislike', signal: '—' },
];

const EXCLUDED_INPUTS = [
  'Private conversations',
  'Assessment answer text',
  'GPS-level location',
  'Sensitive trait guesses',
  'Ranking internals',
];

const EXPLANATION_RULES = [
  { rule: 'Never say "your private taste prefers X about this person"', correct: 'Say "based on what is visible on their profile"' },
  { rule: 'Never expose internal model values in UI', correct: 'Show only editable category-level summaries' },
  { rule: 'Never infer or display sensitive trait preferences', correct: 'Keep sensitive-trait fields out of taste learning entirely' },
  { rule: 'Never show other users any taste data', correct: 'Taste is strictly owner-only, never surfaced to others' },
];

const Chips: React.FC<{ label: string; items?: string[]; tone: 'toward' | 'away' }> = ({ label, items, tone }) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="space-y-1.5">
      <p className="text-[9px] font-bold uppercase tracking-widest text-[#8C7E6E]">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((it) => (
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
        ))}
      </div>
    </div>
  );
};

/**
 * LIVE taste model — only after explicit consent. Builds the owner-only taste
 * profile from the user's REAL interaction signals via /api/ai/taste-profile.
 * Honors this skill's own contract: category-level summaries only, no raw
 * model internals exposed, never any sensitive-trait fields.
 */
const LiveTasteModel: React.FC<{ enabled: boolean }> = ({ enabled }) => {
  const { user, interactions, tasteProfile, resetTasteProfile, trackEvent } = useApp();
  const [model, setModel] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [attempted, setAttempted] = useState(false);

  const counts = {
    likes: interactions?.likes?.length ?? 0,
    passes: interactions?.passes?.length ?? 0,
    more: interactions?.moreLikeThis?.length ?? 0,
    less: interactions?.lessLikeThis?.length ?? 0,
  };
  const signalCount = counts.likes + counts.passes + counts.more + counts.less;

  const build = async () => {
    setLoading(true);
    setAttempted(true);
    try {
      const result = await aiService.analyzeTasteProfile(interactions, tasteProfile);
      setModel(result);
      trackEvent?.('skill_taste_model_built', { hasResult: !!result, signalCount });
    } catch {
      setModel(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    resetTasteProfile?.();
    setModel(null);
    setAttempted(false);
  };

  if (!enabled) {
    return (
      <section className="bg-white border border-dashed border-[#E5E0DB] rounded-[24px] p-6">
        <div className="flex items-center gap-2 text-[#8C7E6E]">
          <Sparkles size={16} />
          <p className="text-xs italic">Enable personalization above to build and view your live taste model.</p>
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

            {signalCount === 0 ? (
              <p className="text-sm text-white/70 italic leading-relaxed">
                Like or pass on a few profiles in Daily Picks first — then build your model from those signals.
                Private conversations, precise location, and sensitive-trait guesses are never used.
              </p>
            ) : loading ? (
              <div className="flex items-center gap-3 text-white/70">
                <Loader2 size={18} className="animate-spin text-[#D4AF37]" />
                <span className="text-sm italic">Learning from your signals…</span>
              </div>
            ) : model ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                  <Chips label="Dealbreakers" items={model.hard_dealbreakers} tone="away" />
                  <Chips label="Leans toward" items={model.soft_preferences} tone="toward" />
                  <Chips label="Leans away" items={model.things_to_avoid} tone="away" />
                </div>
                {model.explanation && (
                  <p className="text-sm text-white/85 leading-relaxed italic font-serif">{model.explanation}</p>
                )}
                <p className="text-[9px] text-white/40 italic">
                  Category-level summary only — internal scoring values are never shown, and this is visible to you alone.
                </p>
                <div className="flex gap-2">
                  <Button onClick={build} variant="outline" className="h-9 rounded-full border-white/20 text-white hover:bg-white/10 text-[10px] font-bold uppercase tracking-widest px-4">
                    Rebuild
                  </Button>
                  <Button onClick={handleReset} variant="ghost" className="h-9 rounded-full text-white/70 hover:bg-white/10 text-[10px] font-bold uppercase tracking-widest px-4 gap-1.5">
                    <RotateCcw size={12} /> Reset
                  </Button>
                </div>
              </div>
            ) : attempted ? (
              <div className="space-y-3">
                <p className="text-sm text-amber-200/90 italic">Model unavailable right now — we never invent preferences. Try again.</p>
                <Button onClick={build} variant="outline" className="h-9 rounded-full border-white/20 text-white hover:bg-white/10 text-[10px] font-bold uppercase tracking-widest px-4">Try again</Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-white/70 italic leading-relaxed">
                  Build your owner-only taste model from your {signalCount} captured signal{signalCount === 1 ? '' : 's'}.
                </p>
                <Button onClick={build} className="h-11 rounded-full bg-[#D4AF37] text-[#2D2926] hover:bg-[#B8962E] font-bold uppercase tracking-widest text-[10px] px-5">
                  Build my taste model
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export const PrivateTasteSkill: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [tasteEnabled, setTasteEnabled] = useState(false);
  const [showConsentGate, setShowConsentGate] = useState(false);

  const handleToggle = () => {
    if (!tasteEnabled) {
      setShowConsentGate(true);
    } else {
      setTasteEnabled(false);
    }
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
        {/* Consent Gate */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Personalization</h2>
              <p className="text-xs text-[#6B5E52] mt-1 italic">Off by default. Requires explicit consent to activate.</p>
            </div>
            <button
              onClick={handleToggle}
              aria-label={tasteEnabled ? 'Disable private taste personalization' : 'Open private taste consent gate'}
              className="transition-all"
            >
              {tasteEnabled
                ? <ToggleRight size={36} className="text-purple-600" />
                : <ToggleLeft size={36} className="text-[#C5B8AE]" />
              }
            </button>
          </div>

          {tasteEnabled && (
            <div className="p-3 bg-purple-50 rounded-xl text-xs text-purple-800 border border-purple-100">
              <span className="font-bold">Active</span> — Kesher is learning your preferences. This is private and only visible to you.
              <button
                onClick={() => setTasteEnabled(false)}
                className="ml-2 underline underline-offset-2"
              >
                Disable
              </button>
            </div>
          )}

          {/* Consent Gate Modal */}
          {showConsentGate && (
            <div className="p-5 bg-[#F7F2EE] rounded-2xl border border-[#E5E0DB] space-y-4">
              <h3 className="font-bold text-sm">Enable Personalization?</h3>
              <div className="text-xs space-y-2 text-[#2D2926]">
                <p>Kesher will learn from how you interact with profiles (likes, passes, dwell time) to improve your Daily Picks.</p>
                <p className="font-medium">What we <span className="text-green-700">do</span> use:</p>
                <ul className="space-y-1 pl-4 text-[#6B5E52]">
                  <li>• Your swipes and likes</li>
                  <li>• Explicit controls (more/less like this)</li>
                  <li>• Coarse session patterns</li>
                </ul>
                <p className="font-medium mt-2">What we <span className="text-red-700">never</span> use:</p>
                <ul className="space-y-1 pl-4 text-[#6B5E52]">
                  {EXCLUDED_INPUTS.map((input) => (
                    <li key={input}>• {input}</li>
                  ))}
                </ul>
                <p className="text-[#8C7E6E] italic">This is private. Other users never see your taste profile.</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="rounded-full bg-[#2D2926] text-white text-[10px] uppercase tracking-widest"
                  onClick={() => { setTasteEnabled(true); setShowConsentGate(false); }}
                >
                  Enable Personalization
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-[10px] uppercase tracking-widest"
                  onClick={() => setShowConsentGate(false)}
                >
                  Not Now
                </Button>
              </div>
            </div>
          )}
        </section>

        {/* LIVE: your real taste model */}
        <LiveTasteModel enabled={tasteEnabled} />

        {/* Sample Profile (owner view) */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Sample Taste Profile (Owner View Only)</h2>
          <p className="text-xs text-[#6B5E52] italic">Categories only — internal model values stay hidden from the UI.</p>
          <div className="space-y-2">
            {SAMPLE_TASTE_PROFILE.map(item => (
              <div key={item.signal} className="flex items-center justify-between p-3 bg-[#F7F2EE] rounded-xl text-xs">
                <div>
                  <span className="font-medium">{item.signal}</span>
                  <span className={`ml-2 px-2 py-0.5 text-[9px] font-bold rounded-full ${
                    item.source === 'explicit'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {item.source}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-bold ${
                    item.direction === 'toward' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {item.direction === 'toward' ? '▲ toward' : '▼ away'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowConsentGate(true)}
              className="rounded-full text-[10px] uppercase tracking-widest bg-[#F7F2EE] flex items-center gap-1"
            >
              <RotateCcw size={10} /> Reset Owner Taste
            </Button>
          </div>
        </section>

        {/* Event Taxonomy */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Event Signal Table</h2>
          <p className="text-xs text-[#6B5E52] italic">Explicit controls always outrank implicit signals. Missing impressions are never negative signals.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#F3EFEA]">
                  <th className="text-left py-2 pr-3 font-bold">Event</th>
                  <th className="text-left py-2 pr-3 font-bold">Authority</th>
                  <th className="text-left py-2 font-bold">Used</th>
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
                      <span className={row.signal === '✗' ? 'text-red-600 font-bold' : row.signal === '—' ? 'text-[#8C7E6E]' : 'text-green-600 font-bold'}>
                        {row.signal}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Explanation Boundary Rules */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-600" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Explanation Boundary Rules</h2>
          </div>
          <p className="text-xs text-[#6B5E52] italic">
            The taste system influences ranking. The explanation layer MUST NOT reveal how.
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

        {/* Reset Semantics */}
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
        </section>
      </main>
    </div>
  );
};
