import "dotenv/config";
import express, { Express } from "express";
import path from "path";
import { aiRouter } from "./server/aiRoutes.ts";
import { authMiddleware } from "./server/authMiddleware.ts";
import discoveryRoutes from "./server/discoveryRoutes.ts";
import trustRoutes from "./server/trustRoutes.ts";
import shareRoutes from "./server/shareRoutes.ts";
import tasteRoutes from "./server/tasteRoutes.ts";

const GITHUB_REPO_URL = "https://github.com/akivagoldstein61-ui/Google-ai-studio-";

function firstNonEmpty(...values: Array<string | undefined | null>): string {
  return values.find((value) => typeof value === "string" && value.trim().length > 0)?.trim() ?? "";
}

function normalizeHttpsUrl(hostOrUrl: string): string | null {
  if (!hostOrUrl) return null;
  if (hostOrUrl.startsWith("http://") || hostOrUrl.startsWith("https://")) return hostOrUrl;
  return `https://${hostOrUrl}`;
}

function getBuildFingerprint() {
  const commitSha = firstNonEmpty(
    process.env.VERCEL_GIT_COMMIT_SHA,
    process.env.GITHUB_SHA,
    process.env.VITE_VERCEL_GIT_COMMIT_SHA,
    process.env.VITE_COMMIT_SHA,
  );
  const branch = firstNonEmpty(
    process.env.VERCEL_GIT_COMMIT_REF,
    process.env.GITHUB_REF_NAME,
    process.env.VITE_VERCEL_GIT_COMMIT_REF,
    process.env.VITE_GIT_BRANCH,
  );
  const vercelUrl = firstNonEmpty(process.env.VERCEL_URL, process.env.VITE_VERCEL_URL);
  const productionUrl = firstNonEmpty(
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VITE_VERCEL_PROJECT_PRODUCTION_URL,
    "google-ai-studio-sage-sigma.vercel.app",
  );

  return {
    status: "ok",
    source: "server",
    generatedAt: new Date().toISOString(),
    repository: "akivagoldstein61-ui/Google-ai-studio-",
    repositoryUrl: GITHUB_REPO_URL,
    commitSha: commitSha || null,
    shortCommitSha: commitSha ? commitSha.slice(0, 7) : null,
    commitUrl: commitSha ? `${GITHUB_REPO_URL}/commit/${commitSha}` : null,
    branch: branch || null,
    environment: firstNonEmpty(process.env.VERCEL_ENV, process.env.VITE_VERCEL_ENV, process.env.NODE_ENV) || null,
    targetEnvironment: firstNonEmpty(process.env.VERCEL_TARGET_ENV, process.env.VITE_VERCEL_TARGET_ENV) || null,
    pullRequestId: firstNonEmpty(process.env.VERCEL_GIT_PULL_REQUEST_ID, process.env.VITE_VERCEL_GIT_PULL_REQUEST_ID) || null,
    deploymentUrl: normalizeHttpsUrl(vercelUrl),
    productionUrl: normalizeHttpsUrl(productionUrl),
    buildTime: firstNonEmpty(process.env.VITE_BUILD_TIME, process.env.BUILD_TIME) || null,
  };
}

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

  app.get(["/__version", "/__build", "/api/version"], (_req, res) => {
    res.json(getBuildFingerprint());
  });

  // Health check (also used by the post-deploy smoke script).
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      source: "express-server",
      service: "kesher",
      timestamp: new Date().toISOString(),
    });
  });

  // AI feature routes — all Gemini SDK usage is server-side only.
  app.use("/api/ai", authMiddleware, aiRouter);

  // Taste profile and discovery ranking routes.
  app.use("/api/taste", tasteRoutes);
  app.use("/api/discovery", discoveryRoutes);

  // Trust & Safety Routes (same router mounted at multiple prefixes for
  // backwards-compat with the existing client paths).
  app.use("/api/safety", trustRoutes);
  app.use("/api/profile", trustRoutes);
  app.use("/api/account", trustRoutes);
  app.use("/api/support", trustRoutes);

  // Permissioned share-card Routes.
  app.use("/api/share", shareRoutes);

  app.use("/api", (req, res) => {
    res.status(404).json({
      status: "not_found",
      source: "express-server",
      service: "kesher",
      path: req.originalUrl,
      message: "API route not implemented on this server.",
      timestamp: new Date().toISOString(),
    });
  });

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
const isTestRunner = process.env.NODE_ENV === "test" || process.argv.some((arg) => arg === "--test");
const isServerless =
  !!process.env.VERCEL ||
  isTestRunner ||
  process.env.KESHER_SUPPRESS_SERVER_LISTEN === "true";

if (!isServerless) {
  (async () => {
    const app = await createApp();
    const PORT = Number(process.env.PORT) || 3000;

    // Vite middleware for development, static dist for production.
    if (process.env.NODE_ENV !== "production") {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: {
          middlewareMode: true,
          hmr: process.env.DISABLE_HMR === "true" ? false : undefined,
        },
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
