/**
 * Mutual Consent Routes — Gate 5 enforcement.
 *
 * Compatibility reflection between two users requires BOTH users to have
 * explicitly opted in to share personality reflection signals with each
 * other. No reflection is generated until both consent records exist and
 * neither has been revoked.
 *
 * Storage: Firestore `consents/{consentId}` where consentId = sorted-uid pair
 * (e.g., "consent_uidA_uidB" with uids sorted alphabetically).
 *
 * Each record holds two opt-in entries — one per user — and a hash of the
 * exact signals each user has approved sharing. Either user can revoke at
 * any time, which marks the record `revoked: true` and blocks future
 * reflections without re-consent.
 *
 * Endpoints:
 *   POST /api/consent/request          — A invites B to mutual reflection
 *   POST /api/consent/grant            — B accepts (or A re-grants)
 *   POST /api/consent/revoke           — Either user revokes
 *   GET  /api/consent/status/:peerUid  — Current state for a pair
 *
 * Privacy & Israeli Amendment 13 alignment:
 *   - User must see exactly which signals are being shared, in plain text
 *   - User can revoke at any time without explanation
 *   - Revocation cascades: any cached reflection cards must be invalidated
 */

import express from "express";
import admin from "firebase-admin";
import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import fs from "fs";

const router = express.Router();

const configPath = "./firebase-applet-config.json";
let db: any = null;

if (fs.existsSync(configPath)) {
  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  if (!getApps().length) {
    initializeApp(config);
  }
  db = getFirestore(undefined as any, config.firestoreDatabaseId);
  if (!admin.apps.length) {
    admin.initializeApp({ projectId: config.projectId });
  }
}

const requireAuth = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authHeader.split("Bearer ")[1];
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    (req as any).user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};

router.use(requireAuth);

function consentId(uidA: string, uidB: string): string {
  const [a, b] = [uidA, uidB].sort();
  return `consent_${a}_${b}`;
}

/** Approved signals catalogue — must match COMPATIBILITY_ALLOWED_SIGNALS */
const APPROVED_SIGNALS = [
  "mutually_shared_values",
  "mutually_visible_intent",
  "mutually_visible_observance",
  "mutually_visible_lifestyle",
  "mutually_visible_interests",
  "mutually_visible_prompts",
  "mutually_approved_share_card",
] as const;

type ApprovedSignal = (typeof APPROVED_SIGNALS)[number];

function validateSignals(signals: unknown): ApprovedSignal[] {
  if (!Array.isArray(signals)) return [];
  return signals.filter((s): s is ApprovedSignal =>
    APPROVED_SIGNALS.includes(s as ApprovedSignal),
  );
}

router.post("/request", async (req, res) => {
  try {
    const me = (req as any).user.uid;
    const { peerUid, signals } = req.body;

    if (!peerUid || typeof peerUid !== "string") {
      return res.status(400).json({ error: "peerUid required" });
    }
    if (peerUid === me) {
      return res.status(400).json({ error: "Cannot consent with yourself" });
    }
    if (!db) return res.status(503).json({ error: "Database unavailable" });

    const approvedSignals = validateSignals(signals);
    if (approvedSignals.length === 0) {
      return res.status(400).json({ error: "No valid signals provided" });
    }

    const id = consentId(me, peerUid);
    const ref = doc(db, "consents", id);
    const existing = await getDoc(ref);

    const myEntry = {
      uid: me,
      grantedAt: serverTimestamp(),
      signals: approvedSignals,
      revoked: false,
      revokedAt: null,
    };

    if (existing.exists()) {
      await updateDoc(ref, {
        [`entries.${me}`]: myEntry,
        updatedAt: serverTimestamp(),
        revoked: false,
      });
    } else {
      await setDoc(ref, {
        consentId: id,
        users: [me, peerUid].sort(),
        entries: { [me]: myEntry },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        revoked: false,
        bothConsented: false,
      });
    }

    res.json({ consentId: id, bothConsented: false });
  } catch (e: any) {
    console.error("Consent request failed:", e);
    res.status(500).json({ error: "Failed to record consent request" });
  }
});

router.post("/grant", async (req, res) => {
  try {
    const me = (req as any).user.uid;
    const { peerUid, signals } = req.body;

    if (!peerUid) return res.status(400).json({ error: "peerUid required" });
    if (!db) return res.status(503).json({ error: "Database unavailable" });

    const approvedSignals = validateSignals(signals);
    if (approvedSignals.length === 0) {
      return res.status(400).json({ error: "No valid signals provided" });
    }

    const id = consentId(me, peerUid);
    const ref = doc(db, "consents", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      return res.status(404).json({ error: "No consent request found" });
    }

    const data = snap.data();
    const peerEntry = data.entries?.[peerUid];
    if (!peerEntry || peerEntry.revoked) {
      return res.status(409).json({ error: "Peer has not requested consent or has revoked" });
    }

    // Both sets of signals must intersect — only intersection is shared
    const intersected = approvedSignals.filter((s) => peerEntry.signals?.includes(s));
    if (intersected.length === 0) {
      return res.status(409).json({ error: "No mutually approved signals" });
    }

    const myEntry = {
      uid: me,
      grantedAt: serverTimestamp(),
      signals: approvedSignals,
      revoked: false,
      revokedAt: null,
    };

    await updateDoc(ref, {
      [`entries.${me}`]: myEntry,
      bothConsented: true,
      mutualSignals: intersected,
      updatedAt: serverTimestamp(),
      revoked: false,
    });

    res.json({
      consentId: id,
      bothConsented: true,
      mutualSignals: intersected,
    });
  } catch (e: any) {
    console.error("Consent grant failed:", e);
    res.status(500).json({ error: "Failed to grant consent" });
  }
});

router.post("/revoke", async (req, res) => {
  try {
    const me = (req as any).user.uid;
    const { peerUid } = req.body;

    if (!peerUid) return res.status(400).json({ error: "peerUid required" });
    if (!db) return res.status(503).json({ error: "Database unavailable" });

    const id = consentId(me, peerUid);
    const ref = doc(db, "consents", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      return res.status(404).json({ error: "No consent record found" });
    }

    await updateDoc(ref, {
      [`entries.${me}.revoked`]: true,
      [`entries.${me}.revokedAt`]: serverTimestamp(),
      revoked: true,
      bothConsented: false,
      revokedBy: me,
      revokedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Cascade: invalidate any cached compatibility reflection cards
    // for this pair. Cards are stored under /compatibilityCards with a
    // `consentId` field linking them to this consent record.
    let invalidated = 0;
    try {
      const cardsQuery = query(
        collection(db, "compatibilityCards"),
        where("consentId", "==", id),
        where("revokedAt", "==", null),
      );
      const cards = await getDocs(cardsQuery);
      if (!cards.empty) {
        const batch = writeBatch(db);
        cards.forEach((cardDoc) => {
          batch.update(cardDoc.ref, {
            revokedAt: serverTimestamp(),
            revokedBy: me,
            payload: null,           // clear cached AI output
            mutualSignals: [],
          });
        });
        await batch.commit();
        invalidated = cards.size;
      }
    } catch (cascadeErr) {
      console.warn("Cascade invalidation partial:", cascadeErr);
    }

    res.json({ consentId: id, revoked: true, cardsInvalidated: invalidated });
  } catch (e: any) {
    console.error("Consent revoke failed:", e);
    res.status(500).json({ error: "Failed to revoke consent" });
  }
});

router.get("/status/:peerUid", async (req, res) => {
  try {
    const me = (req as any).user.uid;
    const peerUid = req.params.peerUid;

    if (!peerUid) return res.status(400).json({ error: "peerUid required" });
    if (!db) return res.status(503).json({ error: "Database unavailable" });

    const id = consentId(me, peerUid);
    const snap = await getDoc(doc(db, "consents", id));

    if (!snap.exists()) {
      return res.json({
        consentId: id,
        state: "none",
        bothConsented: false,
        mutualSignals: [],
      });
    }

    const data = snap.data();
    const myEntry = data.entries?.[me];
    const peerEntry = data.entries?.[peerUid];

    let state: "none" | "requested_by_me" | "requested_by_peer" | "mutual" | "revoked" = "none";
    if (data.revoked) state = "revoked";
    else if (data.bothConsented) state = "mutual";
    else if (myEntry && !peerEntry) state = "requested_by_me";
    else if (!myEntry && peerEntry) state = "requested_by_peer";

    res.json({
      consentId: id,
      state,
      bothConsented: !!data.bothConsented && !data.revoked,
      mutualSignals: data.mutualSignals || [],
      myGrantedSignals: myEntry?.signals || [],
      peerGrantedSignals: peerEntry?.signals || [],
    });
  } catch (e: any) {
    console.error("Consent status failed:", e);
    res.status(500).json({ error: "Failed to fetch consent status" });
  }
});

export default router;
