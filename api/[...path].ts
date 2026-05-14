import express from 'express';
import type { Request, Response } from 'express';
import { aiRouter } from '../server/aiRoutes.ts';
import { authMiddleware } from '../server/authMiddleware.ts';
import trustRoutes from '../server/trustRoutes.ts';
import shareRoutes from '../server/shareRoutes.ts';

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.json({
    status: 'ok',
    source: 'vercel-api-function',
    service: 'kesher',
    timestamp: new Date().toISOString(),
  });
});

// Existing server routers, mounted without starting a long-running listener.
app.use('/api/ai', authMiddleware, aiRouter);
app.use('/api/safety', trustRoutes);
app.use('/api/profile', trustRoutes);
app.use('/api/account', trustRoutes);
app.use('/api/support', trustRoutes);
app.use('/api/share', shareRoutes);

app.use('/api', (req, res) => {
  res.status(404).json({
    status: 'not_found',
    source: 'vercel-api-function',
    service: 'kesher',
    path: req.originalUrl,
    message: 'This API route is not implemented as a Vercel Function in this prototype deployment.',
    timestamp: new Date().toISOString(),
  });
});

function normalizeApiUrl(request: Request) {
  const url = typeof request.url === 'string' ? request.url : '';
  // Direct Vercel Function requests already arrive under /api and can be
  // handed to the Express routers without reconstructing the path.
  if (url.startsWith('/api')) return;

  const pathParam = request.query?.path;
  const path = Array.isArray(pathParam) ? pathParam.join('/') : pathParam;
  const queryStart = url.indexOf('?');
  const search = queryStart >= 0 ? url.slice(queryStart) : '';
  const cleanPath = typeof path === 'string' ? path.replace(/^\/+/, '') : '';
  const normalizedUrl = `/api/${cleanPath}${search}`;
  try {
    new URL(normalizedUrl, 'http://localhost');
  } catch {
    request.url = '/api';
    return;
  }
  request.url = normalizedUrl;
}

export default function handler(request: Request, response: Response) {
  normalizeApiUrl(request);
  return app(request, response);
}
