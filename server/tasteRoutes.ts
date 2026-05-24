import express from 'express';
import { authMiddleware, type AuthenticatedRequest } from './authMiddleware.ts';
import { FieldValue, getOptionalAdminFirestore } from './firebaseAdmin.ts';

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
  const allowed = new Set([
    'hard_filter_edited',
    'soft_preference_edited',
    'like',
    'pass',
    'more_like_this',
    'less_like_this',
    'taste_reset',
    'taste_pause',
  ]);
  const { name } = req.body ?? {};
  if (typeof name !== 'string' || !allowed.has(name)) {
    res.status(400).json({ error: 'Unsupported taste event' });
    return;
  }
  if (req.uid) {
    const db = getOptionalAdminFirestore();
    if (db) {
      await db
        .collection('users')
        .doc(req.uid)
        .collection(PRIVATE_COLLECTION)
        .doc('taste_events')
        .collection('events')
        .add({
          name,
          candidateId: typeof req.body?.candidateId === 'string' ? req.body.candidateId : null,
          surface: typeof req.body?.surface === 'string' ? req.body.surface : null,
          occurredAt: new Date().toISOString(),
        })
        .catch(() => null);

      if (name === 'taste_pause') {
        await tasteProfileRef(req.uid)?.set({
          learning: {
            paused: req.body?.paused !== false,
            optedOut: req.body?.optedOut === true,
            lastUpdatedAt: new Date().toISOString(),
          },
        }, { merge: true }).catch(() => null);
      }
    }
  }
  res.json({ success: true, userId: req.uid, accepted: name });
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

export default router;
