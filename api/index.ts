/**
 * Vercel serverless adapter for the Express app.
 *
 * Vercel maps any /api/* request to this handler. The Express app from
 * server.ts is mounted as a serverless function so the same routing works
 * locally (`npm run dev` via tsx) and in production (Vercel Lambda).
 *
 * Note: The Vite dev middleware in server.ts is conditional on
 * NODE_ENV !== "production"; on Vercel it is skipped so we don't try to
 * load Vite at runtime.
 */

import "dotenv/config";
import express from "express";
import { aiRouter } from "../server/aiRoutes.ts";
import trustRoutes from "../server/trustRoutes.ts";
import shareRoutes from "../server/shareRoutes.ts";
import consentRoutes from "../server/consentRoutes.ts";
import matchRoutes from "../server/matchRoutes.ts";

const app = express();

app.set("trust proxy", 1);

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  );
  next();
});

app.use(express.json({ limit: "200kb" }));

const startedAt = new Date().toISOString();

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime(), startedAt });
});
app.get("/api/health/live", (_req, res) => {
  res.json({ live: true });
});
app.get("/api/health/ready", (_req, res) => {
  const ready =
    !!process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY";
  res.status(ready ? 200 : 503).json({
    ready,
    checks: {
      gemini_api_key: !!process.env.GEMINI_API_KEY,
      firebase_app_check: process.env.FIREBASE_APP_CHECK_ENABLED === "true",
      auth_mode: process.env.AI_ROUTE_AUTH_MODE || "prototype",
    },
  });
});

app.use("/api/ai", aiRouter);
app.use("/api/safety", trustRoutes);
app.use("/api/profile", trustRoutes);
app.use("/api/account", trustRoutes);
app.use("/api/support", trustRoutes);
app.use("/api/share", shareRoutes);
app.use("/api/consent", consentRoutes);
app.use("/api/match", matchRoutes);

// Vercel passes (req, res) directly — Express handles them like any HTTP request
export default app;
