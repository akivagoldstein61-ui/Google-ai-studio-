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
  type EventName,
  type EventClass,
  applyEvent,
  emptyTasteState,
} from '@/lib/learnedTaste';
import { serializeTasteState, deserializeTasteState, cloneTasteState, profileToFeatureTags } from '@/lib/tastePersistence';
import { selectDailyPicks, selectExploreProfiles } from '@/lib/integratedRanking';
import { discoveryService } from '@/services/discoveryService';

type TasteInteractions = {
  likes: string[];
  passes: string[];
  moreLikeThis: string[];
  lessLikeThis: string[];
};

type TasteSignalOptions = {
  value?: number;
  surface?: TasteEvent['surface'];
};

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
  interactions: TasteInteractions;
  signIn: () => Promise<void>;
  setLanguage: (lang: 'en' | 'he') => void;
  setUser: (user: Profile | null) => void;
  setOnboarding: (isOnboarding: boolean) => void;
  setPreferences: (prefs: DiscoveryPreferences) => Promise<void>;
  likeProfile: (profileId: string) => Promise<boolean>;
  passProfile: (profileId: string) => Promise<void>;
  moreLikeThis: (profileId: string) => Promise<void>;
  lessLikeThis: (profileId: string) => Promise<void>;
  recordTasteSignal: (name: EventName, profileId: string, options?: TasteSignalOptions) => void;
  resetTasteProfile: () => Promise<void>;
  setTasteProfile: (profile: TasteProfileDraft) => Promise<void>;
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

function createEmptyInteractions(): TasteInteractions {
  return {
    likes: [],
    passes: [],
    moreLikeThis: [],
    lessLikeThis: [],
  };
}

function createDemoInteractions(): TasteInteractions {
  return {
    likes: ['Profile with tags: Traditional, History, Beach and observance: traditional', 'Profile with tags: Masorti, Dogs, Foodie and observance: masorti'],
    passes: ['Profile with tags: Secular, Art, Spontaneous and observance: secular'],
    moreLikeThis: ['Profile with tags: Introverted, Thoughtful'],
    lessLikeThis: ['Profile with tags: Extroverted'],
  };
}

function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : [];
}

function normalizeTasteInteractions(raw: any): TasteInteractions {
  const input = raw && typeof raw === 'object' ? raw : {};
  return {
    likes: stringList(input.likes),
    passes: stringList(input.passes),
    moreLikeThis: stringList(input.moreLikeThis),
    lessLikeThis: stringList(input.lessLikeThis),
  };
}

function eventClassForTasteSignal(name: EventName): EventClass {
  switch (name) {
    case 'onboarding_completed':
    case 'hard_filter_edited':
    case 'soft_preference_edited':
    case 'taste_consent_granted':
    case 'taste_reset':
    case 'taste_pause':
      return 'policy_consent';
    case 'profile_open':
    case 'photo_carousel_depth':
    case 'prompt_expanded':
    case 'long_dwell':
    case 'reply_received':
      return 'high_signal_implicit';
    case 'surface_seen':
    case 'session_stage':
      return 'context';
    default:
      return 'explicit_preference';
  }
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
  const [interactions, setInteractions] = useState<TasteInteractions>(() => (
    isLocalOnlyMode ? createDemoInteractions() : createEmptyInteractions()
  ));

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

  const applyTasteEvent = (
    uid: string | undefined,
    ev: TasteEvent,
    options: { persistRemote?: boolean } = {},
  ) => {
    setTasteStateRaw(prev => {
      const next = applyEvent(cloneTasteState(prev), ev);
      if (isLocalOnlyMode && user) {
        const nextPrefs = preferences;
        setTimeout(() => refreshLocalDiscovery(nextPrefs, next, user), 0);
      }
      if (!isLocalOnlyMode && uid && options.persistRemote !== false) {
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
      setInteractions(createDemoInteractions());
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

              const interactionsResponse = await discoveryService.getTasteInteractions().catch(() => null);
              if (interactionsResponse?.interactions) {
                setInteractions(normalizeTasteInteractions(interactionsResponse.interactions));
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
            setInteractions(createEmptyInteractions());
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
        setInteractions(createEmptyInteractions());
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isLocalOnlyMode, localUser]);

  const setPreferences = async (prefs: DiscoveryPreferences) => {
    const normalized = normalizeDiscoveryPreferences(prefs);
    const previousPreferences = preferences;
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
      setPreferencesState(previousPreferences);
      throw error;
    }
  };

  const setTasteProfile = async (profile: TasteProfileDraft) => {
    const normalized = normalizeTasteProfile(profile);
    const previousProfile = tasteProfile;
    const previousTasteState = tasteState;
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
      setTasteProfileState(previousProfile);
      setTasteStateRaw(previousTasteState);
      throw error;
    }
  };

  const findKnownProfile = (profileId: string) => [...dailyPicks, ...exploreProfiles, ...MOCK_PROFILES]
    .find(p => p.id === profileId || p.uid === profileId);

  const likeProfile = async (profileId: string): Promise<boolean> => {
    if (!user) return false;

    const profile = findKnownProfile(profileId);
    if (!profile) {
      return false;
    }

    if (isLocalOnlyMode) {
      setInteractions(prev => ({
        ...prev,
        likes: [...prev.likes, `Profile with tags: ${profile.tags.join(', ')} and observance: ${profile.observance}`],
      }));
      applyTasteEvent(user.uid, {
        name: 'like', class: 'explicit_preference',
        candidateId: profileId, candidateFeatures: profileToFeatureTags(profile),
        occurredAt: Date.now(),
      });
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
      if (result?.persisted !== true || result?.tastePersisted !== true) {
        throw new Error('Like was not fully persisted');
      }
      setInteractions(prev => ({
        ...prev,
        likes: [...prev.likes, `Profile with tags: ${profile.tags.join(', ')} and observance: ${profile.observance}`],
      }));
      applyTasteEvent(user.uid, {
        name: 'like', class: 'explicit_preference',
        candidateId: profileId, candidateFeatures: profileToFeatureTags(profile),
        occurredAt: Date.now(),
      }, { persistRemote: false });
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
      return false;
    } catch (error) {
      console.error('Error saving like:', error);
      throw error;
    }
  };

  const passProfile = async (profileId: string): Promise<void> => {
    if (!user) return;

    const profile = findKnownProfile(profileId);
    if (!profile) return;

    if (isLocalOnlyMode) {
      setInteractions(prev => ({
        ...prev,
        passes: [...prev.passes, `Profile with tags: ${profile.tags.join(', ')} and observance: ${profile.observance}`],
      }));
      applyTasteEvent(user.uid, {
        name: 'pass', class: 'explicit_preference',
        candidateId: profileId, candidateFeatures: profileToFeatureTags(profile),
        occurredAt: Date.now(),
      });
      setExploreProfiles(prev => prev.filter(p => p.id !== profileId));
      setDailyPicks(prev => prev.filter(p => p.id !== profileId));
      return;
    }

    try {
      const result = await discoveryService.passProfile(profile.uid ?? profileId);
      if (result?.persisted !== true || result?.tastePersisted !== true) {
        throw new Error('Pass was not fully persisted');
      }
      setInteractions(prev => ({
        ...prev,
        passes: [...prev.passes, `Profile with tags: ${profile.tags.join(', ')} and observance: ${profile.observance}`],
      }));
      applyTasteEvent(user.uid, {
        name: 'pass', class: 'explicit_preference',
        candidateId: profileId, candidateFeatures: profileToFeatureTags(profile),
        occurredAt: Date.now(),
      }, { persistRemote: false });
      setExploreProfiles(prev => prev.filter(p => p.id !== profileId));
      setDailyPicks(prev => prev.filter(p => p.id !== profileId));
    } catch (error) {
      console.error('Error saving pass:', error);
      throw error;
    }
  };

  const moreLikeThis = async (profileId: string): Promise<void> => {
    if (!user) return;
    const profile = findKnownProfile(profileId);
    if (!profile) return;

    const newInteractions = {
      ...interactions,
      moreLikeThis: [...interactions.moreLikeThis, `Profile with tags: ${profile.tags.join(', ')} and observance: ${profile.observance}`],
    };

    if (isLocalOnlyMode) {
      setInteractions(newInteractions);
      applyTasteEvent(user.uid, {
        name: 'more_like_this', class: 'explicit_preference',
        candidateId: profileId, candidateFeatures: profileToFeatureTags(profile),
        occurredAt: Date.now(),
      });
      setTasteProfileState(prev => ({
        ...prev,
        soft_preferences: Array.from(new Set([...(prev.soft_preferences ?? []), ...profile.tags.slice(0, 2)])),
      }));
      return;
    }

    try {
      await discoveryService.recordTasteEvent('more_like_this', profile.uid ?? profileId);
      const { aiService } = await import('../services/aiService');
      const newProfile = await aiService.analyzeTasteProfile(newInteractions, tasteProfile);
      if (newProfile) {
        await setTasteProfile(normalizeTasteProfile(newProfile));
      }
      setInteractions(newInteractions);
      applyTasteEvent(user.uid, {
        name: 'more_like_this', class: 'explicit_preference',
        candidateId: profileId, candidateFeatures: profileToFeatureTags(profile),
        occurredAt: Date.now(),
      }, { persistRemote: false });
    } catch (error) {
      console.error('Failed to update taste profile:', error);
      throw error;
    }
  };

  const lessLikeThis = async (profileId: string): Promise<void> => {
    if (!user) return;
    const profile = findKnownProfile(profileId);
    if (!profile) return;

    const newInteractions = {
      ...interactions,
      lessLikeThis: [...interactions.lessLikeThis, `Profile with tags: ${profile.tags.join(', ')} and observance: ${profile.observance}`],
    };

    if (isLocalOnlyMode) {
      setInteractions(newInteractions);
      applyTasteEvent(user.uid, {
        name: 'less_like_this', class: 'explicit_preference',
        candidateId: profileId, candidateFeatures: profileToFeatureTags(profile),
        occurredAt: Date.now(),
      });
      setTasteProfileState(prev => ({
        ...prev,
        things_to_avoid: Array.from(new Set([...(prev.things_to_avoid ?? []), ...profile.tags.slice(0, 2)])),
      }));
      return;
    }

    try {
      await discoveryService.recordTasteEvent('less_like_this', profile.uid ?? profileId);
      const { aiService } = await import('../services/aiService');
      const newProfile = await aiService.analyzeTasteProfile(newInteractions, tasteProfile);
      if (newProfile) {
        await setTasteProfile(normalizeTasteProfile(newProfile));
      }
      setInteractions(newInteractions);
      applyTasteEvent(user.uid, {
        name: 'less_like_this', class: 'explicit_preference',
        candidateId: profileId, candidateFeatures: profileToFeatureTags(profile),
        occurredAt: Date.now(),
      }, { persistRemote: false });
    } catch (error) {
      console.error('Failed to update taste profile:', error);
      throw error;
    }
  };

  const recordTasteSignal = (name: EventName, profileId: string, options: TasteSignalOptions = {}) => {
    if (!user) return;
    const profile = findKnownProfile(profileId);
    if (!profile) return;

    applyTasteEvent(user.uid, {
      name,
      class: eventClassForTasteSignal(name),
      candidateId: profile.uid ?? profileId,
      candidateFeatures: profileToFeatureTags(profile),
      value: options.value,
      surface: options.surface,
      occurredAt: Date.now(),
    });

    if (!isLocalOnlyMode) {
      discoveryService.recordTasteEvent(name, profile.uid ?? profileId, options).catch(() => null);
    }
  };

  const resetTasteProfile = async () => {
    const previousProfile = tasteProfile;
    const previousInteractions = interactions;
    const previousTasteState = tasteState;
    const emptyProfile = normalizeTasteProfile({
      ...cloneDefaultTasteProfile(),
      learning: {
        paused: tasteProfile.learning.paused,
        optedOut: tasteProfile.learning.optedOut,
        lastUpdatedAt: new Date().toISOString(),
      },
    });
    setTasteProfileState(emptyProfile);

    const nextEmptyInteractions = createEmptyInteractions();
    setInteractions(nextEmptyInteractions);

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
      await setDoc(doc(db, `users/${user.uid}/private/interactions`), nextEmptyInteractions);
      await setDoc(doc(db, `users/${user.uid}/private/taste_state`), serializeTasteState(freshTasteState));
      await discoveryService.resetTasteProfile();
      await refreshRemoteDiscovery();
    } catch (error) {
      console.error('Error resetting taste profile in Firestore:', error);
      setTasteProfileState(previousProfile);
      setInteractions(previousInteractions);
      setTasteStateRaw(previousTasteState);
      throw error;
    }
  };

  const pauseTasteLearning = async (paused: boolean) => {
    const previousProfile = tasteProfile;
    const previousTasteState = tasteState;
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
      await discoveryService.recordTasteEvent(paused ? 'taste_pause' : 'taste_consent_granted', undefined, {
        paused,
        optedOut: updatedProfile.learning.optedOut,
      }).catch(() => null);
    } catch (error) {
      console.error('Error updating taste pause state:', error);
      setTasteProfileState(previousProfile);
      setTasteStateRaw(previousTasteState);
      throw error;
    }
  };

  const optOutTasteLearning = async () => {
    const previousProfile = tasteProfile;
    const previousTasteState = tasteState;
    const updatedProfile = normalizeTasteProfile({
      ...tasteProfile,
      learning: {
        paused: true,
        optedOut: true,
        lastUpdatedAt: new Date().toISOString(),
      },
    });
    const optedOutTasteState = {
      ...emptyTasteState(),
      learningPaused: true,
      optedOut: true,
    };
    setTasteProfileState(updatedProfile);
    setTasteStateRaw(optedOutTasteState);

    if (isLocalOnlyMode || !user) return;
    try {
      await setDoc(doc(db, `users/${user.uid}/private/taste_profile`), updatedProfile);
      await setDoc(doc(db, `users/${user.uid}/private/taste_state`), serializeTasteState(optedOutTasteState));
      await discoveryService.recordTasteEvent('taste_pause', undefined, { paused: true, optedOut: true }).catch(() => null);
    } catch (error) {
      console.error('Error opting out of taste learning:', error);
      setTasteProfileState(previousProfile);
      setTasteStateRaw(previousTasteState);
      throw error;
    }
  };

  const exportTasteProfile = async () => {
    if (!isLocalOnlyMode && user) {
      try {
        return await discoveryService.exportTasteProfile();
      } catch (error) {
        console.error('Error exporting taste profile:', error);
        throw error;
      }
    }

    return {
      exportedAt: new Date().toISOString(),
      userId: user?.uid ?? null,
      tasteProfile,
      tasteState: serializeTasteState(tasteState),
      interactions,
    };
  };

  const deleteTasteProfile = async () => {
    const previousProfile = tasteProfile;
    const previousInteractions = interactions;
    const previousTasteState = tasteState;
    const emptyProfile = cloneDefaultTasteProfile();
    const freshTasteState = emptyTasteStateForProfile(emptyProfile);
    setTasteProfileState(emptyProfile);
    setTasteStateRaw(freshTasteState);
    setInteractions(createEmptyInteractions());
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
      setTasteProfileState(previousProfile);
      setInteractions(previousInteractions);
      setTasteStateRaw(previousTasteState);
      throw error;
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
    setInteractions(createDemoInteractions());
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
    setInteractions(createEmptyInteractions());
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
      recordTasteSignal,
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
