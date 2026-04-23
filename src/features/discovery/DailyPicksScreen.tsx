import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Profile } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, X, Info, Sparkles, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { aiService } from '@/services/aiService';

export const DailyPicksScreen: React.FC<{ 
  onSelect: (profile: Profile) => void,
  onMatch: (profile: Profile) => void
}> = ({ onSelect, onMatch }) => {
  const { dailyPicks, likeProfile, passProfile, moreLikeThis, lessLikeThis, user, trackEvent } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [explanation, setExplanation] = useState<{ reasons_he: string[], first_question_he: string, gentle_clarification_he?: string } | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [introData, setIntroData] = useState<{ headline_en: string, headline_he: string, body_en: string, body_he: string } | null>(null);
  const [loadingIntro, setLoadingIntro] = useState(false);
  const [introAttempted, setIntroAttempted] = useState(false);
  const [pacingData, setPacingData] = useState<{ message_he: string, reflection_prompt_he: string } | null>(null);
  const [pacingAttempted, setPacingAttempted] = useState(false);

  useEffect(() => {
    if (currentIndex >= dailyPicks.length && !pacingData && !pacingAttempted) {
      const fetchPacing = async () => {
        setPacingAttempted(true);
        try {
          const result = await aiService.getPacingIntervention(10, 5); // Mock session length and velocity
          if (result) {
            setPacingData(result);
          }
        } catch (error) {
          console.error("Failed to fetch pacing intervention", error);
        }
      };
      fetchPacing();
    }
  }, [currentIndex, dailyPicks.length, pacingData, pacingAttempted]);

  useEffect(() => {
    if (showIntro && user && !introData && !loadingIntro && !introAttempted) {
      const fetchIntro = async () => {
        setLoadingIntro(true);
        setIntroAttempted(true);
        try {
          const result = await aiService.generateDailyPicksIntro(user);
          if (result) {
            setIntroData(result);
          }
          trackEvent('daily_picks_intro_seen', { userId: user.id });
        } catch (error) {
          console.error("Failed to generate intro", error);
        } finally {
          setLoadingIntro(false);
        }
      };
      fetchIntro();
    }
  }, [showIntro, user, introData, loadingIntro, trackEvent, introAttempted]);

  const currentProfile = dailyPicks[currentIndex];

  useEffect(() => {
    if (!showIntro && currentProfile && user) {
      const fetchExplanation = async () => {
        setLoadingExplanation(true);
        try {
          const result = await aiService.explainMatch({ user_profile: user, candidate_profile: currentProfile, signals: [] });
          if (result) {
            setExplanation(result);
          } else {
            setExplanation({
              reasons_he: [`אתם חולקים תחומי עניין כמו ${currentProfile.tags.slice(0, 2).join(' ו-')}.`],
              first_question_he: "מה אתה אוהב לעשות בסופי שבוע?"
            });
          }
        } catch (error) {
          setExplanation({
            reasons_he: [`אתם חולקים תחומי עניין כמו ${currentProfile.tags.slice(0, 2).join(' ו-')}.`],
            first_question_he: "מה אתה אוהב לעשות בסופי שבוע?"
          });
        } finally {
          setLoadingExplanation(false);
        }
      };
      fetchExplanation();
    }
  }, [currentIndex, currentProfile, user, showIntro]);

  const handleLike = async () => {
    if (!currentProfile) return;
    setDirection(1);
    const isMatch = await likeProfile(currentProfile.id);
    if (isMatch) {
      onMatch(currentProfile);
    }
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setDirection(0);
      setExplanation(null);
    }, 300);
  };

  const handlePass = () => {
    if (!currentProfile) return;
    setDirection(-1);
    passProfile(currentProfile.id);
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setDirection(0);
      setExplanation(null);
    }, 300);
  };

  const handleMoreLikeThis = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentProfile) moreLikeThis(currentProfile.id);
  };

  const handleLessLikeThis = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentProfile) lessLikeThis(currentProfile.id);
  };

  if (showIntro) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8 text-center space-y-8 bg-[#FDFCFB]">
        <div className="w-20 h-20 bg-[#F7F2EE] text-[#D4AF37] rounded-[32px] flex items-center justify-center shadow-sm">
          <Sparkles size={40} />
        </div>
        <div className={cn(
          "space-y-4 transition-opacity duration-500",
          loadingIntro ? "opacity-50" : "opacity-100"
        )}>
          {introData ? (
            <>
              <h2 className="text-3xl font-serif italic text-[#2D2926]">{introData.headline_en}</h2>
              <p className="text-[#8C7E6E] leading-relaxed italic">
                {introData.body_en}
              </p>
              <p className="text-[#8C7E6E] leading-relaxed italic" dir="rtl">
                {introData.body_he}
              </p>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-serif italic text-[#2D2926]">Daily Picks</h2>
              <p className="text-[#8C7E6E] leading-relaxed italic">
                Today's picks are finite and intentional. We prioritize quality over endless swiping.
              </p>
              <p className="text-[#8C7E6E] leading-relaxed italic" dir="rtl">
                ההצעות של היום הן מדויקות ומוגבלות. אנחנו מעדיפים איכות על פני כמות.
              </p>
            </>
          )}
        </div>
        <div className="space-y-3 w-full max-w-sm">
          <Button 
            onClick={() => setShowIntro(false)}
            className="w-full h-14 text-sm font-bold rounded-full bg-[#2D2926] text-white hover:bg-[#1A1816] shadow-xl shadow-black/10 transition-all uppercase tracking-widest"
          >
            View Today's Picks
          </Button>
          <p className="text-[10px] text-center text-[#8C7E6E] uppercase tracking-widest">
            Adjust preferences in Settings
          </p>
        </div>
        <div className="h-px w-16 bg-[#2D2926] opacity-10" />
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8C7E6E]">Intentional • Finite • Calm</p>
      </div>
    );
  }

  if (currentIndex >= dailyPicks.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8 text-center space-y-8 bg-[#FDFCFB]">
        <div className="w-20 h-20 bg-[#F7F2EE] text-[#D4AF37] rounded-[32px] flex items-center justify-center shadow-sm">
          <ShieldCheck size={40} />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-serif italic text-[#2D2926]">That's all for today</h2>
          <p className="text-[#8C7E6E] leading-relaxed italic">We prioritize quality over quantity. Your next set of curated picks will arrive tomorrow morning.</p>
        </div>
        
        <AnimatePresence>
          {pacingData && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#F7F2EE] p-6 rounded-[32px] space-y-4 border border-[#E5DED5] w-full max-w-sm"
            >
              <div className="flex items-center justify-center gap-2 text-[#D4AF37]">
                <Sparkles size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Mindful Dating</span>
              </div>
              <p className="text-[#2D2926] leading-relaxed italic font-serif" dir="rtl">{pacingData.message_he}</p>
              <div className="h-px w-full bg-[#E5DED5]" />
              <p className="text-[#8C7E6E] text-sm leading-relaxed" dir="rtl">{pacingData.reflection_prompt_he}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="h-px w-16 bg-[#2D2926] opacity-10" />
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8C7E6E]">Intentional • Finite • Calm</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col px-6 py-4 space-y-6 overflow-hidden">
      <header className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-serif italic text-[#2D2926]">Daily Picks</h2>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
            <Sparkles size={12} />
            <span>Curated for you</span>
          </div>
        </div>
        <div className="px-4 py-1.5 bg-[#F7F2EE] rounded-full text-[10px] font-bold text-[#8C7E6E] uppercase tracking-widest">
          {currentIndex + 1} / {dailyPicks.length}
        </div>
      </header>

      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentProfile.id}
            initial={{ opacity: 0, x: direction * 100, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: direction * -100, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 rounded-[40px] overflow-hidden shadow-2xl shadow-black/5 border border-[#F3EFEA] bg-white group"
            onClick={() => onSelect(currentProfile)}
          >
            <img 
              src={currentProfile.photos?.[0]} 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4">
              <div className="flex items-end justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-3xl font-bold text-white">{currentProfile.displayName}, {currentProfile.age}</h3>
                    {currentProfile.isVerified && (
                      <div className="bg-[#D4AF37] text-white p-1 rounded-full">
                        <ShieldCheck size={14} />
                      </div>
                    )}
                  </div>
                  <p className="text-white/80 font-medium italic">{currentProfile.city}</p>
                </div>
                <button className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-white/20 transition-all">
                  <Info size={20} />
                </button>
              </div>

              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[24px] p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-[#D4AF37]">
                      <Sparkles size={12} />
                      <span>Why this match / למה ההתאמה הזו</span>
                    </div>
                    <span className="text-[8px] text-white/50 uppercase tracking-widest">Based on your settings</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleLessLikeThis}
                      className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-white/60 hover:text-white"
                      title="Less like this"
                    >
                      <X size={12} />
                    </button>
                    <button 
                      onClick={handleMoreLikeThis}
                      className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-white/60 hover:text-white"
                      title="More like this"
                    >
                      <Heart size={12} />
                    </button>
                  </div>
                </div>
                <div className={cn(
                  "space-y-2 transition-opacity duration-300",
                  loadingExplanation ? "opacity-50" : "opacity-100"
                )}>
                  {explanation ? (
                    <>
                      <ul className="space-y-1">
                        {explanation.reasons_he?.map((reason, i) => (
                          <li key={`syn-${i}`} className="text-sm text-white/90 leading-relaxed italic font-serif flex gap-2">
                            <span className="text-[#D4AF37]">•</span>
                            <span dir="rtl">{reason}</span>
                          </li>
                        ))}
                      </ul>
                      {explanation.gentle_clarification_he && (
                        <div className="mt-2 border-t border-white/10 pt-2">
                          <p className="text-xs text-white/70 leading-relaxed italic font-serif flex gap-2">
                            <span className="text-amber-500/70">•</span>
                            <span dir="rtl">{explanation.gentle_clarification_he}</span>
                          </p>
                        </div>
                      )}
                      {explanation.first_question_he && (
                        <div className="mt-2 border-t border-white/10 pt-2">
                          <p className="text-xs text-white/90 leading-relaxed font-serif flex gap-2">
                            <span className="text-blue-400/70">?</span>
                            <span dir="rtl" className="font-bold">{explanation.first_question_he}</span>
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-white/90 leading-relaxed italic font-serif">
                      Analyzing values alignment...
                    </p>
                  )}
                </div>
                <div className="pt-1 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-widest text-white/40">
                    <Sparkles size={10} />
                    <span>AI Draft • Human Control</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-center gap-6 pb-4">
        <button 
          onClick={handlePass}
          className="w-20 h-20 bg-white border border-[#F3EFEA] rounded-full flex items-center justify-center text-[#8C7E6E] shadow-lg shadow-black/5 hover:bg-[#F7F2EE] transition-all active:scale-90"
        >
          <X size={32} />
        </button>
        <button 
          onClick={handleLike}
          className="w-20 h-20 bg-[#2D2926] rounded-full flex items-center justify-center text-[#D4AF37] shadow-xl shadow-black/10 hover:bg-[#1A1816] transition-all active:scale-90"
        >
          <Heart size={32} fill="currentColor" />
        </button>
      </div>
    </div>
  );
};
