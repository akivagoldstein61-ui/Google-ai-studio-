import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, ShieldCheck, X, Loader2, Heart, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  consentService,
  ALL_CONSENT_SIGNALS,
  SIGNAL_LABELS,
  ConsentSignal,
  ConsentStatus,
} from "@/services/consentService";
import { cn } from "@/lib/utils";

interface Props {
  peerUid: string;
  peerDisplayName: string;
  onClose: () => void;
  onMutual?: (mutualSignals: ConsentSignal[]) => void;
}

/**
 * MutualConsentSheet — Gate 5 enforcement.
 *
 * Both users must opt in to specific signals before any compatibility
 * reflection card is generated. The user sees exactly which signals will
 * be shared, can deselect any, and can revoke later.
 */
export const MutualConsentSheet: React.FC<Props> = ({
  peerUid,
  peerDisplayName,
  onClose,
  onMutual,
}) => {
  const [status, setStatus] = useState<ConsentStatus | null>(null);
  const [selected, setSelected] = useState<Set<ConsentSignal>>(
    new Set(ALL_CONSENT_SIGNALS),
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await consentService.getStatus(peerUid);
        if (!cancelled) {
          setStatus(s);
          if (s.myGrantedSignals?.length > 0) {
            setSelected(new Set(s.myGrantedSignals));
          }
        }
      } catch {
        if (!cancelled) setError("לא הצלחנו לטעון את מצב ההסכמה.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [peerUid]);

  const toggle = (sig: ConsentSignal) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(sig)) next.delete(sig);
      else next.add(sig);
      return next;
    });
  };

  const handleAction = async (action: "request" | "grant" | "revoke") => {
    setSubmitting(true);
    setError(null);
    try {
      const sigs = Array.from(selected);
      let result: any;
      if (action === "request") {
        result = await consentService.requestConsent(peerUid, sigs);
      } else if (action === "grant") {
        result = await consentService.grantConsent(peerUid, sigs);
      } else {
        result = await consentService.revokeConsent(peerUid);
      }
      // Refresh status
      const fresh = await consentService.getStatus(peerUid);
      setStatus(fresh);
      if (fresh.bothConsented && onMutual) {
        onMutual(fresh.mutualSignals);
      }
    } catch (e: any) {
      setError(e.message || "אירעה שגיאה. נסה שוב.");
    } finally {
      setSubmitting(false);
    }
  };

  const state = status?.state || "none";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40 }}
        animate={{ y: 0 }}
        exit={{ y: 40 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FDFCFB] w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 max-h-[90vh] overflow-y-auto"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#D4AF37]" />
              <h2 className="text-2xl font-serif italic text-[#2D2926]">
                שיקוף הדדי
              </h2>
            </div>
            <p className="text-sm text-[#8C7E6E]">
              עם {peerDisplayName} — שניכם צריכים להסכים
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F7F2EE] rounded-full">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-[#8C7E6E]" />
          </div>
        ) : (
          <>
            {/* State banner */}
            <AnimatePresence mode="wait">
              {state === "mutual" && (
                <motion.div
                  key="mutual"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#F0F7F0] border border-[#C8DDC8] rounded-2xl p-4 mb-6 flex gap-3"
                >
                  <Check size={18} className="text-[#5C8A5C] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-[#2D2926]">
                      שניכם הסכמתם
                    </p>
                    <p className="text-xs text-[#5C8A5C]">
                      ניתן להציג שיקוף משותף על {status?.mutualSignals.length || 0} אותות מאושרים
                    </p>
                  </div>
                </motion.div>
              )}
              {state === "requested_by_peer" && (
                <motion.div
                  key="peer-requested"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#FFF7E5] border border-[#F0D998] rounded-2xl p-4 mb-6 flex gap-3"
                >
                  <Heart size={18} className="text-[#D4AF37] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-[#2D2926]">
                      {peerDisplayName} הזמינ/ה אותך לשיקוף משותף
                    </p>
                    <p className="text-xs text-[#8C7E6E]">
                      בחר/י איזה אותות את/ה מסכים/ה לחלוק. שניכם צריכים לסמן אותו אות כדי שהוא ישותף.
                    </p>
                  </div>
                </motion.div>
              )}
              {state === "requested_by_me" && (
                <motion.div
                  key="me-requested"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#F7F2EE] border border-[#E8E0D8] rounded-2xl p-4 mb-6 flex gap-3"
                >
                  <Loader2 size={18} className="text-[#8C7E6E] mt-0.5 shrink-0 animate-pulse" />
                  <div>
                    <p className="text-sm font-bold text-[#2D2926]">
                      ממתין/ה ל-{peerDisplayName}
                    </p>
                    <p className="text-xs text-[#8C7E6E]">
                      שלחת בקשה לשיקוף משותף. תקבל/י עדכון כשהיא תאושר.
                    </p>
                  </div>
                </motion.div>
              )}
              {state === "revoked" && (
                <motion.div
                  key="revoked"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#FAECEC] border border-[#E5C0C0] rounded-2xl p-4 mb-6 flex gap-3"
                >
                  <AlertTriangle size={18} className="text-[#A05050] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-[#2D2926]">
                      ההסכמה בוטלה
                    </p>
                    <p className="text-xs text-[#A05050]">
                      ניתן לבקש מחדש בכל עת.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Signals checklist */}
            <div className="space-y-2 mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-[#8C7E6E] mb-3">
                בחר/י איזה אותות לשתף
              </p>
              {ALL_CONSENT_SIGNALS.map((sig) => {
                const isSelected = selected.has(sig);
                const peerHas = status?.peerGrantedSignals?.includes(sig);
                return (
                  <button
                    key={sig}
                    onClick={() => toggle(sig)}
                    disabled={state === "mutual" || submitting}
                    className={cn(
                      "w-full text-right p-4 rounded-2xl border transition-all flex items-center gap-3 disabled:opacity-60",
                      isSelected
                        ? "bg-[#2D2926] text-white border-[#2D2926]"
                        : "bg-white border-[#E8E0D8] text-[#2D2926] hover:border-[#2D2926]",
                    )}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                        isSelected
                          ? "bg-[#D4AF37] border-[#D4AF37]"
                          : "border-[#C4B5A5]",
                      )}
                    >
                      {isSelected && <Check size={13} className="text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">
                        {SIGNAL_LABELS[sig].he}
                      </p>
                      {peerHas && (
                        <p className={cn("text-[10px] mt-0.5", isSelected ? "text-[#D4AF37]" : "text-[#5C8A5C]")}>
                          {peerDisplayName} הסכים/ה לאות זה ✓
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {error && (
              <div className="bg-[#FAECEC] border border-[#E5C0C0] rounded-2xl p-3 text-xs text-[#A05050] mb-4">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              {state === "none" && (
                <Button
                  className="w-full h-13 rounded-2xl bg-[#2D2926] text-white font-bold"
                  onClick={() => handleAction("request")}
                  disabled={submitting || selected.size === 0}
                >
                  {submitting ? <Loader2 className="animate-spin" /> : "שלח בקשה לשיקוף משותף"}
                </Button>
              )}
              {state === "requested_by_peer" && (
                <Button
                  className="w-full h-13 rounded-2xl bg-[#2D2926] text-white font-bold"
                  onClick={() => handleAction("grant")}
                  disabled={submitting || selected.size === 0}
                >
                  {submitting ? <Loader2 className="animate-spin" /> : "אישור הסכמה הדדית"}
                </Button>
              )}
              {(state === "mutual" || state === "requested_by_me") && (
                <Button
                  variant="ghost"
                  className="w-full h-13 rounded-2xl border border-[#E8E0D8] text-[#A05050] font-semibold"
                  onClick={() => handleAction("revoke")}
                  disabled={submitting}
                >
                  ביטול הסכמה
                </Button>
              )}
              {state === "revoked" && (
                <Button
                  className="w-full h-13 rounded-2xl bg-[#2D2926] text-white font-bold"
                  onClick={() => handleAction("request")}
                  disabled={submitting || selected.size === 0}
                >
                  בקשה חדשה
                </Button>
              )}
            </div>

            <p className="text-[10px] text-[#C4B5A5] mt-4 leading-relaxed text-center">
              ההסכמה תקפה רק לאותות ששניכם סימנתם. ניתן לבטל בכל עת מההגדרות, וכל הכרטיסים שנוצרו יוסרו.
            </p>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};
