import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, DiscoveryPreferences, Match, Conversation, Message } from '../types';
import { MOCK_PROFILES, MOCK_CONVERSATIONS } from '../data/mockProfiles';

interface AppState {
  user: Profile | null;
  language: 'en' | 'he';
  dailyPicks: Profile[];
  exploreProfiles: Profile[];
  matches: Match[];
  conversations: Conversation[];
  preferences: DiscoveryPreferences;
  tasteProfile: any;
  isPremium: boolean;
  isAgeVerified: boolean;
  hasAcceptedTerms: boolean;
  isOnboarding: boolean;
  loading: boolean;
  
  interactions: {
    likes: string[];
    passes: string[];
    moreLikeThis: string[];
    lessLikeThis: string[];
  };
  setLanguage: (lang: 'en' | 'he') => void;
  setUser: (user: Profile | null) => void;
  setOnboarding: (isOnboarding: boolean) => void;
  setPreferences: (prefs: DiscoveryPreferences) => void;
  likeProfile: (profileId: string) => Promise<boolean>;
  passProfile: (profileId: string) => void;
  moreLikeThis: (profileId: string) => void;
  lessLikeThis: (profileId: string) => void;
  resetTasteProfile: () => void;
  setTasteProfile: (profile: any) => void;
  sendMessage: (conversationId: string, text: string, aiAssisted?: boolean) => void;
  verifyAge: () => void;
  acceptTerms: () => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [isOnboarding, setOnboarding] = useState(false);
  const [language, setLanguage] = useState<'en' | 'he'>('en');
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<DiscoveryPreferences>({
    genderPreference: ['female'],
    ageRange: [22, 35],
    maxDistance: 50,
    observancePreference: ['secular', 'traditional', 'masorti', 'dati', 'modern_orthodox'],
    intentPreference: ['serious_relationship', 'marriage_minded'],
    hardFilters: [],
    softPreferences: [],
    recommendationMode: 'balanced'
  });
  const [tasteProfile, setTasteProfile] = useState({
    hard_dealbreakers: [],
    soft_preferences: [],
    things_to_avoid: [],
    weights: {
      values_vs_lifestyle: 0.5,
      distance_tolerance: 0.5
    },
    explanation: ""
  });
  const [isPremium, setIsPremium] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [dailyPicks, setDailyPicks] = useState<Profile[]>(MOCK_PROFILES.slice(0, 2));
  const [exploreProfiles, setExploreProfiles] = useState<Profile[]>(MOCK_PROFILES);

  const [interactions, setInteractions] = useState<{
    likes: string[];
    passes: string[];
    moreLikeThis: string[];
    lessLikeThis: string[];
  }>({
    likes: [],
    passes: [],
    moreLikeThis: [],
    lessLikeThis: []
  });

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const likeProfile = async (profileId: string): Promise<boolean> => {
    // Mock matching logic
    const profile = MOCK_PROFILES.find(p => p.id === profileId);
    if (profile) {
      setInteractions(prev => ({ 
        ...prev, 
        likes: [...prev.likes, `Profile with tags: ${profile.tags.join(', ')} and observance: ${profile.observance}`] 
      }));
      
      const isMatch = Math.random() > 0.5; // Simulate a match
      if (isMatch) {
        const newMatch: Match = {
          id: `m${Date.now()}`,
          users: ['me', profileId],
          status: 'active',
          createdAt: new Date().toISOString(),
          whyThisMatch: `You both share an interest in ${profile.tags.slice(0, 2).join(' and ')}.`,
          participants: [profile]
        };
        setMatches(prev => [...prev, newMatch]);
        setConversations(prev => [
          {
            id: newMatch.id,
            participants: [profile],
            messages: []
          },
          ...prev
        ]);
        return true;
      }
    }
    setExploreProfiles(prev => prev.filter(p => p.id !== profileId));
    return false;
  };

  const passProfile = (profileId: string) => {
    const profile = MOCK_PROFILES.find(p => p.id === profileId);
    if (profile) {
      setInteractions(prev => ({ 
        ...prev, 
        passes: [...prev.passes, `Profile with tags: ${profile.tags.join(', ')} and observance: ${profile.observance}`] 
      }));
    }
    setExploreProfiles(prev => prev.filter(p => p.id !== profileId));
  };

  const moreLikeThis = async (profileId: string) => {
    const profile = MOCK_PROFILES.find(p => p.id === profileId);
    if (profile) {
      const newInteractions = { 
        ...interactions, 
        moreLikeThis: [...interactions.moreLikeThis, `Profile with tags: ${profile.tags.join(', ')} and observance: ${profile.observance}`] 
      };
      setInteractions(newInteractions);
      
      try {
        // TODO(SERVER-SIDE): Replace this client-side AI call with a secure backend API call.
        // e.g., await fetch('/api/taste-profile/analyze', { method: 'POST', body: JSON.stringify({ interactions: newInteractions }) })
        const { aiService } = await import('../services/aiService');
        const newProfile = await aiService.analyzeTasteProfile(newInteractions, tasteProfile);
        setTasteProfile(newProfile);
      } catch (error) {
        console.error("Failed to update taste profile:", error);
      }
    }
  };

  const lessLikeThis = async (profileId: string) => {
    const profile = MOCK_PROFILES.find(p => p.id === profileId);
    if (profile) {
      const newInteractions = { 
        ...interactions, 
        lessLikeThis: [...interactions.lessLikeThis, `Profile with tags: ${profile.tags.join(', ')} and observance: ${profile.observance}`] 
      };
      setInteractions(newInteractions);
      
      try {
        // TODO(SERVER-SIDE): Replace this client-side AI call with a secure backend API call.
        // e.g., await fetch('/api/taste-profile/analyze', { method: 'POST', body: JSON.stringify({ interactions: newInteractions }) })
        const { aiService } = await import('../services/aiService');
        const newProfile = await aiService.analyzeTasteProfile(newInteractions, tasteProfile);
        setTasteProfile(newProfile);
      } catch (error) {
        console.error("Failed to update taste profile:", error);
      }
    }
  };

  const resetTasteProfile = () => {
    setTasteProfile({
      hard_dealbreakers: [],
      soft_preferences: [],
      things_to_avoid: [],
      weights: {
        values_vs_lifestyle: 0.5,
        distance_tolerance: 0.5
      },
      explanation: ""
    });
    setInteractions({
      likes: [],
      passes: [],
      moreLikeThis: [],
      lessLikeThis: []
    });
  };

  const sendMessage = (conversationId: string, text: string, aiAssisted?: boolean) => {
    const newMessage: Message = {
      id: `msg${Date.now()}`,
      senderId: 'me',
      text,
      createdAt: new Date().toISOString(),
      aiAssisted
    };
    setConversations(prev => prev.map(c => 
      c.id === conversationId 
        ? { ...c, messages: [...c.messages, newMessage], lastMessage: newMessage }
        : c
    ));
  };

  const verifyAge = () => setIsAgeVerified(true);
  const acceptTerms = () => setHasAcceptedTerms(true);

  return (
    <AppContext.Provider value={{
      user,
      language,
      dailyPicks,
      exploreProfiles,
      matches,
      conversations,
      preferences,
      tasteProfile,
      isPremium,
      isAgeVerified,
      hasAcceptedTerms,
      isOnboarding,
      loading,
      interactions,
      setLanguage,
      setUser,
      setOnboarding,
      setPreferences,
      likeProfile,
      passProfile,
      moreLikeThis,
      lessLikeThis,
      resetTasteProfile,
      setTasteProfile,
      sendMessage,
      verifyAge,
      acceptTerms
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
