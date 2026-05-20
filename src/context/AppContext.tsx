import React, { createContext, useContext, useState, useEffect } from 'react';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { Profile, DiscoveryPreferences, Match, Conversation, Message } from '@/types';
import { MOCK_PROFILES, MOCK_CONVERSATIONS } from '../data/mockProfiles';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { isPrototypeDemoMode } from '@/lib/prototypeMode';

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
  isDemoMode: boolean;

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
  signOut: () => Promise<void>;
  verifyAge: () => void;
  acceptTerms: () => void;
  trackEvent: (eventName: string, eventData?: Record<string, any>) => void;
}

const DEFAULT_PREFERENCES: DiscoveryPreferences = {
  genderPreference: ['female'],
  ageRange: [22, 35],
  maxDistance: 50,
  observancePreference: ['secular', 'traditional', 'masorti', 'dati', 'modern_orthodox'],
  intentPreference: ['serious_relationship', 'marriage_minded'],
  hardFilters: [],
  softPreferences: [],
  recommendationMode: 'balanced'
};

const EMPTY_TASTE_PROFILE = {
  hard_dealbreakers: [],
  soft_preferences: [],
  things_to_avoid: [],
  weights: {
    attraction_weight: 0.5,
    stability_weight: 0.5,
    pacing_weight: 0.5
  },
  explanation: ''
};

const DEMO_USER: Profile = {
  ...MOCK_PROFILES[1],
  id: 'demo-user',
  uid: 'demo-user',
  displayName: 'Demo Reviewer',
  city: 'Preview Mode',
  intent: 'serious_relationship',
  tags: ['Demo', 'Review', 'No Sign-in'],
  bio: 'View-only demo account seeded with local mock data. No Firebase sign-in required.',
};

const DEMO_MATCHES: Match[] = [
  {
    id: 'demo-match-1',
    users: [DEMO_USER.uid, MOCK_PROFILES[0].uid],
    status: 'active',
    createdAt: '2026-05-01T12:00:00.000Z',
    whyThisMatch: 'Demo match based on shared values and intentional pacing.',
    participants: [MOCK_PROFILES[0]],
  },
];

const DEMO_CONVERSATIONS: Conversation[] = [
  {
    ...MOCK_CONVERSATIONS[0],
    id: 'demo-conv-1',
    participants: [MOCK_PROFILES[0]],
  },
];

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isDemoMode = isPrototypeDemoMode();
  const [user, setUser] = useState<Profile | null>(() => (isDemoMode ? DEMO_USER : null));
  const [isOnboarding, setOnboarding] = useState(!isDemoMode);
  const [language, setLanguage] = useState<'en' | 'he'>('en');
  const [isAgeVerified, setIsAgeVerified] = useState(isDemoMode);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(isDemoMode);
  const [loading, setLoading] = useState(!isDemoMode);
  const [preferences, setPreferencesState] = useState<DiscoveryPreferences>(DEFAULT_PREFERENCES);
  const [tasteProfile, setTasteProfileState] = useState(EMPTY_TASTE_PROFILE);
  const [isPremium, setIsPremium] = useState(isDemoMode);
  const [matches, setMatches] = useState<Match[]>(isDemoMode ? DEMO_MATCHES : []);
  const [conversations, setConversations] = useState<Conversation[]>(isDemoMode ? DEMO_CONVERSATIONS : []);
  const [dailyPicks, setDailyPicks] = useState<Profile[]>(isDemoMode ? MOCK_PROFILES.slice(0, 2) : []);
  const [exploreProfiles, setExploreProfiles] = useState<Profile[]>(isDemoMode ? MOCK_PROFILES : []);

  const [interactions, setInteractions] = useState<{
    likes: string[];
    passes: string[];
    moreLikeThis: string[];
    lessLikeThis: string[];
  }>(() => {
    if (isDemoMode) {
      return {
        likes: ['Profile with tags: Traditional, History, Beach and observance: traditional', 'Profile with tags: Masorti, Dogs, Foodie and observance: masorti'],
        passes: ['Profile with tags: Secular, Art, Spontaneous and observance: secular'],
        moreLikeThis: ['Profile with tags: Introverted, Thoughtful'],
        lessLikeThis: ['Profile with tags: Extroverted']
      };
    }
    return {
      likes: [],
      passes: [],
      moreLikeThis: [],
      lessLikeThis: []
    };
  });

  useEffect(() => {
    if (isDemoMode) {
      setUser(DEMO_USER);
      setOnboarding(false);
      setIsAgeVerified(true);
      setHasAcceptedTerms(true);
      setIsPremium(true);
      setMatches(DEMO_MATCHES);
      setConversations(DEMO_CONVERSATIONS);
      setDailyPicks(MOCK_PROFILES.slice(0, 2));
      setExploreProfiles(MOCK_PROFILES);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data() as Profile);
            setOnboarding(false);

            const tasteDoc = await getDoc(doc(db, `users/${firebaseUser.uid}/private/taste_profile`));
            if (tasteDoc.exists()) {
              setTasteProfileState(tasteDoc.data() as any);
            }

            const prefDoc = await getDoc(doc(db, `users/${firebaseUser.uid}/private/discovery_preferences`));
            if (prefDoc.exists()) {
              setPreferencesState(prefDoc.data() as any);
            }

            try {
              const { collection, query, where, getDocs, limit } = await import('firebase/firestore');
              const matchesQuery = query(collection(db, 'matches'), where('users', 'array-contains', firebaseUser.uid));
              const matchesSnapshot = await getDocs(matchesQuery);
              const fetchedMatches = matchesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match));
              setMatches(fetchedMatches);

              const conversationsQuery = query(collection(db, 'conversations'), where('participants', 'array-contains', firebaseUser.uid));
              const conversationsSnapshot = await getDocs(conversationsQuery);
              const fetchedConversations = conversationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Conversation));
              setConversations(fetchedConversations);

              let currentPrefs = preferences;
              if (prefDoc.exists()) {
                currentPrefs = prefDoc.data() as any;
              }

              let usersQuery;
              if (currentPrefs.genderPreference.length === 1) {
                usersQuery = query(
                  collection(db, 'users'),
                  where('gender', '==', currentPrefs.genderPreference[0]),
                  limit(50)
                );
              } else {
                usersQuery = query(collection(db, 'users'), limit(50));
              }

              const usersSnapshot = await getDocs(usersQuery);
              let fetchedUsers = usersSnapshot.docs
                .map(doc => ({ id: doc.id, ...(doc.data() as any) } as Profile))
                .filter(p => p.uid !== firebaseUser.uid);

              fetchedUsers = fetchedUsers.filter(p => {
                const ageMatch = p.age >= currentPrefs.ageRange[0] && p.age <= currentPrefs.ageRange[1];
                const observanceMatch = currentPrefs.observancePreference.includes(p.observance);
                const intentMatch = currentPrefs.intentPreference.includes(p.intent);
                return ageMatch && observanceMatch && intentMatch;
              });

              if (fetchedUsers.length > 0) {
                setDailyPicks(fetchedUsers.slice(0, 2));
                setExploreProfiles(fetchedUsers);
              } else {
                setDailyPicks(MOCK_PROFILES.slice(0, 2));
                setExploreProfiles(MOCK_PROFILES);
              }

            } catch (error) {
              console.error('Error fetching data:', error);
            }
          } else {
            setUser({
              id: firebaseUser.uid,
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName ?? '',
              age: 0,
              gender: 'male',
              city: '',
              photos: firebaseUser.photoURL ? [firebaseUser.photoURL] : [],
              bio: '',
              observance: 'secular',
              intent: 'serious_relationship',
              prompts: [],
              isVerified: firebaseUser.emailVerified,
              isPremium: false,
              tags: [],
            });
            setOnboarding(true);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUser(null);
        setOnboarding(true);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isDemoMode]);

  const setPreferences = async (prefs: DiscoveryPreferences) => {
    setPreferencesState(prefs);
    if (isDemoMode || !user) {
      return;
    }

    try {
      const { doc, setDoc } = await import('firebase/firestore');
      await setDoc(doc(db, `users/${user.uid}/private/discovery_preferences`), prefs);
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const setTasteProfile = async (profile: any) => {
    setTasteProfileState(profile);
    if (isDemoMode || !user) {
      return;
    }

    try {
      await setDoc(doc(db, `users/${user.uid}/private/taste_profile`), profile);
    } catch (error) {
      console.error('Error saving taste profile:', error);
    }
  };

  const likeProfile = async (profileId: string): Promise<boolean> => {
    if (!user) return false;

    const profile = MOCK_PROFILES.find(p => p.id === profileId);
    if (!profile) {
      return false;
    }

    setInteractions(prev => ({
      ...prev,
      likes: [...prev.likes, `Profile with tags: ${profile.tags.join(', ')} and observance: ${profile.observance}`]
    }));

    if (isDemoMode) {
      setExploreProfiles(prev => prev.filter(p => p.id !== profileId));
      setDailyPicks(prev => prev.filter(p => p.id !== profileId));
      const isMatch = matches.length === 0;
      if (isMatch) {
        const newMatch: Match = {
          id: `demo-match-${Date.now()}`,
          users: [user.uid, profile.uid],
          status: 'active',
          createdAt: new Date().toISOString(),
          whyThisMatch: `Demo match based on shared interest in ${profile.tags.slice(0, 2).join(' and ')}.`,
          participants: [profile],
        };
        setMatches(prev => [newMatch, ...prev]);
        setConversations(prev => [
          {
            id: newMatch.id,
            participants: [profile],
            messages: [],
          },
          ...prev,
        ]);
      }
      return isMatch;
    }

    try {
      const { doc, setDoc } = await import('firebase/firestore');
      await setDoc(doc(db, `users/${user.uid}/private/interactions`), {
        likes: [...interactions.likes, profileId]
      }, { merge: true });
    } catch (error) {
      console.error('Error saving like:', error);
    }

    const isMatch = Math.random() > 0.5;
    if (isMatch) {
      const newMatch: Match = {
        id: `m_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        users: [user.uid, profileId],
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

      try {
        const { doc, setDoc } = await import('firebase/firestore');
        await setDoc(doc(db, 'matches', newMatch.id), newMatch);
        await setDoc(doc(db, 'conversations', newMatch.id), {
          id: newMatch.id,
          participants: [user.uid, profileId],
          messages: []
        });
      } catch (error) {
        console.error('Error saving match:', error);
      }

      return true;
    }

    setExploreProfiles(prev => prev.filter(p => p.id !== profileId));
    return false;
  };

  const passProfile = async (profileId: string) => {
    if (!user) return;

    const profile = MOCK_PROFILES.find(p => p.id === profileId);
    if (profile) {
      setInteractions(prev => ({
        ...prev,
        passes: [...prev.passes, `Profile with tags: ${profile.tags.join(', ')} and observance: ${profile.observance}`]
      }));
    }

    setExploreProfiles(prev => prev.filter(p => p.id !== profileId));
    setDailyPicks(prev => prev.filter(p => p.id !== profileId));

    if (isDemoMode || !profile) {
      return;
    }

    try {
      const { doc, setDoc } = await import('firebase/firestore');
      await setDoc(doc(db, `users/${user.uid}/private/interactions`), {
        passes: [...interactions.passes, profileId]
      }, { merge: true });
    } catch (error) {
      console.error('Error saving pass:', error);
    }
  };

  const moreLikeThis = async (profileId: string) => {
    if (!user) return;
    const profile = MOCK_PROFILES.find(p => p.id === profileId);
    if (!profile) return;

    const newInteractions = {
      ...interactions,
      moreLikeThis: [...interactions.moreLikeThis, `Profile with tags: ${profile.tags.join(', ')} and observance: ${profile.observance}`]
    };
    setInteractions(newInteractions);

    if (isDemoMode) {
      setTasteProfileState(prev => ({
        ...prev,
        soft_preferences: Array.from(new Set([...(prev.soft_preferences ?? []), ...profile.tags.slice(0, 2)])),
      }));
      return;
    }

    try {
      const { doc, setDoc } = await import('firebase/firestore');
      await setDoc(doc(db, `users/${user.uid}/private/interactions`), {
        moreLikeThis: [...interactions.moreLikeThis, profileId]
      }, { merge: true });

      const { aiService } = await import('../services/aiService');
      const newProfile = await aiService.analyzeTasteProfile(newInteractions, tasteProfile);
      if (newProfile) {
        setTasteProfile(newProfile);
      }
    } catch (error) {
      console.error('Failed to update taste profile:', error);
    }
  };

  const lessLikeThis = async (profileId: string) => {
    if (!user) return;
    const profile = MOCK_PROFILES.find(p => p.id === profileId);
    if (!profile) return;

    const newInteractions = {
      ...interactions,
      lessLikeThis: [...interactions.lessLikeThis, `Profile with tags: ${profile.tags.join(', ')} and observance: ${profile.observance}`]
    };
    setInteractions(newInteractions);

    if (isDemoMode) {
      setTasteProfileState(prev => ({
        ...prev,
        things_to_avoid: Array.from(new Set([...(prev.things_to_avoid ?? []), ...profile.tags.slice(0, 2)])),
      }));
      return;
    }

    try {
      const { doc, setDoc } = await import('firebase/firestore');
      await setDoc(doc(db, `users/${user.uid}/private/interactions`), {
        lessLikeThis: [...interactions.lessLikeThis, profileId]
      }, { merge: true });

      const { aiService } = await import('../services/aiService');
      const newProfile = await aiService.analyzeTasteProfile(newInteractions, tasteProfile);
      if (newProfile) {
        setTasteProfile(newProfile);
      }
    } catch (error) {
      console.error('Failed to update taste profile:', error);
    }
  };

  const resetTasteProfile = async () => {
    const emptyProfile = { ...EMPTY_TASTE_PROFILE };
    setTasteProfileState(emptyProfile);

    const emptyInteractions = {
      likes: [],
      passes: [],
      moreLikeThis: [],
      lessLikeThis: []
    };
    setInteractions(emptyInteractions);

    if (isDemoMode || !user) {
      return;
    }

    try {
      const { doc, setDoc } = await import('firebase/firestore');
      await setDoc(doc(db, `users/${user.uid}/private/taste_profile`), emptyProfile);
      await setDoc(doc(db, `users/${user.uid}/private/interactions`), emptyInteractions);
    } catch (error) {
      console.error('Error resetting taste profile in Firestore:', error);
    }
  };

  const sendMessage = async (conversationId: string, text: string, aiAssisted?: boolean) => {
    if (!user) return;
    const newMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      senderId: user.uid,
      text,
      createdAt: new Date().toISOString(),
      aiAssisted
    };

    setConversations(prev => prev.map(c =>
      c.id === conversationId
        ? { ...c, messages: [...c.messages, newMessage], lastMessage: newMessage }
        : c
    ));

    if (isDemoMode) {
      return;
    }

    try {
      const { doc, updateDoc, arrayUnion } = await import('firebase/firestore');
      await updateDoc(doc(db, 'conversations', conversationId), {
        messages: arrayUnion(newMessage)
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setOnboarding(false);
  };

  const verifyAge = () => setIsAgeVerified(true);
  const acceptTerms = () => setHasAcceptedTerms(true);

  const trackEvent = (eventName: string, eventData?: Record<string, any>) => {
    console.log(`[Analytics] ${eventName}`, eventData || {});
  };

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
      isDemoMode,
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
      signOut,
      verifyAge,
      acceptTerms,
      trackEvent
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
