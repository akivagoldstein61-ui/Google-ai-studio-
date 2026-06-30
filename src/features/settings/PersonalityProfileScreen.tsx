import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Brain, Sparkles, Heart, ShieldAlert, MessageCircle, Activity, Loader2, Trash2, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/context/AppContext';
import { trustService } from '@/services/trustService';
import {
  buildPrivatePersonalityProfileSummary,
  buildPersonalityExport,
  scoreKesherPersonalityAssessment,
  type PersonalityAssessmentReport,
} from '@/personality/scoring';

export const PersonalityProfileScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { user, trackEvent } = useApp();
  const [profile, setProfile] = useState<PersonalityAssessmentReport | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const storedReport = user.personalityScores as unknown as PersonalityAssessmentReport | undefined;
        if (storedReport?.domains) {
          setProfile(storedReport);
          trackEvent('personality_profile_viewed', { userId: user.id, reportStatus: storedReport.is_partial ? 'partial' : 'complete' });
          return;
        }

        setProfile(scoreKesherPersonalityAssessment({}));
        trackEvent('personality_profile_viewed', { userId: user.id, fallback: true });
      } catch (error) {
        console.error("Failed to fetch personality profile", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, trackEvent]);

  const handleReset = async () => {
    if (!user) return;
    try {
      await trustService.resetPersonalityAssessment(user.uid);
      console.log("Assessment reset requested");
      setShowResetConfirm(false);
      // In production, navigate to assessment screen
      onBack(); // For now, just go back
    } catch (error) {
      console.error("Failed to reset assessment", error);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    try {
      await trustService.deletePersonalityData(user.uid);
      console.log("Personality data deletion requested");
      setShowDeleteConfirm(false);
      onBack();
    } catch (error) {
      console.error("Failed to delete personality data", error);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col bg-[#FDFCFB] items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-[#D4AF37]" size={32} />
        <p className="text-[#8C7E6E] italic font-serif">Loading your private profile...</p>
      </div>
    );
  }

  if (!profile) return null;

  const profileSummary = buildPrivatePersonalityProfileSummary(profile);
  const answeredAspects = profile.aspects.filter((aspect) => aspect.item_count > 0);
  const sortedAnsweredAspects = [...answeredAspects].sort((left, right) => right.score - left.score);
  const strongestAspect = sortedAnsweredAspects[0] ?? profile.aspects[0];
  const gentlestAspect = sortedAnsweredAspects[sortedAnsweredAspects.length - 1] ?? profile.aspects[1];

  return (
    <div className="h-full flex flex-col bg-[#FDFCFB] relative">
      <header className="px-6 py-4 flex items-center gap-4 border-b border-[#F3EFEA] sticky top-0 bg-[#FDFCFB] z-10">
        <button onClick={onBack} className="p-2 hover:bg-[#F7F2EE] rounded-full transition-all">
          <ChevronLeft size={20} className="text-[#2D2926]" />
        </button>
        <div className="space-y-0.5">
          <h2 className="text-xl font-serif italic text-[#2D2926]">Personality Profile</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">Private & Editable</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-10 pb-24" dir="rtl">
        {/* Intro Section */}
        <section className="space-y-4">
          <div className="p-6 bg-[#2D2926] rounded-[32px] text-white space-y-4">
            <div className="flex items-center gap-2 text-[#D4AF37]">
              <Brain size={18} />
              <span className="text-[10px] font-bold uppercase tracking-widest">הפרופיל שלך</span>
            </div>
            <p className="text-sm text-white/90 leading-relaxed italic font-hebrew">
              {profileSummary.summary_he}
            </p>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-white/70" dir="ltr">
              <span className="rounded-full border border-white/10 px-3 py-2">complete: {profile.completion.percent}%</span>
              <span className="rounded-full border border-white/10 px-3 py-2">status: {profileSummary.report_status}</span>
              <span className="rounded-full border border-white/10 px-3 py-2">AI scoring: no</span>
              <span className="rounded-full border border-white/10 px-3 py-2">raw answers: not exported</span>
            </div>
            <p className="text-[10px] text-white/50 uppercase tracking-widest" dir="ltr">
              {profile.instrument_version} • {profile.score_version} • item source: {profile.item_text_source}
            </p>
          </div>
        </section>

        {/* Strengths & Friction */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 bg-green-50 rounded-[32px] border border-green-100 space-y-4">
            <div className="flex items-center gap-2 text-green-700">
              <Heart size={18} />
              <span className="text-[10px] font-bold uppercase tracking-widest">עוגן לשים לב אליו</span>
            </div>
            <h4 className="font-bold text-sm text-green-950 font-hebrew">{strongestAspect.label_he}</h4>
            <p className="text-sm text-green-900 leading-relaxed font-hebrew">
              {strongestAspect.description_he}
            </p>
          </div>
          <div className="p-6 bg-amber-50 rounded-[32px] border border-amber-100 space-y-4">
            <div className="flex items-center gap-2 text-amber-700">
              <ShieldAlert size={18} />
              <span className="text-[10px] font-bold uppercase tracking-widest">שאלה עדינה להמשך</span>
            </div>
            <h4 className="font-bold text-sm text-amber-950 font-hebrew">{gentlestAspect.label_he}</h4>
            <p className="text-sm text-amber-900 leading-relaxed font-hebrew">
              {gentlestAspect.reflection_prompt_he}
            </p>
          </div>
        </section>

        {/* Domains */}
        <section className="space-y-4">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E] px-2">תכונות ליבה</h4>
          <div className="space-y-3">
            {profile.domains.map((domain) => (
              <div key={domain.id} className="p-4 bg-white border border-[#F3EFEA] rounded-2xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-[#2D2926] font-hebrew">{domain.label_he}</span>
                  <span className="text-xs text-[#8C7E6E] font-mono" dir="ltr">{domain.band}</span>
                </div>
                <div className="w-full h-1.5 bg-[#F7F2EE] rounded-full overflow-hidden" dir="ltr">
                  <div 
                    className="h-full bg-[#D4AF37] rounded-full" 
                    style={{ width: `${domain.score}%` }}
                  />
                </div>
                <p className="text-xs text-[#8C7E6E] leading-relaxed pt-1 font-hebrew">
                  {domain.dating_note_he}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">היבטי עומק</h4>
            <span className="text-[10px] text-[#8C7E6E]" dir="ltr">{answeredAspects.length}/{profile.aspects.length} answered</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {profile.aspects.map((aspect) => (
              <div key={aspect.id} className="p-4 bg-white border border-[#F3EFEA] rounded-2xl space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h5 className="font-bold text-sm text-[#2D2926] font-hebrew">{aspect.label_he}</h5>
                    <p className="text-[10px] text-[#8C7E6E]" dir="ltr">{aspect.label_en}</p>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-[#8C7E6E]">{aspect.band}</span>
                </div>
                <p className="text-xs text-[#8C7E6E] leading-relaxed font-hebrew">{aspect.description_he}</p>
                <p className="text-xs text-[#2D2926] leading-relaxed font-hebrew bg-[#F7F2EE] rounded-xl p-3">
                  {aspect.reflection_prompt_he}
                </p>
              </div>
            ))}
          </div>
        </section>
        
        <div className="pt-4 text-center">
          <p className="text-[10px] text-[#8C7E6E] italic max-w-xs mx-auto font-hebrew">
            {profile.next_step_he} פרופיל זה פרטי וגלוי רק לך. הוא לא מציג ציוני תכונה גולמיים לציבור ולא יוצר דירוג התאמה נסתר.
          </p>
        </div>

        {/* Privacy & Data Controls */}
        <section className="space-y-4 pt-8 border-t border-[#F3EFEA]" dir="ltr">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E] px-2 text-center">Privacy & Data Controls</h4>
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full h-14 border-[#F3EFEA] text-[#2D2926] font-bold rounded-full flex items-center justify-center gap-2"
              onClick={() => {
                const exportPayload = buildPersonalityExport({
                  answers: {},
                  report: profile,
                  cascade: () => {
                    throw new Error('Export does not cascade records.');
                  },
                });
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
                const downloadAnchorNode = document.createElement('a');
                downloadAnchorNode.setAttribute("href", dataStr);
                downloadAnchorNode.setAttribute("download", "kesher_personality_data.json");
                document.body.appendChild(downloadAnchorNode);
                downloadAnchorNode.click();
                downloadAnchorNode.remove();
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              Export Data
            </Button>
            <Button 
              variant="outline" 
              className="w-full h-14 border-[#F3EFEA] text-[#2D2926] font-bold rounded-full flex items-center justify-center gap-2"
              onClick={() => setShowResetConfirm(true)}
            >
              <RefreshCw size={18} />
              Reset Assessment
            </Button>
            <Button 
              variant="ghost" 
              className="w-full h-14 text-red-600 font-bold rounded-full flex items-center justify-center gap-2 hover:bg-red-50"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 size={18} />
              Delete Personality Data
            </Button>
          </div>
        </section>
      </div>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-[#FDFCFB] rounded-[32px] p-6 space-y-6 shadow-2xl"
            >
              <div className="space-y-2 text-center">
                <div className="w-12 h-12 bg-[#F7F2EE] rounded-full flex items-center justify-center mx-auto mb-4 text-[#2D2926]">
                  <RefreshCw size={24} />
                </div>
                <h3 className="text-xl font-serif italic text-[#2D2926]">Reset Assessment?</h3>
                <p className="text-sm text-[#8C7E6E] leading-relaxed">
                  Your current personality profile will be cleared, and you will need to take the assessment again.
                </p>
              </div>
              <div className="space-y-3">
                <Button 
                  className="w-full h-12 bg-[#2D2926] text-white font-bold rounded-full"
                  onClick={handleReset}
                >
                  Yes, Reset
                </Button>
                <Button 
                  variant="ghost"
                  className="w-full h-12 text-[#2D2926] font-bold rounded-full"
                  onClick={() => setShowResetConfirm(false)}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-[#FDFCFB] rounded-[32px] p-6 space-y-6 shadow-2xl"
            >
              <div className="space-y-2 text-center">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                  <Trash2 size={24} />
                </div>
                <h3 className="text-xl font-serif italic text-red-600">Delete Personality Data?</h3>
                <p className="text-sm text-[#8C7E6E] leading-relaxed">
                  This will permanently erase all your personality answers and profile data from our servers. This cannot be undone.
                </p>
              </div>
              <div className="space-y-3">
                <Button 
                  className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full"
                  onClick={handleDelete}
                >
                  Yes, Delete Data
                </Button>
                <Button 
                  variant="ghost"
                  className="w-full h-12 text-[#2D2926] font-bold rounded-full"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
