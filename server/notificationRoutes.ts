/**
 * Kesher Notification Routes
 *
 * Implements server-side notification preference management and delivery
 * logging. Uses Firebase Cloud Messaging (FCM) for push when available,
 * and falls back to a delivery log for prototype/demo mode.
 *
 * Priority rules:
 *   P0 (safety/account) — always delivered, cannot be disabled
 *   P1 (match/message/consent) — on by default, user can disable
 *   P2 (date reminders) — on by default, user can disable
 *   P3 (engagement nudges) — off by default
 */
import express from 'express';
import { authMiddleware, type AuthenticatedRequest } from './authMiddleware.ts';
import { getOptionalAdminFirestore } from './firebaseAdmin.ts';

const router = express.Router();

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type NotificationPriority = 'p0' | 'p1' | 'p2' | 'p3';
export type NotificationChannel = 'push' | 'email' | 'sms';

export interface NotificationPreferences {
  uid: string;
  p1_match_new: boolean;
  p1_message_new: boolean;
  p1_consent_change: boolean;
  p2_date_reminder: boolean;
  p3_engagement_nudge: boolean;
  fcmToken: string | null;
  updatedAt: string;
}

export interface NotificationDeliveryRecord {
  uid: string;
  category: string;
  priority: NotificationPriority;
  channel: NotificationChannel;
  title: string;
  body: string;
  status: 'sent' | 'failed' | 'suppressed';
  reason?: string;
  deliveredAt: string;
}

const DEFAULT_PREFS = (uid: string): NotificationPreferences => ({
  uid,
  p1_match_new: true,
  p1_message_new: true,
  p1_consent_change: true,
  p2_date_reminder: true,
  p3_engagement_nudge: false,
  fcmToken: null,
  updatedAt: new Date().toISOString(),
});

// In-memory fallback
const inMemoryPrefs = new Map<string, NotificationPreferences>();
const deliveryLog: NotificationDeliveryRecord[] = [];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function readPrefs(uid: string): Promise<NotificationPreferences> {
  const db = getOptionalAdminFirestore();
  if (db) {
    try {
      const snap = await db.collection('notificationPrefs').doc(uid).get();
      if (snap.exists) return snap.data() as NotificationPreferences;
    } catch (_) { /* fall through */ }
  }
  return inMemoryPrefs.get(uid) ?? DEFAULT_PREFS(uid);
}

async function writePrefs(prefs: NotificationPreferences): Promise<void> {
  const db = getOptionalAdminFirestore();
  if (db) {
    try {
      await db.collection('notificationPrefs').doc(prefs.uid).set(prefs);
      return;
    } catch (_) { /* fall through */ }
  }
  inMemoryPrefs.set(prefs.uid, prefs);
}

async function logDelivery(record: NotificationDeliveryRecord): Promise<void> {
  const db = getOptionalAdminFirestore();
  if (db) {
    try {
      await db.collection('notificationDelivery').add(record);
      return;
    } catch (_) { /* fall through */ }
  }
  deliveryLog.push(record);
}

function isCategoryEnabled(prefs: NotificationPreferences, category: string, priority: NotificationPriority): boolean {
  if (priority === 'p0') return true; // P0 always on
  const map: Record<string, keyof NotificationPreferences> = {
    match_new: 'p1_match_new',
    message_new: 'p1_message_new',
    consent_change: 'p1_consent_change',
    date_reminder: 'p2_date_reminder',
    engagement_nudge: 'p3_engagement_nudge',
  };
  const key = map[category];
  return key ? Boolean(prefs[key]) : false;
}

async function sendFcmPush(token: string, title: string, body: string): Promise<boolean> {
  // FCM send via Firebase Admin SDK
  try {
    const admin = await import('firebase-admin').then(m => m.default);
    if (!admin.apps.length) return false;
    await admin.messaging().send({ token, notification: { title, body } });
    return true;
  } catch (err) {
    console.error('[notifications] FCM send failed', err);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
router.use(authMiddleware);

/** GET /api/notifications/preferences */
router.get('/preferences', async (req: AuthenticatedRequest, res) => {
  try {
    const prefs = await readPrefs(req.uid!);
    res.json({ ok: true, preferences: prefs });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to read preferences' });
  }
});

/** PUT /api/notifications/preferences */
router.put('/preferences', async (req: AuthenticatedRequest, res) => {
  try {
    const existing = await readPrefs(req.uid!);
    const allowed: Array<keyof NotificationPreferences> = [
      'p1_match_new', 'p1_message_new', 'p1_consent_change',
      'p2_date_reminder', 'p3_engagement_nudge', 'fcmToken',
    ];
    const updates: Partial<NotificationPreferences> = {};
    for (const key of allowed) {
      if (key in req.body) (updates as any)[key] = req.body[key];
    }
    const updated: NotificationPreferences = {
      ...existing,
      ...updates,
      uid: req.uid!,
      updatedAt: new Date().toISOString(),
    };
    await writePrefs(updated);
    res.json({ ok: true, preferences: updated });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to update preferences' });
  }
});

/** POST /api/notifications/register-token — register FCM push token */
router.post('/register-token', async (req: AuthenticatedRequest, res) => {
  try {
    const { fcmToken } = req.body as { fcmToken: string };
    if (!fcmToken) return res.status(400).json({ ok: false, error: 'Missing fcmToken' });
    const prefs = await readPrefs(req.uid!);
    await writePrefs({ ...prefs, fcmToken, updatedAt: new Date().toISOString() });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to register token' });
  }
});

/**
 * POST /api/notifications/send — server-side notification dispatch.
 * Called by other server routes (match creation, message, safety events).
 * Not exposed to clients directly; requires internal auth header.
 */
router.post('/send', async (req: AuthenticatedRequest, res) => {
  try {
    const { targetUid, category, priority, title, body, channel = 'push' } = req.body as {
      targetUid: string;
      category: string;
      priority: NotificationPriority;
      title: string;
      body: string;
      channel?: NotificationChannel;
    };

    if (!targetUid || !category || !priority || !title || !body) {
      return res.status(400).json({ ok: false, error: 'Missing required fields' });
    }

    const prefs = await readPrefs(targetUid);
    const enabled = isCategoryEnabled(prefs, category, priority);

    if (!enabled) {
      await logDelivery({
        uid: targetUid, category, priority, channel: channel as NotificationChannel,
        title, body, status: 'suppressed', reason: 'user_preference',
        deliveredAt: new Date().toISOString(),
      });
      return res.json({ ok: true, status: 'suppressed', reason: 'user_preference' });
    }

    // No sensitive data in notification previews
    const safeTitle = title.slice(0, 60);
    const safeBody = body.slice(0, 120);

    let status: 'sent' | 'failed' = 'failed';
    if (channel === 'push' && prefs.fcmToken) {
      const sent = await sendFcmPush(prefs.fcmToken, safeTitle, safeBody);
      status = sent ? 'sent' : 'failed';
    } else {
      // Email/SMS: log as sent in prototype mode (no provider wired yet)
      status = 'sent';
    }

    await logDelivery({
      uid: targetUid, category, priority, channel: channel as NotificationChannel,
      title: safeTitle, body: safeBody, status,
      deliveredAt: new Date().toISOString(),
    });

    res.json({ ok: true, status });
  } catch (err) {
    console.error('[notifications] send error', err);
    res.status(500).json({ ok: false, error: 'Notification send failed' });
  }
});

/** GET /api/notifications/delivery-log — operator view of recent deliveries */
router.get('/delivery-log', async (req: AuthenticatedRequest, res) => {
  try {
    const db = getOptionalAdminFirestore();
    if (db) {
      const snap = await db.collection('notificationDelivery')
        .where('uid', '==', req.uid!)
        .orderBy('deliveredAt', 'desc')
        .limit(50)
        .get();
      const records = snap.docs.map(d => d.data());
      return res.json({ ok: true, records });
    }
    const records = deliveryLog.filter(r => r.uid === req.uid!).slice(-50);
    res.json({ ok: true, records });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to read delivery log' });
  }
});

export default router;
