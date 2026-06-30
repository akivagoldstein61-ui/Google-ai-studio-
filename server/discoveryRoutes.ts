import express from 'express';
import { MOCK_PROFILES } from '../src/data/mockProfiles.ts';
import type { DiscoveryPreferences, Match, Profile } from '../src/types.ts';
import { applyEvent, emptyTasteState, type EventName, type TasteState } from '../src/lib/learnedTaste.ts';
import {
  emptySystemExclusionState,
  violatesSystemExclusions,
  type FairnessState,
  type SystemExclusionState,
} from '../src/lib/filteringGrammar.ts';
import { deserializeTasteState, profileToFeatureTags, serializeTasteState } from '../src/lib/tastePersistence.ts';
import { selectDailyPicks, selectExploreProfiles, type CandidateRankingContext, type RankedProfile } from '../src/lib/integratedRanking.ts';
import { authMiddleware, type AuthenticatedRequest } from './authMiddleware.ts';
import { FieldValue, getOptionalAdminFirestore } from './firebaseAdmin.ts';

const router = express.Router();
const outboundLikes = new Set<string>();
const PRIVATE_COLLECTION = 'private';
const LEGACY_RECOMMENDATION_MODE = 'chemistry' + '_first';
const DAY_MS = 24 * 60 * 60 * 1000;
const EXPOSURE_RETENTION_MS = 7 * DAY_MS;
const EXPOSURE_EVENT_LIMIT = 200;
const NEUTRAL_ACCOUNT_AGE_MS = 14 * DAY_MS;
const MIN_AGE = 18;
const MAX_AGE = 80;
const MAX_DISTANCE_KM = 500;

const VALID_GENDERS = new Set(['male', 'female', 'non_binary']);
const VALID_OBSERVANCE = new Set(['secular', 'traditional', 'masorti', 'dati', 'modern_orthodox', 'ultra_orthodox']);
const VALID_INTENTS = new Set(['marriage_minded', 'serious_relationship', 'open_to_possibilities']);
const VALID_RECOMMENDATION_MODES = new Set(['values_first', 'balanced', 'serendipity', 'open_exploration']);
const VALID_HARD_FILTERS = new Set(['verified', 'verified_only', 'age', 'age_range', 'distance', 'max_distance', 'gender', 'intent', 'intent_alignment', 'observance']);
const VALID_SOFT_PREFERENCES = new Set(['shared_interests', 'same_city', 'similar_observance', 'similar_age', 'values_alignment', 'pacing_alignment']);
const VALID_POOL_IMPACT_TIERS = new Set(['low', 'medium', 'high', 'very_high']);

type CandidatePoolOptions = {
  includeInteracted?: boolean;
};

type DiscoveryInteractionExclusionState = {
  likedUserIds: Set<string>;
  passedUserIds: Set<string>;
  matchedUserIds: Set<string>;
  hiddenUserIds: Set<string>;
  dismissedUserIds: Set<string>;
};

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
  softPreferences: ['shared_interests', 'same_city', 'similar_age'],
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
    similar_age: 0.35,
  },
};

router.use(authMiddleware);

router.get('/preferences', async (req: AuthenticatedRequest, res) => {
  const saved = req.uid ? await loadOptionalPreferences(req.uid) : undefined;
  const preferences = saved ?? DEFAULT_DISCOVERY_PREFERENCES;
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.json({
    preferences,
    source: saved ? 'private/discovery_preferences' : 'defaults',
    persisted: Boolean(saved),
  });
});

router.post('/preferences', async (req: AuthenticatedRequest, res) => {
  const viewerUid = req.uid;
  if (!viewerUid) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const nextPreferences = normalizePreferences(req.body?.preferences ?? req.body);
  const db = getOptionalAdminFirestore();
  let persisted = false;
  if (db) {
    persisted = await db
      .collection('users')
      .doc(viewerUid)
      .collection(PRIVATE_COLLECTION)
      .doc('discovery_preferences')
      .set({
        ...nextPreferences,
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: false })
      .then(() => true)
      .catch(() => false);
  }

  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.json({
    preferences: nextPreferences,
    persisted,
  });
});

router.get('/daily-picks', async (req: AuthenticatedRequest, res) => {
  const viewer = await loadViewer(req.uid);
  const preferences = await loadPreferences(req.uid);
  const tasteState = await loadTasteState(req.uid);
  const candidates = await loadCandidatePool(req.uid);
  const candidateContexts = await loadCandidateRankingContexts(candidates);
  const items = selectDailyPicks({
    viewer,
    candidates,
    preferences,
    tasteState,
    candidateContexts,
    limit: 5,
  });
  const exposureImpressionsRecorded = await recordDiscoveryImpressions(items);

  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.json({
    generatedAt: new Date().toISOString(),
    items,
    policy: {
      finiteDailyPickLimit: 5,
      hiddenOverrideUsed: false,
      paidPlacementUsed: false,
      systemExclusionsApplied: Boolean(req.uid),
      interactionExclusionsApplied: Boolean(req.uid),
      reciprocalPreferencesUsed: Object.values(candidateContexts).some((context) => Boolean(context.preferences || context.tasteState)),
      exposureFairnessUsed: Object.values(candidateContexts).some((context) => Boolean(context.fairness)),
      exposureImpressionsRecorded,
    },
  });
});

router.get('/explore', async (req: AuthenticatedRequest, res) => {
  const viewer = await loadViewer(req.uid);
  const preferences = await loadPreferences(req.uid);
  const tasteState = await loadTasteState(req.uid);
  const candidates = await loadCandidatePool(req.uid);
  const candidateContexts = await loadCandidateRankingContexts(candidates);
  const items = selectExploreProfiles({
    viewer,
    candidates,
    preferences,
    tasteState,
    candidateContexts,
    allowDisclosedSpillover: true,
  });
  const exposureImpressionsRecorded = await recordDiscoveryImpressions(items);

  res.json({
    generatedAt: new Date().toISOString(),
    items,
    systemExclusionsApplied: Boolean(req.uid),
    interactionExclusionsApplied: Boolean(req.uid),
    reciprocalPreferencesUsed: Object.values(candidateContexts).some((context) => Boolean(context.preferences || context.tasteState)),
    exposureFairnessUsed: Object.values(candidateContexts).some((context) => Boolean(context.fairness)),
    exposureImpressionsRecorded,
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
    const candidate = (await loadCandidatePool(viewerUid, { includeInteracted: true }))
      .find((profile) => profile.uid === profileId || profile.id === profileId);
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
    const candidate = (await loadCandidatePool(viewerUid, { includeInteracted: true }))
      .find((profile) => profile.uid === profileId || profile.id === profileId);
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
  return await loadOptionalPreferences(uid) ?? DEFAULT_DISCOVERY_PREFERENCES;
}

async function loadOptionalPreferences(uid: string): Promise<DiscoveryPreferences | undefined> {
  const db = getOptionalAdminFirestore();
  if (!db) return undefined;
  const snap = await db
    .collection('users')
    .doc(uid)
    .collection(PRIVATE_COLLECTION)
    .doc('discovery_preferences')
    .get()
    .catch(() => null);
  return snap?.exists ? normalizePreferences(snap.data()) : undefined;
}

async function loadTasteState(uid: string | undefined): Promise<TasteState> {
  if (!uid) return emptyTasteState();
  return await loadOptionalTasteState(uid) ?? emptyTasteState();
}

async function loadOptionalTasteState(uid: string): Promise<TasteState | undefined> {
  const db = getOptionalAdminFirestore();
  if (!db) return undefined;
  const snap = await db
    .collection('users')
    .doc(uid)
    .collection(PRIVATE_COLLECTION)
    .doc('taste_state')
    .get()
    .catch(() => null);
  return snap?.exists ? deserializeTasteState(snap.data()) : undefined;
}

async function loadOptionalFairnessState(uid: string): Promise<FairnessState | undefined> {
  const db = getOptionalAdminFirestore();
  if (!db) return undefined;
  const snap = await db
    .collection('users')
    .doc(uid)
    .collection(PRIVATE_COLLECTION)
    .doc('discovery_exposure')
    .get()
    .catch(() => null);
  return snap?.exists ? normalizeFairnessState(snap.data()) : undefined;
}

async function loadCandidateRankingContexts(candidates: Profile[]): Promise<Record<string, CandidateRankingContext>> {
  const db = getOptionalAdminFirestore();
  if (!db || candidates.length === 0) return {};
  const entries = await Promise.all(candidates.map<Promise<readonly [string, CandidateRankingContext] | null>>(async (candidate) => {
    const uid = candidate.uid || candidate.id;
    const [preferences, tasteState, fairness] = await Promise.all([
      loadOptionalPreferences(uid),
      loadOptionalTasteState(uid),
      loadOptionalFairnessState(uid),
    ]);
    if (!preferences && !tasteState && !fairness) return null;
    return [uid, { preferences, tasteState, fairness }] as const;
  }));
  return Object.fromEntries(entries.filter((entry): entry is readonly [string, CandidateRankingContext] => entry !== null));
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

async function loadCandidatePool(viewerUid: string | undefined, options: CandidatePoolOptions = {}): Promise<Profile[]> {
  const db = getOptionalAdminFirestore();
  if (!db) return demoCandidatePool();
  const [snap, exclusions, interactionExclusions] = await Promise.all([
    db.collection('users').limit(100).get().catch(() => null),
    loadSystemExclusions(viewerUid),
    options.includeInteracted
      ? Promise.resolve(emptyInteractionExclusionState())
      : loadInteractionExclusions(viewerUid),
  ]);
  const profiles = snap?.docs
    .filter((doc) => doc.id !== viewerUid)
    .map((doc) => normalizeProfile(doc.id, doc.data()))
    .filter((profile): profile is Profile => Boolean(profile)) ?? [];
  if (profiles.length === 0) return demoCandidatePool();
  return profiles.filter((profile) =>
    !violatesSystemExclusions(profile, exclusions).violates &&
    !excludesInteractedCandidate(profile, interactionExclusions)
  );
}

async function loadSystemExclusions(uid: string | undefined): Promise<SystemExclusionState> {
  const db = getOptionalAdminFirestore();
  if (!db || !uid) return emptySystemExclusionState();
  const docs = await Promise.all([
    db.collection('users').doc(uid).collection(PRIVATE_COLLECTION).doc('interactions').get().catch(() => null),
    db.collection('users').doc(uid).collection(PRIVATE_COLLECTION).doc('system_exclusions').get().catch(() => null),
    db.collection('users').doc(uid).collection(PRIVATE_COLLECTION).doc('safety').get().catch(() => null),
  ]);
  return normalizeSystemExclusions(docs.map((snap) => snap?.data()).filter(Boolean));
}

async function loadInteractionExclusions(uid: string | undefined): Promise<DiscoveryInteractionExclusionState> {
  const db = getOptionalAdminFirestore();
  if (!db || !uid) return emptyInteractionExclusionState();
  const snap = await db
    .collection('users')
    .doc(uid)
    .collection(PRIVATE_COLLECTION)
    .doc('interactions')
    .get()
    .catch(() => null);
  return normalizeInteractionExclusions(snap?.data());
}

async function recordDiscoveryImpressions(items: RankedProfile[]): Promise<number> {
  const db = getOptionalAdminFirestore();
  if (!db || items.length === 0) return 0;
  const profilesByUid = new Map<string, Profile>();
  for (const item of items) {
    const uid = item.profile.uid || item.profile.id;
    if (uid && !profilesByUid.has(uid)) profilesByUid.set(uid, item.profile);
  }
  const now = Date.now();
  const results = await Promise.all(Array.from(profilesByUid.entries()).map(async ([uid, profile]) => {
    const ref = db.collection('users').doc(uid).collection(PRIVATE_COLLECTION).doc('discovery_exposure');
    const snap = await ref.get().catch(() => null);
    const data = snap?.data() ?? {};
    const prior = normalizeTimestampArray(data.recentImpressionMs ?? data.recentImpressions ?? data.impressionTimestamps);
    const recentImpressionMs = [...prior.filter((ms) => now - ms <= EXPOSURE_RETENTION_MS), now]
      .slice(-EXPOSURE_EVENT_LIMIT);
    const profileCreatedAtMs = timestampToMs((profile as Profile & { createdAt?: unknown }).createdAt);
    const storedCreatedAtMs = timestampToMs(data.accountCreatedAt) ?? timestampToMs(data.createdAt);
    const createdAtMs = profileCreatedAtMs ?? storedCreatedAtMs;
    const candidateAccountAgeMs = createdAtMs != null
      ? Math.max(0, now - createdAtMs)
      : readNumber(data.candidateAccountAgeMs) ?? NEUTRAL_ACCOUNT_AGE_MS;
    const totalImpressions = Math.max(0, readNumber(data.totalImpressions) ?? 0) + 1;
    return await ref.set({
      candidateAccountAgeMs,
      impressionsLast24h: recentImpressionMs.filter((ms) => now - ms <= DAY_MS).length,
      impressionsLast7d: recentImpressionMs.length,
      recentImpressionMs,
      totalImpressions,
      lastImpressionAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true }).then(() => true).catch(() => false);
  }));
  return results.filter(Boolean).length;
}

function normalizePreferences(raw: unknown): DiscoveryPreferences {
  if (!raw || typeof raw !== 'object') return DEFAULT_DISCOVERY_PREFERENCES;
  const input = raw as Record<string, any>;
  return {
    genderPreference: normalizeStringList(input.genderPreference, VALID_GENDERS, DEFAULT_DISCOVERY_PREFERENCES.genderPreference),
    ageRange: normalizeAgeRange(input.ageRange),
    maxDistance: normalizeNumber(input.maxDistance, 0, MAX_DISTANCE_KM, DEFAULT_DISCOVERY_PREFERENCES.maxDistance),
    observancePreference: normalizeStringList(input.observancePreference, VALID_OBSERVANCE, DEFAULT_DISCOVERY_PREFERENCES.observancePreference),
    intentPreference: normalizeStringList(input.intentPreference, VALID_INTENTS, DEFAULT_DISCOVERY_PREFERENCES.intentPreference),
    hardFilters: normalizeStringList(input.hardFilters, VALID_HARD_FILTERS, DEFAULT_DISCOVERY_PREFERENCES.hardFilters),
    softPreferences: normalizeStringList(input.softPreferences, VALID_SOFT_PREFERENCES, DEFAULT_DISCOVERY_PREFERENCES.softPreferences),
    recommendationMode: normalizeRecommendationMode(input.recommendationMode),
    dealbreakers: normalizeDealbreakers(input.dealbreakers),
    softPreferenceWeights: normalizeSoftPreferenceWeights(input.softPreferenceWeights),
    poolImpact: normalizePoolImpact(input.poolImpact),
  };
}

function normalizeStringList<T extends string>(value: unknown, allowed: ReadonlySet<string>, fallback: readonly T[]): T[] {
  if (!Array.isArray(value)) return [...fallback];
  const output: T[] = [];
  for (const item of value) {
    if (typeof item !== 'string' || !allowed.has(item) || output.includes(item as T)) continue;
    output.push(item as T);
  }
  return output.length > 0 ? output : [...fallback];
}

function normalizeAgeRange(value: unknown): [number, number] {
  if (!Array.isArray(value) || value.length < 2) return [...DEFAULT_DISCOVERY_PREFERENCES.ageRange];
  const min = normalizeNumber(value[0], MIN_AGE, MAX_AGE, DEFAULT_DISCOVERY_PREFERENCES.ageRange[0]);
  const max = normalizeNumber(value[1], MIN_AGE, MAX_AGE, DEFAULT_DISCOVERY_PREFERENCES.ageRange[1]);
  return min <= max ? [min, max] : [max, min];
}

function normalizeNumber(value: unknown, min: number, max: number, fallback: number): number {
  const number = typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  return Math.max(min, Math.min(max, Math.round(number)));
}

function normalizeRecommendationMode(value: unknown): DiscoveryPreferences['recommendationMode'] {
  if (value === LEGACY_RECOMMENDATION_MODE) return 'serendipity';
  return typeof value === 'string' && VALID_RECOMMENDATION_MODES.has(value)
    ? value as DiscoveryPreferences['recommendationMode']
    : DEFAULT_DISCOVERY_PREFERENCES.recommendationMode;
}

function normalizeDealbreakers(value: unknown): NonNullable<DiscoveryPreferences['dealbreakers']> {
  const input = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  return {
    age: typeof input.age === 'boolean' ? input.age : DEFAULT_DISCOVERY_PREFERENCES.dealbreakers?.age,
    distance: typeof input.distance === 'boolean' ? input.distance : DEFAULT_DISCOVERY_PREFERENCES.dealbreakers?.distance,
    gender: typeof input.gender === 'boolean' ? input.gender : DEFAULT_DISCOVERY_PREFERENCES.dealbreakers?.gender,
    intent: typeof input.intent === 'boolean' ? input.intent : DEFAULT_DISCOVERY_PREFERENCES.dealbreakers?.intent,
    observance: typeof input.observance === 'boolean' ? input.observance : DEFAULT_DISCOVERY_PREFERENCES.dealbreakers?.observance,
    verified: typeof input.verified === 'boolean' ? input.verified : DEFAULT_DISCOVERY_PREFERENCES.dealbreakers?.verified,
  };
}

function normalizeSoftPreferenceWeights(value: unknown): NonNullable<DiscoveryPreferences['softPreferenceWeights']> {
  const input = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  return {
    shared_interests: normalizeWeight(input.shared_interests, DEFAULT_DISCOVERY_PREFERENCES.softPreferenceWeights?.shared_interests),
    same_city: normalizeWeight(input.same_city, DEFAULT_DISCOVERY_PREFERENCES.softPreferenceWeights?.same_city),
    similar_observance: normalizeWeight(input.similar_observance, DEFAULT_DISCOVERY_PREFERENCES.softPreferenceWeights?.similar_observance),
    similar_age: normalizeWeight(input.similar_age, DEFAULT_DISCOVERY_PREFERENCES.softPreferenceWeights?.similar_age),
    values_alignment: normalizeWeight(input.values_alignment, undefined),
    pacing_alignment: normalizeWeight(input.pacing_alignment, undefined),
  };
}

function normalizeWeight(value: unknown, fallback: number | undefined): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.max(0, Math.min(1, value));
}

function normalizePoolImpact(value: unknown): DiscoveryPreferences['poolImpact'] {
  if (!value || typeof value !== 'object') return undefined;
  const output: NonNullable<DiscoveryPreferences['poolImpact']> = {};
  for (const [key, tier] of Object.entries(value as Record<string, unknown>)) {
    if (typeof tier === 'string' && VALID_POOL_IMPACT_TIERS.has(tier)) {
      output[key] = tier as NonNullable<DiscoveryPreferences['poolImpact']>[string];
    }
  }
  return Object.keys(output).length > 0 ? output : undefined;
}

function normalizeFairnessState(raw: unknown): FairnessState | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const input = raw as Record<string, any>;
  const accountAgeMs = readNumber(input.candidateAccountAgeMs);
  const createdAtMs = timestampToMs(input.createdAt) ?? timestampToMs(input.accountCreatedAt);
  const candidateAccountAgeMs = accountAgeMs ?? (createdAtMs != null ? Math.max(0, Date.now() - createdAtMs) : undefined);
  const recentImpressionMs = normalizeTimestampArray(input.recentImpressionMs ?? input.recentImpressions ?? input.impressionTimestamps);
  const now = Date.now();
  const impressionsLast7d = readNumber(input.impressionsLast7d) ??
    recentImpressionMs.filter((ms) => now - ms <= EXPOSURE_RETENTION_MS).length;
  const impressionsLast24h = readNumber(input.impressionsLast24h) ??
    recentImpressionMs.filter((ms) => now - ms <= DAY_MS).length;
  if (candidateAccountAgeMs == null || impressionsLast7d == null || impressionsLast24h == null) return undefined;
  return {
    candidateAccountAgeMs,
    impressionsLast7d,
    impressionsLast24h,
  };
}

function normalizeSystemExclusions(docs: unknown[]): SystemExclusionState {
  const state = emptySystemExclusionState();
  for (const doc of docs) {
    if (!doc || typeof doc !== 'object') continue;
    const input = doc as Record<string, unknown>;
    addIds(state.blockedUserIds, input.blockedUserIds, input.blocked, input.blocks);
    addIds(state.reportedUserIds, input.reportedUserIds, input.reported, input.reports);
    addIds(state.suspectedBotIds, input.suspectedBotIds, input.suspectedBots, input.botUserIds);
  }
  return state;
}

function emptyInteractionExclusionState(): DiscoveryInteractionExclusionState {
  return {
    likedUserIds: new Set<string>(),
    passedUserIds: new Set<string>(),
    matchedUserIds: new Set<string>(),
    hiddenUserIds: new Set<string>(),
    dismissedUserIds: new Set<string>(),
  };
}

function normalizeInteractionExclusions(raw: unknown): DiscoveryInteractionExclusionState {
  const state = emptyInteractionExclusionState();
  if (!raw || typeof raw !== 'object') return state;
  const input = raw as Record<string, unknown>;
  addIds(state.likedUserIds, input.likes, input.likedUserIds, input.outboundLikes, input.liked);
  addIds(state.passedUserIds, input.passes, input.passUserIds, input.passedUserIds, input.skippedUserIds);
  addIds(state.matchedUserIds, input.matches, input.matchUserIds, input.matchedUserIds, input.activeMatches);
  addIds(state.hiddenUserIds, input.hiddenUserIds, input.hidden, input.mutedUserIds, input.muted);
  addIds(state.dismissedUserIds, input.dismissedUserIds, input.dismissed, input.removedUserIds, input.removed);
  return state;
}

function excludesInteractedCandidate(profile: Profile, state: DiscoveryInteractionExclusionState): boolean {
  return hasProfileId(state.likedUserIds, profile) ||
    hasProfileId(state.passedUserIds, profile) ||
    hasProfileId(state.matchedUserIds, profile) ||
    hasProfileId(state.hiddenUserIds, profile) ||
    hasProfileId(state.dismissedUserIds, profile);
}

function hasProfileId(ids: Set<string>, profile: Profile): boolean {
  return candidateProfileIds(profile).some((id) => ids.has(id));
}

function candidateProfileIds(profile: Profile): string[] {
  return [profile.uid, profile.id].filter((id): id is string => typeof id === 'string' && id.length > 0);
}

function addIds(target: Set<string>, ...values: unknown[]) {
  for (const value of values) {
    if (!Array.isArray(value)) continue;
    for (const id of value) {
      if (typeof id === 'string' && id) target.add(id);
    }
  }
}

function normalizeTimestampArray(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => timestampToMs(item))
    .filter((ms): ms is number => typeof ms === 'number' && Number.isFinite(ms))
    .sort((a, b) => a - b);
}

function readNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function timestampToMs(value: unknown): number | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const maybeTimestamp = value as { toMillis?: () => number; seconds?: number };
  if (typeof maybeTimestamp.toMillis === 'function') {
    const ms = maybeTimestamp.toMillis();
    return Number.isFinite(ms) ? ms : undefined;
  }
  if (typeof maybeTimestamp.seconds === 'number') return maybeTimestamp.seconds * 1000;
  return undefined;
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
