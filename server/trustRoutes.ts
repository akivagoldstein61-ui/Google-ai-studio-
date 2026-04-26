import express from 'express';
import admin from 'firebase-admin';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import fs from 'fs';

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

    // In a real app, this would clear the specific personality fields
    await updateDoc(doc(db, 'users', userId), {
      personalityAnswers: null,
      personalityProfile: null,
      updatedAt: serverTimestamp(),
    });

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

    // In a real app, this would delete all personality-related data
    await updateDoc(doc(db, 'users', userId), {
      personalityAnswers: null,
      personalityProfile: null,
      personalityTaste: null,
      updatedAt: serverTimestamp(),
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting personality data:', error);
    res.status(500).json({ error: 'Failed to delete personality data' });
  }
});

export default router;
