import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Loader2, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { aiService } from '@/services/aiService';
import { Profile } from '@/types';

interface Props {
  user: Profile;
  candidate: Profile;
  bothOptedIn: boolean;
}

export const CompatibilityReflectionPanel: React.FC<Props> = ({ user, candidate, bothOptedIn }) => {
  const [agreed, setAgreed] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReflect = async () => {
    setLoading(true);
    setError(null);
    try {
      const sharedInputs = {
        values: [],
        intent: candidate.intent,
        observance: candidate.observance,
        lifestyle: candidate.tags?.slice(0, 4) ?? [],
        interests: candidate.tags?.slice(0, 6) ?? [],
        prompts: (candidate.prompts ?? []).slice(0, 3).map((p) => ({
          question: p.question,
          answer: p.answer,
        })),
        approvedShareCard: undefined,
      };
      const result = await aiService.getCompatibilityReflection(sharedInputs, {
        mutualConsent: true,
        bothOptedIn,
      });
      if (!result) {
        setError('Reflection unavailable right now. We never invent compatibility.');
      } else {
        setReport(result);
      }
    } catch (e: any) {
      setError(e?.message ?? 'Reflection failed');
    } finally {
      setLoading(false);
    }
  };

  if (report) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[32px] space-y-5 text-left"
      >
        <div className="flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-widest text-[#D4AF37]">
          <Sparkles size={14} />
          <span>Reflection — not a score</span>
        </div>

        {report.shared_strengths_he?.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Shared strengths</p>
            <ul className="space-y-2">
              {report.shared_strengths_he.map((line: string, i: number) => (
                <li key={i} className="text-sm text-white/90 italic font-serif" dir="rtl">• {line}</li>
              ))}
            </ul>
          </div>
        )}

        {report.friction_loops?.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-white/10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Friction loops</p>
            <ul className="space-y-3">
              {report.friction_loops.map((loop: any, i: number) => (
                <li key={i} className="text-sm text-white/90 leading-relaxed italic font-serif space-y-1" dir="rtl">
                  <p>• {loop.dynamic_he}</p>
                  <p className="text-xs text-white/70 pr-4">↳ {loop.advice_he}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {report.question_to_explore_he && (
          <div className="space-y-1 pt-2 border-t border-white/10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Question to explore</p>
            <p className="text-sm text-[#D4AF37] italic font-serif" dir="rtl">"{report.question_to_explore_he}"</p>
          </div>
        )}

        {report.micro_habit_he && (
          <div className="space-y-1 pt-2 border-t border-white/10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Micro-habit</p>
            <p className="text-sm text-white/90 italic" dir="rtl">{report.micro_habit_he}</p>
          </div>
        )}

        {report.gentle_boundary_he && (
          <div className="space-y-1 pt-2 border-t border-white/10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Gentle boundary</p>
            <p className="text-sm text-white/90 italic" dir="rtl">{report.gentle_boundary_he}</p>
          </div>
        )}

        {report.signals_used?.length > 0 && (
          <div className="pt-2 border-t border-white/10 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Signals used</p>
            <div className="flex flex-wrap gap-2">
              {report.signals_used.map((s: string) => (
                <span
                  key={s}
                  className="px-2 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/25 text-[10px] font-bold text-[#D4AF37]"
                >
                  {s.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[32px] space-y-4 text-left">
      <div className="flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-widest text-[#D4AF37]">
        <ShieldCheck size={14} />
        <span>Reflect together — mutual consent</span>
      </div>
      <p className="text-sm text-white/80 leading-relaxed italic font-serif">
        We can generate a short, calm reflection on how you and {candidate.displayName} might communicate, including shared strengths and friction loops to discuss. We never produce a compatibility score, and the reflection only uses mutually visible signals.
      </p>
      {!bothOptedIn && (
        <p className="text-[11px] text-amber-300 italic">
          {candidate.displayName} hasn't opted in yet. Reflections only run when both of you have agreed.
        </p>
      )}
      <label className="flex items-start gap-3 text-xs text-white/80 leading-relaxed cursor-pointer select-none">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-1 accent-[#D4AF37]"
        />
        <span>
          I understand this is a reflection, not a prediction. Raw scores, private taste and private messages are not used.
        </span>
      </label>
      <Button
        onClick={handleReflect}
        disabled={!agreed || !bothOptedIn || loading}
        className="w-full h-12 rounded-full bg-[#D4AF37] text-[#2D2926] hover:bg-[#B8962E] font-bold uppercase tracking-widest text-xs disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="animate-spin" size={16} /> Generating reflection
          </span>
        ) : (
          'Generate reflection'
        )}
      </Button>
      {error && (
        <p className="text-xs text-red-300 italic text-center">{error}</p>
      )}
    </div>
  );
};
