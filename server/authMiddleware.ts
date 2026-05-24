import admin from "firebase-admin";
import type { Request, Response, NextFunction } from "express";
import firebaseConfig from "../firebase-applet-config.json" with { type: "json" };

type DecodedFirebaseToken = {
  uid: string;
  [claim: string]: unknown;
};

type AuthenticatedRequest = Request & {
  uid?: string;
  user?: DecodedFirebaseToken;
  authContext?: {
    uid: string;
    mode: "firebase" | "local-dev-mock";
  };
};

function ensureInitialized() {
  if (!admin.apps.length) {
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId,
    });
  }
}

function isLocalMockAuthEnabled() {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.AI_ROUTE_AUTH_MODE !== "strict" &&
    process.env.KESHER_ENABLE_MOCK_AUTH !== "false"
  );
}

function getBearerToken(authHeader: string | string[] | undefined): string | null {
  const header = Array.isArray(authHeader) ? authHeader[0] : authHeader;
  if (!header) return null;

  const [scheme, token, ...rest] = header.trim().split(/\s+/);
  if (scheme?.toLowerCase() !== "bearer" || !token || rest.length > 0) {
    throw new Error("INVALID_AUTH_HEADER");
  }

  return token;
}

function attachAuth(
  req: AuthenticatedRequest,
  decoded: DecodedFirebaseToken,
  mode: "firebase" | "local-dev-mock",
) {
  req.uid = decoded.uid;
  req.user = decoded;
  req.authContext = { uid: decoded.uid, mode };
}

async function verifyFirebaseIdToken(token: string): Promise<DecodedFirebaseToken> {
  ensureInitialized();
  return admin.auth().verifyIdToken(token);
}

export function createAuthMiddleware(
  verifyIdToken: (token: string) => Promise<DecodedFirebaseToken> = verifyFirebaseIdToken,
) {
  return async function authMiddleware(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    let token: string | null = null;

    try {
      token = getBearerToken(req.headers.authorization);
    } catch {
      res.status(401).json({ error: "Invalid authorization header" });
      return;
    }

    if (token) {
      try {
        const decoded = await verifyIdToken(token);
        attachAuth(req, decoded, "firebase");
        next();
      } catch {
        res.status(401).json({ error: "Invalid token" });
      }
      return;
    }

    if (isLocalMockAuthEnabled()) {
      attachAuth(
        req,
        {
          uid: "local-dev-user",
          firebase: { sign_in_provider: "local-dev-mock" },
        },
        "local-dev-mock",
      );
      next();
      return;
    }

    res.status(401).json({ error: "Authentication required" });
  };
}

/**
 * Express middleware that verifies Firebase ID tokens.
 * In local development only, missing credentials fall back to a mock user.
 * Invalid credentials are always rejected, including in development.
 */
export const authMiddleware = createAuthMiddleware();
