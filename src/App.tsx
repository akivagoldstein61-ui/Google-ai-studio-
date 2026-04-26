import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { WelcomeScreen } from './features/auth/WelcomeScreen';
import { OnboardingFlow } from './features/onboarding/OnboardingFlow';
import { DailyPicksScreen } from './features/discovery/DailyPicksScreen';
import { MainLayout } from './components/layout/MainLayout';
import { ExploreScreen } from './features/discovery/ExploreScreen';
import { InboxScreen } from './features/chat/InboxScreen';
import { ChatThread } from './features/chat/ChatThread';
import { SettingsScreen } from './features/settings/SettingsScreen';
import { PersonalityProfileScreen } from './features/settings/PersonalityProfileScreen';
import { AITrustHub } from './features/settings/AITrustHub';
import { PrivateTasteProfile } from './features/settings/PrivateTasteProfile';
import { AIOpsScreen } from './features/admin/AIOpsScreen';
import { ExperimentsScreen } from './features/admin/ExperimentsScreen';
import { ProfileDetail } from './components/discovery/ProfileDetail';
import { ProfileBuilder } from './components/onboarding/ProfileBuilder';
import { MatchSheet } from './features/match/MatchSheet';
import { SafetyCenter } from './features/safety/SafetyCenter';
import { AnimatePresence, motion } from 'motion/react';
import { Profile, Conversation } from './types';
import { AppProvider } from './context/AppContext';

const AppContent: React.FC = () => {
  const { user, isOnboarding, setUser, setOnboarding, likeProfile, passProfile } = useApp();
  const [activeTab, setActiveTab] = useState<'daily' | 'explore' | 'matches' | 'profile'>('daily');
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showSafety, setShowSafety] = useState(false);
  const [showAITrust, setShowAITrust] = useState(false);
  const [showTasteProfile, setShowTasteProfile] = useState(false);
  const [showPersonalityProfile, setShowPersonalityProfile] = useState(false);
  const [showAIOps, setShowAIOps] = useState(false);
  const [showExperiments, setShowExperiments] = useState(false);
  const [showMatch, setShowMatch] = useState<Profile | null>(null);
  const [showEditProfile, setShowEditProfile] = useState(false);

  if (!user) {
    return <WelcomeScreen onNext={() => {}} />;
  }

  if (isOnboarding) {
    return <OnboardingFlow onComplete={() => setOnboarding(false)} />;
  }

  const handleLike = async (profile: Profile) => {
    const isMatch = await likeProfile(profile.id);
    setSelectedProfile(null);
    if (isMatch) {
      setShowMatch(profile);
    }
  };

  return (
    <div className="h-screen w-full bg-[#FDFCFB] flex flex-col relative overflow-hidden font-sans text-[#2D2926]">
      <AnimatePresence mode="wait">
        <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full relative overflow-hidden">
          {showSafety ? (
            <SafetyCenter onBack={() => setShowSafety(false)} />
          ) : showAITrust ? (
            <AITrustHub 
              onBack={() => setShowAITrust(false)} 
              onShowTasteProfile={() => setShowTasteProfile(true)}
            />
          ) : showTasteProfile ? (
            <PrivateTasteProfile onBack={() => setShowTasteProfile(false)} />
          ) : showPersonalityProfile ? (
            <PersonalityProfileScreen onBack={() => setShowPersonalityProfile(false)} />
          ) : showAIOps ? (
            <AIOpsScreen onBack={() => setShowAIOps(false)} />
          ) : showExperiments ? (
            <ExperimentsScreen onBack={() => setShowExperiments(false)} />
          ) : showEditProfile ? (
            <div className="h-full overflow-y-auto bg-[#FDFCFB]">
              <div className="px-6 py-4 flex items-center justify-between border-b border-[#F3EFEA] sticky top-0 bg-white/80 backdrop-blur-xl z-50">
                <button onClick={() => setShowEditProfile(false)} className="p-2 hover:bg-[#F7F2EE] rounded-full transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#2D2926]"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <h2 className="text-xl font-serif italic text-[#2D2926]">Edit Profile</h2>
                <div className="w-10" />
              </div>
              <div className="p-6">
                <ProfileBuilder 
                  initialData={user}
                  onComplete={async (data) => {
                    if (user) {
                      const updatedUser = {
                        ...user,
                        photos: data.photos?.map((p: any) => p.url) || [],
                        bio: data.bio,
                        prompts: data.prompts,
                        personalityScores: data.personalityScores || user.personalityScores,
                        isVerified: data.isVerified
                      };
                      
                      try {
                        const { doc, setDoc } = await import('firebase/firestore');
                        const { db } = await import('@/firebase');
                        await setDoc(doc(db, 'users', user.uid), updatedUser);
                        
                        if (data.personalityScores) {
                          await setDoc(doc(db, `users/${user.uid}/private/personality`), {
                            scores: data.personalityScores,
                            updatedAt: new Date().toISOString()
                          });
                        }
                        
                        setUser(updatedUser);
                      } catch (error) {
                        console.error("Error saving profile to Firestore:", error);
                      }
                    }
                    setShowEditProfile(false);
                  }}
                />
              </div>
            </div>
          ) : selectedProfile ? (
            <ProfileDetail 
              profile={selectedProfile} 
              onBack={() => setSelectedProfile(null)}
              onLike={() => handleLike(selectedProfile)}
              onPass={() => { passProfile(selectedProfile.id); setSelectedProfile(null); }}
            />
          ) : selectedConversation ? (
            <ChatThread 
              conversation={selectedConversation} 
              onBack={() => setSelectedConversation(null)} 
            />
          ) : (
            <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  {activeTab === 'daily' && <DailyPicksScreen onSelect={setSelectedProfile} onMatch={setShowMatch} />}
                  {activeTab === 'explore' && <ExploreScreen onSelect={setSelectedProfile} />}
                  {activeTab === 'matches' && <InboxScreen onSelect={setSelectedConversation} />}
                  {activeTab === 'profile' && (
                    <SettingsScreen 
                      onShowSafety={() => setShowSafety(true)} 
                      onShowAITrust={() => setShowAITrust(true)}
                      onShowPersonalityProfile={() => setShowPersonalityProfile(true)}
                      onShowAIOps={() => setShowAIOps(true)}
                      onShowExperiments={() => setShowExperiments(true)}
                      onEditProfile={() => setShowEditProfile(true)}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </MainLayout>
          )}

          <AnimatePresence>
            {showMatch && (
              <MatchSheet 
                profile={showMatch} 
                onClose={() => setShowMatch(null)}
                onMessage={() => {
                  setShowMatch(null);
                  setActiveTab('matches');
                }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
