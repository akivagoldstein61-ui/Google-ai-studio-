import express from 'express';
import admin from 'firebase-admin';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, deleteField, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import fs from 'fs';
import { buildSafePersonalityExport } from '../src/personality/privacy.ts';

const router = express.Router();

// Initialize Firebase client SDK for server-side persistence
const configPath = './firebase-applet-config.json';
let db: any = null;

if (fs.existsSync(configPath)) {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const app = initializeApp(config);
  db = getFirestore(app, config.firestoreDatabaseId);
  
  // Initialize Firebase Admin for auth verification
  if (!admin.apps.length) {
    admin.initializeApp({
      projectId: config.projectId,
    });
  }
}

// Auth enforcement middleware
const requireAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split('Bearer ')[1];
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    (req as any).user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying auth token:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

router.use(requireAuth);

router.post('/report', async (req, res) => {
  try {
    const { reporterId, targetId, reason, note, evidence } = req.body;
    if ((req as any).user.uid !== reporterId) return res.status(403).json({ error: 'Forbidden' });
    if (!db) return res.status(500).json({ error: 'Database not initialized' });

    const reportData: any = {
      reporterId,
      reason,
      status: 'pending',
      createdAt: serverTimestamp(),
    };
    
    if (targetId) reportData.targetId = targetId;
    if (note) reportData.note = note;
    if (evidence) reportData.evidence = evidence;

    await addDoc(collection(db, 'reports'), reportData);

    res.json({ success: true });
  } catch (error) {
    console.error('Error submitting report:', error);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

router.post('/block', async (req, res) => {
  try {
    const { blockerId, blockedId } = req.body;
    if ((req as any).user.uid !== blockerId) return res.status(403).json({ error: 'Forbidden' });
    if (!db) return res.status(500).json({ error: 'Database not initialized' });

    await addDoc(collection(db, 'blocks'), {
      blockerId,
      blockedId,
      createdAt: serverTimestamp(),
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error submitting block:', error);
    res.status(500).json({ error: 'Failed to submit block' });
  }
});

router.post('/unmatch', async (req, res) => {
  try {
    const { unmatcherId, targetId, matchId } = req.body;
    if ((req as any).user.uid !== unmatcherId) return res.status(403).json({ error: 'Forbidden' });
    if (!db) return res.status(500).json({ error: 'Database not initialized' });

    const unmatchData: any = {
      unmatcherId,
      targetId,
      createdAt: serverTimestamp(),
    };
    if (matchId) unmatchData.matchId = matchId;

    await addDoc(collection(db, 'unmatches'), unmatchData);

    // Also update the match status if matchId is provided
    if (matchId) {
      await updateDoc(doc(db, 'matches', matchId), {
        status: 'unmatched',
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error submitting unmatch:', error);
    res.status(500).json({ error: 'Failed to submit unmatch' });
  }
});

router.post('/pause', async (req, res) => {
  try {
    const { userId, paused } = req.body;
    if ((req as any).user.uid !== userId) return res.status(403).json({ error: 'Forbidden' });
    if (!db) return res.status(500).json({ error: 'Database not initialized' });

    await updateDoc(doc(db, 'users', userId), {
      paused,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error pausing profile:', error);
    res.status(500).json({ error: 'Failed to pause profile' });
  }
});

router.post('/delete-request', async (req, res) => {
  try {
    const { userId, reason } = req.body;
    if ((req as any).user.uid !== userId) return res.status(403).json({ error: 'Forbidden' });
    if (!db) return res.status(500).json({ error: 'Database not initialized' });

    const deleteData: any = {
      userId,
      status: 'pending',
      createdAt: serverTimestamp(),
    };
    if (reason) deleteData.reason = reason;

    await addDoc(collection(db, 'delete_requests'), deleteData);

    res.json({ success: true });
  } catch (error) {
    console.error('Error submitting delete request:', error);
    res.status(500).json({ error: 'Failed to submit delete request' });
  }
});

router.post('/contact', async (req, res) => {
  try {
    const { userId, message, type } = req.body;
    if ((req as any).user.uid !== userId) return res.status(403).json({ error: 'Forbidden' });
    if (!db) return res.status(500).json({ error: 'Database not initialized' });

    await addDoc(collection(db, 'support_requests'), {
      userId,
      message,
      type,
      status: 'pending',
      createdAt: serverTimestamp(),
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error submitting support request:', error);
    res.status(500).json({ error: 'Failed to submit support request' });
  }
});

router.post('/privacy', async (req, res) => {
  try {
    const { userId, settings } = req.body;
    if ((req as any).user.uid !== userId) return res.status(403).json({ error: 'Forbidden' });
    if (!db) return res.status(500).json({ error: 'Database not initialized' });

    await updateDoc(doc(db, 'users', userId), {
      privacySettings: settings,
      updatedAt: serverTimestamp(),
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating privacy settings:', error);
    res.status(500).json({ error: 'Failed to update privacy settings' });
  }
});

router.post('/personality/reset', async (req, res) => {
  try {
    const { userId } = req.body;
    if ((req as any).user.uid !== userId) return res.status(403).json({ error: 'Forbidden' });
    if (!db) return res.status(500).json({ error: 'Database not initialized' });

    await updateDoc(doc(db, 'users', userId), {
      personalityAnswers: null,
      personalityProfile: null,
      personalityScores: null,
      personalityShareCards: null,
      personalityShareGrants: null,
      whyMatchPersonalityProvenance: null,
      rawAnswersStored: false,
      updatedAt: serverTimestamp(),
    });
    await setDoc(
      doc(db, `users/${userId}/private/personality`),
      {
        report: null,
        answers: deleteField(),
        personalityAnswers: deleteField(),
        rawAnswersStored: false,
        resetAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error resetting personality assessment:', error);
    res.status(500).json({ error: 'Failed to reset personality assessment' });
  }
});

router.post('/personality/delete', async (req, res) => {
  try {
    const { userId } = req.body;
    if ((req as any).user.uid !== userId) return res.status(403).json({ error: 'Forbidden' });
    if (!db) return res.status(500).json({ error: 'Database not initialized' });

    await updateDoc(doc(db, 'users', userId), {
      personalityAnswers: null,
      personalityProfile: null,
      personalityScores: null,
      personalityTaste: null,
      personalityShareCards: null,
      personalityShareGrants: null,
      personalityConsentReceipts: null,
      whyMatchPersonalityProvenance: null,
      rawAnswersStored: false,
      updatedAt: serverTimestamp(),
    });
    await setDoc(
      doc(db, `users/${userId}/private/personality`),
      {
        report: null,
        answers: deleteField(),
        personalityAnswers: deleteField(),
        rawAnswersStored: false,
        deletedAt: new Date().toISOString(),
        deletionScope: [
          'personality_answers',
          'personality_report',
          'personality_share_cards',
          'personality_share_grants',
          'personality_consent_receipts',
          'why_match_personality_provenance',
        ],
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting personality data:', error);
    res.status(500).json({ error: 'Failed to delete personality data' });
  }
});

router.post('/personality/export', async (req, res) => {
  try {
    const { userId } = req.body;
    if ((req as any).user.uid !== userId) return res.status(403).json({ error: 'Forbidden' });
    if (!db) return res.status(500).json({ error: 'Database not initialized' });

    const userSnap = await getDoc(doc(db, 'users', userId));
    const personalitySnap = await getDoc(doc(db, `users/${userId}/private/personality`));
    const visibilitySnap = await getDoc(doc(db, `users/${userId}/private/visibility`));

    res.json(buildSafePersonalityExport({
      userData: userSnap.exists() ? userSnap.data() : null,
      personalityData: personalitySnap.exists() ? personalitySnap.data() : null,
      visibility: visibilitySnap.exists() ? visibilitySnap.data() : null,
    }));
  } catch (error) {
    console.error('Error exporting personality data:', error);
    res.status(500).json({ error: 'Failed to export personality data' });
  }
});

const VISIBILITY_FIELDS = ['trait_summary', 'strengths', 'watch_outs', 'communication_notes'];
const VISIBILITY_SCOPES = ['private', 'public', 'mutual'];

router.post('/personality/visibility', async (req, res) => {
  try {
    const { userId } = req.body;
    if ((req as any).user.uid !== userId) return res.status(403).json({ error: 'Forbidden' });
    if (!db) return res.status(500).json({ error: 'Database not initialized' });

    const snap = await getDoc(doc(db, `users/${userId}/private/visibility`));
    if (!snap.exists()) {
      const defaultDoc = {
        fields: VISIBILITY_FIELDS.reduce((acc, f) => ({ ...acc, [f]: 'private' }), {}),
        updatedAt: new Date().toISOString(),
      };
      return res.json(defaultDoc);
    }
    res.json(snap.data());
  } catch (error) {
    console.error('Error loading personality visibility:', error);
    res.status(500).json({ error: 'Failed to load personality visibility' });
  }
});

router.post('/personality/visibility/update', async (req, res) => {
  try {
    const { userId, fields } = req.body;
    if ((req as any).user.uid !== userId) return res.status(403).json({ error: 'Forbidden' });
    if (!db) return res.status(500).json({ error: 'Database not initialized' });
    if (!fields || typeof fields !== 'object') return res.status(400).json({ error: 'Missing fields' });

    const sanitized: Record<string, string> = {};
    for (const [k, v] of Object.entries(fields)) {
      if (!VISIBILITY_FIELDS.includes(k)) continue;
      if (typeof v !== 'string' || !VISIBILITY_SCOPES.includes(v)) continue;
      sanitized[k] = v;
    }

    await setDoc(
      doc(db, `users/${userId}/private/visibility`),
      {
        fields: sanitized,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );

    res.json({ success: true, fields: sanitized });
  } catch (error) {
    console.error('Error updating personality visibility:', error);
    res.status(500).json({ error: 'Failed to update personality visibility' });
  }
});

export default router;
