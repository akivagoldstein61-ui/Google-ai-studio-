import React, { useState } from 'react';
import { ChevronLeft, Heart, Check, X, AlertTriangle, Beaker, Sparkles, Loader2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { aiService } from '@/services/aiService';

const sharedInputsFrom = (p: any) => ({
  values: [],
  intent: p?.intent,
  observance: p?.observance,
  lifestyle: Array.isArray(p?.tags) ? p.tags.slice(0, 4) : [],
  interests: Array.isArray(p?.tags) ? p.tags.slice(0, 6) : [],
  prompts: Array.isArray(p?.prompts) ? p.prompts.slice(0, 3).map((x: any) => ({ question: x?.question, answer: x?.answer })) : [],
});

/**
 * LIVE: mutual-consent compatibility reflection. The server rejects (403) unless
 * mutualConsent && bothOptedIn are both true, and never returns a score.
 */
const LiveCompatibility: React.FC = () => {
  const { user, dailyPicks, trackEvent } = useApp();
  const candidate = dailyPicks?.[0];
  const [agreed, setAgreed] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    if (!user || !candidate) return;
    setLoading(true);
    setError(null);
    trackEvent?.('skill_consent_accepted', { skillId: 'compatibility-reflection' });
    try {
      const r = await aiService.getCompatibilityReflection(sharedInputsFrom(candidate), {
        mutualConsent: true,
        bothOptedIn: true,
      });
      if (!r) {
        setError('Reflection unavailable right now. We never invent a compatibility report.');
      } else {
        setReport(r);
        trackEvent?.('skill_completed', { skillId: 'compatibility-reflection' });
      }
    } catch {
      setError('Reflection unavailable right now.');
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
          <span className="text-[10px] font-bold uppercase tracking-widest">Live reflection — not a score</span>
        </div>

        {!user ? (
          <p className="text-sm text-white/70 italic">Sign in to try a mutual-consent reflection.</p>
        ) : !candidate ? (
          <p className="text-sm text-white/70 italic">Load your Daily Picks first to reflect with a real candidate.</p>
        ) : report ? (
          <div className="space-y-4" dir="rtl">
            {report.shared_strengths_he?.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Shared strengths</p>
                <ul className="space-y-1">{report.shared_strengths_he.map((s: string, i: number) => <li key={i} className="text-sm text-white/90 italic font-serif">• {s}</li>)}</ul>
              </div>
            )}
            {report.friction_loops?.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-white/10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Friction loops</p>
                {report.friction_loops.map((f: any, i: number) => (
                  <div key={i} className="text-sm text-white/90 italic font-serif"><p>• {f.dynamic_he}</p><p className="text-xs text-white/65 pr-4">↳ {f.advice_he}</p></div>
                ))}
              </div>
            )}
            {report.question_to_explore_he && <div className="pt-2 border-t border-white/10"><p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Question to explore</p><p className="text-sm text-[#D4AF37] italic font-serif">"{report.question_to_explore_he}"</p></div>}
            {report.micro_habit_he && <div className="pt-2 border-t border-white/10"><p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Micro-habit</p><p className="text-sm text-white/90 italic">{report.micro_habit_he}</p></div>}
            {report.gentle_boundary_he && <div className="pt-2 border-t border-white/10"><p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Gentle boundary</p><p className="text-sm text-white/90 italic">{report.gentle_boundary_he}</p></div>}
            <p className="text-[9px] text-white/40 italic" dir="ltr">A reflection to talk better — never a percentage, ranking, or verdict.</p>
          </div>
        ) : loading ? (
          <div className="flex items-center gap-3 text-white/70"><Loader2 size={18} className="animate-spin text-[#D4AF37]" /><span className="text-sm italic">Generating a consent-safe reflection…</span></div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-white/70 italic leading-relaxed">
              Reflect with {candidate.displayName} on how you might communicate. Uses only mutually visible signals; the
              server refuses to run without explicit mutual consent.
            </p>
            <label className="flex items-start gap-2 text-xs text-white/80 cursor-pointer select-none">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 accent-[#D4AF37]" />
              <span>We both consent. I understand this is a reflection, not a prediction — no scores, no verdicts.</span>
            </label>
            <button onClick={run} disabled={!agreed} className="h-11 px-5 rounded-full bg-[#D4AF37] text-[#2D2926] hover:bg-[#B8962E] font-bold uppercase tracking-widest text-[10px] disabled:opacity-40">
              Generate reflection
            </button>
            {error && <p className="text-xs text-amber-200/90 italic">{error}</p>}
          </div>
        )}
      </div>
    </section>
  );
};

const LENSES = [
  {
    type: 'Values Alignment',
    example: 'You both seem to prioritize stability and long-term planning. This shared ground might make conversations about the future feel natural, though you may also want to explore where your visions differ.',
    signals: 'Explicit profile values + shared personality cards',
  },
  {
    type: 'Communication',
    example: 'Based on what you\'ve shared, one of you may prefer direct, energetic exchanges while the other tends toward thoughtful pauses. Neither style is better — noticing this early can help you find a rhythm.',
    signals: 'Extraversion/agreeableness aspects',
  },
  {
    type: 'Friction Forecast',
    example: 'Your shared summaries suggest different approaches to routine and spontaneity. This isn\'t a problem to solve — it\'s something to notice and talk about if it comes up.',
    signals: 'Conscientiousness/openness aspects',
  },
  {
    type: 'Growth Edge',
    example: 'Where one of you tends toward caution, the other leans into novelty. Pairs like this sometimes find they expand each other\'s comfort zones — or sometimes need to negotiate pace.',
    signals: 'Cross-domain pattern analysis',
  },
];

const ANTI_PATTERNS = [
  { pattern: '"Numeric fit claim"', reason: 'No scientific basis; creates false precision' },
  { pattern: '"Fated-pair claim"', reason: 'Certainty framing creates unhealthy expectations' },
  { pattern: '"You complete each other"', reason: 'Essentializing and deterministic' },
  { pattern: '"Based on science"', reason: 'Overclaims; FTC scrutiny risk' },
  { pattern: '"Better than your other matches"', reason: 'Comparative ranking without invariance' },
  { pattern: 'One-sided advice', reason: 'Creates power asymmetry; not evidence-based' },
];

export const CompatibilityReflectionSkill: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2D2926]">
      <header className="sticky top-0 z-10 bg-[#FDFCFB]/95 backdrop-blur-sm px-6 py-4 flex items-center gap-4 border-b border-[#F3EFEA]">
        <button onClick={onBack} className="p-2 hover:bg-[#F7F2EE] rounded-full transition-all">
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center border border-rose-200">
            <Heart size={16} />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-lg font-serif italic">Compatibility Reflection</h1>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#8C7E6E]">Bilateral Personality Insights</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* LIVE: mutual-consent reflection */}
        <LiveCompatibility />

        {/* Core Constraints */}
        <section className="p-6 bg-rose-50 rounded-[24px] border border-rose-100 space-y-4">
          <div className="flex items-center gap-2 text-rose-700">
            <AlertTriangle size={18} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Core Constraints</span>
          </div>
          <p className="text-xs text-rose-800 leading-relaxed">
            This is the highest-sensitivity feature in Kesher's personality stack. The scientific evidence does NOT support
            deterministic fit scoring. Personality similarity shows mixed or negligible incremental validity for relationship satisfaction.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <h4 className="text-[9px] font-bold uppercase tracking-widest text-green-700">What it IS:</h4>
              {['A conversation starter', 'Uncertainty-aware and exploratory', 'Equally visible to both parties', 'Reflection on potential dynamics'].map(item => (
                <div key={item} className="flex items-start gap-1 text-xs text-green-700">
                  <Check size={12} className="mt-0.5 shrink-0" /><span>{item}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <h4 className="text-[9px] font-bold uppercase tracking-widest text-red-700">What it is NOT:</h4>
              {['A numeric fit rating', 'A prediction of success', 'A recommendation to pursue/avoid', 'A deterministic type match'].map(item => (
                <div key={item} className="flex items-start gap-1 text-xs text-red-700">
                  <X size={12} className="mt-0.5 shrink-0" /><span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Reflection Lenses */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Reflection Lenses</h2>
          <p className="text-xs text-[#6B5E52] italic">Maximum 3 lenses shown per pair. No refresh without card change.</p>
          <div className="space-y-4">
            {LENSES.map(lens => (
              <div key={lens.type} className="p-4 bg-[#F7F2EE] rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold">{lens.type} Lens</h3>
                  <span className="text-[9px] text-[#8C7E6E]">{lens.signals}</span>
                </div>
                <p className="text-xs italic text-[#6B5E52] leading-relaxed">"{lens.example}"</p>
              </div>
            ))}
          </div>
        </section>

        {/* Demo Display */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Display Demo</h2>
          <div className="p-5 bg-[#F7F2EE] rounded-2xl space-y-4">
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#8C7E6E]">Based on what you've both shared</p>
            <div className="space-y-3">
              <div className="p-3 bg-white rounded-xl border border-[#F3EFEA] text-xs">
                <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[9px] font-bold rounded-full border border-rose-200 mr-2">Values</span>
                You both seem to prioritize stability and long-term planning.
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#F3EFEA] text-xs">
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-bold rounded-full border border-blue-200 mr-2">Communication</span>
                One of you may prefer direct exchanges while the other tends toward thoughtful pauses.
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#F3EFEA] text-xs">
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-bold rounded-full border border-amber-200 mr-2">Growth</span>
                Your different approaches to novelty might expand each other's comfort zones.
              </div>
            </div>
            <p className="text-[9px] text-[#8C7E6E] italic border-t border-[#E5E0DB] pt-3">
              This is a reflection, not a prediction. Either person can remove this reflection at any time.
            </p>
          </div>
        </section>

        {/* Anti-Patterns */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Prohibited Anti-Patterns</h2>
          <div className="space-y-2">
            {ANTI_PATTERNS.map(item => (
              <div key={item.pattern} className="flex items-start gap-3 p-3 bg-red-50 rounded-xl text-xs border border-red-100">
                <X size={14} className="mt-0.5 shrink-0 text-red-600" />
                <div>
                  <span className="font-bold text-red-800 line-through">{item.pattern}</span>
                  <p className="text-red-700 mt-0.5">{item.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Verification Experiments */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Required Verification Experiments</h2>
          <div className="space-y-3">
            {[
              { name: 'Explanation Trust', desc: 'Reflection must not decrease trust vs. no-reflection control' },
              { name: 'Creepiness Check', desc: 'Creepiness must not exceed control by >0.5 SD' },
              { name: 'Barnum Effect', desc: 'Real reflection must be rated more accurate than generic' },
              { name: 'Harm Check', desc: 'No harm measure (shame, fatalism, feeling judged) exceeds control by >0.3 SD' },
            ].map((exp, i) => (
              <div key={exp.name} className="flex items-start gap-3 p-3 bg-[#F7F2EE] rounded-xl text-xs">
                <Beaker size={14} className="mt-0.5 shrink-0 text-rose-600" />
                <div>
                  <span className="font-bold">{exp.name}</span>
                  <p className="text-[#6B5E52] mt-0.5">{exp.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Revocation */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Revocation Behavior</h2>
          <div className="space-y-2">
            {[
              { action: 'Either user revokes mutual consent', effect: 'Reflection disappears for both' },
              { action: 'Either user revokes shared card', effect: 'Reflection invalidated, removed for both' },
              { action: 'Either user resets assessment', effect: 'All mutual reflections removed' },
              { action: 'Either user blocks the other', effect: 'Reflection deleted permanently' },
            ].map(item => (
              <div key={item.action} className="flex items-center justify-between p-3 bg-[#F7F2EE] rounded-xl text-xs">
                <span className="font-medium">{item.action}</span>
                <span className="text-red-600 text-[10px] font-bold">{item.effect}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
