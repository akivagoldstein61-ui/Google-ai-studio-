import React, { useState } from 'react';
import { DailyPicksScreen } from './features/discovery/DailyPicksScreen';
import { ExploreScreen } from './features/discovery/ExploreScreen';
import { PrivateTasteProfileScreen } from './features/settings/PrivateTasteProfileScreen';
import { AITrustHubScreen } from './features/settings/AITrustHubScreen';
import { LandingScreen } from './features/onboarding/LandingScreen';
import { AppShell } from './components/layout/AppShell';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'daily_picks' | 'explore' | 'taste_profile' | 'ai_trust'>('daily_picks');
  const [isOnboarded, setIsOnboarded] = useState(false);

  if (!isOnboarded) {
    return <LandingScreen onComplete={() => setIsOnboarded(true)} />;
  }

  return (
    <AppShell activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'daily_picks' && <DailyPicksScreen />}
      {activeTab === 'explore' && <ExploreScreen />}
      {activeTab === 'taste_profile' && <PrivateTasteProfileScreen />}
      {activeTab === 'ai_trust' && <AITrustHubScreen />}
    </AppShell>
  );
};

export default function App() {
  return (
    <AppContent />
  );
}

