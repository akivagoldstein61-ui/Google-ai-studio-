/**
 * Vercel serverless catch-all for /api/*.
 *
 * Unknown API namespaces return a small JSON 404 before the full Express app is
 * imported. That keeps smoke checks deterministic even if a cold start would
 * otherwise need Firebase Admin or Gemini dependencies.
 */

import type { IncomingMessage, ServerResponse } from 'node:http';

type ExpressHandler = (req: IncomingMessage, res: ServerResponse) => void;

const SUPPORTED_API_NAMESPACES = new Set([
  'ai',
  'taste',
  'discovery',
  'safety',
  'profile',
  'account',
  'support',
  'share',
]);

let cached: Promise<ExpressHandler> | null = null;

function createApiNotFound(path: string) {
  return {
    status: 'not_found',
    source: 'vercel-api-function',
    service: 'kesher',
    path,
    message: 'API route not implemented in this prototype server.',
    timestamp: new Date().toISOString(),
  };
}

function sendJson(response: ServerResponse, statusCode: number, body: unknown) {
  response.statusCode = statusCode;
  response.setHeader('Cache-Control', 'no-store, max-age=0');
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(body));
}

function normalizeApiUrlInPlace(request: IncomingMessage) {
  const url = typeof request.url === 'string' ? request.url : '';
  if (url.startsWith('/api')) return;

  const requestWithQuery = request as IncomingMessage & { query?: Record<string, string | string[]> };
  const pathParam = requestWithQuery.query?.path;
  const path = Array.isArray(pathParam) ? pathParam.join('/') : pathParam;
  const queryStart = url.indexOf('?');
  const search = queryStart >= 0 ? url.slice(queryStart) : '';
  const cleanPath = typeof path === 'string' ? path.replace(/^\/+/, '') : '';
  const normalizedUrl = `/api/${cleanPath}${search}`;

  try {
    new URL(normalizedUrl, 'http://localhost');
    request.url = normalizedUrl;
  } catch {
    request.url = '/api';
  }
}

function getApiNamespace(url: string) {
  const pathname = new URL(url, 'http://localhost').pathname;
  const [, namespace] = pathname.replace(/^\/+/, '').split('/');
  return namespace;
}

async function getApp(): Promise<ExpressHandler> {
  if (cached) return cached;
  cached = import('../server.ts')
    .then(({ createApp }) => createApp())
    .then((app) => app as unknown as ExpressHandler);
  return cached;
}

export const config = {
  runtime: 'nodejs',
  maxDuration: 60,
};

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  normalizeApiUrlInPlace(req);

  const namespace = getApiNamespace(req.url ?? '/api');
  if (!namespace || !SUPPORTED_API_NAMESPACES.has(namespace)) {
    sendJson(res, 404, createApiNotFound(req.url ?? '/api'));
    return;
  }

  const app = await getApp();
  return app(req, res);
}
