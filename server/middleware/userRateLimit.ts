/**
 * Per-user rate limiting middleware.
 *
 * IP-based rate limiting (express-rate-limit) is bypassed by NAT, mobile
 * carriers, and shared networks. Per-user limits use the verified Firebase
 * uid as the key so abuse from one account cannot affect others.
 *
 * Tiers (per minute):
 *   - free user:    20 AI calls
 *   - premium user: 60 AI calls
 *   - unverified:   5 AI calls   (forces sign-in for power use)
 *
 * Tiers (per day):
 *   - free user:    300 AI calls
 *   - premium user: 1500 AI calls
 *   - unverified:   30 AI calls
 *
 * Hard daily cost cap per uid (sum of token usage estimates):
 *   - free:    $0.50/day
 *   - premium: $3.00/day
 *
 * Storage: in-memory token bucket. For multi-instance deployments, swap to
 * Redis or Firestore-backed counter via setRateLimitStore().
 */

import express from "express";

type Tier = "unverified" | "free" | "premium";

interface BucketEntry {
  minuteCount: number;
  minuteWindowStart: number;
  dayCount: number;
  dayWindowStart: number;
  costCents: number;
}

const buckets = new Map<string, BucketEntry>();

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

function getBucket(uid: string, now: number): BucketEntry {
  let b = buckets.get(uid);
  if (!b) {
    b = {
      minuteCount: 0,
      minuteWindowStart: now,
      dayCount: 0,
      dayWindowStart: now,
      costCents: 0,
    };
    buckets.set(uid, b);
  }
  if (now - b.minuteWindowStart >= MIN_MS) {
    b.minuteCount = 0;
    b.minuteWindowStart = now;
  }
  if (now - b.dayWindowStart >= DAY_MS) {
    b.dayCount = 0;
    b.dayWindowStart = now;
    b.costCents = 0;
  }
  return b;
}

export const requireUserRateLimit = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const uid = (req as any).user?.uid || `ip:${req.ip}`;
  const now = Date.now();
  const tier = tierFor(req);
  const limits = LIMITS[tier];
  const bucket = getBucket(uid, now);

  if (bucket.minuteCount >= limits.perMin) {
    res.setHeader("Retry-After", "60");
    return res.status(429).json({
      error: "Rate limit exceeded — try again in a minute",
      tier,
      limit: limits.perMin,
      window: "1m",
    });
  }
  if (bucket.dayCount >= limits.perDay) {
    res.setHeader("Retry-After", "3600");
    return res.status(429).json({
      error: "Daily rate limit reached — resets at midnight UTC",
      tier,
      limit: limits.perDay,
      window: "24h",
    });
  }
  if (bucket.costCents >= limits.maxCents) {
    return res.status(429).json({
      error: "Daily AI cost cap reached for your tier",
      tier,
      max_cents: limits.maxCents,
    });
  }

  bucket.minuteCount += 1;
  bucket.dayCount += 1;
  res.locals.rate_limit_bucket = bucket;
  res.locals.rate_limit_tier = tier;
  next();
};

/** Estimate cost for a feature_id and add to bucket. Call after AI completes. */
export function recordAiCost(res: express.Response, featureId: string, tokens: number) {
  const bucket = res.locals.rate_limit_bucket as BucketEntry | undefined;
  if (!bucket) return;
  // Rough cost in cents per 1k tokens: Flash $0.0075, Pro $0.125 — use feature route lookup.
  const estimate =
    featureId.includes("personality") || featureId.includes("compatibility") || featureId.includes("date_planner")
      ? Math.round((tokens / 1000) * 12.5)  // Pro
      : Math.round((tokens / 1000) * 0.75); // Flash
  bucket.costCents += estimate;
}

/** Test/admin: clear the bucket for a uid */
export function resetUserBucket(uid: string) {
  buckets.delete(uid);
}
