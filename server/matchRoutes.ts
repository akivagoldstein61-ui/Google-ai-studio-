/**
 * Match routes — server-side mutual-like check + notification fanout.
 *
 * The client uses /src/services/matchService.ts for the optimistic path
 * (writes the like and checks reciprocity). This server route exists as
 * a server-of-record for fan-out actions that require admin privileges:
 *
 *   POST /api/match/notify-on-match  — creates /notifications/{id} for both
 *                                       users after a successful match.
 *   POST /api/match/unmatch          — soft-deletes the match record.
 *
 * Auth: required (Firebase ID token).
 */

import express from "express";
import admin from "firebase-admin";
import fs from "fs";

const router = express.Router();

const configPath = "./firebase-applet-config.json";
if (fs.existsSync(configPath) && !admin.apps.length) {
  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  admin.initializeApp({ projectId: config.projectId });
}

const requireAuth = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = await admin.auth().verifyIdToken(auth.split(" ")[1]);
    (req as any).user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};

router.use(requireAuth);

router.post("/notify-on-match", async (req, res) => {
  try {
    const me = (req as any).user.uid;
    const { matchId, peerUid, peerDisplayName } = req.body;

    if (!matchId || !peerUid) {
      return res.status(400).json({ error: "matchId and peerUid required" });
    }

    const fs = admin.firestore();
    const matchSnap = await fs.collection("matches").doc(matchId).get();
    if (!matchSnap.exists) return res.status(404).json({ error: "Match not found" });
    const matchData = matchSnap.data() as any;
    if (!matchData?.users?.includes(me)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const batch = fs.batch();
    for (const uid of matchData.users) {
      const ref = fs.collection("notifications").doc();
      batch.set(ref, {
        userId: uid,
        kind: "new_match",
        title: "התאמה חדשה",
        body: uid === me ? `יש לכם התאמה חדשה.` : `יש לכם התאמה עם ${peerDisplayName || ""}.`,
        link: `/chat/${matchId}`,
        matchId,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
    await batch.commit();
    res.json({ ok: true, count: matchData.users.length });
  } catch (e: any) {
    console.error("notify-on-match failed:", e);
    res.status(500).json({ error: "Notification fan-out failed" });
  }
});

router.post("/unmatch", async (req, res) => {
  try {
    const me = (req as any).user.uid;
    const { matchId } = req.body;
    if (!matchId) return res.status(400).json({ error: "matchId required" });

    const fs = admin.firestore();
    const matchRef = fs.collection("matches").doc(matchId);
    const snap = await matchRef.get();
    if (!snap.exists) return res.status(404).json({ error: "Match not found" });
    const data = snap.data() as any;
    if (!data?.users?.includes(me)) return res.status(403).json({ error: "Forbidden" });

    await matchRef.set(
      {
        status: "unmatched",
        unmatchedBy: me,
        unmatchedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    res.json({ ok: true });
  } catch (e: any) {
    console.error("unmatch failed:", e);
    res.status(500).json({ error: "Unmatch failed" });
  }
});

export default router;
