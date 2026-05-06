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
import { CompatibilityReflectionPanel } from "./CompatibilityReflectionPanel";
import { ShareCardModal } from "./ShareCardModal";
import { Share2, Users } from "lucide-react";

const SIGNAL_LABELS: Record<string, string> = {
  visible_values: "Shared values",
  visible_intent: "Visible intent",
  visible_observance: "Visible observance",
  visible_lifestyle: "Visible lifestyle",
  visible_interests: "Visible interests",
  visible_prompts: "Profile prompts",
  self_declared_profile_fields: "Public profile fields",
  private_taste_profile: "Private taste",
  hidden_dealbreakers: "Hidden dealbreakers",
  hidden_ranking_signals: "Hidden ranking",
  raw_personality_scores: "Raw personality scores",
  private_messages: "Private messages",
  exact_location: "Exact location",
  protected_trait_inference: "Sensitive inferences",
};

const labelSignal = (signal: string) => SIGNAL_LABELS[signal] || signal;

export const MatchSheet: React.FC<{
  profile: Profile;
  onClose: () => void;
  onMessage: () => void;
}> = ({ profile, onClose, onMessage }) => {
  const { user } = useApp();
  const [matchExplanation, setMatchExplanation] = useState<any>(null);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [showDatePlanner, setShowDatePlanner] = useState(false);
  const [showReflectionPanel, setShowReflectionPanel] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);

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
            prompts: user.prompts,
          },
          candidate_profile: {
            age: profile.age,
            city: profile.city,
            observance: profile.observance,
            intent: profile.intent,
            tags: profile.tags,
            prompts: profile.prompts,
          },
          signals: [
            "visible_values",
            "visible_intent",
            "visible_observance",
            "visible_interests",
            "visible_prompts",
          ],
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

              {matchExplanation.uncertainty_he && (
                <div className="pt-4 border-t border-white/10 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                    Note
                  </p>
                  <p className="text-xs text-white/60 italic leading-relaxed">
                    {matchExplanation.uncertainty_he}
                  </p>
                </div>
              )}

              {(matchExplanation.signals_used?.length > 0 ||
                matchExplanation.signals_not_used?.length > 0) && (
                <div className="pt-4 border-t border-white/10 space-y-3">
                  {matchExplanation.signals_used?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                        Used
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {matchExplanation.signals_used.map((signal: string) => (
                          <span
                            key={signal}
                            className="px-2 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/25 text-[10px] font-bold text-[#D4AF37]"
                          >
                            {labelSignal(signal)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {matchExplanation.signals_not_used?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                        Not Used
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {matchExplanation.signals_not_used.map((signal: string) => (
                          <span
                            key={signal}
                            className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/55"
                          >
                            {labelSignal(signal)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-white/80 leading-relaxed italic font-serif text-center">
              "You both prioritize {profile.tags?.[0]?.toLowerCase() || 'similar values'} and have
              visible profile details that can be a useful start for a first
              conversation. Private taste and hidden ranking signals are not used here."
            </p>
          )}
        </div>

        <div className="space-y-4 pt-4">
          {showReflectionPanel && user && (
            <CompatibilityReflectionPanel
              user={user}
              candidate={profile}
              bothOptedIn={true}
            />
          )}

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
          {!showReflectionPanel && (
            <Button
              onClick={() => setShowReflectionPanel(true)}
              variant="outline"
              className="w-full h-14 text-base font-bold rounded-[24px] border-white/20 bg-white/5 text-white hover:bg-white/10 transition-all gap-3"
            >
              <Users size={20} />
              Reflect together
            </Button>
          )}
          <Button
            onClick={() => setShowShareCard(true)}
            variant="outline"
            className="w-full h-14 text-base font-bold rounded-[24px] border-white/20 bg-white/5 text-white hover:bg-white/10 transition-all gap-3"
          >
            <Share2 size={20} />
            Share a personality card
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
        {showShareCard && (
          <ShareCardModal
            candidate={profile}
            payload={{
              summary_he: matchExplanation?.uncertainty_he,
              strengths_he: matchExplanation?.reasons_he,
              communication_notes_he: matchExplanation?.gentle_clarification_he,
            }}
            onClose={() => setShowShareCard(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};
