import React from "react";
import { motion } from "motion/react";
import { ChevronLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface Props {
  onAccept: () => void;
  onBack?: () => void;
  embedded?: boolean;
}

export const TermsOfServiceScreen: React.FC<Props> = ({ onAccept, onBack, embedded = false }) => {
  return (
    <div className={cn("bg-[#FDFCFB] text-[#2D2926]", !embedded && "min-h-screen flex flex-col")} dir="rtl">
      {!embedded && (
        <header className="px-6 pt-14 pb-5 flex items-center gap-3 bg-white/90 border-b border-[#F3EFEA] sticky top-0 z-20">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
              <ChevronLeft size={20} />
            </Button>
          )}
          <FileText size={20} className="text-[#D4AF37]" />
          <h1 className="text-xl font-serif italic">תנאי השימוש</h1>
        </header>
      )}

      <main className="flex-1 overflow-y-auto px-6 py-8 max-w-2xl mx-auto w-full space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-[#F3EFEA] p-6 space-y-4"
        >
          <h2 className="text-lg font-bold">תנאי השימוש של קשר</h2>
          <p className="text-xs text-[#8C7E6E]">עודכן: מאי 2026</p>

          <Section title="1. גיל מינימלי">
            <p>השירות מיועד למשתמשים בני 18 ומעלה בלבד. אנו לא מאפשרים שימוש לקטינים ובודקים גיל בעת ההרשמה.</p>
          </Section>

          <Section title="2. כללי התנהגות">
            <ul className="list-disc pr-5 space-y-1">
              <li>יחס מכבד לכל משתמש/ת</li>
              <li>איסור על הטרדה, הסתה, אלימות, או דרישה כלכלית</li>
              <li>איסור על התחזות או יצירת פרופיל מזויף</li>
              <li>שמירה על דיסקרטיות בנוגע לשיחות פרטיות</li>
              <li>אסור לפרסם בפלטפורמה תוכן מסחרי או דעות פוליטיות בוטות</li>
            </ul>
          </Section>

          <Section title="3. תוכן בינה מלאכותית">
            <p>תכונות AI מספקות <strong>טיוטות בלבד</strong>. אתה תמיד הכותב/ת והשולח/ת. שום תוכן AI אינו נשלח אוטומטית. אינך רשאי/ת להעביר תוכן AI כאילו נכתב על ידך באופן אישי לחלוטין באופן מטעה.</p>
          </Section>

          <Section title="4. אכיפה ואפס סובלנות">
            <p>הפרת תנאים אלו עלולה להוביל להגבלה או למחיקת חשבון. במקרים חמורים נשתף פעולה עם הרשויות. תלונות בטיחות נבדקות תוך 24 שעות.</p>
          </Section>

          <Section title="5. אחריות מוגבלת">
            <p>קשר אינה אחראית לתוצאות של פגישות בין משתמשים. כל פגישה היא באחריות אישית. אנו ממליצים על מקומות ציבוריים, יידוע אדם קרוב, ושימוש בכלי הבטיחות שמסופקים באפליקציה.</p>
          </Section>

          <Section title="6. שינוי בתנאים">
            <p>אם נשנה את התנאים באופן מהותי נודיע מראש לפחות 30 ימים לפני התחולה.</p>
          </Section>

          <Section title="7. סמכות שיפוט">
            <p>תנאים אלו כפופים לדין הישראלי. סמכות השיפוט הבלעדית נתונה לבתי המשפט בתל אביב.</p>
          </Section>
        </motion.div>

        <Button
          className="w-full h-14 rounded-2xl bg-[#2D2926] text-white font-bold text-base"
          onClick={onAccept}
        >
          המשך — אני מסכים/ה לתנאים
        </Button>
      </main>
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-2 pt-4 border-t border-[#F3EFEA] first:border-0 first:pt-0">
    <h3 className="text-sm font-bold">{title}</h3>
    <div className="text-xs text-[#5C4F44] leading-relaxed">{children}</div>
  </div>
);
