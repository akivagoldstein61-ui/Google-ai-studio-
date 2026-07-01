/**
 * Kesher Billing & Entitlements Routes
 *
 * Implements server-side subscription management without a live payment
 * processor dependency. Uses a local entitlement store (Firestore when
 * available, in-memory map for demo/prototype mode) so the UI can gate
 * premium features correctly.
 *
 * Production upgrade path: replace the `simulateWebhook` handler with a
 * real Stripe webhook endpoint and verify the Stripe-Signature header.
 */
import express from 'express';
import { authMiddleware, type AuthenticatedRequest } from './authMiddleware.ts';
import { getOptionalAdminFirestore } from './firebaseAdmin.ts';

const router = express.Router();

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type SubscriptionTier = 'free' | 'premium';
export type SubscriptionStatus = 'active' | 'trial' | 'expired' | 'cancelled';

export interface Entitlement {
  uid: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  expiresAt: string | null;   // ISO-8601 or null for free tier
  trialUsed: boolean;
  features: string[];
  updatedAt: string;
}

const PREMIUM_FEATURES = [
  'unlimited_picks',
  'compatibility_reflection',
  'deeper_share_cards',
  'advanced_explore_filters',
  'date_planner_full',
  'voice_sessions',
];

const FREE_FEATURES = [
  'daily_picks_5',
  'basic_share_cards',
  'why_this_match',
  'bio_coach',
  'message_openers',
  'pacing_coach',
];

// In-memory fallback for demo/prototype mode
const inMemoryEntitlements = new Map<string, Entitlement>();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function buildFreeEntitlement(uid: string): Entitlement {
  return {
    uid,
    tier: 'free',
    status: 'active',
    expiresAt: null,
    trialUsed: false,
    features: FREE_FEATURES,
    updatedAt: new Date().toISOString(),
  };
}

function buildTrialEntitlement(uid: string): Entitlement {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  return {
    uid,
    tier: 'premium',
    status: 'trial',
    expiresAt,
    trialUsed: true,
    features: PREMIUM_FEATURES,
    updatedAt: new Date().toISOString(),
  };
}

function buildPremiumEntitlement(uid: string, daysFromNow = 30): Entitlement {
  const expiresAt = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000).toISOString();
  return {
    uid,
    tier: 'premium',
    status: 'active',
    expiresAt,
    trialUsed: true,
    features: PREMIUM_FEATURES,
    updatedAt: new Date().toISOString(),
  };
}

async function readEntitlement(uid: string): Promise<Entitlement> {
  const db = getOptionalAdminFirestore();
  if (db) {
    try {
      const snap = await db.collection('entitlements').doc(uid).get();
      if (snap.exists) {
        const data = snap.data() as Entitlement;
        // Expire stale trial/premium
        if (data.expiresAt && new Date(data.expiresAt) < new Date()) {
          const expired: Entitlement = { ...data, status: 'expired', tier: 'free', features: FREE_FEATURES };
          await db.collection('entitlements').doc(uid).set(expired);
          return expired;
        }
        return data;
      }
    } catch (_) { /* fall through to in-memory */ }
  }
  return inMemoryEntitlements.get(uid) ?? buildFreeEntitlement(uid);
}

async function writeEntitlement(entitlement: Entitlement): Promise<void> {
  const db = getOptionalAdminFirestore();
  if (db) {
    try {
      await db.collection('entitlements').doc(entitlement.uid).set(entitlement);
      return;
    } catch (_) { /* fall through */ }
  }
  inMemoryEntitlements.set(entitlement.uid, entitlement);
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
router.use(authMiddleware);

/** GET /api/billing/entitlement — return the caller's current entitlement */
router.get('/entitlement', async (req: AuthenticatedRequest, res) => {
  try {
    const entitlement = await readEntitlement(req.uid!);
    res.json({ ok: true, entitlement });
  } catch (err) {
    console.error('[billing] entitlement read error', err);
    res.status(500).json({ ok: false, error: 'Failed to read entitlement' });
  }
});

/** POST /api/billing/start-trial — activate a 7-day premium trial */
router.post('/start-trial', async (req: AuthenticatedRequest, res) => {
  try {
    const existing = await readEntitlement(req.uid!);
    if (existing.trialUsed) {
      return res.status(409).json({ ok: false, error: 'Trial already used for this account.' });
    }
    const trial = buildTrialEntitlement(req.uid!);
    await writeEntitlement(trial);
    res.json({ ok: true, entitlement: trial });
  } catch (err) {
    console.error('[billing] start-trial error', err);
    res.status(500).json({ ok: false, error: 'Failed to start trial' });
  }
});

/** POST /api/billing/cancel — cancel subscription at period end */
router.post('/cancel', async (req: AuthenticatedRequest, res) => {
  try {
    const existing = await readEntitlement(req.uid!);
    if (existing.tier === 'free') {
      return res.status(400).json({ ok: false, error: 'No active subscription to cancel.' });
    }
    const cancelled: Entitlement = {
      ...existing,
      status: 'cancelled',
      updatedAt: new Date().toISOString(),
    };
    await writeEntitlement(cancelled);
    res.json({ ok: true, entitlement: cancelled, message: 'Subscription will end at period expiry.' });
  } catch (err) {
    console.error('[billing] cancel error', err);
    res.status(500).json({ ok: false, error: 'Failed to cancel subscription' });
  }
});

/**
 * POST /api/billing/webhook — idempotent webhook handler.
 * In prototype mode this accepts a simulated event body so the UI can
 * demonstrate the full billing flow without a real payment processor.
 *
 * Production: verify Stripe-Signature header before processing.
 */
router.post('/webhook', async (req, res) => {
  try {
    const { event, uid, daysFromNow } = req.body as {
      event: 'checkout.session.completed' | 'customer.subscription.deleted' | 'invoice.payment_succeeded';
      uid: string;
      daysFromNow?: number;
    };

    if (!uid || !event) {
      return res.status(400).json({ ok: false, error: 'Missing uid or event' });
    }

    if (event === 'checkout.session.completed' || event === 'invoice.payment_succeeded') {
      const premium = buildPremiumEntitlement(uid, daysFromNow ?? 30);
      await writeEntitlement(premium);
      return res.json({ ok: true, entitlement: premium });
    }

    if (event === 'customer.subscription.deleted') {
      const existing = await readEntitlement(uid);
      const expired: Entitlement = {
        ...existing,
        tier: 'free',
        status: 'expired',
        features: FREE_FEATURES,
        updatedAt: new Date().toISOString(),
      };
      await writeEntitlement(expired);
      return res.json({ ok: true, entitlement: expired });
    }

    res.status(400).json({ ok: false, error: 'Unknown event type' });
  } catch (err) {
    console.error('[billing] webhook error', err);
    res.status(500).json({ ok: false, error: 'Webhook processing failed' });
  }
});

/** POST /api/billing/check-feature — gate check for a specific feature */
router.post('/check-feature', async (req: AuthenticatedRequest, res) => {
  try {
    const { feature } = req.body as { feature: string };
    if (!feature) return res.status(400).json({ ok: false, error: 'Missing feature' });
    const entitlement = await readEntitlement(req.uid!);
    const allowed = entitlement.features.includes(feature);
    res.json({ ok: true, allowed, tier: entitlement.tier, status: entitlement.status });
  } catch (err) {
    console.error('[billing] check-feature error', err);
    res.status(500).json({ ok: false, error: 'Feature check failed' });
  }
});

export default router;
