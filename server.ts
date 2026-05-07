import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { aiRouter } from "./server/aiRoutes.ts";
import trustRoutes from "./server/trustRoutes.ts";
import shareRoutes from "./server/shareRoutes.ts";
import consentRoutes from "./server/consentRoutes.ts";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
  const startedAt = new Date().toISOString();

  // Trust the first proxy (Cloud Run / Vercel / Nginx)
  app.set("trust proxy", 1);

  // Strict security headers
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
    if (process.env.NODE_ENV === "production") {
      res.setHeader("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
    }
    next();
  });

  app.use(express.json({ limit: "200kb" })); // Cap body size to limit abuse

  // Health checks (public, unauthenticated)
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

  // AI Routes (App Check + per-user rate limit applied inside aiRouter)
  app.use("/api/ai", aiRouter);

  // Trust & Safety Routes
  app.use("/api/safety", trustRoutes);
  app.use("/api/profile", trustRoutes);
  app.use("/api/account", trustRoutes);
  app.use("/api/support", trustRoutes);

  // Permissioned share-card Routes
  app.use("/api/share", shareRoutes);

  // Mutual consent (Gate 5 — compatibility reflection prerequisite)
  app.use("/api/consent", consentRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
