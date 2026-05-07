/**
 * Firebase App Check verification middleware.
 *
 * In production, every AI/trust route must include a valid App Check token
 * that proves the request comes from a real, attested Kesher client app.
 * This blocks bot traffic, stolen API keys, and replay attacks.
 *
 * App Check token is sent in the `X-Firebase-AppCheck` header.
 *
 * Modes:
 *   - "production"  : Token required and verified. Reject on failure.
 *   - "prototype"   : Token logged if present but not enforced.
 *   - "off"         : Bypass entirely (local dev only).
 *
 * Set FIREBASE_APP_CHECK_ENABLED=true and AI_ROUTE_AUTH_MODE=production to enforce.
 */

import express from "express";
import admin from "firebase-admin";

export type AppCheckMode = "production" | "prototype" | "off";

export function getAppCheckMode(): AppCheckMode {
  const enabled = process.env.FIREBASE_APP_CHECK_ENABLED === "true";
  const authMode = process.env.AI_ROUTE_AUTH_MODE || "prototype";
  if (!enabled) return "off";
  if (authMode === "production") return "production";
  return "prototype";
}

export const requireAppCheck = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const mode = getAppCheckMode();

  if (mode === "off") {
    next();
    return;
  }

  const token = req.header("X-Firebase-AppCheck");

  if (!token) {
    if (mode === "production") {
      console.warn("App Check rejected: missing X-Firebase-AppCheck header");
      return res.status(401).json({ error: "Missing App Check token" });
    }
    // prototype: warn but allow
    console.warn("App Check warning (prototype mode): missing token");
    next();
    return;
  }

  try {
    if (!admin.apps.length) {
      if (mode === "production") {
        return res.status(503).json({ error: "App Check unavailable" });
      }
      next();
      return;
    }

    const appCheckClaims = await admin.appCheck().verifyToken(token);
    (req as any).appCheckClaims = appCheckClaims;
    res.locals.app_check_verified = true;
    next();
  } catch (error: any) {
    console.warn("App Check verification failed:", error?.message);
    if (mode === "production") {
      return res.status(401).json({ error: "Invalid App Check token" });
    }
    next();
  }
};
