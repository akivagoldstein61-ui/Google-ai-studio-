import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Profile, DiscoveryPreferences, Match, Conversation, Message, TasteProfileDraft } from '@/types';
import { MOCK_PROFILES, MOCK_CONVERSATIONS } from '../data/mockProfiles';
import { auth, db } from '../firebase';
import { isPrototypeDemoMode } from '@/lib/prototypeMode';
import {
  hasLocalMockAuthSession,
  isLocalDevMockAuthEnabled,
  setLocalMockAuthSession,
} from '@/services/authHeaders';
import {
  type TasteState,
  type TasteEvent,
  applyEvent,
  emptyTasteState,
} from '@/lib/learnedTaste';
import { serializeTasteState, deserializeTasteState, cloneTasteState, profileToFeatureTags } from '@/lib/tastePersistence';
import { selectDailyPicks, selectExploreProfiles } from '@/lib/integratedRanking';
import { discoveryService } from '@/services/discoveryService';

interface AppState {
  user: Profile | null;
  language: 'en' | 'he';
  dailyPicks: Profile[];
  exploreProfiles: Profile[];
  matches: Match[];
  conversations: Conversation[];
  preferences: DiscoveryPreferences;
  tasteProfile: TasteProfileDraft;
  tasteState: TasteState;
  isPremium: boolean;
  isAgeVerified: boolean;
  hasAcceptedTerms: boolean;
  isOnboarding: boolean;
  loading: boolean;
  isDemoMode: boolean;
  isLocalMockAuth: boolean;
  interactions: {
    likes: string[];
    passes: string[];
    moreLikeThis: string[];
    lessLikeThis: string[];
  };
  signIn: () => Promise<void>;
  setLanguage: (lang: 'en' | 'he') => void;
  setUser: (user: Profile | null) => void;
  setOnboarding: (isOnboarding: boolean) => void;
  setPreferences: (prefs: DiscoveryPreferences) => Promise<void>;
  likeProfile: (profileId: string) => Promise<boolean>;
  passProfile: (profileId: string) => void;
  moreLikeThis: (profileId: string) => void;
  lessLikeThis: (profileId: string) => void;
  resetTasteProfile: () => void;
  setTasteProfile: (profile: TasteProfileDraft) => void;
  pauseTasteLearning: (paused: boolean) => Promise<void>;
  optOutTasteLearning: () => Promise<void>;
  exportTasteProfile: () => Promise<any>;
  deleteTasteProfile: () => Promise<void>;
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
  softPreferences: ['shared_interests', 'same_city', 'similar_age'],
  recommendationMode: 'balanced',
  dealbreakers: {
    age: true,
    distance: false,
    gender: true,
    intent: true,
    observance: true,
    verified: true,
  },
  softPreferenceWeights: {
    shared_interests: 0.6,
    same_city: 0.25,
    similar_observance: 0.15,
    similar_age: 0.35,
  },
  poolImpact: {
    age: 'high',
    distance: 'medium',
    verified: 'medium',
  },
};

const EMPTY_TASTE_PROFILE: TasteProfileDraft = {
  hard_dealbreakers: [],
  soft_preferences: [],
  things_to_avoid: [],
  weights: {
    values_weight: 0.5,
    stability_weight: 0.5,
    pacing_weight: 0.5,
  },
  learning: {
    paused: true,
    optedOut: false,
    lastUpdatedAt: null,
  },
  provenance: {},
  lockedItems: [],
  removedItems: [],
  explanation: '',
};

const LEGACY_RECOMMENDATION_MODE = 'chemistry' + '_first';

function cloneDefaultTasteProfile(): TasteProfileDraft {
  return JSON.parse(JSON.stringify(EMPTY_TASTE_PROFILE));
}

function emptyTasteStateForProfile(profile: TasteProfileDraft = cloneDefaultTasteProfile()): TasteState {
  return {
    ...emptyTasteState(),
    learningPaused: profile.learning.paused,
    optedOut: profile.learning.optedOut,
  };
}

function normalizeTasteProfile(raw: any): TasteProfileDraft {
  const input = raw && typeof raw === 'object' ? raw : {};
  const weights = input.weights && typeof input.weights === 'object' ? input.weights : {};
  const defaultProfile = cloneDefaultTasteProfile();
  return {
    ...defaultProfile,
    ...input,
    hard_dealbreakers: Array.isArray(input.hard_dealbreakers) ? input.hard_dealbreakers : [],
    soft_preferences: Array.isArray(input.soft_preferences) ? input.soft_preferences : [],
    things_to_avoid: Array.isArray(input.things_to_avoid) ? input.things_to_avoid : [],
    weights: {
      values_weight: typeof weights.values_weight === 'number'
        ? weights.values_weight
        : typeof weights.values_vs_lifestyle === 'number'
          ? weights.values_vs_lifestyle
          : 0.5,
      stability_weight: typeof weights.stability_weight === 'number' ? weights.stability_weight : 0.5,
      pacing_weight: typeof weights.pacing_weight === 'number' ? weights.pacing_weight : 0.5,
    },
    learning: {
      paused: typeof input.learning?.paused === 'boolean' ? input.learning.paused : defaultProfile.learning.paused,
      optedOut: input.learning?.optedOut === true,
      lastUpdatedAt: typeof input.learning?.lastUpdatedAt === 'string' ? input.learning.lastUpdatedAt : null,
    },
    provenance: input.provenance && typeof input.provenance === 'object' ? input.provenance : {},
    lockedItems: Array.isArray(input.lockedItems) ? input.lockedItems : [],
    removedItems: Array.isArray(input.removedItems) ? input.removedItems : [],
    explanation: typeof input.explanation === 'string' ? input.explanation : '',
  };
}

function discoveryItemsToProfiles(response: any): Profile[] {
  if (!Array.isArray(response?.items)) return [];
  return response.items
    .map((item: any) => item?.profile ?? item)
    .filter((profile: any): profile is Profile => Boolean(profile?.id && profile?.uid));
}

function normalizeDiscoveryPreferences(raw: any): DiscoveryPreferences {
  const input = raw && typeof raw === 'object' ? raw : {};
  return {
    ...DEFAULT_PREFERENCES,
    ...input,
    hardFilters: Array.isArray(input.hardFilters) ? input.hardFilters : DEFAULT_PREFERENCES.hardFilters,
    softPreferences: Array.isArray(input.softPreferences) ? input.softPreferences : DEFAULT_PREFERENCES.softPreferences,
    recommendationMode:
      input.recommendationMode === LEGACY_RECOMMENDATION_MODE
        ? 'serendipity'
        : input.recommendationMode ?? DEFAULT_PREFERENCES.recommendationMode,
    dealbreakers: {
      ...DEFAULT_PREFERENCES.dealbreakers,
      ...(input.dealbreakers && typeof input.dealbreakers === 'object' ? input.dealbreakers : {}),
    },
    softPreferenceWeights: {
      ...DEFAULT_PREFERENCES.softPreferenceWeights,
      ...(input.softPreferenceWeights && typeof input.softPreferenceWeights === 'object' ? input.softPreferenceWeights : {}),
    },
    poolImpact: {
      ...DEFAULT_PREFERENCES.poolImpact,
      ...(input.poolImpact && typeof input.poolImpact === 'object' ? input.poolImpact : {}),
    },
  };
}

function localCandidatePool(viewer: Profile): Profile[] {
  return MOCK_PROFILES.filter((profile) => profile.id !== viewer.id && profile.uid !== viewer.uid);
}

function rankLocalDiscovery(
  viewer: Profile,
  prefs: DiscoveryPreferences,
  taste: TasteState,
): { daily: Profile[]; explore: Profile[] } {
  const candidates = localCandidatePool(viewer);
  return {
    daily: selectDailyPicks({
      viewer,
      candidates,
      preferences: prefs,
      tasteState: taste,
      limit: 5,
    }).map((item) => item.profile),
    explore: selectExploreProfiles({
      viewer,
      candidates,
      preferences: prefs,
      tasteState: taste,
      allowDisclosedSpillover: true,
    }).map((item) => item.profile),
  };
}

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

const LOCAL_DEV_USER: Profile = {
  ...MOCK_PROFILES[1],
  id: 'local-dev-user',
  uid: 'local-dev-user',
  displayName: 'Local Dev',
  city: 'Local Preview',
  intent: 'serious_relationship',
  tags: ['Local', 'Mock Auth'],
  bio: 'Local development mock account used when Firebase sign-in is unavailable.',
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
  const [isLocalMockAuth, setIsLocalMockAuth] = useState(() => hasLocalMockAuthSession());
  const isLocalOnlyMode = isDemoMode || isLocalMockAuth;
  const localUser = useMemo(() => (isDemoMode ? DEMO_USER : LOCAL_DEV_USER), [isDemoMode]);
  const [user, setUser] = useState<Profile | null>(() => (isLocalOnlyMode ? localUser : null));
  const [isOnboarding, setOnboarding] = useState(!isLocalOnlyMode);
  const [language, setLanguage] = useState<'en' | 'he'>('en');
  const [isAgeVerified, setIsAgeVerified] = useState(isLocalOnlyMode);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(isLocalOnlyMode);
  const [loading, setLoading] = useState(!isLocalOnlyMode);
  const [preferences, setPreferencesState] = useState<DiscoveryPreferences>(DEFAULT_PREFERENCES);
  const [tasteProfile, setTasteProfileState] = useState<TasteProfileDraft>(() => cloneDefaultTasteProfile());
  const [tasteState, setTasteStateRaw] = useState<TasteState>(() => emptyTasteStateForProfile());
  const [isPremium, setIsPremium] = useState(isLocalOnlyMode);
  const initialLocalDiscovery = rankLocalDiscovery(localUser, DEFAULT_PREFERENCES, emptyTasteStateForProfile());
  const [matches, setMatches] = useState<Match[]>(isLocalOnlyMode ? DEMO_MATCHES : []);
  const [conversations, setConversations] = useState<Conversation[]>(isLocalOnlyMode ? DEMO_CONVERSATIONS : []);
  const [dailyPicks, setDailyPicks] = useState<Profile[]>(isLocalOnlyMode ? initialLocalDiscovery.daily : []);
  const [exploreProfiles, setExploreProfiles] = useState<Profile[]>(isLocalOnlyMode ? initialLocalDiscovery.explore : []);

  const [interactions, setInteractions] = useState<{
    likes: string[];
    passes: string[];
    moreLikeThis: string[];
    lessLikeThis: string[];
  }>(() => {
    if (isLocalOnlyMode) {
      return {
        likes: ['Profile with tags: Traditional, History, Beach and observance: traditional', 'Profile with tags: Masorti, Dogs, Foodie and observance: masorti'],
        passes: ['Profile with tags: Secular, Art, Spontaneous and observance: secular'],
        moreLikeThis: ['Profile with tags: Introverted, Thoughtful'],
        lessLikeThis: ['Profile with tags: Extroverted'],
      };
    }
    return {
      likes: [],
      passes: [],
      moreLikeThis: [],
      lessLikeThis: [],
    };
  });

  const refreshLocalDiscovery = (
    nextPrefs: DiscoveryPreferences,
    nextTaste: TasteState = tasteState,
    nextViewer: Profile | null = user ?? localUser,
  ) => {
    if (!nextViewer) return;
    const ranked = rankLocalDiscovery(nextViewer, nextPrefs, nextTaste);
    setDailyPicks(ranked.daily);
    setExploreProfiles(ranked.explore);
  };

  const refreshRemoteDiscovery = async () => {
    const [dailyResponse, exploreResponse] = await Promise.all([
      discoveryService.getDailyPicks().catch(() => null),
      discoveryService.getExploreProfiles().catch(() => null),
    ]);
    const apiDailyPicks = discoveryItemsToProfiles(dailyResponse);
    const apiExploreProfiles = discoveryItemsToProfiles(exploreResponse);
    setDailyPicks(apiDailyPicks.length > 0 ? apiDailyPicks.slice(0, 5) : []);
    setExploreProfiles(apiExploreProfiles.length > 0 ? apiExploreProfiles : []);
  };

  const applyTasteEvent = (uid: string | undefined, ev: TasteEvent) => {
    setTasteStateRaw(prev => {
      const next = applyEvent(cloneTasteState(prev), ev);
      if (isLocalOnlyMode && user) {
        const nextPrefs = preferences;
        setTimeout(() => refreshLocalDiscovery(nextPrefs, next, user), 0);
      }
      if (!isLocalOnlyMode && uid) {
        setTimeout(() => {
          setDoc(doc(db, `users/${uid}/private/taste_state`), serializeTasteState(next))
            .catch((e: unknown) => console.error('Error saving taste_state:', e));
        }, 0);
      }
      return next;
    });
  };

  useEffect(() => {
    if (isLocalOnlyMode) {
      setUser(localUser);
      setOnboarding(false);
      setIsAgeVerified(true);
      setHasAcceptedTerms(true);
      setIsPremium(true);
      setMatches(DEMO_MATCHES);
      setConversations(DEMO_CONVERSATIONS);
      refreshLocalDiscovery(preferences, tasteState, localUser);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setIsLocalMockAuth(false);
        setLocalMockAuthSession(false);
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data() as Profile);
            setOnboarding(false);

            const tasteDoc = await getDoc(doc(db, `users/${firebaseUser.uid}/private/taste_profile`));
            if (tasteDoc.exists()) {
              const normalizedTasteProfile = normalizeTasteProfile(tasteDoc.data());
              setTasteProfileState(normalizedTasteProfile);
              setTasteStateRaw(prev => ({
                ...cloneTasteState(prev),
                learningPaused: normalizedTasteProfile.learning.paused,
                optedOut: normalizedTasteProfile.learning.optedOut,
              }));
            }

            const tasteStateDoc = await getDoc(doc(db, `users/${firebaseUser.uid}/private/taste_state`));
            if (tasteStateDoc.exists()) {
              const loadedTasteState = deserializeTasteState(tasteStateDoc.data());
              setTasteStateRaw(prev => ({
                ...loadedTasteState,
                learningPaused: loadedTasteState.learningPaused ?? prev.learningPaused,
                optedOut: loadedTasteState.optedOut ?? prev.optedOut,
              }));
            }

            try {
              const { collection, query, where, getDocs } = await import('firebase/firestore');
              const matchesQuery = query(collection(db, 'matches'), where('users', 'array-contains', firebaseUser.uid));
              const matchesSnapshot = await getDocs(matchesQuery);
              const fetchedMatches = matchesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match));
              setMatches(fetchedMatches);

              const conversationsQuery = query(collection(db, 'conversations'), where('participants', 'array-contains', firebaseUser.uid));
              const conversationsSnapshot = await getDocs(conversationsQuery);
              const fetchedConversations = conversationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Conversation));
              setConversations(fetchedConversations);

              const preferenceResponse = await discoveryService.getDiscoveryPreferences().catch(() => null);
              if (preferenceResponse?.preferences) {
                setPreferencesState(normalizeDiscoveryPreferences(preferenceResponse.preferences));
              }

              const tasteResponse = await discoveryService.getTasteProfile().catch(() => null);
              if (tasteResponse?.profile) {
                setTasteProfileState(normalizeTasteProfile(tasteResponse.profile));
              }
              await refreshRemoteDiscovery();
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
        if (hasLocalMockAuthSession()) {
          setIsLocalMockAuth(true);
          setLoading(false);
          return;
        }
        setUser(null);
        setOnboarding(true);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isLocalOnlyMode, localUser]);

  const setPreferences = async (prefs: DiscoveryPreferences) => {
    const normalized = normalizeDiscoveryPreferences(prefs);
    setPreferencesState(normalized);
    if (isLocalOnlyMode || !user) {
      refreshLocalDiscovery(normalized);
      return;
    }

    try {
      const response = await discoveryService.saveDiscoveryPreferences(normalized);
      const serverPreferences = normalizeDiscoveryPreferences(response?.preferences ?? normalized);
      setPreferencesState(serverPreferences);
      await discoveryService.recordTasteEvent('hard_filter_edited').catch(() => null);
      await refreshRemoteDiscovery();
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const setTasteProfile = async (profile: TasteProfileDraft) => {
    const normalized = normalizeTasteProfile(profile);
    setTasteProfileState(normalized);
    setTasteStateRaw(prev => ({
      ...cloneTasteState(prev),
      learningPaused: normalized.learning.paused,
      optedOut: normalized.learning.optedOut,
    }));
    if (isLocalOnlyMode || !user) {
      return;
    }

    try {
      await setDoc(doc(db, `users/${user.uid}/private/taste_profile`), normalized);
    } catch (error) {
      console.error('Error saving taste profile:', error);
    }
  };

  const likeProfile = async (profileId: string): Promise<boolean> => {
    if (!user) return false;

    const profile = [...dailyPicks, ...exploreProfiles, ...MOCK_PROFILES]
      .find(p => p.id === profileId || p.uid === profileId);
    if (!profile) {
      return false;
    }

    setInteractions(prev => ({
      ...prev,
      likes: [...prev.likes, `Profile with tags: ${profile.tags.join(', ')} and observance: ${profile.observance}`],
    }));
    applyTasteEvent(user.uid, {
      name: 'like', class: 'explicit_preference',
      candidateId: profileId, candidateFeatures: profileToFeatureTags(profile),
      occurredAt: Date.now(),
    });
    discoveryService.recordTasteEvent('like', profileId).catch(() => null);

    if (isLocalOnlyMode) {
      setExploreProfiles(prev => prev.filter(p => p.id !== profileId));
      setDailyPicks(prev => prev.filter(p => p.id !== profileId));
      const isMatch = profile.id === MOCK_PROFILES[0]?.id;
      if (isMatch) {
        const newMatch: Match = {
          id: `demo-match-${user.uid}-${profile.uid}`,
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
      const result = await discoveryService.likeProfile(profile.uid ?? profileId);
      setExploreProfiles(prev => prev.filter(p => p.id !== profileId));
      setDailyPicks(prev => prev.filter(p => p.id !== profileId));

      if (result?.isMatch && result.match) {
        const newMatch: Match = {
          ...result.match,
          participants: result.match.participants?.length ? result.match.participants : [profile],
        };
        setMatches(prev => [newMatch, ...prev.filter(match => match.id !== newMatch.id)]);
        setConversations(prev => [
          {
            id: newMatch.id,
            participants: [profile],
            messages: [],
          },
          ...prev.filter(conversation => conversation.id !== newMatch.id),
        ]);
        return true;
      }
    } catch (error) {
      console.error('Error saving like:', error);
    }

    setExploreProfiles(prev => prev.filter(p => p.id !== profileId));
    setDailyPicks(prev => prev.filter(p => p.id !== profileId));
    return false;
  };

  const passProfile = async (profileId: string) => {
    if (!user) return;

    const profile = [...dailyPicks, ...exploreProfiles, ...MOCK_PROFILES]
      .find(p => p.id === profileId || p.uid === profileId);
    if (profile) {
      setInteractions(prev => ({
        ...prev,
        passes: [...prev.passes, `Profile with tags: ${profile.tags.join(', ')} and observance: ${profile.observance}`],
      }));
      applyTasteEvent(user.uid, {
        name: 'pass', class: 'explicit_preference',
        candidateId: profileId, candidateFeatures: profileToFeatureTags(profile),
        occurredAt: Date.now(),
      });
    }

    setExploreProfiles(prev => prev.filter(p => p.id !== profileId));
    setDailyPicks(prev => prev.filter(p => p.id !== profileId));

    if (isLocalOnlyMode || !profile) {
      return;
    }

    try {
      await discoveryService.passProfile(profile.uid ?? profileId);
      await discoveryService.recordTasteEvent('pass', profileId).catch(() => null);
    } catch (error) {
      console.error('Error saving pass:', error);
    }
  };

  const moreLikeThis = async (profileId: string) => {
    if (!user) return;
    const profile = [...dailyPicks, ...exploreProfiles, ...MOCK_PROFILES]
      .find(p => p.id === profileId || p.uid === profileId);
    if (!profile) return;

    const newInteractions = {
      ...interactions,
      moreLikeThis: [...interactions.moreLikeThis, `Profile with tags: ${profile.tags.join(', ')} and observance: ${profile.observance}`],
    };
    setInteractions(newInteractions);
    applyTasteEvent(user.uid, {
      name: 'more_like_this', class: 'explicit_preference',
      candidateId: profileId, candidateFeatures: profileToFeatureTags(profile),
      occurredAt: Date.now(),
    });
    discoveryService.recordTasteEvent('more_like_this', profileId).catch(() => null);

    if (isLocalOnlyMode) {
      setTasteProfileState(prev => ({
        ...prev,
        soft_preferences: Array.from(new Set([...(prev.soft_preferences ?? []), ...profile.tags.slice(0, 2)])),
      }));
      return;
    }

    try {
      const { doc, setDoc } = await import('firebase/firestore');
      await setDoc(doc(db, `users/${user.uid}/private/interactions`), {
        moreLikeThis: [...interactions.moreLikeThis, profileId],
      }, { merge: true });

      const { aiService } = await import('../services/aiService');
      const newProfile = await aiService.analyzeTasteProfile(newInteractions, tasteProfile);
      if (newProfile) {
        setTasteProfile(normalizeTasteProfile(newProfile));
      }
    } catch (error) {
      console.error('Failed to update taste profile:', error);
    }
  };

  const lessLikeThis = async (profileId: string) => {
    if (!user) return;
    const profile = [...dailyPicks, ...exploreProfiles, ...MOCK_PROFILES]
      .find(p => p.id === profileId || p.uid === profileId);
    if (!profile) return;

    const newInteractions = {
      ...interactions,
      lessLikeThis: [...interactions.lessLikeThis, `Profile with tags: ${profile.tags.join(', ')} and observance: ${profile.observance}`],
    };
    setInteractions(newInteractions);
    applyTasteEvent(user.uid, {
      name: 'less_like_this', class: 'explicit_preference',
      candidateId: profileId, candidateFeatures: profileToFeatureTags(profile),
      occurredAt: Date.now(),
    });
    discoveryService.recordTasteEvent('less_like_this', profileId).catch(() => null);

    if (isLocalOnlyMode) {
      setTasteProfileState(prev => ({
        ...prev,
        things_to_avoid: Array.from(new Set([...(prev.things_to_avoid ?? []), ...profile.tags.slice(0, 2)])),
      }));
      return;
    }

    try {
      const { doc, setDoc } = await import('firebase/firestore');
      await setDoc(doc(db, `users/${user.uid}/private/interactions`), {
        lessLikeThis: [...interactions.lessLikeThis, profileId],
      }, { merge: true });

      const { aiService } = await import('../services/aiService');
      const newProfile = await aiService.analyzeTasteProfile(newInteractions, tasteProfile);
      if (newProfile) {
        setTasteProfile(normalizeTasteProfile(newProfile));
      }
    } catch (error) {
      console.error('Failed to update taste profile:', error);
    }
  };

  const resetTasteProfile = async () => {
    const emptyProfile = normalizeTasteProfile({
      ...cloneDefaultTasteProfile(),
      learning: {
        paused: tasteProfile.learning.paused,
        optedOut: tasteProfile.learning.optedOut,
        lastUpdatedAt: new Date().toISOString(),
      },
    });
    setTasteProfileState(emptyProfile);

    const emptyInteractions = {
      likes: [],
      passes: [],
      moreLikeThis: [],
      lessLikeThis: [],
    };
    setInteractions(emptyInteractions);

    const freshTasteState = emptyTasteStateForProfile(emptyProfile);
    setTasteStateRaw(freshTasteState);
    if (isLocalOnlyMode) {
      refreshLocalDiscovery(preferences, freshTasteState);
      return;
    }

    if (!user) return;

    try {
      const { doc, setDoc } = await import('firebase/firestore');
      await setDoc(doc(db, `users/${user.uid}/private/taste_profile`), emptyProfile);
      await setDoc(doc(db, `users/${user.uid}/private/interactions`), emptyInteractions);
      await setDoc(doc(db, `users/${user.uid}/private/taste_state`), serializeTasteState(freshTasteState));
      await discoveryService.resetTasteProfile().catch(() => null);
      await refreshRemoteDiscovery();
    } catch (error) {
      console.error('Error resetting taste profile in Firestore:', error);
    }
  };

  const pauseTasteLearning = async (paused: boolean) => {
    const updatedProfile = normalizeTasteProfile({
      ...tasteProfile,
      learning: {
        ...tasteProfile.learning,
        paused,
        optedOut: paused ? tasteProfile.learning.optedOut : false,
        lastUpdatedAt: new Date().toISOString(),
      },
    });
    setTasteProfileState(updatedProfile);
    setTasteStateRaw(prev => ({ ...cloneTasteState(prev), learningPaused: paused, optedOut: updatedProfile.learning.optedOut }));

    if (isLocalOnlyMode || !user) return;
    try {
      await setDoc(doc(db, `users/${user.uid}/private/taste_profile`), updatedProfile);
      await discoveryService.recordTasteEvent(paused ? 'taste_pause' : 'taste_consent_granted').catch(() => null);
    } catch (error) {
      console.error('Error updating taste pause state:', error);
    }
  };

  const optOutTasteLearning = async () => {
    const updatedProfile = normalizeTasteProfile({
      ...tasteProfile,
      learning: {
        paused: true,
        optedOut: true,
        lastUpdatedAt: new Date().toISOString(),
      },
    });
    setTasteProfileState(updatedProfile);
    setTasteStateRaw(prev => ({ ...cloneTasteState(prev), learningPaused: true, optedOut: true }));

    if (isLocalOnlyMode || !user) return;
    try {
      await setDoc(doc(db, `users/${user.uid}/private/taste_profile`), updatedProfile);
      await setDoc(doc(db, `users/${user.uid}/private/taste_state`), serializeTasteState({
        ...emptyTasteState(),
        learningPaused: true,
        optedOut: true,
      }));
      await discoveryService.recordTasteEvent('taste_pause').catch(() => null);
    } catch (error) {
      console.error('Error opting out of taste learning:', error);
    }
  };

  const exportTasteProfile = async () => {
    if (!isLocalOnlyMode && user) {
      try {
        return await discoveryService.exportTasteProfile();
      } catch (error) {
        console.error('Error exporting taste profile:', error);
      }
    }

    return {
      exportedAt: new Date().toISOString(),
      userId: user?.uid ?? null,
      tasteProfile,
      tasteState: serializeTasteState(tasteState),
    };
  };

  const deleteTasteProfile = async () => {
    const emptyProfile = cloneDefaultTasteProfile();
    const freshTasteState = emptyTasteStateForProfile(emptyProfile);
    setTasteProfileState(emptyProfile);
    setTasteStateRaw(freshTasteState);
    setInteractions({
      likes: [],
      passes: [],
      moreLikeThis: [],
      lessLikeThis: [],
    });
    if (isLocalOnlyMode) {
      refreshLocalDiscovery(preferences, freshTasteState);
      return;
    }

    if (!user) return;
    try {
      await discoveryService.deleteTasteProfile();
      await refreshRemoteDiscovery();
    } catch (error) {
      console.error('Error deleting taste profile:', error);
    }
  };

  const sendMessage = async (conversationId: string, text: string, aiAssisted?: boolean) => {
    if (!user) return;
    const newMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      senderId: user.uid,
      text,
      createdAt: new Date().toISOString(),
      aiAssisted,
    };

    setConversations(prev => prev.map(c =>
      c.id === conversationId
        ? { ...c, messages: [...c.messages, newMessage], lastMessage: newMessage }
        : c
    ));

    if (isLocalOnlyMode) {
      return;
    }

    try {
      const { doc, updateDoc, arrayUnion } = await import('firebase/firestore');
      await updateDoc(doc(db, 'conversations', conversationId), {
        messages: arrayUnion(newMessage),
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const activateLocalMockAuth = () => {
    setLocalMockAuthSession(true);
    setIsLocalMockAuth(true);
    setUser(LOCAL_DEV_USER);
    setOnboarding(false);
    setIsAgeVerified(true);
    setHasAcceptedTerms(true);
    setIsPremium(true);
    setMatches(DEMO_MATCHES);
    setConversations(DEMO_CONVERSATIONS);
    const ranked = rankLocalDiscovery(LOCAL_DEV_USER, preferences, tasteState);
    setDailyPicks(ranked.daily);
    setExploreProfiles(ranked.explore);
    setLoading(false);
  };

  const signIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      if (isLocalDevMockAuthEnabled()) {
        activateLocalMockAuth();
        return;
      }
      throw error;
    }
  };

  const signOut = async () => {
    setLocalMockAuthSession(false);
    setIsLocalMockAuth(false);
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
      tasteState,
      isPremium,
      isAgeVerified,
      hasAcceptedTerms,
      isOnboarding,
      loading,
      isDemoMode,
      isLocalMockAuth,
      interactions,
      signIn,
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
      pauseTasteLearning,
      optOutTasteLearning,
      exportTasteProfile,
      deleteTasteProfile,
      sendMessage,
      signOut,
      verifyAge,
      acceptTerms,
      trackEvent,
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