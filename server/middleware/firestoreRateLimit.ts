/**
 * Firestore-backed rate limiter.
 *
 * The in-memory `userRateLimit.ts` resets on every cold start of a Vercel
 * Lambda. This implementation persists per-user counters in Firestore so
 * limits hold across function instances.
 *
 * Activation: set `RATE_LIMIT_BACKEND=firestore` in env vars.
 *
 * Schema (Firestore):
 *   /rateLimits/{uid} → {
 *     minuteCount, minuteWindowStart,
 *     dayCount, dayWindowStart,
 *     costCents,
 *     updatedAt
 *   }
 *
 * Reads + transactional writes per request — Firestore charges 2 ops per
 * call (~$0.36 per million). For an MVP this is acceptable; for scale,
 * swap to Redis or Cloud Memorystore.
 */

import express from "express";
import admin from "firebase-admin";

type Tier = "unverified" | "free" | "premium";

const LIMITS: Record<Tier, { perMin: number; perDay: number; maxCents: number }> = {
  unverified: { perMin: 5, perDay: 30, maxCents: 10 },
  free: { perMin: 20, perDay: 300, maxCents: 50 },
  premium: { perMin: 60, perDay: 1500, maxCents: 300 },
};

const MIN_MS = 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function tierFor(req: express.Request): Tier {
  const claims = (req as any).user;
  if (!claims?.uid) return "unverified";
  if (claims.premium === true || claims.role === "premium") return "premium";
  return "free";
}

export const requireFirestoreRateLimit = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  if (process.env.RATE_LIMIT_BACKEND !== "firestore") {
    // Fallback to in-memory limiter
    return next();
  }

  const uid = (req as any).user?.uid;
  if (!uid) {
    // Unverified: rely on IP-based limiter upstream
    return next();
  }

  if (!admin.apps.length) {
    return next();
  }

  const tier = tierFor(req);
  const limits = LIMITS[tier];
  const now = Date.now();
  const ref = admin.firestore().collection("rateLimits").doc(uid);

  try {
    const result = await admin.firestore().runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const data = snap.exists
        ? (snap.data() as any)
        : {
            minuteCount: 0,
            minuteWindowStart: now,
            dayCount: 0,
            dayWindowStart: now,
            costCents: 0,
          };

      if (now - data.minuteWindowStart >= MIN_MS) {
        data.minuteCount = 0;
        data.minuteWindowStart = now;
      }
      if (now - data.dayWindowStart >= DAY_MS) {
        data.dayCount = 0;
        data.dayWindowStart = now;
        data.costCents = 0;
      }

      if (data.minuteCount >= limits.perMin) {
        return { rejected: "minute" as const, data };
      }
      if (data.dayCount >= limits.perDay) {
        return { rejected: "day" as const, data };
      }
      if (data.costCents >= limits.maxCents) {
        return { rejected: "cost" as const, data };
      }

      data.minuteCount += 1;
      data.dayCount += 1;
      data.updatedAt = admin.firestore.FieldValue.serverTimestamp();
      tx.set(ref, data, { merge: true });
      return { rejected: null, data };
    });

    if (result.rejected === "minute") {
      res.setHeader("Retry-After", "60");
      return res.status(429).json({ error: "Rate limit (minute)", tier });
    }
    if (result.rejected === "day") {
      res.setHeader("Retry-After", "3600");
      return res.status(429).json({ error: "Rate limit (day)", tier });
    }
    if (result.rejected === "cost") {
      return res.status(429).json({ error: "Daily cost cap", tier });
    }

    res.locals.rate_limit_tier = tier;
    next();
  } catch (e: any) {
    console.warn("Firestore rate limit failed, allowing:", e?.message);
    next();
  }
};
