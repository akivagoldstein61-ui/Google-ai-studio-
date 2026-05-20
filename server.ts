import "dotenv/config";
import express, { Express } from "express";
import path from "path";
import { aiRouter } from "./server/aiRoutes.ts";
import trustRoutes from "./server/trustRoutes.ts";
import shareRoutes from "./server/shareRoutes.ts";

/**
 * Build the Express app with all Kesher routes mounted.
 *
 * Exported so it can be reused by:
 *   - local dev / production node entry below (the `app.listen` block)
 *   - Vercel serverless catch-all at `api/[...path].ts`
 *
 * IMPORTANT: do not call `app.listen` here. Calling listen from a serverless
 * function leaks ports between invocations.
 */
export async function createApp(): Promise<Express> {
  const app = express();

  // Trust the first proxy (Vercel/Cloud Run/Nginx) so rate-limit + req.ip work.
  app.set("trust proxy", 1);

  app.use(express.json({ limit: "1mb" }));

  // Health check (also used by the post-deploy smoke script).
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // AI Routes
  app.use("/api/ai", aiRouter);

  // Trust & Safety Routes (same router mounted at multiple prefixes for
  // backwards-compat with the existing client paths).
  app.use("/api/safety", trustRoutes);
  app.use("/api/profile", trustRoutes);
  app.use("/api/account", trustRoutes);
  app.use("/api/support", trustRoutes);

  // Permissioned share-card Routes
  app.use("/api/share", shareRoutes);

  return app;
}

// On Vercel the file is imported by `api/[...path].ts` and must not start a
// listener (Vercel sets the `VERCEL` env var on every serverless invocation).
// For `npm run dev` (tsx) and `npm start` (node dist/server.cjs), no VERCEL
// var is set, so we listen normally.
//
// Using an env-var guard instead of `import.meta.url === file://${argv[1]}`
// because esbuild's CJS output for the `npm start` bundle strips `import.meta`
// to an empty object — that would silently disable the listen block.
const isServerless = !!process.env.VERCEL;

if (!isServerless) {
  (async () => {
    const app = await createApp();
    const PORT = Number(process.env.PORT) || 3000;

    // Vite middleware for development, static dist for production.
    if (process.env.NODE_ENV !== "production") {
      const { createServer: createViteServer } = await import("vite");
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
  })().catch((err) => {
    console.error("server failed to start:", err);
    process.exit(1);
  });
}
