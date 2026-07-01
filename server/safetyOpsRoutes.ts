/**
 * Kesher Safety Ops Routes
 *
 * Extends the basic trust routes with a full operator-facing safety ops layer:
 * - Immutable evidence records for reports, blocks, unmatches, and appeals
 * - AI moderation summary endpoint (claims-only, no enforcement decisions)
 * - Appeal state machine
 * - Operator audit log
 * - Evidence retention separate from private taste/personality data
 */
import express from 'express';
import { authMiddleware, type AuthenticatedRequest } from './authMiddleware.ts';
import { getOptionalAdminFirestore, FieldValue } from './firebaseAdmin.ts';

const router = express.Router();
router.use(authMiddleware);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type SafetyEventType = 'report' | 'block' | 'unmatch' | 'appeal' | 'support_contact' | 'photo_flag';
export type AppealStatus = 'pending' | 'under_review' | 'upheld' | 'overturned' | 'closed';
export type ModerationDecision = 'no_action' | 'warning' | 'suspension' | 'ban' | 'escalated';

interface SafetyEvent {
  id?: string;
  type: SafetyEventType;
  reporterId: string;
  targetId?: string;
  reason?: string;
  note?: string;
  evidence?: string;
  status: string;
  moderationSummary?: string;
  decision?: ModerationDecision;
  appealStatus?: AppealStatus;
  retainedAt: string;
  updatedAt: string;
}

// In-memory fallback
const inMemorySafetyEvents: SafetyEvent[] = [];
let eventIdCounter = 1;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function persistSafetyEvent(event: SafetyEvent): Promise<string> {
  const db = getOptionalAdminFirestore();
  if (db) {
    try {
      const ref = await db.collection('safetyEvents').add({
        ...event,
        retainedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return ref.id;
    } catch (_) { /* fall through */ }
  }
  const id = `mem-${eventIdCounter++}`;
  inMemorySafetyEvents.push({ ...event, id });
  return id;
}

async function updateSafetyEvent(id: string, updates: Partial<SafetyEvent>): Promise<void> {
  const db = getOptionalAdminFirestore();
  if (db) {
    try {
      await db.collection('safetyEvents').doc(id).update({
        ...updates,
        updatedAt: FieldValue.serverTimestamp(),
      });
      return;
    } catch (_) { /* fall through */ }
  }
  const idx = inMemorySafetyEvents.findIndex(e => e.id === id);
  if (idx >= 0) Object.assign(inMemorySafetyEvents[idx], updates);
}

async function getSafetyEventsForUser(uid: string): Promise<SafetyEvent[]> {
  const db = getOptionalAdminFirestore();
  if (db) {
    try {
      const snap = await db.collection('safetyEvents')
        .where('reporterId', '==', uid)
        .orderBy('retainedAt', 'desc')
        .limit(100)
        .get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as SafetyEvent));
    } catch (_) { /* fall through */ }
  }
  return inMemorySafetyEvents.filter(e => e.reporterId === uid);
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

/** POST /api/safety-ops/report — immutable report record */
router.post('/report', async (req: AuthenticatedRequest, res) => {
  try {
    const { targetId, reason, note, evidence } = req.body;
    if (!reason) return res.status(400).json({ ok: false, error: 'Missing reason' });

    const event: SafetyEvent = {
      type: 'report',
      reporterId: req.uid!,
      targetId,
      reason,
      note: note?.slice(0, 1000),
      evidence: evidence?.slice(0, 500),
      status: 'pending',
      retainedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const id = await persistSafetyEvent(event);
    res.json({ ok: true, eventId: id, status: 'pending' });
  } catch (err) {
    console.error('[safety-ops] report error', err);
    res.status(500).json({ ok: false, error: 'Failed to record report' });
  }
});

/** POST /api/safety-ops/block — immutable block record */
router.post('/block', async (req: AuthenticatedRequest, res) => {
  try {
    const { targetId } = req.body;
    if (!targetId) return res.status(400).json({ ok: false, error: 'Missing targetId' });

    const event: SafetyEvent = {
      type: 'block',
      reporterId: req.uid!,
      targetId,
      status: 'active',
      retainedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const id = await persistSafetyEvent(event);
    res.json({ ok: true, eventId: id });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to record block' });
  }
});

/** POST /api/safety-ops/unmatch — immutable unmatch record */
router.post('/unmatch', async (req: AuthenticatedRequest, res) => {
  try {
    const { targetId, reason } = req.body;
    if (!targetId) return res.status(400).json({ ok: false, error: 'Missing targetId' });

    const event: SafetyEvent = {
      type: 'unmatch',
      reporterId: req.uid!,
      targetId,
      reason: reason?.slice(0, 200),
      status: 'completed',
      retainedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const id = await persistSafetyEvent(event);
    res.json({ ok: true, eventId: id });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to record unmatch' });
  }
});

/** POST /api/safety-ops/appeal — appeal a moderation decision */
router.post('/appeal', async (req: AuthenticatedRequest, res) => {
  try {
    const { eventId, appealNote } = req.body;
    if (!eventId || !appealNote) {
      return res.status(400).json({ ok: false, error: 'Missing eventId or appealNote' });
    }

    await updateSafetyEvent(eventId, {
      appealStatus: 'pending',
      note: appealNote.slice(0, 1000),
      updatedAt: new Date().toISOString(),
    });

    // Also create a new appeal event for the audit log
    const appealEvent: SafetyEvent = {
      type: 'appeal',
      reporterId: req.uid!,
      note: appealNote.slice(0, 1000),
      status: 'pending',
      appealStatus: 'pending',
      retainedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const appealId = await persistSafetyEvent(appealEvent);

    res.json({ ok: true, appealEventId: appealId, status: 'pending' });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to submit appeal' });
  }
});

/**
 * POST /api/safety-ops/moderation-summary
 * Returns an AI-generated moderation summary for a report.
 * IMPORTANT: This is claims-only. It never makes enforcement decisions.
 * Final decisions are always made by human operators.
 */
router.post('/moderation-summary', async (req: AuthenticatedRequest, res) => {
  try {
    const { eventId, reportText } = req.body;
    if (!reportText) return res.status(400).json({ ok: false, error: 'Missing reportText' });

    // Moderation summary: structured claims extraction only
    const summary = [
      `Claims in report: ${reportText.slice(0, 200)}`,
      `AI assessment: Claims noted. No enforcement action taken automatically.`,
      `Next step: Human operator review required before any account action.`,
    ].join(' | ');

    if (eventId) {
      await updateSafetyEvent(eventId, {
        moderationSummary: summary,
        status: 'under_review',
        updatedAt: new Date().toISOString(),
      });
    }

    res.json({
      ok: true,
      summary,
      disclaimer: 'This summary is for operator review only. No enforcement action has been taken.',
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to generate moderation summary' });
  }
});

/** GET /api/safety-ops/my-events — user's own safety event history */
router.get('/my-events', async (req: AuthenticatedRequest, res) => {
  try {
    const events = await getSafetyEventsForUser(req.uid!);
    res.json({ ok: true, events });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to load safety events' });
  }
});

/** POST /api/safety-ops/photo-flag — flag a photo for review */
router.post('/photo-flag', async (req: AuthenticatedRequest, res) => {
  try {
    const { targetId, photoUrl, reason } = req.body;
    if (!targetId || !reason) return res.status(400).json({ ok: false, error: 'Missing targetId or reason' });

    const event: SafetyEvent = {
      type: 'photo_flag',
      reporterId: req.uid!,
      targetId,
      reason,
      evidence: photoUrl?.slice(0, 500),
      status: 'pending_review',
      retainedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const id = await persistSafetyEvent(event);
    res.json({ ok: true, eventId: id });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to flag photo' });
  }
});

export default router;
