import express from 'express';
import { authMiddleware, type AuthenticatedRequest } from './authMiddleware.ts';
import { FieldValue, getOptionalAdminFirestore } from './firebaseAdmin.ts';
import {
  applyEvent,
  emptyTasteState,
  type EventClass,
  type EventName,
  type TasteEvent,
  type TasteState,
} from '../src/lib/learnedTaste.ts';
import {
  deserializeTasteState,
  profileToFeatureTags,
  serializeTasteState,
} from '../src/lib/tastePersistence.ts';
import type { Profile } from '../src/types.ts';

const router = express.Router();
const PRIVATE_COLLECTION = 'private';
type InteractionField = 'likes' | 'passes' | 'moreLikeThis' | 'lessLikeThis';
const INTERACTION_FIELDS: InteractionField[] = ['likes', 'passes', 'moreLikeThis', 'lessLikeThis'];

export const EMPTY_TASTE_PROFILE = {
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

const EVENT_CLASS_BY_NAME: Record<EventName, EventClass> = {
  onboarding_completed: 'policy_consent',
  hard_filter_edited: 'policy_consent',
  soft_preference_edited: 'policy_consent',
  taste_consent_granted: 'policy_consent',
  taste_reset: 'policy_consent',
  taste_pause: 'policy_consent',
  like: 'explicit_preference',
  pass: 'explicit_preference',
  more_like_this: 'explicit_preference',
  less_like_this: 'explicit_preference',
  hide: 'explicit_preference',
  block: 'explicit_preference',
  tag_edited: 'explicit_preference',
  profile_open: 'high_signal_implicit',
  photo_carousel_depth: 'high_signal_implicit',
  prompt_expanded: 'high_signal_implicit',
  long_dwell: 'high_signal_implicit',
  reply_received: 'high_signal_implicit',
  surface_seen: 'context',
  session_stage: 'context',
};

const INTERACTION_FIELD_BY_EVENT: Partial<Record<EventName, InteractionField>> = {
  like: 'likes',
  pass: 'passes',
  more_like_this: 'moreLikeThis',
  less_like_this: 'lessLikeThis',
};

const SURFACE_VALUES = new Set<TasteEvent['surface']>(['daily_picks', 'explore', 'inbox', 'profile']);

function cloneEmptyTasteProfile() {
  return JSON.parse(JSON.stringify(EMPTY_TASTE_PROFILE));
}

function emptyInteractions(): Record<InteractionField, string[]> {
  return {
    likes: [],
    passes: [],
    moreLikeThis: [],
    lessLikeThis: [],
  };
}

function normalizeTasteProfile(raw: unknown) {
  if (!raw || typeof raw !== 'object') return cloneEmptyTasteProfile();
  const input = raw as Record<string, any>;
  const weights = input.weights && typeof input.weights === 'object' ? input.weights : {};
  return {
    ...cloneEmptyTasteProfile(),
    ...input,
    hard_dealbreakers: Array.isArray(input.hard_dealbreakers) ? input.hard_dealbreakers : [],
    soft_preferences: Array.isArray(input.soft_preferences) ? input.soft_preferences : [],
    things_to_avoid: Array.isArray(input.things_to_avoid) ? input.things_to_avoid : [],
    weights: {
      values_weight: numberOrDefault(weights.values_weight ?? weights.values_vs_lifestyle, 0.5),
      stability_weight: numberOrDefault(weights.stability_weight, 0.5),
      pacing_weight: numberOrDefault(weights.pacing_weight, 0.5),
    },
    learning: {
      paused: typeof input.learning?.paused === 'boolean' ? input.learning.paused : true,
      optedOut: input.learning?.optedOut === true,
      lastUpdatedAt: typeof input.learning?.lastUpdatedAt === 'string' ? input.learning.lastUpdatedAt : null,
    },
    provenance: input.provenance && typeof input.provenance === 'object' ? input.provenance : {},
    lockedItems: Array.isArray(input.lockedItems) ? input.lockedItems : [],
    removedItems: Array.isArray(input.removedItems) ? input.removedItems : [],
    explanation: typeof input.explanation === 'string' ? input.explanation : '',
  };
}

function normalizeStoredInteractionList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map((item) => item.trim())));
}

function numberOrDefault(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function optionalNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function isTasteEventName(value: unknown): value is EventName {
  return typeof value === 'string'
    && Object.prototype.hasOwnProperty.call(EVENT_CLASS_BY_NAME, value);
}

function normalizeSurface(value: unknown): TasteEvent['surface'] | undefined {
  return typeof value === 'string' && SURFACE_VALUES.has(value as TasteEvent['surface'])
    ? value as TasteEvent['surface']
    : undefined;
}

function tasteProfileRef(uid: string) {
  return getOptionalAdminFirestore()
    ?.collection('users')
    .doc(uid)
    .collection(PRIVATE_COLLECTION)
    .doc('taste_profile');
}

function tasteStateRef(uid: string) {
  return getOptionalAdminFirestore()
    ?.collection('users')
    .doc(uid)
    .collection(PRIVATE_COLLECTION)
    .doc('taste_state');
}

function interactionsRef(uid: string) {
  return getOptionalAdminFirestore()
    ?.collection('users')
    .doc(uid)
    .collection(PRIVATE_COLLECTION)
    .doc('interactions');
}

router.use(authMiddleware);

router.get('/profile', async (req: AuthenticatedRequest, res) => {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  const ref = req.uid ? tasteProfileRef(req.uid) : null;
  const snap = ref ? await ref.get().catch(() => null) : null;
  res.json({
    userId: req.uid,
    profile: snap?.exists ? normalizeTasteProfile(snap.data()) : cloneEmptyTasteProfile(),
  });
});

router.get('/interactions', async (req: AuthenticatedRequest, res) => {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  if (!req.uid) {
    res.json({
      userId: req.uid,
      interactions: emptyInteractions(),
      interactionIds: emptyInteractions(),
    });
    return;
  }

  const snap = await interactionsRef(req.uid)?.get().catch(() => null);
  const raw = snap?.exists ? snap.data() : {};
  const interactionIds = emptyInteractions();
  const interactions = emptyInteractions();

  await Promise.all(INTERACTION_FIELDS.map(async (field) => {
    const ids = normalizeStoredInteractionList(raw?.[field]);
    interactionIds[field] = ids;
    interactions[field] = await Promise.all(ids.map((value) => summarizeInteractionValue(value)));
  }));

  res.json({
    userId: req.uid,
    interactions,
    interactionIds,
    updatedAt: raw?.updatedAt ?? null,
    resetAt: raw?.resetAt ?? null,
    deletedAt: raw?.deletedAt ?? null,
  });
});

router.post('/events', async (req: AuthenticatedRequest, res) => {
  const { name } = req.body ?? {};
  if (!isTasteEventName(name)) {
    res.status(400).json({ error: 'Unsupported taste event' });
    return;
  }
  if (!req.uid) {
    res.status(401).json({ error: 'Authentication required', persisted: false });
    return;
  }

  const db = getOptionalAdminFirestore();
  if (!db) {
    res.status(503).json({ error: 'Taste event persistence unavailable', persisted: false });
    return;
  }

  const candidateId = typeof req.body?.candidateId === 'string' && req.body.candidateId.trim().length > 0
    ? req.body.candidateId.trim()
    : undefined;
  const candidate = candidateId ? await loadCandidateProfile(candidateId) : null;
  if (candidateId && !candidate) {
    res.status(500).json({ error: 'Taste event candidate profile was not loaded', candidateId, persisted: false });
    return;
  }

  const candidateFeatures = candidate ? profileToFeatureTags(candidate) : [];
  const candidateFeaturesCaptured = candidateFeatures.length;
  const previousState = await loadTasteState(req.uid);
  const profile = await loadTasteProfile(req.uid);
  const requestedOptedOut = name === 'taste_pause' && typeof req.body?.optedOut === 'boolean'
    ? req.body.optedOut
    : undefined;
  const event: TasteEvent = {
    name,
    class: EVENT_CLASS_BY_NAME[name],
    candidateId,
    candidateFeatures,
    value: optionalNumber(req.body?.value),
    surface: normalizeSurface(req.body?.surface),
    occurredAt: Date.now(),
  };

  const stateForEvent: TasteState = {
    ...previousState,
    learningPaused: name === 'taste_consent_granted'
      ? false
      : name === 'taste_pause'
        ? true
        : (profile.learning.paused || previousState.learningPaused),
    optedOut: name === 'taste_consent_granted'
      ? false
      : (requestedOptedOut ?? profile.learning.optedOut || previousState.optedOut),
  };
  const nextState = applyEvent(stateForEvent, event);

  const batch = db.batch();
  const userPrivate = db.collection('users').doc(req.uid).collection(PRIVATE_COLLECTION);
  batch.set(userPrivate.doc('taste_events').collection('events').doc(), {
    name,
    eventClass: EVENT_CLASS_BY_NAME[name],
    candidateId: candidateId ?? null,
    surface: normalizeSurface(req.body?.surface) ?? null,
    candidateFeaturesCaptured,
    occurredAt: new Date().toISOString(),
    createdAt: FieldValue.serverTimestamp(),
  });

  const interactionField = INTERACTION_FIELD_BY_EVENT[name];
  if (interactionField && candidateId) {
    batch.set(userPrivate.doc('interactions'), {
      [interactionField]: FieldValue.arrayUnion(candidateId),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
  }

  batch.set(userPrivate.doc('taste_state'), serializeTasteState(nextState), { merge: false });

  if (name === 'taste_pause') {
    const paused = typeof req.body?.paused === 'boolean' ? req.body.paused : true;
    const optedOut = requestedOptedOut ?? profile.learning.optedOut;

    batch.set(userPrivate.doc('taste_profile'), {
      learning: {
        paused,
        optedOut,
        lastUpdatedAt: new Date().toISOString(),
      },
    }, { merge: true });
  }

  if (name === 'taste_consent_granted') {
    batch.set(userPrivate.doc('taste_profile'), {
      learning: {
        paused: false,
        optedOut: false,
        lastUpdatedAt: new Date().toISOString(),
      },
    }, { merge: true });
  }

  const persisted = await batch.commit().then(() => true).catch(() => false);
  if (!persisted) {
    res.status(500).json({ error: 'Taste event was not persisted', persisted: false });
    return;
  }

  res.json({
    success: true,
    persisted: true,
    userId: req.uid,
    accepted: name,
    eventClass: EVENT_CLASS_BY_NAME[name],
    stateUpdated: didTasteStateChange(previousState, nextState),
    candidateFeaturesCaptured,
  });
});

router.post('/reset', async (req: AuthenticatedRequest, res) => {
  if (!req.uid) {
    res.status(401).json({ error: 'Authentication required', persisted: false });
    return;
  }

  const db = getOptionalAdminFirestore();
  if (!db) {
    res.status(503).json({ error: 'Taste reset persistence unavailable', persisted: false });
    return;
  }

  const previousProfile = await loadTasteProfile(req.uid);
  const profile = normalizeTasteProfile({
    ...cloneEmptyTasteProfile(),
    learning: {
      paused: previousProfile.learning.paused,
      optedOut: previousProfile.learning.optedOut,
      lastUpdatedAt: new Date().toISOString(),
    },
  });
  const resetState: TasteState = {
    ...emptyTasteState(),
    learningPaused: profile.learning.paused,
    optedOut: profile.learning.optedOut,
  };
  const serializedResetState = serializeTasteState(resetState);
  const interactions = emptyInteractions();
  const userPrivate = db.collection('users').doc(req.uid).collection(PRIVATE_COLLECTION);
  const batch = db.batch();

  batch.set(userPrivate.doc('taste_profile'), profile, { merge: false });
  batch.set(userPrivate.doc('taste_state'), serializedResetState, { merge: false });
  batch.set(userPrivate.doc('interactions'), {
    ...interactions,
    resetAt: FieldValue.serverTimestamp(),
  }, { merge: true });
  batch.set(userPrivate.doc('taste_events').collection('events').doc(), {
    name: 'taste_reset',
    eventClass: 'policy_consent',
    candidateId: null,
    surface: null,
    candidateFeaturesCaptured: 0,
    occurredAt: new Date().toISOString(),
    createdAt: FieldValue.serverTimestamp(),
  });

  const persisted = await batch.commit().then(() => true).catch(() => false);
  if (!persisted) {
    res.status(500).json({ error: 'Taste reset was not persisted', persisted: false });
    return;
  }

  res.json({
    success: true,
    persisted: true,
    userId: req.uid,
    profile,
    tasteState: serializedResetState,
    interactions,
  });
});

router.get('/export', async (req: AuthenticatedRequest, res) => {
  const profileSnap = req.uid ? await tasteProfileRef(req.uid)?.get().catch(() => null) : null;
  const stateSnap = req.uid ? await tasteStateRef(req.uid)?.get().catch(() => null) : null;
  const interactionsSnap = req.uid ? await interactionsRef(req.uid)?.get().catch(() => null) : null;
  res.json({
    exportedAt: new Date().toISOString(),
    userId: req.uid,
    tasteProfile: profileSnap?.exists ? normalizeTasteProfile(profileSnap.data()) : cloneEmptyTasteProfile(),
    tasteState: stateSnap?.exists ? stateSnap.data() : null,
    tasteInteractions: interactionsSnap?.exists ? normalizeInteractionDocument(interactionsSnap.data()) : emptyInteractions(),
  });
});

router.post('/delete', async (req: AuthenticatedRequest, res) => {
  if (!req.uid) {
    res.status(401).json({ error: 'Authentication required', persisted: false });
    return;
  }

  const db = getOptionalAdminFirestore();
  if (!db) {
    res.status(503).json({ error: 'Taste delete persistence unavailable', persisted: false });
    return;
  }

  const interactions = emptyInteractions();
  const userPrivate = db.collection('users').doc(req.uid).collection(PRIVATE_COLLECTION);
  const batch = db.batch();
  batch.delete(userPrivate.doc('taste_profile'));
  batch.delete(userPrivate.doc('taste_state'));
  batch.set(userPrivate.doc('interactions'), {
    ...interactions,
    deletedAt: FieldValue.serverTimestamp(),
  }, { merge: true });

  const persisted = await batch.commit().then(() => true).catch(() => false);
  if (!persisted) {
    res.status(500).json({ error: 'Taste delete was not persisted', persisted: false });
    return;
  }

  res.json({ success: true, persisted: true, userId: req.uid, interactions });
});

async function loadTasteProfile(uid: string) {
  const snap = await tasteProfileRef(uid)?.get().catch(() => null);
  return snap?.exists ? normalizeTasteProfile(snap.data()) : cloneEmptyTasteProfile();
}

async function loadTasteState(uid: string): Promise<TasteState> {
  const snap = await tasteStateRef(uid)?.get().catch(() => null);
  return snap?.exists ? deserializeTasteState(snap.data()) : emptyTasteState();
}

function normalizeInteractionDocument(raw: unknown) {
  const input = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
  const normalized = emptyInteractions();
  for (const field of INTERACTION_FIELDS) {
    normalized[field] = normalizeStoredInteractionList(input[field]);
  }
  return normalized;
}

async function summarizeInteractionValue(value: string) {
  if (value.startsWith('Profile with tags:')) return value;
  const profile = await loadCandidateProfile(value);
  if (!profile) return `Profile id: ${value}`;
  return summarizeProfileForTaste(profile);
}

function summarizeProfileForTaste(profile: Profile) {
  const tags = profile.tags.length > 0 ? profile.tags.join(', ') : 'none listed';
  return `Profile with tags: ${tags} and observance: ${profile.observance}`;
}

async function loadCandidateProfile(candidateId: string): Promise<Profile | null> {
  const db = getOptionalAdminFirestore();
  if (!db) return null;

  const directSnap = await db.collection('users').doc(candidateId).get().catch(() => null);
  if (directSnap?.exists) {
    return normalizeCandidateProfile(directSnap.id, directSnap.data());
  }

  for (const field of ['uid', 'id']) {
    const querySnap = await db.collection('users')
      .where(field, '==', candidateId)
      .limit(1)
      .get()
      .catch(() => null);
    const doc = querySnap?.docs?.[0];
    if (doc) {
      return normalizeCandidateProfile(doc.id, doc.data());
    }
  }

  return null;
}

function normalizeCandidateProfile(id: string, raw: any): Profile {
  return {
    id: raw?.id ?? id,
    uid: raw?.uid ?? id,
    displayName: typeof raw?.displayName === 'string' ? raw.displayName : '',
    age: numberOrDefault(raw?.age, 0),
    gender: raw?.gender ?? 'non_binary',
    city: typeof raw?.city === 'string' ? raw.city : '',
    photos: Array.isArray(raw?.photos) ? raw.photos : [],
    bio: typeof raw?.bio === 'string' ? raw.bio : '',
    observance: raw?.observance ?? 'traditional',
    intent: raw?.intent ?? 'serious_relationship',
    prompts: Array.isArray(raw?.prompts) ? raw.prompts : [],
    isVerified: raw?.isVerified === true,
    isPremium: raw?.isPremium === true,
    tags: Array.isArray(raw?.tags) ? raw.tags.filter((tag: unknown): tag is string => typeof tag === 'string') : [],
    lastActive: typeof raw?.lastActive === 'string' ? raw.lastActive : undefined,
    personalityScores: raw?.personalityScores && typeof raw.personalityScores === 'object' ? raw.personalityScores : undefined,
    role: typeof raw?.role === 'string' ? raw.role : undefined,
  };
}

function didTasteStateChange(before: TasteState, after: TasteState) {
  return JSON.stringify(serializeTasteState(before)) !== JSON.stringify(serializeTasteState(after));
}

export default router;
