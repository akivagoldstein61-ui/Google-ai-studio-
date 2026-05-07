import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Sparkles, Copy, Check, AlertCircle, Loader2, RefreshCw, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/context/AppContext';
import { aiService } from '@/services/aiService';
import { cn } from '@/lib/utils';

const OBSERVANCE_LEVELS = [
  { id: 'secular', label_he: 'חילוני/ת', label_en: 'Secular' },
  { id: 'traditional', label_he: 'מסורתי/ת', label_en: 'Traditional' },
  { id: 'modern_orthodox', label_he: 'דתי/ה לאומי/ת', label_en: 'Modern Orthodox' },
  { id: 'haredi', label_he: 'חרדי/ת', label_en: 'Haredi' },
  { id: 'reform', label_he: 'רפורמי/ת', label_en: 'Reform' },
  { id: 'conservative', label_he: 'קונסרבטיבי/ת', label_en: 'Conservative' },
  { id: 'spiritual', label_he: 'רוחני/ת', label_en: 'Spiritual / Cultural' },
];

const VALUE_TOPICS = [
  { id: 'shabbat', label_he: 'שבת', label_en: 'Shabbat observance' },
  { id: 'kashrut', label_he: 'כשרות', label_en: 'Kashrut / diet' },
  { id: 'family', label_he: 'משפחה', label_en: 'Family & parenthood' },
  { id: 'education', label_he: 'חינוך', label_en: 'Jewish education' },
  { id: 'community', label_he: 'קהילה', label_en: 'Community & belonging' },
  { id: 'israel', label_he: 'ישראל', label_en: 'Connection to Israel' },
  { id: 'tzniut', label_he: 'צניעות', label_en: 'Modesty & lifestyle' },
  { id: 'zionism', label_he: 'ציונות', label_en: 'Zionism & politics' },
  { id: 'custom', label_he: 'נושא אחר', label_en: 'Other topic' },
];

interface PhrasingResult {
  phrasing_options_he: string[];
  phrasing_options_en: string[];
  what_each_option_signals: string[];
  avoid_phrases: string[];
  coaching_note_he: string;
}

export const ValuesPhrasingCoach: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { user, trackEvent } = useApp();

  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [customTopic, setCustomTopic] = useState('');
  const [userDraft, setUserDraft] = useState('');
  const [observance, setObservance] = useState(user?.observance || 'traditional');
  const [context, setContext] = useState<'bio' | 'prompt' | 'message'>('bio');
  const [result, setResult] = useState<PhrasingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const effectiveTopic =
    selectedTopic === 'custom' ? customTopic : VALUE_TOPICS.find(t => t.id === selectedTopic)?.label_en || '';

  const handleGenerate = async () => {
    if (!effectiveTopic.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await aiService.getValuesPhrasing({
        value_topic: effectiveTopic,
        user_draft: userDraft,
        observance,
        context,
      });

      if (data) {
        setResult(data);
        trackEvent?.('values_phrasing_generated', { topic: selectedTopic, observance });
      } else {
        setError('לא הצלחנו לייצר אפשרויות ניסוח כרגע. נסה שוב.');
      }
    } catch {
      setError('שגיאה בחיבור לשרת. בדוק את החיבור לאינטרנט ונסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col text-[#2D2926]">
      {/* Header */}
      <header className="px-6 pt-14 pb-5 flex items-center gap-4 bg-white/90 backdrop-blur-xl border-b border-[#F3EFEA] sticky top-0 z-20">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full hover:bg-[#F7F2EE]">
          <ChevronLeft size={20} />
        </Button>
        <div>
          <h1 className="text-xl font-serif italic text-[#2D2926]">Values Phrasing Coach</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">Express yourself authentically</p>
        </div>
        <div className="ml-auto">
          <Sparkles size={18} className="text-[#D4AF37]" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar px-6 py-8 space-y-8 max-w-lg mx-auto w-full">

        {/* Disclosure */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
          <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800 leading-relaxed">
            כלי זה מציע <strong>טיוטות בלבד</strong> — אתה/את תמיד שולט/ת בנרטיב שלך. בינה מלאכותית אינה שולחת הודעות בשמך.
          </p>
        </div>

        {/* Observance selector */}
        <section className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-widest text-[#8C7E6E]">
            רמת שמירת מצוות שלך
          </label>
          <div className="flex flex-wrap gap-2">
            {OBSERVANCE_LEVELS.map(level => (
              <button
                key={level.id}
                onClick={() => setObservance(level.id)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-semibold transition-all border",
                  observance === level.id
                    ? "bg-[#2D2926] text-white border-[#2D2926]"
                    : "bg-white text-[#6B5E52] border-[#E8E0D8] hover:border-[#2D2926]"
                )}
              >
                {level.label_he}
              </button>
            ))}
          </div>
        </section>

        {/* Topic selector */}
        <section className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-widest text-[#8C7E6E]">
            על מה תרצה/י לדבר?
          </label>
          <div className="grid grid-cols-2 gap-2">
            {VALUE_TOPICS.map(topic => (
              <button
                key={topic.id}
                onClick={() => setSelectedTopic(topic.id)}
                className={cn(
                  "px-4 py-3 rounded-2xl text-sm font-semibold text-right transition-all border",
                  selectedTopic === topic.id
                    ? "bg-[#2D2926] text-white border-[#2D2926]"
                    : "bg-white text-[#6B5E52] border-[#E8E0D8] hover:border-[#2D2926]"
                )}
                dir="rtl"
              >
                {topic.label_he}
              </button>
            ))}
          </div>
          <AnimatePresence>
            {selectedTopic === 'custom' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <input
                  type="text"
                  value={customTopic}
                  onChange={e => setCustomTopic(e.target.value)}
                  placeholder="כתוב את הנושא שלך..."
                  className="w-full px-4 py-3 rounded-2xl border border-[#E8E0D8] bg-white text-[#2D2926] placeholder-[#C4B5A5] focus:outline-none focus:border-[#2D2926] text-sm"
                  dir="rtl"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Context selector */}
        <section className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-widest text-[#8C7E6E]">
            איפה תשתמש/י בניסוח?
          </label>
          <div className="flex gap-2">
            {[
              { id: 'bio', label_he: 'ביוגרפיה' },
              { id: 'prompt', label_he: 'שאלה בפרופיל' },
              { id: 'message', label_he: 'הודעה' },
            ].map(c => (
              <button
                key={c.id}
                onClick={() => setContext(c.id as any)}
                className={cn(
                  "flex-1 py-2 rounded-full text-sm font-semibold transition-all border",
                  context === c.id
                    ? "bg-[#D4AF37] text-white border-[#D4AF37]"
                    : "bg-white text-[#6B5E52] border-[#E8E0D8] hover:border-[#D4AF37]"
                )}
              >
                {c.label_he}
              </button>
            ))}
          </div>
        </section>

        {/* Optional draft */}
        <section className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-widest text-[#8C7E6E]">
            טיוטה שלך (אופציונלי)
          </label>
          <textarea
            value={userDraft}
            onChange={e => setUserDraft(e.target.value)}
            placeholder="כתוב מה שניסית להגיד — נעזור לך לנסחו טוב יותר..."
            rows={3}
            className="w-full px-4 py-3 rounded-2xl border border-[#E8E0D8] bg-white text-[#2D2926] placeholder-[#C4B5A5] focus:outline-none focus:border-[#2D2926] text-sm resize-none"
            dir="rtl"
          />
        </section>

        {/* Generate button */}
        <Button
          className="w-full h-14 rounded-2xl bg-[#2D2926] text-white font-bold text-base flex items-center justify-center gap-2 disabled:opacity-40"
          onClick={handleGenerate}
          disabled={!effectiveTopic.trim() || loading}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              מייצר אפשרויות ניסוח...
            </>
          ) : (
            <>
              <Sparkles size={18} className="text-[#D4AF37]" />
              הצע אפשרויות ניסוח
            </>
          )}
        </Button>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700 text-right" dir="rtl">
            {error}
          </div>
        )}

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Coaching note */}
              {result.coaching_note_he && (
                <div className="bg-[#F7F2EE] rounded-2xl p-5 flex gap-3" dir="rtl">
                  <BookOpen size={16} className="text-[#C8956B] mt-0.5 shrink-0" />
                  <p className="text-sm text-[#6B5E52] leading-relaxed">{result.coaching_note_he}</p>
                </div>
              )}

              {/* Phrasing options */}
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-[#8C7E6E]">
                  אפשרויות ניסוח — בחר את שמרגיש הכי אמיתי
                </p>
                {result.phrasing_options_he.map((phrase, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.06 }}
                    className="bg-white rounded-2xl border border-[#E8E0D8] p-5 space-y-3"
                    dir="rtl"
                  >
                    <p className="text-base font-medium text-[#2D2926] leading-relaxed">{phrase}</p>
                    {result.what_each_option_signals[idx] && (
                      <p className="text-xs text-[#8C7E6E] italic">
                        אות: {result.what_each_option_signals[idx]}
                      </p>
                    )}
                    {result.phrasing_options_en[idx] && (
                      <p className="text-xs text-[#C4B5A5] border-t border-[#F3EFEA] pt-2" dir="ltr">
                        {result.phrasing_options_en[idx]}
                      </p>
                    )}
                    <button
                      onClick={() => handleCopy(phrase, idx)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-[#C8956B] hover:text-[#A07050] transition-colors"
                    >
                      {copiedIdx === idx ? (
                        <><Check size={13} /> הועתק!</>
                      ) : (
                        <><Copy size={13} /> העתק ניסוח</>
                      )}
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Avoid phrases */}
              {result.avoid_phrases?.length > 0 && (
                <div className="bg-white rounded-2xl border border-[#F3EFEA] p-5 space-y-2" dir="rtl">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#8C7E6E]">כדאי להימנע מ</p>
                  <ul className="space-y-1">
                    {result.avoid_phrases.map((phrase, i) => (
                      <li key={i} className="text-sm text-[#C4B5A5] flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-[#F7F2EE] flex items-center justify-center text-[10px] text-[#8C7E6E] shrink-0">✕</span>
                        {phrase}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Try again */}
              <Button
                variant="ghost"
                className="w-full h-12 rounded-2xl border border-[#E8E0D8] text-[#6B5E52] font-semibold flex items-center justify-center gap-2"
                onClick={handleGenerate}
                disabled={loading}
              >
                <RefreshCw size={14} />
                נסח אפשרויות שונות
              </Button>

              {/* Draft-only disclaimer */}
              <p className="text-center text-xs text-[#C4B5A5] leading-relaxed pb-4">
                כל האפשרויות הן <strong>טיוטות בלבד</strong>. את/ה בוחר/ת מה להשתמש ומה לשנות.
                הבינה המלאכותית אינה שולחת כלום בשמך.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
