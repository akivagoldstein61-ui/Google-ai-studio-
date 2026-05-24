import React, { useState } from 'react';
import { ChevronLeft, FileText, Check, X, AlertTriangle, Download, RotateCcw, Trash2, Sparkles, Loader2, Heart, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/context/AppContext';
import { aiService } from '@/services/aiService';

const DOMAIN_CARDS = [
  {
    domain: 'Extraversion',
    friendlyName: 'Social Energy',
    emoji: '⚡',
    sampleInsight: 'Your responses suggest you tend toward energetic social engagement. You may find group settings feel natural and stimulating.',
    watchout: 'You might occasionally need to pace yourself after intensive social periods.',
    color: 'bg-violet-50 border-violet-100 text-violet-800',
    badgeColor: 'bg-violet-100 text-violet-700',
  },
  {
    domain: 'Agreeableness',
    friendlyName: 'Warmth & Consideration',
    emoji: '🤝',
    sampleInsight: 'You tend to approach others with warmth and a genuine interest in their wellbeing.',
    watchout: 'You may at times prioritize others\' comfort at the expense of your own needs.',
    color: 'bg-pink-50 border-pink-100 text-pink-800',
    badgeColor: 'bg-pink-100 text-pink-700',
  },
  {
    domain: 'Conscientiousness',
    friendlyName: 'Planning & Follow-through',
    emoji: '📋',
    sampleInsight: 'You tend to approach tasks with structure and care about following through on commitments.',
    watchout: 'You might feel friction when plans change unexpectedly.',
    color: 'bg-blue-50 border-blue-100 text-blue-800',
    badgeColor: 'bg-blue-100 text-blue-700',
  },
  {
    domain: 'Neuroticism',
    friendlyName: 'Emotional Steadiness',
    emoji: '🌊',
    sampleInsight: 'Your responses suggest a capacity for steady emotional processing under most circumstances.',
    watchout: 'Like most people, there are conditions under which you may experience more emotional activation.',
    color: 'bg-cyan-50 border-cyan-100 text-cyan-800',
    badgeColor: 'bg-cyan-100 text-cyan-700',
  },
  {
    domain: 'Openness',
    friendlyName: 'Curiosity & Openness',
    emoji: '🔭',
    sampleInsight: 'You tend to engage with ideas, experiences, and perspectives with genuine curiosity.',
    watchout: 'You may sometimes find highly routine or predictable settings less stimulating.',
    color: 'bg-amber-50 border-amber-100 text-amber-800',
    badgeColor: 'bg-amber-100 text-amber-700',
  },
];

const FORBIDDEN_OUTPUTS = [
  { phrase: '"You are a classic introvert."', reason: 'Fixed identity label' },
  { phrase: '"This means you are compatible with…"', reason: 'Unsupported compatibility claim' },
  { phrase: '"You score 84% on Agreeableness."', reason: 'Raw score exposure (not normed)' },
  { phrase: '"Based on science, you should…"', reason: 'Overclaims scientific certainty' },
  { phrase: '"You have a mental health risk…"', reason: 'Clinical / diagnostic language' },
];

const ALLOWED_AI_INPUTS = [
  'Domain percentile bands (low / mid / high)',
  'Aspect highlights (top 2–3 aspects only)',
  'User locale (for Hebrew / English card generation)',
  'Explicit framing preference',
];

const FORBIDDEN_AI_INPUTS = [
  'Raw BFAS answer text',
  'Exact numeric scores',
  'Private messages or chat history',
  'Private taste internals',
  'Behavioral swipe patterns',
  'Photos or location data',
];

/**
 * LIVE interactive reflection — runs the real /api/ai/personality-profile route
 * against the signed-in user's deterministic BFAS scores and renders the warm,
 * Hebrew-first reflection. Falls back gracefully; never invents content.
 */
const LiveReflection: React.FC = () => {
  const { user, trackEvent } = useApp();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [attempted, setAttempted] = useState(false);

  const scores = user?.personalityScores ?? {};
  const hasScores = Object.keys(scores).length > 0;

  const generate = async () => {
    if (!user) return;
    setLoading(true);
    setAttempted(true);
    try {
      const result = await aiService.getPersonalityProfile(user);
      setProfile(result);
      trackEvent?.('skill_personality_profile_generated', { hasResult: !!result });
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="p-6 bg-[#2D2926] rounded-[28px] text-white space-y-4 relative overflow-hidden">
      <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-[#D4AF37]/10 blur-3xl" />
      <div className="relative z-10 space-y-4">
        <div className="flex items-center gap-2 text-[#D4AF37]">
          <Sparkles size={16} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Your live reflection</span>
        </div>

        {!user ? (
          <p className="text-sm text-white/70 italic leading-relaxed">
            Sign in to generate your private reflection. It is owner-only and never shown to other users.
          </p>
        ) : !hasScores ? (
          <p className="text-sm text-white/70 italic leading-relaxed">
            Take the optional personality assessment first — then this card turns your scores into a warm,
            private reflection. Your raw answers never leave your device's private store.
          </p>
        ) : !attempted ? (
          <div className="space-y-3">
            <p className="text-sm text-white/70 italic leading-relaxed">
              Generate a private reflection from your assessment. The AI receives only derived percentile bands —
              never raw answers or exact scores.
            </p>
            <Button
              onClick={generate}
              className="h-11 rounded-full bg-[#D4AF37] text-[#2D2926] hover:bg-[#B8962E] font-bold uppercase tracking-widest text-[10px] px-5"
            >
              Generate my reflection
            </Button>
          </div>
        ) : loading ? (
          <div className="flex items-center gap-3 text-white/70">
            <Loader2 size={18} className="animate-spin text-[#D4AF37]" />
            <span className="text-sm italic">Generating your private reflection…</span>
          </div>
        ) : profile ? (
          <div className="space-y-5" dir="rtl">
            {profile.summary_he && (
              <p className="text-sm text-white/90 leading-relaxed italic font-serif">{profile.summary_he}</p>
            )}
            {profile.implication_card && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" dir="rtl">
                {profile.implication_card.dating_superpower_he && (
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[#D4AF37]"><Heart size={13} /><span className="text-[9px] font-bold uppercase tracking-widest">כוח על</span></div>
                    <p className="text-xs text-white/85 leading-relaxed">{profile.implication_card.dating_superpower_he}</p>
                  </div>
                )}
                {profile.implication_card.growth_area_he && (
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-1.5">
                    <div className="flex items-center gap-1.5 text-amber-300"><ShieldAlert size={13} /><span className="text-[9px] font-bold uppercase tracking-widest">נקודת צמיחה</span></div>
                    <p className="text-xs text-white/85 leading-relaxed">{profile.implication_card.growth_area_he}</p>
                  </div>
                )}
              </div>
            )}
            {Array.isArray(profile.domains) && profile.domains.length > 0 && (
              <div className="space-y-2.5" dir="rtl">
                {profile.domains.map((d: any, i: number) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white/90">{d.domain_name}</span>
                      <span className="text-[10px] text-white/50 font-mono">{d.percentile}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden" dir="ltr">
                      <div className="h-full bg-[#D4AF37] rounded-full" style={{ width: `${Math.max(0, Math.min(100, d.percentile))}%` }} />
                    </div>
                    {d.description_he && <p className="text-[11px] text-white/60 leading-relaxed pt-0.5">{d.description_he}</p>}
                  </div>
                ))}
              </div>
            )}
            <p className="text-[9px] text-white/40 italic" dir="ltr">Private and editable. Reflects tendencies, not fixed traits.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-amber-200/90 italic leading-relaxed">
              Reflection unavailable right now (the AI service may be offline). We never invent a profile — please try again.
            </p>
            <Button
              onClick={generate}
              variant="outline"
              className="h-10 rounded-full border-white/20 text-white hover:bg-white/10 font-bold uppercase tracking-widest text-[10px] px-5"
            >
              Try again
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export const PersonalityProfileSkill: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [expandedCard, setExpandedCard] = useState<string | null>('Extraversion');

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2D2926]">
      <header className="sticky top-0 z-10 bg-[#FDFCFB]/95 backdrop-blur-sm px-6 py-4 flex items-center gap-4 border-b border-[#F3EFEA]">
        <button onClick={onBack} className="p-2 hover:bg-[#F7F2EE] rounded-full transition-all">
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center border border-teal-200">
            <FileText size={16} />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-lg font-serif italic">Personality Profile</h1>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#8C7E6E]">Private Reflection Cards</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* LIVE: your real reflection */}
        <LiveReflection />

        {/* Purpose */}
        <section className="p-6 bg-teal-50 rounded-[24px] border border-teal-100 space-y-3">
          <div className="flex items-center gap-2 text-teal-700">
            <FileText size={18} />
            <span className="text-[10px] font-bold uppercase tracking-widest">What this is</span>
          </div>
          <p className="text-xs text-teal-800 leading-relaxed">
            Translates deterministic BFAS domain and aspect scores into warm, private, user-visible reflection cards.
            The AI receives <strong>only derived percentile bands</strong> — never raw answers, exact scores, or private data.
          </p>
          <p className="text-[9px] text-teal-700 italic">
            Owner-only by default. Not shown to other users. Corrections, exports, and deletion available at all times.
          </p>
        </section>

        {/* Sample Reflection Cards */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Sample Domain Reflection Cards</h2>
          <p className="text-xs text-[#6B5E52] italic">Tap a card to expand. Generated in user's language via Gemini (server-side).</p>
          <div className="space-y-3">
            {DOMAIN_CARDS.map(card => (
              <button
                key={card.domain}
                onClick={() => setExpandedCard(expandedCard === card.domain ? null : card.domain)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${card.color}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{card.emoji}</span>
                    <div>
                      <span className="font-bold text-sm">{card.friendlyName}</span>
                      <span className={`ml-2 px-2 py-0.5 text-[9px] font-bold rounded-full ${card.badgeColor}`}>
                        {card.domain}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium opacity-60">{expandedCard === card.domain ? '▲' : '▼'}</span>
                </div>
                {expandedCard === card.domain && (
                  <div className="mt-3 space-y-2 text-xs">
                    <p className="italic leading-relaxed">{card.sampleInsight}</p>
                    <div className="pt-2 border-t border-current/10">
                      <span className="font-bold text-[10px] uppercase tracking-widest opacity-60">Watch-out: </span>
                      <span className="opacity-80">{card.watchout}</span>
                    </div>
                    <p className="text-[9px] opacity-50 pt-1">
                      This card is private and editable. It reflects tendencies, not fixed traits.
                    </p>
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* AI Input Contract */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">AI Input Contract</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-green-700">Allowed inputs</h3>
              {ALLOWED_AI_INPUTS.map(item => (
                <div key={item} className="flex items-start gap-2 p-2 bg-green-50 rounded-xl text-xs border border-green-100">
                  <Check size={12} className="mt-0.5 shrink-0 text-green-600" />
                  <span className="text-green-800">{item}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-red-700">Forbidden inputs</h3>
              {FORBIDDEN_AI_INPUTS.map(item => (
                <div key={item} className="flex items-start gap-2 p-2 bg-red-50 rounded-xl text-xs border border-red-100">
                  <X size={12} className="mt-0.5 shrink-0 text-red-600" />
                  <span className="text-red-800">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Forbidden Output Patterns */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-600" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Forbidden Output Patterns</h2>
          </div>
          <p className="text-xs text-[#6B5E52] italic">The validator rejects any card containing these phrases or structures.</p>
          <div className="space-y-2">
            {FORBIDDEN_OUTPUTS.map(item => (
              <div key={item.phrase} className="flex items-start gap-3 p-3 bg-red-50 rounded-xl text-xs border border-red-100">
                <X size={14} className="mt-0.5 shrink-0 text-red-600" />
                <div>
                  <span className="font-bold text-red-700 line-through">{item.phrase}</span>
                  <p className="text-red-600 mt-0.5">{item.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Data Controls */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">User Data Controls</h2>
          <p className="text-xs text-[#6B5E52] italic">Must be reachable from the personality profile screen at all times.</p>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-[#F7F2EE] rounded-full text-xs font-medium">
              <Download size={14} className="text-[#8C7E6E]" /> Export as JSON
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-[#F7F2EE] rounded-full text-xs font-medium">
              <RotateCcw size={14} className="text-[#8C7E6E]" /> Reset scores
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-full text-xs font-medium text-red-700">
              <Trash2 size={14} /> Delete all personality data
            </div>
          </div>
          <p className="text-[9px] text-[#8C7E6E] italic">
            Reset: clears answers, scores, and generated cards. Delete: removes all personality data subject to legal retention rules.
          </p>
        </section>

        {/* Rendering States */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Required Rendering States</h2>
          <div className="space-y-2">
            {[
              { state: 'No assessment', display: '"Take the optional personality assessment to see your reflection."' },
              { state: 'Scores loading', display: 'Skeleton cards — never show spinner for >3s without feedback' },
              { state: 'Gemini unavailable', display: 'Deterministic fallback card — no invented content' },
              { state: 'Quality check failed', display: '"Reflection unavailable — please re-take the assessment."' },
              { state: 'Cards available', display: 'Domain cards + aspect highlights + superpower + growth edge' },
            ].map(item => (
              <div key={item.state} className="flex items-start gap-3 p-3 bg-[#F7F2EE] rounded-xl text-xs">
                <span className="font-bold shrink-0 min-w-[100px]">{item.state}:</span>
                <span className="text-[#6B5E52] italic">{item.display}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
