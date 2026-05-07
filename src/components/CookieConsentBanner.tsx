import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

const STORAGE_KEY = "kesher_cookie_consent_v1";

type ConsentState = {
  essential: true; // always required
  analytics: boolean;
  decided: boolean;
  decidedAt: string;
};

const defaultState: ConsentState = {
  essential: true,
  analytics: false,
  decided: false,
  decidedAt: "",
};

export function loadConsent(): ConsentState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    return { ...defaultState, ...JSON.parse(raw) };
  } catch {
    return defaultState;
  }
}

function saveConsent(state: ConsentState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage may be unavailable (private mode) — silent
  }
}

/**
 * Cookie consent banner — minimal Israeli Amendment 13 / GDPR compliant pattern.
 *
 * - Essential cookies are always on (auth, CSRF) — no consent required.
 * - Analytics (or any non-essential) cookies require an explicit click.
 * - User can change preferences from AI Trust Hub at any time.
 */
export const CookieConsentBanner: React.FC = () => {
  const [state, setState] = useState<ConsentState>(defaultState);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const loaded = loadConsent();
    setState(loaded);
    if (!loaded.decided) {
      // Delay to avoid layout jank on first paint
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const persist = (analytics: boolean) => {
    const next: ConsentState = {
      essential: true,
      analytics,
      decided: true,
      decidedAt: new Date().toISOString(),
    };
    saveConsent(next);
    setState(next);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", damping: 24, stiffness: 280 }}
          className="fixed bottom-4 left-4 right-4 max-w-xl mx-auto z-[110] bg-white border border-[#E8E0D8] rounded-3xl shadow-2xl shadow-black/15 p-5"
          role="dialog"
          aria-label="הסכמה לעוגיות"
          dir="rtl"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FFF7E5] text-[#D4AF37] flex items-center justify-center shrink-0 mt-0.5">
              <Cookie size={18} />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-sm font-bold">עוגיות (Cookies)</h3>
                <p className="text-xs text-[#6B5E52] leading-relaxed mt-1">
                  אנו משתמשים בעוגיות חיוניות לתפעול האפליקציה (התחברות, אבטחה).
                  ניתן להסכים גם לעוגיות אנליטיות שמסייעות לנו להבין שימוש מצטבר —
                  ללא זיהוי אישי. ניתן לשנות בכל עת מהגדרות → AI &amp; Trust Hub.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  className="h-10 rounded-full bg-[#2D2926] text-white text-xs font-bold uppercase tracking-widest px-5"
                  onClick={() => persist(true)}
                >
                  לקבל הכל
                </Button>
                <Button
                  variant="ghost"
                  className="h-10 rounded-full border border-[#E8E0D8] text-[#2D2926] text-xs font-bold uppercase tracking-widest px-5"
                  onClick={() => persist(false)}
                >
                  חיוניות בלבד
                </Button>
              </div>
            </div>
            <button
              onClick={() => persist(false)}
              aria-label="סגור"
              className="text-[#C4B5A5] hover:text-[#2D2926] p-1"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
