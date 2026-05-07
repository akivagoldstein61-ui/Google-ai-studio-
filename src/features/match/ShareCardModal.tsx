import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ChevronRight, Loader2, X, ShieldCheck, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/context/AppContext';
import { shareCardService } from '@/services/shareCardService';
import { SHARE_CARD_SCOPES, type ShareCardScope } from '@/ai/schemas';
import { Profile } from '@/types';

type Step = 'preview' | 'scope' | 'expiry' | 'confirm' | 'done' | 'revoke';

interface Props {
  candidate: Profile;
  payload: {
    summary_he?: string;
    strengths_he?: string[];
    watch_outs_he?: string[];
    communication_notes_he?: string;
    compatibility_reflection_he?: string;
  };
  onClose: () => void;
}

const SCOPE_LABELS: Record<ShareCardScope, { en: string; description: string }> = {
  summary: {
    en: 'Trait summary',
    description: 'Two-sentence warm summary',
  },
  strengths: {
    en: 'Strengths',
    description: 'What you bring into a connection',
  },
  watch_outs: {
    en: 'Watch-outs',
    description: 'Friction loops to navigate together',
  },
  communication_notes: {
    en: 'Communication notes',
    description: 'How you respond best in conversation',
  },
  compatibility_reflection: {
    en: 'Compatibility reflection',
    description: 'A mutual-consent reflection paragraph',
  },
};

export const ShareCardModal: React.FC<Props> = ({ candidate, payload, onClose }) => {
  const { user } = useApp();
  const [step, setStep] = useState<Step>('preview');
  const [scope, setScope] = useState<ShareCardScope[]>(['summary']);
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [creating, setCreating] = useState(false);
  const [createdCardId, setCreatedCardId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleScope = (s: ShareCardScope) => {
    setScope((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const handleCreate = async () => {
    if (!user) return;
    setCreating(true);
    setError(null);
    try {
      const result = await shareCardService.create({
        ownerUid: user.uid,
        recipientUid: candidate.uid,
        scope,
        expiresInDays,
        payload,
      });
      setCreatedCardId(result.cardId);
      setStep('done');
    } catch (e: any) {
      setError(e?.message ?? 'Failed to create share card');
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async () => {
    if (!createdCardId) return;
    setCreating(true);
    try {
      await shareCardService.revoke(createdCardId);
      setStep('revoke');
    } catch (e: any) {
      setError(e?.message ?? 'Failed to revoke share card');
    } finally {
      setCreating(false);
    }
  };

  const renderPreview = () => (
    <div className="space-y-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">Step 1 of 4 — Preview</p>
      <h3 className="text-2xl font-serif italic text-[#2D2926]">Here's exactly what {candidate.displayName} would see</h3>
      <div className="p-5 bg-[#F7F2EE] rounded-2xl space-y-3 text-sm text-[#2D2926]">
        {payload.summary_he && (
          <p className="italic font-serif" dir="rtl">{payload.summary_he}</p>
        )}
        {payload.strengths_he && payload.strengths_he.length > 0 && (
          <div className="pt-2 border-t border-[#E5DED5]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E] mb-2">Strengths</p>
            <ul className="space-y-1" dir="rtl">
              {payload.strengths_he.map((s, i) => (
                <li key={i}>• {s}</li>
              ))}
            </ul>
          </div>
        )}
        {payload.communication_notes_he && (
          <div className="pt-2 border-t border-[#E5DED5]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E] mb-2">Communication notes</p>
            <p dir="rtl" className="italic">{payload.communication_notes_he}</p>
          </div>
        )}
      </div>
      <p className="text-[11px] text-[#8C7E6E] italic">
        We never share raw answers, raw scores, your private taste, or hidden ranking signals.
      </p>
      <Button
        onClick={() => setStep('scope')}
        className="w-full h-12 rounded-full bg-[#2D2926] text-white font-bold uppercase tracking-widest text-xs"
      >
        Continue <ChevronRight size={16} className="ml-1" />
      </Button>
    </div>
  );

  const renderScope = () => (
    <div className="space-y-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">Step 2 of 4 — Choose scope</p>
      <h3 className="text-2xl font-serif italic text-[#2D2926]">What may they see?</h3>
      <div className="space-y-2">
        {SHARE_CARD_SCOPES.map((s) => {
          const isSelected = scope.includes(s);
          return (
            <button
              key={s}
              onClick={() => toggleScope(s)}
              className={`w-full p-4 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'border-[#D4AF37] bg-[#D4AF37]/5'
                  : 'border-[#F3EFEA] hover:border-[#D4AF37]/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-[#2D2926]">{SCOPE_LABELS[s].en}</p>
                  <p className="text-[11px] text-[#8C7E6E] italic">{SCOPE_LABELS[s].description}</p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    isSelected ? 'bg-[#D4AF37] text-white' : 'bg-[#F7F2EE] text-transparent'
                  }`}
                >
                  <Check size={12} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <Button
        onClick={() => setStep('expiry')}
        disabled={scope.length === 0}
        className="w-full h-12 rounded-full bg-[#2D2926] text-white font-bold uppercase tracking-widest text-xs disabled:opacity-40"
      >
        Continue
      </Button>
    </div>
  );

  const renderExpiry = () => (
    <div className="space-y-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">Step 3 of 4 — Expiry</p>
      <h3 className="text-2xl font-serif italic text-[#2D2926]">How long should access last?</h3>
      <div className="grid grid-cols-3 gap-2">
        {[3, 7, 14].map((days) => (
          <button
            key={days}
            onClick={() => setExpiresInDays(days)}
            className={`p-4 rounded-2xl border text-center transition-all ${
              expiresInDays === days
                ? 'border-[#D4AF37] bg-[#D4AF37]/5 text-[#2D2926]'
                : 'border-[#F3EFEA] text-[#8C7E6E] hover:border-[#D4AF37]/30'
            }`}
          >
            <p className="font-bold text-2xl">{days}</p>
            <p className="text-[10px] uppercase tracking-widest">days</p>
          </button>
        ))}
      </div>
      <p className="text-[11px] text-[#8C7E6E] italic">
        After expiry the card becomes inaccessible. You can revoke at any time. Revocation stops future access but cannot erase screenshots or memory.
      </p>
      <Button
        onClick={() => setStep('confirm')}
        className="w-full h-12 rounded-full bg-[#2D2926] text-white font-bold uppercase tracking-widest text-xs"
      >
        Review & confirm
      </Button>
    </div>
  );

  const renderConfirm = () => (
    <div className="space-y-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">Step 4 of 4 — Confirm</p>
      <h3 className="text-2xl font-serif italic text-[#2D2926]">Confirm sharing with {candidate.displayName}</h3>
      <div className="p-5 bg-[#F7F2EE] rounded-2xl space-y-3 text-sm text-[#2D2926]">
        <p>
          <span className="font-bold">Recipient:</span> {candidate.displayName}
        </p>
        <p>
          <span className="font-bold">Includes:</span>{' '}
          {scope.map((s) => SCOPE_LABELS[s].en).join(', ')}
        </p>
        <p>
          <span className="font-bold">Expires in:</span> {expiresInDays} days
        </p>
        <p className="text-[11px] text-[#8C7E6E] italic pt-2 border-t border-[#E5DED5]">
          Reflective summary, not a score. You can revoke anytime.
        </p>
      </div>
      {error && <p className="text-xs text-red-600 italic text-center">{error}</p>}
      <div className="space-y-2">
        <Button
          onClick={handleCreate}
          disabled={creating}
          className="w-full h-12 rounded-full bg-[#D4AF37] text-[#2D2926] hover:bg-[#B8962E] font-bold uppercase tracking-widest text-xs"
        >
          {creating ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" size={14} /> Sharing
            </span>
          ) : (
            'Share now'
          )}
        </Button>
        <Button
          variant="ghost"
          onClick={() => setStep('preview')}
          className="w-full h-10 rounded-full text-[#2D2926] font-bold uppercase tracking-widest text-xs"
        >
          Back
        </Button>
      </div>
    </div>
  );

  const renderDone = () => (
    <div className="space-y-4 text-center">
      <div className="w-16 h-16 mx-auto bg-[#D4AF37]/10 rounded-full flex items-center justify-center text-[#D4AF37]">
        <ShieldCheck size={32} />
      </div>
      <h3 className="text-2xl font-serif italic text-[#2D2926]">Share card created</h3>
      <p className="text-sm text-[#8C7E6E] italic leading-relaxed">
        {candidate.displayName} can now view this card for {expiresInDays} days. They cannot screenshot the limits — encourage them to keep it private.
      </p>
      <div className="space-y-2">
        <Button
          variant="outline"
          onClick={handleRevoke}
          disabled={creating}
          className="w-full h-12 rounded-full border-[#F3EFEA] text-red-600 font-bold uppercase tracking-widest text-xs hover:bg-red-50"
        >
          <Trash2 size={14} className="mr-2" /> Revoke now
        </Button>
        <Button
          onClick={onClose}
          className="w-full h-12 rounded-full bg-[#2D2926] text-white font-bold uppercase tracking-widest text-xs"
        >
          Done
        </Button>
      </div>
    </div>
  );

  const renderRevoked = () => (
    <div className="space-y-4 text-center">
      <div className="w-16 h-16 mx-auto bg-red-50 rounded-full flex items-center justify-center text-red-600">
        <Trash2 size={32} />
      </div>
      <h3 className="text-2xl font-serif italic text-[#2D2926]">Share card revoked</h3>
      <p className="text-sm text-[#8C7E6E] italic leading-relaxed">
        Future in-app access is blocked. Past views and any saved screenshots are outside our control.
      </p>
      <Button
        onClick={onClose}
        className="w-full h-12 rounded-full bg-[#2D2926] text-white font-bold uppercase tracking-widest text-xs"
      >
        Close
      </Button>
    </div>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-[#FDFCFB] rounded-[32px] p-6 shadow-2xl relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-[#F7F2EE] rounded-full transition-all"
          >
            <X size={18} className="text-[#8C7E6E]" />
          </button>
          {step === 'preview' && renderPreview()}
          {step === 'scope' && renderScope()}
          {step === 'expiry' && renderExpiry()}
          {step === 'confirm' && renderConfirm()}
          {step === 'done' && renderDone()}
          {step === 'revoke' && renderRevoked()}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
