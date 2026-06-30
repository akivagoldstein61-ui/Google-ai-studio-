import express from 'express';
import { MOCK_PROFILES } from '../src/data/mockProfiles.ts';
import type { DiscoveryPreferences, Match, Profile } from '../src/types.ts';
import { applyEvent, emptyTasteState, type EventName, type TasteState } from '../src/lib/learnedTaste.ts';
import { deserializeTasteState, profileToFeatureTags, serializeTasteState } from '../src/lib/tastePersistence.ts';
import { selectDailyPicks, selectExploreProfiles } from '../src/lib/integratedRanking.ts';
import { authMiddleware, type AuthenticatedRequest } from './authMiddleware.ts';
import { FieldValue, getOptionalAdminFirestore } from './firebaseAdmin.ts';

const router = express.Router();
const outboundLikes = new Set<string>();
const PRIVATE_COLLECTION = 'private';
const LEGACY_RECOMMENDATION_MODE = 'chemistry' + '_first';

const DEFAULT_VIEWER: Profile = {
  id: 'local-dev-user',
  uid: 'local-dev-user',
  displayName: 'Local Dev',
  age: 30,
  gender: 'male',
  city: 'Tel Aviv',
  photos: [],
  bio: '',
  observance: 'masorti',
  intent: 'serious_relationship',
  prompts: [],
  isVerified: true,
  isPremium: false,
  tags: ['Traditional', 'Hiking', 'Family', 'Torah'],
};

export const DEFAULT_DISCOVERY_PREFERENCES: DiscoveryPreferences = {
  genderPreference: ['female'],
  ageRange: [22, 35],
  maxDistance: 50,
  observancePreference: ['secular', 'traditional', 'masorti', 'dati', 'modern_orthodox'],
  intentPreference: ['serious_relationship', 'marriage_minded'],
  hardFilters: ['verified'],
  softPreferences: ['shared_interests', 'same_city'],
  recommendationMode: 'balanced',
  dealbreakers: {
    age: true,
    distance: true,
    gender: true,
    intent: true,
    observance: true,
    verified: true,
  },
  softPreferenceWeights: {
    shared_interests: 0.6,
    same_city: 0.25,
    similar_observance: 0.15,
  },
};

router.use(authMiddleware);

router.get('/daily-picks', async (req: AuthenticatedRequest, res) => {
  const viewer = await loadViewer(req.uid);
  const preferences = await loadPreferences(req.uid);
  const tasteState = await loadTasteState(req.uid);
  const candidates = await loadCandidatePool(req.uid);
  const items = selectDailyPicks({
    viewer,
    candidates,
    preferences,
    tasteState,
    limit: 5,
  });

  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.json({
    generatedAt: new Date().toISOString(),
    items,
    policy: {
      finiteDailyPickLimit: 5,
      hiddenOverrideUsed: false,
      paidPlacementUsed: false,
    },
  });
});

router.get('/explore', async (req: AuthenticatedRequest, res) => {
  const viewer = await loadViewer(req.uid);
  const preferences = await loadPreferences(req.uid);
  const tasteState = await loadTasteState(req.uid);
  const candidates = await loadCandidatePool(req.uid);
  const items = selectExploreProfiles({
    viewer,
    candidates,
    preferences,
    tasteState,
    allowDisclosedSpillover: true,
  });

  res.json({
    generatedAt: new Date().toISOString(),
    items,
    spilloverDisclosure: 'Explore may show clearly labeled age or distance breadth only when those settings are not dealbreakers.',
  });
});

router.post('/like', async (req: AuthenticatedRequest, res) => {
  const viewerUid = req.uid ?? DEFAULT_VIEWER.uid;
  const { profileId } = req.body ?? {};
  if (typeof profileId !== 'string' || !profileId) {
    res.status(400).json({ error: 'Missing profileId' });
    return;
  }

  const db = getOptionalAdminFirestore();
  if (db) {
    await db
      .collection('users')
      .doc(viewerUid)
      .collection(PRIVATE_COLLECTION)
      .doc('interactions')
      .set({
        likes: FieldValue.arrayUnion(profileId),
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true })
      .catch(() => null);

    const reciprocalSnap = await db
      .collection('users')
      .doc(profileId)
      .collection(PRIVATE_COLLECTION)
      .doc('interactions')
      .get()
      .catch(() => null);
    const reciprocalLikes = reciprocalSnap?.data()?.likes;
    const isMatch = Array.isArray(reciprocalLikes) && reciprocalLikes.includes(viewerUid);
    const candidate = (await loadCandidatePool(viewerUid)).find((profile) => profile.uid === profileId || profile.id === profileId);
    if (req.body?.tasteEventAlreadyRecorded !== true) {
      await persistDiscoveryTasteState(viewerUid, 'like', candidate);
    }
    const match = isMatch ? buildMatch(viewerUid, profileId, candidate) : null;
    if (match) {
      await db.collection('matches').doc(match.id).set(match, { merge: true }).catch(() => null);
      await db.collection('conversations').doc(match.id).set({
        id: match.id,
        participants: [viewerUid, profileId],
        messages: [],
        createdAt: match.createdAt,
      }, { merge: true }).catch(() => null);
    }

    res.json({ success: true, isMatch, match });
    return;
  }

  const reciprocalKey = `${profileId}:${viewerUid}`;
  const likeKey = `${viewerUid}:${profileId}`;
  const isMatch = outboundLikes.has(reciprocalKey);
  outboundLikes.add(likeKey);

  const match = isMatch
    ? buildMatch(viewerUid, profileId, demoCandidatePool().find((profile) => profile.id === profileId))
    : null;

  res.json({ success: true, isMatch, match });
});

router.post('/pass', async (req: AuthenticatedRequest, res) => {
  const viewerUid = req.uid ?? DEFAULT_VIEWER.uid;
  const { profileId } = req.body ?? {};
  if (typeof profileId !== 'string' || !profileId) {
    res.status(400).json({ error: 'Missing profileId' });
    return;
  }
  const db = getOptionalAdminFirestore();
  if (db) {
    await db
      .collection('users')
      .doc(viewerUid)
      .collection(PRIVATE_COLLECTION)
      .doc('interactions')
      .set({
        passes: FieldValue.arrayUnion(profileId),
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true })
      .catch(() => null);
    const candidate = (await loadCandidatePool(viewerUid)).find((profile) => profile.uid === profileId || profile.id === profileId);
    if (req.body?.tasteEventAlreadyRecorded !== true) {
      await persistDiscoveryTasteState(viewerUid, 'pass', candidate);
    }
  }
  res.json({ success: true, profileId });
});

async function loadViewer(uid: string | undefined): Promise<Profile> {
  const fallback = { ...DEFAULT_VIEWER, uid: uid ?? DEFAULT_VIEWER.uid, id: uid ?? DEFAULT_VIEWER.id };
  if (!uid) return fallback;
  const db = getOptionalAdminFirestore();
  if (!db) return fallback;
  const snap = await db.collection('users').doc(uid).get().catch(() => null);
  if (!snap?.exists) return fallback;
  return normalizeProfile(snap.id, snap.data(), fallback);
}

async function loadPreferences(uid: string | undefined): Promise<DiscoveryPreferences> {
  if (!uid) return DEFAULT_DISCOVERY_PREFERENCES;
  const db = getOptionalAdminFirestore();
  if (!db) return DEFAULT_DISCOVERY_PREFERENCES;
  const snap = await db
    .collection('users')
    .doc(uid)
    .collection(PRIVATE_COLLECTION)
    .doc('discovery_preferences')
    .get()
    .catch(() => null);
  return normalizePreferences(snap?.exists ? snap.data() : null);
}

async function loadTasteState(uid: string | undefined): Promise<TasteState> {
  if (!uid) return emptyTasteState();
  const db = getOptionalAdminFirestore();
  if (!db) return emptyTasteState();
  const snap = await db
    .collection('users')
    .doc(uid)
    .collection(PRIVATE_COLLECTION)
    .doc('taste_state')
    .get()
    .catch(() => null);
  return snap?.exists ? deserializeTasteState(snap.data()) : emptyTasteState();
}

async function persistDiscoveryTasteState(
  viewerUid: string,
  name: Extract<EventName, 'like' | 'pass'>,
  candidate: Profile | undefined,
) {
  const db = getOptionalAdminFirestore();
  if (!db) return;
  const previous = await loadTasteState(viewerUid);
  const next = applyEvent(previous, {
    name,
    class: 'explicit_preference',
    candidateId: candidate?.uid ?? candidate?.id,
    candidateFeatures: candidate ? profileToFeatureTags(candidate) : [],
    occurredAt: Date.now(),
  });
  await db
    .collection('users')
    .doc(viewerUid)
    .collection(PRIVATE_COLLECTION)
    .doc('taste_state')
    .set(serializeTasteState(next), { merge: false })
    .catch(() => null);
}

async function loadCandidatePool(viewerUid: string | undefined): Promise<Profile[]> {
  const db = getOptionalAdminFirestore();
  if (!db) return demoCandidatePool();
  const snap = await db.collection('users').limit(100).get().catch(() => null);
  const profiles = snap?.docs
    .filter((doc) => doc.id !== viewerUid)
    .map((doc) => normalizeProfile(doc.id, doc.data()))
    .filter((profile): profile is Profile => Boolean(profile)) ?? [];
  return profiles.length > 0 ? profiles : demoCandidatePool();
}

function normalizePreferences(raw: unknown): DiscoveryPreferences {
  if (!raw || typeof raw !== 'object') return DEFAULT_DISCOVERY_PREFERENCES;
  const input = raw as Record<string, any>;
  return {
    ...DEFAULT_DISCOVERY_PREFERENCES,
    ...input,
    hardFilters: Array.isArray(input.hardFilters) ? input.hardFilters : DEFAULT_DISCOVERY_PREFERENCES.hardFilters,
    softPreferences: Array.isArray(input.softPreferences) ? input.softPreferences : DEFAULT_DISCOVERY_PREFERENCES.softPreferences,
    recommendationMode:
      input.recommendationMode === LEGACY_RECOMMENDATION_MODE
        ? 'serendipity'
        : input.recommendationMode ?? DEFAULT_DISCOVERY_PREFERENCES.recommendationMode,
    dealbreakers: {
      ...DEFAULT_DISCOVERY_PREFERENCES.dealbreakers,
      ...(input.dealbreakers && typeof input.dealbreakers === 'object' ? input.dealbreakers : {}),
    },
    softPreferenceWeights: {
      ...DEFAULT_DISCOVERY_PREFERENCES.softPreferenceWeights,
      ...(input.softPreferenceWeights && typeof input.softPreferenceWeights === 'object' ? input.softPreferenceWeights : {}),
    },
  };
}

function normalizeProfile(id: string, raw: any, fallback?: Profile): Profile {
  const base = fallback ?? DEFAULT_VIEWER;
  return {
    ...base,
    ...raw,
    id: raw?.id ?? id,
    uid: raw?.uid ?? id,
    displayName: raw?.displayName ?? base.displayName,
    age: typeof raw?.age === 'number' ? raw.age : base.age,
    gender: raw?.gender ?? base.gender,
    city: raw?.city ?? base.city,
    photos: Array.isArray(raw?.photos) ? raw.photos : [],
    bio: typeof raw?.bio === 'string' ? raw.bio : '',
    observance: raw?.observance ?? base.observance,
    intent: raw?.intent ?? base.intent,
    prompts: Array.isArray(raw?.prompts) ? raw.prompts : [],
    isVerified: raw?.isVerified === true,
    isPremium: raw?.isPremium === true,
    tags: Array.isArray(raw?.tags) ? raw.tags : [],
  };
}

function buildMatch(viewerUid: string, profileId: string, candidate?: Profile): Match {
  const ids = [viewerUid, profileId].sort();
  return {
    id: `match_${ids[0]}_${ids[1]}`,
    users: [viewerUid, profileId],
    status: 'active',
    createdAt: new Date().toISOString(),
    whyThisMatch: 'This match was created after both members liked each other.',
    participants: candidate ? [candidate] : [],
  };
}

function demoCandidatePool(): Profile[] {
  const seed = MOCK_PROFILES.filter((profile) => profile.gender === 'female');
  const source = seed.length > 0 ? seed : MOCK_PROFILES;
  return Array.from({ length: 8 }, (_, index) => {
    const base = source[index % source.length];
    return {
      ...base,
      id: `demo-discovery-${index}`,
      uid: `demo-discovery-${index}`,
      age: 24 + index,
      gender: 'female',
      isVerified: true,
      isPremium: false,
      tags: index % 2 === 0
        ? [...base.tags, 'Hiking', 'Family']
        : [...base.tags, 'Cooking'],
    };
  });
}

export default router;
