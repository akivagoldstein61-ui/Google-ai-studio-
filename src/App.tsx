import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { WelcomeScreen } from './features/auth/WelcomeScreen';
import { OnboardingFlow } from './features/onboarding/OnboardingFlow';
import { DailyPicksScreen } from './features/discovery/DailyPicksScreen';
import { MainLayout } from './components/layout/MainLayout';
import { ExploreScreen } from './features/discovery/ExploreScreen';
import { InboxScreen } from './features/chat/InboxScreen';
import { ChatThread } from './features/chat/ChatThread';
import { SettingsScreen } from './features/settings/SettingsScreen';
import { AITrustHub } from './features/settings/AITrustHub';
import { PrivateTasteProfile } from './features/settings/PrivateTasteProfile';
import { AIOpsScreen } from './features/admin/AIOpsScreen';
import { ExperimentsScreen } from './features/admin/ExperimentsScreen';
import { ProfileDetail } from './components/discovery/ProfileDetail';
import { MatchSheet } from './features/match/MatchSheet';
import { SafetyCenter } from './features/safety/SafetyCenter';
import { AnimatePresence, motion } from 'motion/react';
import { Profile, Conversation } from '@/types';
import { AppProvider } from './context/AppContext';

// ---------------------------------------------------------------------------
// Auth guard — redirects unauthenticated / onboarding users
// ---------------------------------------------------------------------------

const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isOnboarding, setUser, setOnboarding } = useApp();

  if (!user) {
    return <WelcomeScreen onNext={() => setUser({ id: 'me', uid: 'me', displayName: 'Akiva', age: 28, gender: 'male', city: 'Jerusalem', photos: [], bio: '', observance: 'modern_orthodox', intent: 'marriage_minded', prompts: [], isVerified: true, isPremium: false, tags: [] })} />;
  }

  if (isOnboarding) {
    return <OnboardingFlow onComplete={() => setOnboarding(false)} />;
  }

  return <>{children}</>;
};

// ---------------------------------------------------------------------------
// Tab layout — wraps the 4 main tab screens with MainLayout + tab bar
// ---------------------------------------------------------------------------

const TAB_ROUTES = ['/daily', '/explore', '/inbox', '/settings'] as const;
type TabPath = typeof TAB_ROUTES[number];

const TAB_MAP: Record<TabPath, 'daily' | 'explore' | 'matches' | 'profile'> = {
  '/daily': 'daily',
  '/explore': 'explore',
  '/inbox': 'matches',
  '/settings': 'profile',
};

const TabLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname as TabPath;
  const activeTab = TAB_MAP[currentPath] || 'daily';

  const setActiveTab = (tab: 'daily' | 'explore' | 'matches' | 'profile') => {
    const path = Object.entries(TAB_MAP).find(([, v]) => v === tab)?.[0];
    if (path) navigate(path);
  };

  return (
    <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </MainLayout>
  );
};

// ---------------------------------------------------------------------------
// Route wrappers — thin components that bridge router ↔ existing screen props
// ---------------------------------------------------------------------------

const DailyPicksRoute: React.FC = () => {
  const navigate = useNavigate();
  const [showMatch, setShowMatch] = React.useState<Profile | null>(null);

  return (
    <>
      <DailyPicksScreen
        onSelect={(profile) => navigate(`/profile/${profile.id}`, { state: { profile } })}
        onMatch={setShowMatch}
      />
      <AnimatePresence>
        {showMatch && (
          <MatchSheet
            profile={showMatch}
            onClose={() => setShowMatch(null)}
            onMessage={() => {
              setShowMatch(null);
              navigate('/inbox');
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

const ExploreRoute: React.FC = () => {
  const navigate = useNavigate();
  return <ExploreScreen onSelect={(profile) => navigate(`/profile/${profile.id}`, { state: { profile } })} />;
};

const InboxRoute: React.FC = () => {
  const navigate = useNavigate();
  return <InboxScreen onSelect={(conv) => navigate(`/inbox/${conv.id}`, { state: { conversation: conv } })} />;
};

const SettingsRoute: React.FC = () => {
  const navigate = useNavigate();
  return (
    <SettingsScreen
      onShowSafety={() => navigate('/settings/safety')}
      onShowAITrust={() => navigate('/settings/ai-trust')}
      onShowAIOps={() => navigate('/admin/ai-ops')}
      onShowExperiments={() => navigate('/admin/experiments')}
    />
  );
};

const ProfileDetailRoute: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { likeProfile, passProfile } = useApp();
  const [showMatch, setShowMatch] = React.useState<Profile | null>(null);

  const profile = (location.state as any)?.profile as Profile | undefined;
  if (!profile) return <Navigate to="/daily" replace />;

  const handleLike = async () => {
    const isMatch = await likeProfile(profile.id);
    if (isMatch) {
      setShowMatch(profile);
    } else {
      navigate(-1);
    }
  };

  return (
    <>
      <ProfileDetail
        profile={profile}
        onBack={() => navigate(-1)}
        onLike={handleLike}
        onPass={() => { passProfile(profile.id); navigate(-1); }}
      />
      <AnimatePresence>
        {showMatch && (
          <MatchSheet
            profile={showMatch}
            onClose={() => { setShowMatch(null); navigate(-1); }}
            onMessage={() => {
              setShowMatch(null);
              navigate('/inbox');
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

const ChatThreadRoute: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const conversation = (location.state as any)?.conversation as Conversation | undefined;
  if (!conversation) return <Navigate to="/inbox" replace />;
  return <ChatThread conversation={conversation} onBack={() => navigate(-1)} />;
};

const SafetyCenterRoute: React.FC = () => {
  const navigate = useNavigate();
  return <SafetyCenter onBack={() => navigate(-1)} />;
};

const AITrustHubRoute: React.FC = () => {
  const navigate = useNavigate();
  return <AITrustHub onBack={() => navigate(-1)} onShowTasteProfile={() => navigate('/settings/taste-profile')} />;
};

const TasteProfileRoute: React.FC = () => {
  const navigate = useNavigate();
  return <PrivateTasteProfile onBack={() => navigate(-1)} />;
};

const AIOpsRoute: React.FC = () => {
  const navigate = useNavigate();
  return <AIOpsScreen onBack={() => navigate(-1)} />;
};

const ExperimentsRoute: React.FC = () => {
  const navigate = useNavigate();
  return <ExperimentsScreen onBack={() => navigate(-1)} />;
};

// ---------------------------------------------------------------------------
// App shell
// ---------------------------------------------------------------------------

const AppContent: React.FC = () => {
  return (
    <div className="h-screen w-full bg-[#FDFCFB] flex flex-col relative overflow-hidden font-sans text-[#2D2926]">
      <AuthGuard>
        <Routes>
          {/* Tab screens — wrapped in shared layout with bottom nav */}
          <Route element={<TabLayout />}>
            <Route path="/daily" element={<DailyPicksRoute />} />
            <Route path="/explore" element={<ExploreRoute />} />
            <Route path="/inbox" element={<InboxRoute />} />
            <Route path="/settings" element={<SettingsRoute />} />
          </Route>

          {/* Full-screen routes (no tab bar) */}
          <Route path="/profile/:profileId" element={<ProfileDetailRoute />} />
          <Route path="/inbox/:conversationId" element={<ChatThreadRoute />} />
          <Route path="/settings/safety" element={<SafetyCenterRoute />} />
          <Route path="/settings/ai-trust" element={<AITrustHubRoute />} />
          <Route path="/settings/taste-profile" element={<TasteProfileRoute />} />
          <Route path="/admin/ai-ops" element={<AIOpsRoute />} />
          <Route path="/admin/experiments" element={<ExperimentsRoute />} />

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/daily" replace />} />
        </Routes>
      </AuthGuard>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </BrowserRouter>
  );
}
