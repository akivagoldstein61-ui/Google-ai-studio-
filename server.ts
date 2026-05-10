import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { aiRouter } from "./server/aiRoutes.ts";
import { authMiddleware } from "./server/authMiddleware.ts";
import trustRoutes from "./server/trustRoutes.ts";
import shareRoutes from "./server/shareRoutes.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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
    process.env.VITE_COMMIT_SHA
  );
  const branch = firstNonEmpty(
    process.env.VERCEL_GIT_COMMIT_REF,
    process.env.GITHUB_REF_NAME,
    process.env.VITE_VERCEL_GIT_COMMIT_REF,
    process.env.VITE_GIT_BRANCH
  );
  const vercelUrl = firstNonEmpty(process.env.VERCEL_URL, process.env.VITE_VERCEL_URL);
  const productionUrl = firstNonEmpty(
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VITE_VERCEL_PROJECT_PRODUCTION_URL,
    "google-ai-studio-sage-sigma.vercel.app"
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust the first proxy (e.g., Cloud Run / Nginx)
  app.set('trust proxy', 1);

  app.use(express.json());

  // Build fingerprint for tying the visible deployment back to GitHub/Vercel.
  // Do not include secrets here; only expose public deployment metadata.
  app.get(["/__version", "/api/version"], (_req, res) => {
    res.json(getBuildFingerprint());
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // AI feature routes — all Gemini SDK usage is server-side only
  app.use("/api/ai", authMiddleware, aiRouter);
  
  // Trust & Safety Routes
  app.use("/api/safety", trustRoutes);
  app.use("/api/profile", trustRoutes);
  app.use("/api/account", trustRoutes);
  app.use("/api/support", trustRoutes);

  // Permissioned share-card Routes
  app.use("/api/share", shareRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
