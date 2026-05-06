import admin from "firebase-admin";
import type { Request, Response, NextFunction } from "express";
import firebaseConfig from "../firebase-applet-config.json" with { type: "json" };

// Lazy initialization — only once
let initialized = false;

function ensureInitialized() {
  if (!initialized) {
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId,
    });
    initialized = true;
  }
}

/**
 * Express middleware that verifies Firebase ID tokens.
 * Attaches `req.uid` on success, returns 401 on failure.
 */
export async function authMiddleware(
  req: Request & { uid?: string },
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const token = authHeader.slice(7);

  try {
    ensureInitialized();
    const decoded = await admin.auth().verifyIdToken(token);
    (req as any).uid = decoded.uid;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}
