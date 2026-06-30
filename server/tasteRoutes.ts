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
    paused: false,
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

const INTERACTION_FIELD_BY_EVENT: Partial<Record<EventName, 'likes' | 'passes' | 'moreLikeThis' | 'lessLikeThis'>> = {
  like: 'likes',
  pass: 'passes',
  more_like_this: 'moreLikeThis',
  less_like_this: 'lessLikeThis',
};

const SURFACE_VALUES = new Set<TasteEvent['surface']>(['daily_picks', 'explore', 'inbox', 'profile']);

function cloneEmptyTasteProfile() {
  return JSON.parse(JSON.stringify(EMPTY_TASTE_PROFILE));
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
      paused: input.learning?.paused === true,
      optedOut: input.learning?.optedOut === true,
      lastUpdatedAt: typeof input.learning?.lastUpdatedAt === 'string' ? input.learning.lastUpdatedAt : null,
    },
    provenance: input.provenance && typeof input.provenance === 'object' ? input.provenance : {},
    lockedItems: Array.isArray(input.lockedItems) ? input.lockedItems : [],
    removedItems: Array.isArray(input.removedItems) ? input.removedItems : [],
    explanation: typeof input.explanation === 'string' ? input.explanation : '',
  };
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

router.post('/events', async (req: AuthenticatedRequest, res) => {
  const { name } = req.body ?? {};
  if (!isTasteEventName(name)) {
    res.status(400).json({ error: 'Unsupported taste event' });
    return;
  }

  let stateUpdated = false;
  let candidateFeaturesCaptured = 0;
  const db = getOptionalAdminFirestore();

  if (req.uid && db) {
    const candidateId = typeof req.body?.candidateId === 'string' && req.body.candidateId.trim().length > 0
      ? req.body.candidateId.trim()
      : undefined;
    const candidate = candidateId ? await loadCandidateProfile(candidateId) : null;
    const candidateFeatures = candidate ? profileToFeatureTags(candidate) : [];
    candidateFeaturesCaptured = candidateFeatures.length;

    await persistTasteEventAudit(req.uid, {
      name,
      eventClass: EVENT_CLASS_BY_NAME[name],
      candidateId: candidateId ?? null,
      surface: normalizeSurface(req.body?.surface) ?? null,
      candidateFeaturesCaptured,
    });

    await persistInteractionSummary(req.uid, name, candidateId);

    const previousState = await loadTasteState(req.uid);
    const profile = await loadTasteProfile(req.uid);
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
      learningPaused: name === 'taste_consent_granted' ? false : (profile.learning.paused || previousState.learningPaused),
      optedOut: name === 'taste_consent_granted' ? false : (profile.learning.optedOut || previousState.optedOut),
    };
    const nextState = applyEvent(stateForEvent, event);

    await tasteStateRef(req.uid)?.set(serializeTasteState(nextState), { merge: false }).catch(() => null);
    stateUpdated = didTasteStateChange(previousState, nextState);

    if (name === 'taste_pause') {
      await tasteProfileRef(req.uid)?.set({
        learning: {
          paused: req.body?.paused !== false,
          optedOut: req.body?.optedOut === true,
          lastUpdatedAt: new Date().toISOString(),
        },
      }, { merge: true }).catch(() => null);
    }

    if (name === 'taste_consent_granted') {
      await tasteProfileRef(req.uid)?.set({
        learning: {
          paused: false,
          optedOut: false,
          lastUpdatedAt: new Date().toISOString(),
        },
      }, { merge: true }).catch(() => null);
    }
  }

  res.json({
    success: true,
    userId: req.uid,
    accepted: name,
    eventClass: EVENT_CLASS_BY_NAME[name],
    stateUpdated,
    candidateFeaturesCaptured,
  });
});

router.post('/reset', async (req: AuthenticatedRequest, res) => {
  const profile = cloneEmptyTasteProfile();
  if (req.uid) {
    await tasteProfileRef(req.uid)?.set(profile).catch(() => null);
    await tasteStateRef(req.uid)?.set({
      fast: {},
      slow: {},
      lastUpdatedMs: Date.now(),
      learningPaused: false,
      optedOut: false,
    }).catch(() => null);
    await interactionsRef(req.uid)?.set({
      likes: [],
      passes: [],
      moreLikeThis: [],
      lessLikeThis: [],
      resetAt: FieldValue.serverTimestamp(),
    }, { merge: true }).catch(() => null);
    await persistTasteEventAudit(req.uid, {
      name: 'taste_reset',
      eventClass: 'policy_consent',
      candidateId: null,
      surface: null,
      candidateFeaturesCaptured: 0,
    });
  }
  res.json({
    success: true,
    userId: req.uid,
    profile,
  });
});

router.get('/export', async (req: AuthenticatedRequest, res) => {
  const profileSnap = req.uid ? await tasteProfileRef(req.uid)?.get().catch(() => null) : null;
  const stateSnap = req.uid ? await tasteStateRef(req.uid)?.get().catch(() => null) : null;
  res.json({
    exportedAt: new Date().toISOString(),
    userId: req.uid,
    tasteProfile: profileSnap?.exists ? normalizeTasteProfile(profileSnap.data()) : cloneEmptyTasteProfile(),
    tasteState: stateSnap?.exists ? stateSnap.data() : null,
  });
});

router.post('/delete', async (req: AuthenticatedRequest, res) => {
  if (req.uid) {
    await tasteProfileRef(req.uid)?.delete().catch(() => null);
    await tasteStateRef(req.uid)?.delete().catch(() => null);
    await interactionsRef(req.uid)?.set({
      likes: [],
      passes: [],
      moreLikeThis: [],
      lessLikeThis: [],
      deletedAt: FieldValue.serverTimestamp(),
    }, { merge: true }).catch(() => null);
  }
  res.json({ success: true, userId: req.uid });
});

async function loadTasteProfile(uid: string) {
  const snap = await tasteProfileRef(uid)?.get().catch(() => null);
  return snap?.exists ? normalizeTasteProfile(snap.data()) : cloneEmptyTasteProfile();
}

async function loadTasteState(uid: string): Promise<TasteState> {
  const snap = await tasteStateRef(uid)?.get().catch(() => null);
  return snap?.exists ? deserializeTasteState(snap.data()) : emptyTasteState();
}

async function persistTasteEventAudit(
  uid: string,
  payload: {
    name: EventName;
    eventClass: EventClass;
    candidateId: string | null;
    surface: TasteEvent['surface'] | null;
    candidateFeaturesCaptured: number;
  },
) {
  const db = getOptionalAdminFirestore();
  if (!db) return;
  await db
    .collection('users')
    .doc(uid)
    .collection(PRIVATE_COLLECTION)
    .doc('taste_events')
    .collection('events')
    .add({
      ...payload,
      occurredAt: new Date().toISOString(),
      createdAt: FieldValue.serverTimestamp(),
    })
    .catch(() => null);
}

async function persistInteractionSummary(
  uid: string,
  name: EventName,
  candidateId: string | undefined,
) {
  const field = INTERACTION_FIELD_BY_EVENT[name];
  if (!field || !candidateId) return;
  await interactionsRef(uid)?.set({
    [field]: FieldValue.arrayUnion(candidateId),
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true }).catch(() => null);
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
