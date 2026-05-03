import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { aiRouter, apiLimiter } from "./server/aiRoutes.ts";
import trustRoutes from "./server/trustRoutes.ts";
import shareRoutes from "./server/shareRoutes.ts";
import { authMiddleware } from "./server/auth.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust the first proxy (e.g., Cloud Run / Nginx)
  app.set('trust proxy', 1);

  app.use(express.json());

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // AI Routes — rate-limited and authenticated
  app.use("/api/ai", apiLimiter, authMiddleware, aiRouter);

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
