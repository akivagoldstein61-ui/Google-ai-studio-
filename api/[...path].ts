/**
 * Vercel serverless catch-all that exposes the full Express app at /api/*.
 *
 * Why a catch-all instead of one file per route? The existing Express routers
 * (server/aiRoutes, server/trustRoutes, server/shareRoutes) already share
 * middleware (auth, rate limit, Firebase Admin init, request shape). Splitting
 * each route into its own Vercel function file would duplicate that middleware
 * three ways. A single catch-all is simpler and keeps `npm run dev` (which
 * boots the same Express app via `tsx server.ts`) behaviour identical to
 * production.
 *
 * The app instance is cached across warm invocations to avoid re-initializing
 * Firebase Admin and the Gemini client on every request.
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import { createApp } from "../server.ts";

type ExpressHandler = (req: IncomingMessage, res: ServerResponse) => void;

let cached: Promise<ExpressHandler> | null = null;

function getApp(): Promise<ExpressHandler> {
  if (cached) return cached;
  cached = createApp().then((app) => app as unknown as ExpressHandler);
  return cached;
}

// Eagerly warm the cache at cold start so the first request doesn't pay the
// Firebase Admin init cost on top of network latency.
void getApp();

// Vercel function config — see vercel.json for the matching `functions` block.
// `runtime: "nodejs"` is required because firebase-admin and @google/genai are
// Node-only (no edge runtime support).
export const config = {
  runtime: "nodejs",
  maxDuration: 60,
};

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  const app = await getApp();
  return app(req, res);
}
