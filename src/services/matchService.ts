/**
 * Match service.
 *
 * Replaces the prototype `Math.random()` mutual-like check with a real
 * Firestore-backed implementation.
 *
 * Flow:
 *   1. recordLike(fromUid, toUid) — writes /likes/{likeId} with (fromId, toId)
 *   2. The service then checks for a reciprocal /likes doc (toUid → fromUid)
 *   3. If found, atomically:
 *        - creates /matches/{matchId}
 *        - creates /conversations/{matchId}
 *        - returns the new Match
 *
 * Firestore rules (already in firestore.rules) ensure only the liker can
 * create their own like record, and either party can read it for reciprocity.
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  limit,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db, auth } from "@/firebase";
import { isPrototypeDemoMode } from "@/lib/prototypeMode";
import type { Match, Profile } from "@/types";

const LIKE_COLLECTION = "likes";
const MATCH_COLLECTION = "matches";
const CONVERSATION_COLLECTION = "conversations";
const PASS_COLLECTION = "passes";

function likeId(fromUid: string, toUid: string) {
  return `like_${fromUid}_${toUid}`;
}

function matchId(uidA: string, uidB: string) {
  return `match_${[uidA, uidB].sort().join("_")}`;
}

export interface MatchResult {
  isMatch: boolean;
  match?: Match;
}

export const matchService = {
  /**
   * Record a like. If the target user has already liked the current user,
   * a Match record is created atomically and returned.
   */
  async recordLike(fromUid: string, target: Profile): Promise<MatchResult> {
    if (isPrototypeDemoMode()) {
      // Demo: simulate a 50% match for the very first like, then no more.
      const isMatch = Math.random() > 0.5;
      if (!isMatch) return { isMatch: false };
      const id = matchId(fromUid, target.uid);
      return {
        isMatch: true,
        match: {
          id,
          users: [fromUid, target.uid],
          status: "active",
          createdAt: new Date().toISOString(),
          whyThisMatch: `You both expressed interest.`,
          participants: [target],
        },
      };
    }

    const id = likeId(fromUid, target.uid);

    // 1. Write the like record (idempotent)
    try {
      await setDoc(
        doc(db, LIKE_COLLECTION, id),
        {
          id,
          fromId: fromUid,
          toId: target.uid,
          createdAt: serverTimestamp(),
        },
        { merge: true },
      );
    } catch (e) {
      console.error("recordLike: failed to write like", e);
      throw e;
    }

    // 2. Check for reciprocal like
    const reciprocalId = likeId(target.uid, fromUid);
    const reciprocalSnap = await getDoc(doc(db, LIKE_COLLECTION, reciprocalId));
    if (!reciprocalSnap.exists()) {
      return { isMatch: false };
    }

    // 3. Atomic: create match + conversation
    const newMatchId = matchId(fromUid, target.uid);
    const matchRef = doc(db, MATCH_COLLECTION, newMatchId);
    const convoRef = doc(db, CONVERSATION_COLLECTION, newMatchId);

    // If a match already exists (race condition), short-circuit
    const existing = await getDoc(matchRef);
    if (existing.exists()) {
      const data = existing.data() as any;
      return {
        isMatch: true,
        match: {
          id: newMatchId,
          users: data.users,
          status: data.status,
          createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
          whyThisMatch: data.whyThisMatch ?? "You both expressed interest.",
          participants: [target],
        },
      };
    }

    const matchDoc = {
      id: newMatchId,
      users: [fromUid, target.uid],
      status: "active" as const,
      createdAt: serverTimestamp(),
      whyThisMatch: "You both expressed interest.",
    };

    const conversationDoc = {
      id: newMatchId,
      participants: [fromUid, target.uid],
      messages: [],
      createdAt: serverTimestamp(),
      lastActivityAt: serverTimestamp(),
    };

    const batch = writeBatch(db);
    batch.set(matchRef, matchDoc);
    batch.set(convoRef, conversationDoc);
    await batch.commit();

    return {
      isMatch: true,
      match: {
        id: newMatchId,
        users: [fromUid, target.uid],
        status: "active",
        createdAt: new Date().toISOString(),
        whyThisMatch: matchDoc.whyThisMatch,
        participants: [target],
      },
    };
  },

  /**
   * Record a pass. Stored under /passes for later "hide from explore" filtering.
   */
  async recordPass(fromUid: string, toUid: string): Promise<void> {
    if (isPrototypeDemoMode()) return;
    const id = `pass_${fromUid}_${toUid}`;
    await setDoc(doc(db, PASS_COLLECTION, id), {
      id,
      fromId: fromUid,
      toId: toUid,
      createdAt: serverTimestamp(),
    });
  },

  /**
   * Fetch all matches for the current user.
   */
  async getMyMatches(uid: string): Promise<Match[]> {
    if (isPrototypeDemoMode()) return [];

    const q = query(
      collection(db, MATCH_COLLECTION),
      where("users", "array-contains", uid),
      limit(50),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data() as any;
      return {
        id: d.id,
        users: data.users,
        status: data.status,
        createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
        whyThisMatch: data.whyThisMatch ?? "",
        participants: [], // hydrated separately by AppContext profile loader
      };
    });
  },

  /** Unmatch — soft-delete both sides. */
  async unmatch(matchId: string, byUid: string): Promise<void> {
    if (isPrototypeDemoMode()) return;
    await setDoc(
      doc(db, MATCH_COLLECTION, matchId),
      { status: "unmatched", unmatchedBy: byUid, unmatchedAt: serverTimestamp() },
      { merge: true },
    );
  },
};
