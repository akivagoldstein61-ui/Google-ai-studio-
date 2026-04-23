import React, { useState, useEffect } from 'react';
import { Profile } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ShieldCheck, Sparkles, Heart, X, MessageCircle, MapPin, Calendar, Info, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/context/AppContext';
import { aiService } from '@/services/aiService';
import { cn } from '@/lib/utils';
import { SafetyMenu } from '@/features/safety/SafetyMenu';
import { ReportFlow } from '@/features/safety/ReportFlow';

import { trustService } from '@/services/trustService';

export const ProfileDetail: React.FC<{ 
  profile: Profile, 
  onBack: () => void,
  onLike: () => void,
  onPass: () => void
}> = ({ profile, onBack, onLike, onPass }) => {
  const [openers, setOpeners] = useState<any[]>([]);
  const [loadingOpeners, setLoadingOpeners] = useState(false);
  const [showOpeners, setShowOpeners] = useState(false);
  const { user, moreLikeThis, lessLikeThis } = useApp();
  const [explanation, setExplanation] = useState<{ reasons: string[], first_question?: string, gentle_clarification?: string } | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [showSafetyMenu, setShowSafetyMenu] = useState(false);
  const [showReportFlow, setShowReportFlow] = useState(false);

  useEffect(() => {
    if (profile && user) {
      const fetchExplanation = async () => {
        setLoadingExplanation(true);
        try {
          const result = await aiService.explainMatch({
            user_profile: user,
            candidate_profile: profile,
            signals: ['interests', 'intent', 'observance']
          });
          setExplanation(result);
        } catch (error) {
          setExplanation({
            reasons: [`You both share an interest in ${profile.tags.slice(0, 2).join(' and ')}.`]
          });
        } finally {
          setLoadingExplanation(false);
        }
      };
      fetchExplanation();
    }
  }, [profile, user]);

  const fetchOpeners = async () => {
    setLoadingOpeners(true);
    try {
      const suggested = await aiService.generateOpeners(
        profile.displayName, 
        profile.bio, 
        profile.prompts?.[0]?.answer || ''
      );
      setOpeners(suggested);
      setShowOpeners(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingOpeners(false);
    }
  };

  const handleBlock = async () => {
    if (!user) return;
    try {
      await trustService.block(user.id, profile.id);
      alert("This person can no longer contact you. The connection is severed.");
      onBack();
    } catch (error) {
      console.error('Failed to block user', error);
      alert('Failed to block user. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-[#FDFCFB] flex flex-col overflow-hidden">
      <header className="absolute top-0 left-0 right-0 z-50 px-6 pt-14 pb-6 flex items-center justify-between pointer-events-none">
        <button 
          onClick={onBack}
          className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20 pointer-events-auto hover:bg-white/30 transition-all"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex gap-2 pointer-events-auto">
          <button 
            onClick={() => setShowSafetyMenu(true)}
            className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-white/30 transition-all"
          >
            <Info size={24} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        <div className="relative aspect-[3/4] w-full">
          <img 
            src={profile.photos?.[0]} 
            className="w-full h-full object-cover" 
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FDFCFB] via-transparent to-black/20" />
          
          <div className="absolute bottom-10 left-8 right-8 space-y-2">
            <div className="flex items-center gap-3">
              <h2 className="text-4xl font-bold text-[#2D2926]">{profile.displayName}, {profile.age}</h2>
              {profile.isVerified && (
                <div className="bg-[#D4AF37] text-white p-1.5 rounded-full shadow-lg shadow-[#D4AF37]/20">
                  <ShieldCheck size={18} />
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[#8C7E6E] font-medium italic text-sm">
              <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                <MapPin size={14} className="text-[#D4AF37]" />
                <span>{profile.city}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                <Heart size={14} className="text-[#D4AF37]" />
                <span className="capitalize">{profile.intent.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                <Sparkles size={14} className="text-[#D4AF37]" />
                <span className="capitalize">{profile.observance.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-10 space-y-12">
          {/* Why This Match */}
          <section className="bg-[#F7F2EE]/50 border border-[#E5DED5] p-8 rounded-[40px] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
                <Sparkles size={16} />
                <span>Why this match / למה ההתאמה הזו</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => lessLikeThis(profile.id)}
                  className="p-2 hover:bg-white/50 rounded-full transition-all text-[#8C7E6E] hover:text-[#2D2926]"
                  title="Less like this"
                >
                  <X size={14} />
                </button>
                <button 
                  onClick={() => moreLikeThis(profile.id)}
                  className="p-2 hover:bg-white/50 rounded-full transition-all text-[#8C7E6E] hover:text-[#2D2926]"
                  title="More like this"
                >
                  <Heart size={14} />
                </button>
              </div>
            </div>
            
            <div className={cn(
              "space-y-3 transition-opacity duration-300",
              loadingExplanation ? "opacity-50" : "opacity-100"
            )}>
              {explanation ? (
                <>
                  <ul className="space-y-2">
                    {explanation.reasons?.map((reason, i) => (
                      <li key={i} className="text-lg text-[#2D2926] leading-relaxed italic font-serif flex gap-3">
                        <span className="text-[#D4AF37]">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                  {explanation.first_question && (
                    <div className="pt-4 mt-4 border-t border-[#E5DED5]">
                      <p className="text-sm text-[#8C7E6E] italic">
                        <span className="font-bold text-[#2D2926] not-italic">Icebreaker:</span> {explanation.first_question}
                      </p>
                    </div>
                  )}
                  {explanation.gentle_clarification && (
                    <div className="pt-2 mt-2">
                      <p className="text-xs text-[#8C7E6E] italic opacity-80">
                        <span className="font-bold text-[#2D2926] not-italic">Note:</span> {explanation.gentle_clarification}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-lg text-[#2D2926] leading-relaxed italic font-serif">
                  Analyzing values alignment...
                </p>
              )}
            </div>
            <div className="pt-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-[#8C7E6E]">
                <Sparkles size={12} />
                <span>AI Draft • Human Control</span>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#D4AF37]">
                Based on your settings
              </span>
            </div>
          </section>

          {/* Bio */}
          <section className="space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#8C7E6E]">About</h3>
            <p className="text-xl text-[#2D2926] leading-relaxed italic font-serif">{profile.bio}</p>
          </section>

          {/* Prompts */}
          <div className="space-y-8">
            {profile.prompts.map(prompt => (
              <section key={prompt.id} className="p-8 bg-white border border-[#F3EFEA] rounded-[40px] space-y-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8C7E6E]">{prompt.question}</h4>
                </div>
                <p className="text-2xl font-bold text-[#2D2926] leading-tight italic font-serif">{prompt.answer}</p>
              </section>
            ))}
          </div>

          {/* Tags */}
          <section className="flex flex-wrap gap-3">
            {profile.tags?.map((tag, i) => (
              <span key={`${tag}-${i}`} className="px-5 py-2.5 bg-[#F7F2EE] text-[#8C7E6E] rounded-full text-[11px] font-bold uppercase tracking-widest border border-[#E5DED5]">
                {tag}
              </span>
            ))}
          </section>
        </div>
      </div>

      {/* Action Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#FDFCFB] via-[#FDFCFB] to-transparent flex items-center justify-center gap-6">
        <button 
          onClick={onPass}
          className="w-20 h-20 bg-white border border-[#F3EFEA] rounded-full flex items-center justify-center text-[#8C7E6E] shadow-xl shadow-black/5 hover:bg-[#F7F2EE] transition-all active:scale-90"
        >
          <X size={32} />
        </button>
        
        <Button 
          onClick={fetchOpeners}
          disabled={loadingOpeners}
          className="flex-1 h-20 rounded-full bg-[#2D2926] text-white font-bold text-lg gap-3 shadow-2xl shadow-black/20 hover:bg-[#1A1816] transition-all active:scale-[0.98]"
        >
          {loadingOpeners ? <Loader2 className="animate-spin" /> : <MessageCircle size={24} />}
          {loadingOpeners ? 'Thinking...' : 'Say Shalom'}
        </Button>

        <button 
          onClick={onLike}
          className="w-20 h-20 bg-[#D4AF37] rounded-full flex items-center justify-center text-white shadow-xl shadow-[#D4AF37]/20 hover:bg-[#B8962E] transition-all active:scale-90"
        >
          <Heart size={32} fill="currentColor" />
        </button>
      </div>

      {/* AI Openers Drawer */}
      <AnimatePresence>
        {showOpeners && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-end"
            onClick={() => setShowOpeners(false)}
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full bg-[#FDFCFB] rounded-t-[48px] p-10 space-y-10"
              onClick={e => e.stopPropagation()}
            >
              <header className="flex justify-between items-center">
                <div className="space-y-1">
                  <h3 className="text-2xl font-serif italic text-[#2D2926]">Break the Ice</h3>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
                    <Sparkles size={14} />
                    <span>AI-assisted openers</span>
                  </div>
                </div>
                <button onClick={() => setShowOpeners(false)} className="p-2 hover:bg-[#F7F2EE] rounded-full transition-all">
                  <X size={24} className="text-[#2D2926]" />
                </button>
              </header>

              <div className="space-y-4">
                {openers.map((opener, i) => (
                  <button 
                    key={i}
                    onClick={() => { onLike(); setShowOpeners(false); }}
                    className="w-full p-6 text-right bg-white border border-[#F3EFEA] rounded-[32px] hover:border-[#D4AF37] transition-all shadow-sm group relative overflow-hidden flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className="text-xs text-[#8C7E6E] font-sans text-left max-w-[40%]">{opener.text_en}</span>
                      <span className="text-lg text-[#2D2926] leading-relaxed font-hebrew font-medium text-right flex-1">{opener.text_he}</span>
                    </div>
                    {opener.rationale && (
                      <div className="mt-2 pt-3 border-t border-[#F3EFEA]/50 w-full text-right">
                        <span className="text-[10px] text-[#8C7E6E] italic font-serif">{opener.rationale}</span>
                      </div>
                    )}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/5 blur-3xl -mr-12 -mt-12 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>

              <p className="text-center text-[10px] text-[#8C7E6E] font-bold uppercase tracking-[0.3em]">Respectful • Sincere • Intentional</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <SafetyMenu
        isOpen={showSafetyMenu}
        onClose={() => setShowSafetyMenu(false)}
        onReport={() => setShowReportFlow(true)}
        onBlock={handleBlock}
        targetName={profile.displayName}
      />

      <ReportFlow
        isOpen={showReportFlow}
        onClose={() => setShowReportFlow(false)}
        targetName={profile.displayName}
        reporterId={user?.id}
        targetId={profile.id}
      />
    </div>
  );
};
