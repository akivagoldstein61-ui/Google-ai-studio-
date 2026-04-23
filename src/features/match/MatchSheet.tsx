import React, { useState, useEffect } from "react";
import { Profile } from "@/types";
import { motion, AnimatePresence } from "motion/react";
import {
  Heart,
  MessageCircle,
  X,
  Sparkles,
  ShieldCheck,
  Loader2,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { aiService } from "@/services/aiService";
import { useApp } from "@/context/AppContext";
import { DatePlannerModal } from "./DatePlannerModal";

export const MatchSheet: React.FC<{
  profile: Profile;
  onClose: () => void;
  onMessage: () => void;
}> = ({ profile, onClose, onMessage }) => {
  const { user } = useApp();
  const [matchExplanation, setMatchExplanation] = useState<any>(null);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [showDatePlanner, setShowDatePlanner] = useState(false);

  useEffect(() => {
    const fetchExplanation = async () => {
      if (!user) return;
      setIsLoadingExplanation(true);
      try {
        const explanation = await aiService.explainMatch({
          user_profile: {
            age: user.age,
            city: user.city,
            observance: user.observance,
            intent: user.intent,
            tags: user.tags,
          },
          candidate_profile: {
            age: profile.age,
            city: profile.city,
            observance: profile.observance,
            intent: profile.intent,
            tags: profile.tags,
          },
          signals: ["Shared values", "Similar observance level", "Proximity"],
        });
        setMatchExplanation(explanation);
      } catch (error) {
        console.error("Failed to fetch match explanation", error);
      } finally {
        setIsLoadingExplanation(false);
      }
    };

    fetchExplanation();
  }, [user, profile]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-[#2D2926]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-8 text-center overflow-y-auto"
      >
      <button
        onClick={onClose}
        className="absolute top-14 right-8 p-3 bg-white/10 backdrop-blur-xl rounded-full text-white border border-white/20 hover:bg-white/20 transition-all"
      >
        <X size={24} />
      </button>

      <div className="space-y-12 w-full max-w-sm my-auto py-12">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
          className="relative"
        >
          <div className="flex justify-center -space-x-8">
            <div className="w-32 h-32 rounded-full border-4 border-[#D4AF37] overflow-hidden shadow-2xl shadow-black/20 rotate-[-6deg]">
              <img
                src={
                  user?.photos?.[0] || "https://picsum.photos/seed/user/600/800"
                }
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="w-32 h-32 rounded-full border-4 border-[#D4AF37] overflow-hidden shadow-2xl shadow-black/20 rotate-[6deg]">
              <img
                src={profile.photos?.[0]}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#D4AF37] rounded-full flex items-center justify-center text-white shadow-xl shadow-[#D4AF37]/40">
            <Heart size={32} fill="currentColor" />
          </div>
        </motion.div>

        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.4em] text-[#D4AF37]">
            <Sparkles size={16} />
            <span>It's a connection</span>
          </div>
          <h2 className="text-5xl font-serif italic text-white leading-tight">
            You and {profile.displayName}
          </h2>
          <p className="text-white/60 text-lg leading-relaxed italic max-w-[280px] mx-auto">
            A connection based on shared values and serious intent.
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[40px] space-y-6 text-left">
          <div className="flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-widest text-[#D4AF37] mb-2">
            <ShieldCheck size={14} />
            <span>Why This Match</span>
          </div>

          {isLoadingExplanation ? (
            <div className="flex justify-center py-4">
              <Loader2 size={24} className="animate-spin text-[#D4AF37]" />
            </div>
          ) : matchExplanation ? (
            <div className="space-y-6">
              <ul className="space-y-3">
                {matchExplanation.reasons_he?.map(
                  (reason: string, i: number) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-sm text-white/90 leading-relaxed font-serif italic"
                    >
                      <span className="text-[#D4AF37] mt-1">•</span>
                      <span>{reason}</span>
                    </li>
                  ),
                )}
              </ul>

              <div className="pt-4 border-t border-white/10 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                  Suggested Opener
                </p>
                <p className="text-sm text-[#D4AF37] italic font-serif">
                  "{matchExplanation.first_question_he}"
                </p>
              </div>

              {matchExplanation.gentle_clarification_he && (
                <div className="pt-4 border-t border-white/10 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                    Keep in mind
                  </p>
                  <p className="text-xs text-white/60 italic leading-relaxed">
                    {matchExplanation.gentle_clarification_he}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-white/80 leading-relaxed italic font-serif text-center">
              "You both prioritize {profile.tags?.[0]?.toLowerCase() || 'similar values'} and have
              verified your identities. A great foundation for a first
              conversation."
            </p>
          )}
        </div>

        <div className="space-y-4 pt-4">
          <Button
            onClick={onMessage}
            className="w-full h-16 text-lg font-bold rounded-[24px] bg-white text-[#2D2926] hover:bg-[#F7F2EE] shadow-xl shadow-black/20 transition-all active:scale-[0.98] gap-3"
          >
            <MessageCircle size={24} />
            Send a message
          </Button>
          <Button
            onClick={() => setShowDatePlanner(true)}
            className="w-full h-16 text-lg font-bold rounded-[24px] bg-[#D4AF37] text-[#2D2926] hover:bg-[#B8962E] shadow-xl shadow-black/20 transition-all active:scale-[0.98] gap-3"
          >
            <Calendar size={24} />
            Plan a Date
          </Button>
          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full h-16 text-lg text-white/60 hover:text-white hover:bg-white/5 rounded-[24px] transition-all"
          >
            Keep exploring
          </Button>
        </div>
      </div>
      </motion.div>

      <AnimatePresence>
        {showDatePlanner && (
          <DatePlannerModal
            onClose={() => setShowDatePlanner(false)}
            partnerName={profile.displayName}
          />
        )}
      </AnimatePresence>
    </>
  );
};
