import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Button } from '@/components/ui/Button';
import { AlertCircle, Brain, Check, ChevronRight } from 'lucide-react';
import {
  KESHER_PERSONALITY_ITEMS,
  type PersonalityAssessmentReport,
  scoreKesherPersonalityAssessment,
} from '@/personality/scoring';

const OPTIONS = [
  { value: 1, label_en: 'Strongly disagree', label_he: 'בכלל לא מסכים/ה' },
  { value: 2, label_en: 'Disagree', label_he: 'לא מסכים/ה' },
  { value: 3, label_en: 'Neutral', label_he: 'ניטרלי' },
  { value: 4, label_en: 'Agree', label_he: 'מסכים/ה' },
  { value: 5, label_en: 'Strongly agree', label_he: 'מסכים/ה מאוד' },
];

export const PersonalityAssessment: React.FC<{
  onComplete: (report: PersonalityAssessmentReport) => void;
}> = ({ onComplete }) => {
  const [hasOptedIn, setHasOptedIn] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showExplainer, setShowExplainer] = useState(true);

  const currentItem = KESHER_PERSONALITY_ITEMS[currentIndex];
  const report = useMemo(() => scoreKesherPersonalityAssessment(answers), [answers]);
  const isComplete = report.completion.answered === report.completion.total;

  const handleAnswer = (value: number) => {
    setAnswers((prev) => ({ ...prev, [currentItem.id]: value }));

    if (currentIndex < KESHER_PERSONALITY_ITEMS.length - 1) {
      window.setTimeout(() => setCurrentIndex((prev) => prev + 1), 180);
    }
  };

  if (!hasOptedIn) {
    return (
      <div className="p-6 bg-white border border-[#F3EFEA] rounded-[24px] space-y-6 shadow-sm" dir="rtl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center text-[#D4AF37] shrink-0">
            <Brain size={24} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-serif italic text-[#2D2926]">פרופיל אישיות פרטי</h3>
            <p className="text-sm text-[#8C7E6E] leading-relaxed">
              כלי רפלקציה מקורי של Kesher שעוזר לך לראות דפוסי תקשורת ודייטינג. הוא פרטי כברירת מחדל, לא מדרג אותך ולא מנבא התאמה.
            </p>
          </div>
        </div>

        {showExplainer && (
          <div className="p-4 bg-[#F7F2EE] rounded-2xl flex gap-3 items-start">
            <AlertCircle size={16} className="text-[#8C7E6E] shrink-0 mt-0.5" />
            <p className="text-xs text-[#8C7E6E] leading-relaxed">
              זהו כלי רפלקציה לא-קליני. החישוב דטרמיניסטי, לא נעשה על ידי AI, ונשמר עם גרסת כלי וגרסת חישוב.
            </p>
            <button
              type="button"
              onClick={() => setShowExplainer(false)}
              className="text-[10px] font-bold uppercase tracking-widest text-[#2D2926]"
            >
              Hide
            </button>
          </div>
        )}

        <Button
          onClick={() => setHasOptedIn(true)}
          className="w-full h-14 rounded-full bg-[#2D2926] text-white hover:bg-[#1A1816] font-bold uppercase tracking-widest text-xs"
        >
          I opt in
          <ChevronRight size={16} />
        </Button>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="p-6 bg-white border border-[#F3EFEA] rounded-[24px] space-y-6 shadow-sm text-center" dir="rtl">
        <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto text-[#D4AF37]">
          <Check size={32} />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-serif italic text-[#2D2926]">הפרופיל הפרטי מוכן</h3>
          <p className="text-sm text-[#8C7E6E]">
            נשמר דוח עם {report.domains.length} תחומים ו-{report.aspects.length} היבטים. הדוח פרטי, לא כולל תשובות גולמיות, ולא נוצר על ידי AI.
          </p>
          <p className="text-[10px] text-[#8C7E6E] uppercase tracking-widest" dir="ltr">
            {report.instrument_version} • {report.score_version} • {report.item_text_source}
          </p>
        </div>
        <Button
          onClick={() => onComplete(report)}
          className="w-full h-14 rounded-full bg-[#2D2926] text-white hover:bg-[#1A1816] font-bold uppercase tracking-widest text-xs"
        >
          View private dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white border border-[#F3EFEA] rounded-[24px] space-y-7 shadow-sm" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#D4AF37]">
          <Brain size={18} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Kesher reflection</span>
        </div>
        <span className="text-xs text-[#8C7E6E] font-mono" dir="ltr">
          {report.completion.answered} / {report.completion.total} • {report.completion.percent}%
        </span>
      </div>

      <div className="w-full h-1.5 bg-[#F7F2EE] rounded-full overflow-hidden" dir="ltr">
        <motion.div
          className="h-full bg-[#D4AF37] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${report.completion.percent}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentItem.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6 min-h-[260px]"
        >
          <div className="space-y-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">
              Kesher item • {currentItem.aspect.replaceAll('_', ' ')}
            </p>
            <h4 className="text-xl font-serif italic text-[#2D2926] leading-relaxed">
              {currentItem.text_he}
            </h4>
            <p className="text-xs text-[#8C7E6E]" dir="ltr">
              {currentItem.text_en}
            </p>
          </div>

          <div className="space-y-2">
            {OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                className={`w-full p-4 rounded-2xl border text-sm transition-all ${
                  answers[currentItem.id] === option.value
                    ? 'border-[#D4AF37] bg-[#D4AF37]/5 text-[#2D2926] font-bold'
                    : 'border-[#F3EFEA] text-[#8C7E6E] hover:border-[#D4AF37]/30 hover:bg-[#F7F2EE]'
                }`}
              >
                <span>{option.label_he}</span>
                <span className="block text-[10px] opacity-70" dir="ltr">
                  {option.label_en}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {report.is_partial && report.completion.answered > 0 && (
        <p className="text-[11px] text-[#8C7E6E] text-center leading-relaxed">
          השאלון נשמר רק כשתסיים/י את כל הפריטים, כדי שהדוח הפרטי יהיה מלא ושימושי.
        </p>
      )}
    </div>
  );
};
