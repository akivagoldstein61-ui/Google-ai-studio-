import express from 'express';
import admin from 'firebase-admin';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
} from 'firebase/firestore';
import fs from 'fs';

const router = express.Router();

const configPath = './firebase-applet-config.json';
let db: any = null;

if (fs.existsSync(configPath)) {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const app = initializeApp(config, 'shareRoutesApp');
  db = getFirestore(app, config.firestoreDatabaseId);
  if (!admin.apps.length) {
    admin.initializeApp({ projectId: config.projectId });
  }
}

const ALLOWED_SCOPES = [
  'summary',
  'strengths',
  'watch_outs',
  'communication_notes',
  'compatibility_reflection',
];

const requireAuth = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split('Bearer ')[1];
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    (req as any).user = decoded;
    next();
  } catch (error) {
    console.error('share-card auth verification failed:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

router.use(requireAuth);

const sanitizePayload = (raw: any) => {
  if (!raw || typeof raw !== 'object') return {};
  const out: Record<string, unknown> = {};
  if (typeof raw.summary_he === 'string') out.summary_he = raw.summary_he.slice(0, 600);
  if (Array.isArray(raw.strengths_he)) {
    out.strengths_he = raw.strengths_he
      .filter((x: any) => typeof x === 'string')
      .slice(0, 6)
      .map((x: string) => x.slice(0, 200));
  }
  if (Array.isArray(raw.watch_outs_he)) {
    out.watch_outs_he = raw.watch_outs_he
      .filter((x: any) => typeof x === 'string')
      .slice(0, 6)
      .map((x: string) => x.slice(0, 200));
  }
  if (typeof raw.communication_notes_he === 'string') {
    out.communication_notes_he = raw.communication_notes_he.slice(0, 600);
  }
  if (typeof raw.compatibility_reflection_he === 'string') {
    out.compatibility_reflection_he = raw.compatibility_reflection_he.slice(0, 800);
  }
  return out;
};

const isExpiredOrRevoked = (data: any): { reason: 'expired' | 'revoked' | null } => {
  if (!data) return { reason: null };
  if (data.revokedAt) return { reason: 'revoked' };
  if (data.expiresAt && new Date(data.expiresAt).getTime() < Date.now()) {
    return { reason: 'expired' };
  }
  return { reason: null };
};

router.post('/create', async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'Database not initialized' });
    const { ownerUid, recipientUid, scope, expiresInDays, payload } = req.body;
    const callerUid = (req as any).user.uid;

    if (callerUid !== ownerUid) return res.status(403).json({ error: 'Forbidden' });
    if (!recipientUid || typeof recipientUid !== 'string') {
      return res.status(400).json({ error: 'Missing recipientUid' });
    }
    if (recipientUid === ownerUid) {
      return res.status(400).json({ error: 'Cannot share with yourself' });
    }
    if (!Array.isArray(scope) || scope.length === 0) {
      return res.status(400).json({ error: 'Missing scope' });
    }
    const cleanScope: string[] = [];
    for (const s of scope) {
      if (typeof s === 'string' && ALLOWED_SCOPES.includes(s)) cleanScope.push(s);
    }
    if (cleanScope.length === 0) {
      return res.status(400).json({ error: 'No valid scope entries' });
    }

    const days = Math.max(1, Math.min(30, Number(expiresInDays) || 7));
    const cardId = `${ownerUid}_${recipientUid}_${Date.now()}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const record = {
      cardId,
      ownerUid,
      recipientUid,
      scope: cleanScope,
      payload: sanitizePayload(payload),
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      revokedAt: null,
      lastViewedAt: null,
    };

    await setDoc(doc(db, 'shareCards', cardId), record);
    await setDoc(
      doc(db, `shareCards/${cardId}/auditLog/${now.getTime()}_create`),
      { type: 'create', at: now.toISOString(), byUid: ownerUid },
    );

    res.json({ cardId });
  } catch (error) {
    console.error('share-card create failed:', error);
    res.status(500).json({ error: 'Failed to create share card' });
  }
});

router.get('/get/:cardId', async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'Database not initialized' });
    const { cardId } = req.params;
    const callerUid = (req as any).user.uid;
    const snap = await getDoc(doc(db, 'shareCards', cardId));
    if (!snap.exists()) return res.status(404).json({ error: 'Not found' });
    const data = snap.data();

    if (callerUid !== data.ownerUid && callerUid !== data.recipientUid) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const status = isExpiredOrRevoked(data);
    if (status.reason === 'expired') return res.status(410).json({ error: 'Expired' });
    if (status.reason === 'revoked') return res.status(410).json({ error: 'Revoked' });

    if (callerUid === data.recipientUid) {
      const now = new Date().toISOString();
      await updateDoc(doc(db, 'shareCards', cardId), { lastViewedAt: now });
      await setDoc(
        doc(db, `shareCards/${cardId}/auditLog/${Date.now()}_view`),
        { type: 'view', at: now, byUid: callerUid },
      );
    }

    res.json(data);
  } catch (error) {
    console.error('share-card get failed:', error);
    res.status(500).json({ error: 'Failed to fetch share card' });
  }
});

router.post('/revoke/:cardId', async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'Database not initialized' });
    const { cardId } = req.params;
    const callerUid = (req as any).user.uid;
    const snap = await getDoc(doc(db, 'shareCards', cardId));
    if (!snap.exists()) return res.status(404).json({ error: 'Not found' });
    const data = snap.data();
    if (callerUid !== data.ownerUid) return res.status(403).json({ error: 'Forbidden' });

    const now = new Date().toISOString();
    await updateDoc(doc(db, 'shareCards', cardId), { revokedAt: now });
    await setDoc(
      doc(db, `shareCards/${cardId}/auditLog/${Date.now()}_revoke`),
      { type: 'revoke', at: now, byUid: callerUid },
    );
    res.json({ success: true });
  } catch (error) {
    console.error('share-card revoke failed:', error);
    res.status(500).json({ error: 'Failed to revoke share card' });
  }
});

router.get('/by-owner/:ownerUid', async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'Database not initialized' });
    const { ownerUid } = req.params;
    const callerUid = (req as any).user.uid;
    if (callerUid !== ownerUid) return res.status(403).json({ error: 'Forbidden' });

    const q = query(collection(db, 'shareCards'), where('ownerUid', '==', ownerUid));
    const snap = await getDocs(q);
    const items: any[] = [];
    snap.forEach((d) => items.push(d.data()));
    res.json(items);
  } catch (error) {
    console.error('share-card list failed:', error);
    res.status(500).json({ error: 'Failed to list share cards' });
  }
});

export default router;
