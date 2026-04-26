import { Request, Response, NextFunction } from "express";
import firebaseConfig from "../firebase-applet-config.json" assert { type: "json" };

type FirebaseLookupResponse = {
  users?: Array<{ localId?: string; email?: string; displayName?: string }>;
  error?: { message?: string };
};

export type VerifiedAuth = {
  uid: string;
  email?: string;
  displayName?: string;
  source: "firebase" | "mock";
};

export type AuthenticatedRequest = Request & { auth?: VerifiedAuth };

export type TokenVerifier = (idToken: string) => Promise<VerifiedAuth>;

const LOCAL_DEV_MOCK_HEADER = "x-kesher-mock-auth";

function isLocalDev(): boolean {
  return process.env.NODE_ENV !== "production";
}

function isMockAuthEnabled(): boolean {
  return isLocalDev() && process.env.KESHER_ENABLE_MOCK_AUTH !== "false";
}

function getBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim() || null;
}

export const verifyFirebaseIdToken: TokenVerifier = async (idToken: string) => {
  const apiKey = process.env.FIREBASE_API_KEY || firebaseConfig.apiKey;
  if (!apiKey) {
    throw new Error("Missing Firebase API key for token verification");
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    }
  );

  const payload = (await response.json()) as FirebaseLookupResponse;

  if (!response.ok || !payload.users?.[0]?.localId) {
    throw new Error(payload.error?.message || "Invalid Firebase ID token");
  }

  const user = payload.users[0];
  return {
    uid: user.localId!,
    email: user.email,
    displayName: user.displayName,
    source: "firebase",
  };
};

export function createAuthMiddleware(verifier: TokenVerifier = verifyFirebaseIdToken) {
  return async function authBoundary(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    const token = getBearerToken(req);

    if (token) {
      try {
        req.auth = await verifier(token);
        return next();
      } catch {
        return void res.status(401).json({ error: "Invalid auth token" });
      }
    }

    if (isMockAuthEnabled()) {
      const hintedUser = req.header(LOCAL_DEV_MOCK_HEADER)?.trim();
      req.auth = {
        uid: hintedUser || "local-dev-user",
        source: "mock",
      };
      return next();
    }

    return void res.status(401).json({ error: "Authentication required" });
  };
}

export const authMiddleware = createAuthMiddleware();
