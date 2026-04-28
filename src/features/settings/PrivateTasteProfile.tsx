import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Sparkles, RefreshCw, Info, Edit2, Check, X, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/context/AppContext';
import { aiService } from '@/services/aiService';

export const PrivateTasteProfile: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { tasteProfile, setTasteProfile, resetTasteProfile, interactions, trackEvent, user } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(tasteProfile);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      trackEvent('private_taste_profile_viewed', { userId: user.id });
    }
  }, [user, trackEvent]);

  const handleReset = () => {
    resetTasteProfile();
    setEditedProfile({
      hard_dealbreakers: [],
      soft_preferences: [],
      things_to_avoid: [],
      weights: {
        attraction_weight: 0.5,
        stability_weight: 0.5,
        pacing_weight: 0.5
      },
      explanation: ""
    });
    setShowResetConfirm(false);
  };

  const handleSave = () => {
    setTasteProfile(editedProfile);
    setIsEditing(false);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const newProfile = await aiService.analyzeTasteProfile(interactions, tasteProfile);
      if (newProfile) {
        setTasteProfile(newProfile);
        setEditedProfile(newProfile);
      }
    } catch (error) {
      console.error("Taste profile analysis error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderListEditor = (title: string, key: keyof typeof tasteProfile) => {
    const items = isEditing ? editedProfile[key] : tasteProfile[key];
    const [addingNew, setAddingNew] = useState(false);
    const [newItemText, setNewItemText] = useState('');
    
    return (
      <div className="space-y-3">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">{title}</h4>
        <div className="flex flex-wrap gap-2 items-center">
          {items.map((item: string, i: number) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#F3EFEA] rounded-full text-xs font-medium text-[#2D2926]">
              <span>{item}</span>
              {isEditing && (
                <button 
                  onClick={() => {
                    const newItems = [...items];
                    newItems.splice(i, 1);
                    setEditedProfile({ ...editedProfile, [key]: newItems });
                  }}
                  className="text-[#8C7E6E] hover:text-red-500"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
          {isEditing && !addingNew && (
            <button 
              onClick={() => setAddingNew(true)}
              className="px-3 py-1.5 bg-[#F7F2EE] border border-dashed border-[#D4AF37]/50 rounded-full text-xs font-medium text-[#D4AF37] hover:bg-[#D4AF37]/10"
            >
              + Add
            </button>
          )}
          {isEditing && addingNew && (
            <div className="flex items-center gap-2">
              <input 
                type="text"
                autoFocus
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newItemText.trim()) {
                    setEditedProfile({ ...editedProfile, [key]: [...items, newItemText.trim()] });
                    setNewItemText('');
                    setAddingNew(false);
                  } else if (e.key === 'Escape') {
                    setAddingNew(false);
                  }
                }}
                onBlur={() => {
                  if (newItemText.trim()) {
                    setEditedProfile({ ...editedProfile, [key]: [...items, newItemText.trim()] });
                  }
                  setNewItemText('');
                  setAddingNew(false);
                }}
                className="px-3 py-1 bg-white border border-[#D4AF37] rounded-full text-xs font-medium text-[#2D2926] focus:outline-none w-32"
                placeholder="Type and enter..."
              />
            </div>
          )}
          {!isEditing && items.length === 0 && (
            <span className="text-xs text-[#8C7E6E] italic">None learned yet.</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#FDFCFB]">
      <header className="px-6 py-4 flex items-center justify-between border-b border-[#F3EFEA]">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-[#F7F2EE] rounded-full transition-all">
            <ChevronLeft size={20} className="text-[#2D2926]" />
          </button>
          <div className="space-y-0.5">
            <h2 className="text-xl font-serif italic text-[#2D2926]">Private Taste Profile</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">AI-Powered Preferences</p>
          </div>
        </div>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} className="p-2 hover:bg-[#F7F2EE] rounded-full transition-all text-[#D4AF37]">
            <Edit2 size={18} />
          </button>
        ) : (
          <button onClick={handleSave} className="p-2 hover:bg-[#F7F2EE] rounded-full transition-all text-emerald-600">
            <Check size={18} />
          </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8 pb-24">
        <section className="p-6 bg-[#2D2926] rounded-[32px] text-white space-y-4 relative overflow-hidden">
          <div className="flex items-center gap-2 text-[#D4AF37] relative z-10">
            <Shield size={18} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Strictly Private</span>
          </div>
          <h3 className="text-lg font-serif italic leading-snug relative z-10">Your taste, your control.</h3>
          <p className="text-sm text-white/60 leading-relaxed italic relative z-10">
            This profile is built securely from your interactions to improve your daily picks. It is never shared with other users. You can edit or reset it at any time.
          </p>
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 blur-3xl -mr-16 -mt-16" />
        </section>

        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-serif italic text-[#2D2926]">Learned Preferences</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleAnalyze}
              disabled={isAnalyzing || isEditing || (interactions.likes.length === 0 && interactions.passes.length === 0 && interactions.moreLikeThis.length === 0 && interactions.lessLikeThis.length === 0)}
              className="text-[#D4AF37] hover:text-[#B8962E] hover:bg-[#D4AF37]/5 rounded-full gap-2 font-bold uppercase tracking-[0.1em] text-[10px]"
            >
              {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              Refresh from Activity
            </Button>
          </div>

          {tasteProfile.explanation && !isEditing && (
            <div className="p-4 bg-[#F7F2EE] border border-[#F3EFEA] rounded-[24px] flex gap-3 items-start">
              <Info size={16} className="text-[#D4AF37] shrink-0 mt-0.5" />
              <p className="text-xs text-[#8C7E6E] leading-relaxed italic">
                {tasteProfile.explanation}
              </p>
            </div>
          )}

          <div className="p-6 bg-white border border-[#F3EFEA] rounded-[32px] space-y-6 shadow-sm">
            {renderListEditor("Soft Preferences", "soft_preferences")}
            {renderListEditor("Things to Avoid", "things_to_avoid")}
            {renderListEditor("Hard Dealbreakers", "hard_dealbreakers")}
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-lg font-serif italic text-[#2D2926]">Balancing Weights</h3>
          <div className="p-6 bg-white border border-[#F3EFEA] rounded-[32px] space-y-6 shadow-sm">
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold text-[#2D2926]">
                <span>Attraction</span>
                <span>Stability</span>
              </div>
              <input 
                type="range" 
                min="0" max="1" step="0.1" 
                disabled={!isEditing}
                value={isEditing ? editedProfile.weights.attraction_weight : tasteProfile.weights.attraction_weight}
                onChange={(e) => setEditedProfile({
                  ...editedProfile,
                  weights: { ...editedProfile.weights, attraction_weight: parseFloat(e.target.value) }
                })}
                className="w-full accent-[#D4AF37]"
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold text-[#2D2926]">
                <span>Fast Paced</span>
                <span>Slow Paced</span>
              </div>
              <input 
                type="range" 
                min="0" max="1" step="0.1" 
                disabled={!isEditing}
                value={isEditing ? editedProfile.weights.pacing_weight : tasteProfile.weights.pacing_weight}
                onChange={(e) => setEditedProfile({
                  ...editedProfile,
                  weights: { ...editedProfile.weights, pacing_weight: parseFloat(e.target.value) }
                })}
                className="w-full accent-[#D4AF37]"
              />
            </div>
          </div>
        </section>

        <section className="pt-4">
          <button 
            onClick={() => setShowResetConfirm(true)}
            className="w-full p-4 flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 rounded-[24px] transition-all font-bold text-sm"
          >
            <RefreshCw size={16} />
            Reset Taste Learning
          </button>
        </section>
      </div>

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
                <h3 className="text-xl font-serif italic text-[#2D2926]">Reset Taste Learning?</h3>
                <p className="text-sm text-[#8C7E6E] leading-relaxed">
                  Are you sure you want to reset your taste learning? This will clear your private preference model.
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
    </div>
  );
};
