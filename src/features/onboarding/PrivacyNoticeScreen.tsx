import React, { useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, Shield, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface Props {
  onAccept: () => void;
  onBack?: () => void;
  embedded?: boolean; // when true, render without header (e.g., from settings)
}

/**
 * Israeli Amendment 13 privacy notice.
 *
 * MUST be shown before first data collection (Onboarding Step 0).
 * Counsel-reviewed Hebrew copy required before production. Until then,
 * this scaffold is functionally complete but flagged in `claims/personality.yml`
 * Gate 8 status: pending.
 */
export const PrivacyNoticeScreen: React.FC<Props> = ({ onAccept, onBack, embedded = false }) => {
  const [agreed, setAgreed] = useState({
    notice: false,
    sensitiveData: false,
    international: false,
  });

  const allAgreed = agreed.notice && agreed.sensitiveData && agreed.international;

  return (
    <div className={cn("bg-[#FDFCFB] text-[#2D2926]", !embedded && "min-h-screen flex flex-col")} dir="rtl">
      {!embedded && (
        <header className="px-6 pt-14 pb-5 flex items-center gap-3 bg-white/90 border-b border-[#F3EFEA] sticky top-0 z-20">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
              <ChevronLeft size={20} />
            </Button>
          )}
          <Shield size={20} className="text-[#D4AF37]" />
          <h1 className="text-xl font-serif italic">הודעת פרטיות</h1>
        </header>
      )}

      <main className="flex-1 overflow-y-auto px-6 py-8 max-w-2xl mx-auto w-full space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-[#F3EFEA] p-6 space-y-4"
        >
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-[#D4AF37]" />
            <h2 className="text-lg font-bold">הודעת הפרטיות של קשר</h2>
          </div>
          <p className="text-xs text-[#8C7E6E] leading-relaxed">
            בהתאם לחוק הגנת הפרטיות ולתיקון 13. עודכן: מאי 2026.
          </p>

          {/* 1. Identity */}
          <Section title="1. בעל השליטה במידע">
            <p>קשר — אפליקציית היכרויות יהודית רצינית הפועלת בישראל.</p>
            <p>פניות בנושאי פרטיות: privacy@kesher.app</p>
            <p>הממונה על הגנת הפרטיות: שם הממונה (יעודכן לפני השקה).</p>
          </Section>

          {/* 2. Purposes */}
          <Section title="2. מטרות השימוש במידע">
            <ul className="list-disc pr-5 space-y-1">
              <li>שידוך והמלצות פרופילים מתאימים</li>
              <li>שמירה על ביטחון המשתמשים ומניעת התנהגות פוגענית</li>
              <li>הפעלת תכונות בינה מלאכותית (ניסוח ביוגרפיה, הסבר התאמה, שיקוף תקשורת)</li>
              <li>תפעול השירות והפקת תובנות סטטיסטיות אגרגטיביות</li>
            </ul>
          </Section>

          {/* 3. Data categories */}
          <Section title="3. סוגי מידע שאנו אוספים">
            <ul className="list-disc pr-5 space-y-1">
              <li>זהות: שם, גיל, מספר טלפון, דוא״ל</li>
              <li>מיקום: עיר או אזור בלבד — לעולם לא כתובת מדויקת</li>
              <li>רמת שמירת מצוות (כפי שאת/ה מצהיר/ה)</li>
              <li>תמונות פרופיל</li>
              <li>תשובות לשאלון אישיות (IPIP) — אופציונלי, מוסכם בנפרד</li>
              <li>אותות התנהגות: לייקים, פאסים, זמן צפייה</li>
              <li>הודעות: נשמרות מוצפנות; ניגישה אליהן רק לצורכי בטיחות</li>
            </ul>
          </Section>

          <Section title="4. מידע בעל רגישות מיוחדת" highlighted>
            <p>נתוני אישיות, רמת שמירת מצוות, ותכני הודעות נחשבים <strong>מידע בעל רגישות מיוחדת</strong>:</p>
            <ul className="list-disc pr-5 space-y-1 mt-2">
              <li>איסופם דורש הסכמה נפרדת ומפורשת — לא ברירת מחדל</li>
              <li>ניתן למחוק אותם בכל עת ללא הסבר</li>
              <li>שום החלטה אוטומטית אינה מתבססת רק עליהם</li>
              <li>שיתופם עם משתמשים אחרים מחייב הסכמה הדדית, גרנולרית, וניתנת לביטול</li>
            </ul>
          </Section>

          {/* 5. Recipients */}
          <Section title="5. למי המידע מועבר">
            <ul className="list-disc pr-5 space-y-1">
              <li>Google Cloud — אזור ישראל (me-west1) או EU כברירת מחדל</li>
              <li>Firebase (Google) לאימות וזהות</li>
              <li>Vercel לאירוח</li>
              <li>Gemini API — שיחות ה-AI מתבצעות בצד שרת בלבד; פרטי זהות אינם נשלחים. הקלטים אינם משמשים לאימון מודלים.</li>
            </ul>
          </Section>

          {/* 6. Retention */}
          <Section title="6. משך השמירה">
            <ul className="list-disc pr-5 space-y-1">
              <li>חשבונות פעילים: כל עוד החשבון קיים</li>
              <li>חשבונות שנמחקו: 30 ימי חסד לשחזור, ולאחר מכן מחיקה מוחלטת</li>
              <li>נתוני אישיות: נמחקים מיידית לפי בקשה</li>
              <li>הודעות: נמחקות כששני הצדדים מוחקים את ההתאמה</li>
              <li>יומני בטיחות: 12 חודשים</li>
            </ul>
          </Section>

          {/* 7. User rights */}
          <Section title="7. זכויותייך לפי חוק הגנת הפרטיות">
            <ul className="list-disc pr-5 space-y-1">
              <li><strong>עיון:</strong> לראות את כל המידע השמור עלייך</li>
              <li><strong>תיקון:</strong> לעדכן מידע לא מדויק</li>
              <li><strong>מחיקה:</strong> למחוק את כל החשבון או רק את נתוני האישיות</li>
              <li><strong>התנגדות:</strong> לעצור עיבוד מסוים</li>
              <li><strong>ביטול הסכמה:</strong> בכל עת, לכל תכונה</li>
              <li><strong>ייצוא:</strong> לקבל את המידע בפורמט קריא למחשב</li>
              <li><strong>תלונה:</strong> לרשות להגנת הפרטיות (privacy@justice.gov.il)</li>
            </ul>
          </Section>

          {/* 8. AI features */}
          <Section title="8. תכונות בינה מלאכותית">
            <p>שיחות AI מבוצעות בצד שרת בלבד. כל פלט מסומן כטיוטה, ניתן לעריכה לפני שליחה, ואינו נשלח אוטומטית. אנו לא מסיקים מאפיינים מוגנים (דת, מוצא, מיניות, בריאות) מתמונות או טקסט.</p>
          </Section>

          {/* 9. International */}
          <Section title="9. העברה בינלאומית" highlighted>
            <p>מידע עשוי להיות מעובד בשרתי Google מחוץ לישראל (אירופה / ארה״ב). העברות אלו מבוצעות על בסיס סעיפי חוזה סטנדרטיים (SCCs) או החלטות נאותות של רשויות ההגנה על הפרטיות.</p>
          </Section>
        </motion.div>

        {/* Granular consents */}
        <div className="bg-white rounded-2xl border border-[#F3EFEA] p-6 space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[#8C7E6E]">אישורים נדרשים</p>
          <Checkbox
            checked={agreed.notice}
            onChange={(c) => setAgreed((p) => ({ ...p, notice: c }))}
            label="קראתי והבנתי את הודעת הפרטיות לעיל."
          />
          <Checkbox
            checked={agreed.sensitiveData}
            onChange={(c) => setAgreed((p) => ({ ...p, sensitiveData: c }))}
            label="אני מסכים/ה לאיסוף מידע בעל רגישות מיוחדת (רמת שמירה, אישיות) לצורך השירות. ברור לי שניתן למחוק זאת בכל עת."
          />
          <Checkbox
            checked={agreed.international}
            onChange={(c) => setAgreed((p) => ({ ...p, international: c }))}
            label="אני מסכים/ה להעברת המידע לעיבוד בשרתים בינלאומיים תחת מנגנוני הגנה תקפים."
          />
        </div>

        <Button
          className="w-full h-14 rounded-2xl bg-[#2D2926] text-white font-bold text-base disabled:opacity-40"
          disabled={!allAgreed}
          onClick={onAccept}
        >
          המשך — אני מסכים/ה
        </Button>

        <p className="text-center text-[10px] text-[#C4B5A5] leading-relaxed">
          ניתן לבטל הסכמה בכל עת מתוך הגדרות → AI &amp; Trust Hub.
          לקבלת עותק של ההודעה או למימוש זכויות, פנו אלינו ב-privacy@kesher.app.
        </p>
      </main>
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode; highlighted?: boolean }> = ({
  title,
  children,
  highlighted,
}) => (
  <div
    className={cn(
      "space-y-2 pt-4 border-t border-[#F3EFEA] first:border-0 first:pt-0",
      highlighted && "bg-[#FFF7E5] -mx-2 px-3 py-3 rounded-xl border border-[#F0D998]",
    )}
  >
    <h3 className="text-sm font-bold text-[#2D2926]">{title}</h3>
    <div className="text-xs text-[#5C4F44] leading-relaxed space-y-1">{children}</div>
  </div>
);

const Checkbox: React.FC<{ checked: boolean; onChange: (c: boolean) => void; label: string }> = ({
  checked,
  onChange,
  label,
}) => (
  <button
    onClick={() => onChange(!checked)}
    className={cn(
      "w-full text-right p-4 rounded-2xl border transition-all flex items-start gap-3",
      checked ? "bg-[#2D2926] text-white border-[#2D2926]" : "bg-white border-[#E8E0D8] text-[#2D2926]",
    )}
  >
    <div
      className={cn(
        "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5",
        checked ? "bg-[#D4AF37] border-[#D4AF37]" : "border-[#C4B5A5]",
      )}
    >
      {checked && <Check size={12} className="text-white" />}
    </div>
    <span className="text-sm leading-relaxed">{label}</span>
  </button>
);
