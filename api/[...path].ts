import express from 'express';
import { aiRouter } from '../server/aiRoutes.ts';
import { authMiddleware } from '../server/authMiddleware.ts';
import trustRoutes from '../server/trustRoutes.ts';
import shareRoutes from '../server/shareRoutes.ts';
import type { ApiRequest, JsonResponse } from '../server/vercelFunctionTypes.ts';

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

function normalizeApiUrl(request: ApiRequest) {
  const url = typeof request.url === 'string' ? request.url : '';
  if (url.startsWith('/api')) return;

  const pathParam = request.query?.path;
  const path = Array.isArray(pathParam) ? pathParam.join('/') : pathParam;
  const queryStart = url.indexOf('?');
  const search = queryStart >= 0 ? url.slice(queryStart) : '';
  request.url = `/api/${path || ''}${search}`;
}

export default function handler(request: ApiRequest, response: JsonResponse) {
  normalizeApiUrl(request);
  return app(request as any, response as any);
}
