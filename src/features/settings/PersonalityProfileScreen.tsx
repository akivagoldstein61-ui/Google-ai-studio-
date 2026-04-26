import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Brain, Sparkles, Heart, ShieldAlert, MessageCircle, Activity, Loader2, Trash2, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/context/AppContext';
import { aiService } from '@/services/aiService';
import { trustService } from '@/services/trustService';

export const PersonalityProfileScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { user, trackEvent } = useApp();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const result = await aiService.getPersonalityProfile(user);
        if (result) {
          setProfile(result);
          trackEvent('personality_profile_viewed', { userId: user.id });
        } else {
          // Fallback to deterministic display if AI fails
          const scores = user.personalityScores || {};
          setProfile({
            summary_he: "מערכת הבינה המלאכותית שלנו אינה זמינה כרגע. הנה סיכום בסיסי של התוצאות שלך:",
            implication_card: {
              dating_superpower_he: "לא זמין כרגע. אנא נסה שוב מאוחר יותר.",
              growth_area_he: "לא זמין כרגע. אנא נסה שוב מאוחר יותר.",
              likely_friction_loops_he: [],
              repair_suggestions_he: []
            },
            domains: [
              { domain_name: "פתיחות", percentile: scores['Openness'] ?? 50, description_he: "נקבע על פי התשובות שלך בנושאי אינטלקט ופתיחות לחוויות." },
              { domain_name: "מצפוניות", percentile: scores['Conscientiousness'] ?? 50, description_he: "נקבע על פי התשובות שלך בנושאי סדר וחריצות." },
              { domain_name: "מוחצנות", percentile: scores['Extraversion'] ?? 50, description_he: "נקבע על פי התשובות שלך בנושאי אסרטיביות והתלהבות." },
              { domain_name: "נעימות", percentile: scores['Agreeableness'] ?? 50, description_he: "נקבע על פי התשובות שלך בנושאי נימוס וחמלה." },
              { domain_name: "נוירוטיות", percentile: scores['Neuroticism'] ?? 50, description_he: "נקבע על פי התשובות שלך בנושאי תנודתיות ונסיגה." }
            ]
          });
          trackEvent('personality_profile_viewed', { userId: user.id, fallback: true });
        }
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
        <p className="text-[#8C7E6E] italic font-serif">Generating your private profile...</p>
      </div>
    );
  }

  if (!profile) return null;

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
              {profile.summary_he}
            </p>
          </div>
        </section>

        {/* Strengths & Friction */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 bg-green-50 rounded-[32px] border border-green-100 space-y-4">
            <div className="flex items-center gap-2 text-green-700">
              <Heart size={18} />
              <span className="text-[10px] font-bold uppercase tracking-widest">כוח על</span>
            </div>
            <p className="text-sm text-green-900 leading-relaxed font-hebrew">
              {profile.implication_card?.dating_superpower_he}
            </p>
          </div>
          <div className="p-6 bg-amber-50 rounded-[32px] border border-amber-100 space-y-4">
            <div className="flex items-center gap-2 text-amber-700">
              <ShieldAlert size={18} />
              <span className="text-[10px] font-bold uppercase tracking-widest">נקודת צמיחה</span>
            </div>
            <p className="text-sm text-amber-900 leading-relaxed font-hebrew">
              {profile.implication_card?.growth_area_he}
            </p>
          </div>
        </section>

        {/* Domains */}
        <section className="space-y-4">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E] px-2">תכונות ליבה</h4>
          <div className="space-y-3">
            {profile.domains.map((domain: any, i: number) => (
              <div key={i} className="p-4 bg-white border border-[#F3EFEA] rounded-2xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-[#2D2926] font-hebrew">{domain.domain_name}</span>
                  <span className="text-xs text-[#8C7E6E] font-mono">{domain.percentile}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#F7F2EE] rounded-full overflow-hidden" dir="ltr">
                  <div 
                    className="h-full bg-[#D4AF37] rounded-full" 
                    style={{ width: `${domain.percentile}%` }}
                  />
                </div>
                <p className="text-xs text-[#8C7E6E] leading-relaxed pt-1 font-hebrew">{domain.description_he}</p>
              </div>
            ))}
          </div>
        </section>
        
        <div className="pt-4 text-center">
          <p className="text-[10px] text-[#8C7E6E] italic max-w-xs mx-auto font-hebrew">
            פרופיל זה פרטי וגלוי רק לך. הוא עוזר לקשר להבין את ההעדפות שלך ולספק התאמות טובות יותר.
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
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
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
