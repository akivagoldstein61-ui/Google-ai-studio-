import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Shield, Eye, RefreshCw, Info, ChevronLeft, Check, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AI_FEATURE_REGISTRY } from '@/ai/featureRegistry';
import { cn } from '@/lib/utils';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '@/firebase';

import { useApp } from '@/context/AppContext';

export const AITrustHub: React.FC<{ onBack: () => void, onShowTasteProfile?: () => void }> = ({ onBack, onShowTasteProfile }) => {
  const { resetTasteProfile, user } = useApp();
  const [enabledFeatures, setEnabledFeatures] = useState<string[]>(
    AI_FEATURE_REGISTRY.filter(f => f.default_enabled).map(f => f.id)
  );

  useEffect(() => {
    const fetchPreferences = async () => {
      if (user) {
        try {
          const prefDoc = await getDoc(doc(db, `users/${user.uid}/private/preferences`));
          if (prefDoc.exists() && prefDoc.data().enabledFeatures) {
            setEnabledFeatures(prefDoc.data().enabledFeatures);
          }
        } catch (error) {
          console.error("Error fetching AI preferences:", error);
        }
      }
    };
    fetchPreferences();
  }, [user]);

  const toggleFeature = async (id: string) => {
    const newFeatures = enabledFeatures.includes(id) 
      ? enabledFeatures.filter(f => f !== id) 
      : [...enabledFeatures, id];
      
    setEnabledFeatures(newFeatures);
    
    if (user) {
      try {
        await setDoc(doc(db, `users/${user.uid}/private/preferences`), {
          enabledFeatures: newFeatures,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (error) {
        console.error("Error saving AI preferences:", error);
      }
    }
  };

  const handleResetTaste = () => {
    // In a real app, use a custom modal here
    resetTasteProfile();
    alert("Taste profile reset successfully.");
  };

  return (
    <div className="h-full flex flex-col bg-[#FDFCFB]">
      <header className="px-6 py-4 flex items-center gap-4 border-b border-[#F3EFEA]">
        <button onClick={onBack} className="p-2 hover:bg-[#F7F2EE] rounded-full transition-all">
          <ChevronLeft size={20} className="text-[#2D2926]" />
        </button>
        <div className="space-y-0.5">
          <h2 className="text-xl font-serif italic text-[#2D2926]">AI & Trust Hub</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">Transparency & Control</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-10 pb-24">
        {/* Intro Section */}
        <section className="space-y-4">
          <div className="p-6 bg-[#2D2926] rounded-[32px] text-white space-y-4">
            <div className="flex items-center gap-2 text-[#D4AF37]">
              <Sparkles size={18} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Our AI Philosophy</span>
            </div>
            <h3 className="text-lg font-serif italic leading-snug">AI is our assistant, not our authority.</h3>
            <p className="text-sm text-white/60 leading-relaxed italic">
              We use Google's Gemini AI to help you express yourself and stay safe. We never use AI to score your attractiveness or flirt on your behalf.
            </p>
            <div className="pt-4 border-t border-white/10 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">Active Models</p>
              <div className="flex flex-col gap-1 text-xs text-white/80">
                <div className="flex justify-between">
                  <span>Primary Reasoning:</span>
                  <span className="font-mono text-[10px]">gemini-3.1-pro-preview</span>
                </div>
                <div className="flex justify-between">
                  <span>Maps Grounding (Exception):</span>
                  <span className="font-mono text-[10px]">gemini-2.5-flash</span>
                </div>
                <div className="flex justify-between">
                  <span>Image Generation (Exception):</span>
                  <span className="font-mono text-[10px]">gemini-3.1-flash-image-preview</span>
                </div>
                <div className="flex justify-between">
                  <span>Live Audio (Exception):</span>
                  <span className="font-mono text-[10px]">gemini-2.5-flash-native-audio-preview-12-2025</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Controls */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">AI Features</h4>
            <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest">Beta</span>
          </div>
          
          <div className="space-y-4">
            {AI_FEATURE_REGISTRY.filter(f => f.user_visible).map(feature => (
              <div 
                key={feature.id}
                className="p-6 bg-white border border-[#F3EFEA] rounded-[32px] space-y-4 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h5 className="font-bold text-[#2D2926]">{feature.name}</h5>
                    <p className="text-xs text-[#8C7E6E] leading-relaxed italic">{feature.notes}</p>
                  </div>
                  <button 
                    onClick={() => toggleFeature(feature.id)}
                    className={cn(
                      "w-12 h-6 rounded-full transition-all relative shrink-0",
                      enabledFeatures.includes(feature.id) ? "bg-[#2D2926]" : "bg-[#F7F2EE]"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                      enabledFeatures.includes(feature.id) ? "right-1" : "left-1"
                    )} />
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="px-2 py-1 bg-gray-50 text-gray-600 text-[8px] font-bold uppercase tracking-widest rounded-full border border-gray-200">
                    {feature.runtime_model_route}
                  </span>
                  {feature.capability_exception && (
                    <span className="px-2 py-1 bg-purple-50 text-purple-700 text-[8px] font-bold uppercase tracking-widest rounded-full border border-purple-100" title={feature.exception_reason}>
                      Capability Exception
                    </span>
                  )}
                  {feature.category === 'beta_opt_in' && (
                    <span className="px-2 py-1 bg-amber-50 text-amber-700 text-[8px] font-bold uppercase tracking-widest rounded-full border border-amber-100">Beta</span>
                  )}
                  {feature.requires_consent && (
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-[8px] font-bold uppercase tracking-widest rounded-full border border-blue-100">Requires Consent</span>
                  )}
                  <span className="px-2 py-1 bg-[#F7F2EE] text-[#8C7E6E] text-[8px] font-bold uppercase tracking-widest rounded-full">Risk: {feature.risk_level}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Data & Privacy */}
        <section className="space-y-6">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E] px-2">Data & Privacy</h4>
          <div className="bg-white border border-[#F3EFEA] rounded-[32px] overflow-hidden shadow-sm">
            <button 
              onClick={() => onShowTasteProfile && onShowTasteProfile()}
              className="w-full p-6 flex items-center justify-between hover:bg-[#F7F2EE] transition-all border-b border-[#F3EFEA]"
            >
              <div className="flex items-center gap-4 text-left">
                <div className="w-10 h-10 bg-[#F7F2EE] rounded-full flex items-center justify-center text-[#2D2926]">
                  <Sparkles size={18} />
                </div>
                <div className="space-y-0.5">
                  <span className="font-bold text-sm text-[#2D2926]">Manage Private Taste Profile</span>
                  <p className="text-[10px] text-[#8C7E6E] italic">View, edit, or reset your AI preferences</p>
                </div>
              </div>
            </button>
            <button className="w-full p-6 flex items-center justify-between hover:bg-[#F7F2EE] transition-all">
              <div className="flex items-center gap-4 text-left">
                <div className="w-10 h-10 bg-[#F7F2EE] rounded-full flex items-center justify-center text-[#2D2926]">
                  <Eye size={18} />
                </div>
                <div className="space-y-0.5">
                  <span className="font-bold text-sm text-[#2D2926]">View AI Disclosures</span>
                  <p className="text-[10px] text-[#8C7E6E] italic">Understand how we use your data</p>
                </div>
              </div>
            </button>
          </div>
        </section>

        {/* Red Lines */}
        <section className="p-6 bg-red-50 rounded-[32px] border border-red-100 space-y-4">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle size={18} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Our Red Lines</span>
          </div>
          <ul className="space-y-2">
            {[
              "No public attractiveness ratings",
              "No auto-chatting as the user",
              "No sensitive identity inference from photos",
              "No hidden ranking manipulation"
            ].map((line, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-red-800/70 italic">
                <Check size={14} className="mt-0.5 shrink-0" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Admin Tools */}
        {(user?.role === 'admin' || auth.currentUser?.email === 'akivagoldstein61@gmail.com') && (
          <section className="space-y-6">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E] px-2">Admin Tools</h4>
            <div className="bg-white border border-[#F3EFEA] rounded-[32px] overflow-hidden shadow-sm">
              <button 
                onClick={async () => {
                  try {
                    const { MOCK_PROFILES } = await import('@/data/mockProfiles');
                    for (const profile of MOCK_PROFILES) {
                      await setDoc(doc(db, 'users', profile.uid), profile);
                    }
                    alert('Mock data seeded successfully!');
                  } catch (error) {
                    console.error('Error seeding mock data:', error);
                    alert('Failed to seed mock data.');
                  }
                }}
                className="w-full p-6 flex items-center justify-between hover:bg-[#F7F2EE] transition-all"
              >
                <div className="flex items-center gap-4 text-left">
                  <div className="w-10 h-10 bg-[#F7F2EE] rounded-full flex items-center justify-center text-[#2D2926]">
                    <RefreshCw size={18} />
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-bold text-sm text-[#2D2926]">Seed Mock Data</span>
                    <p className="text-[10px] text-[#8C7E6E] italic">Populate Firestore with mock profiles</p>
                  </div>
                </div>
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
