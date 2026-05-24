import type { Request, Response } from 'express';
import rootHandler from './[...path].ts';

export function forwardToApiPath(apiPath: string) {
  return function handler(request: Request, response: Response) {
    const url = typeof request.url === 'string' ? request.url : '';
    const queryStart = url.indexOf('?');
    const search = queryStart >= 0 ? url.slice(queryStart) : '';
    request.url = `${apiPath}${search}`;
    return rootHandler(request, response);
  };
}

export function forwardOriginalApiRequest(request: Request, response: Response) {
  return rootHandler(request, response);
}

export default function helperRoute(_request: Request, response: Response) {
  response.setHeader('Cache-Control', 'no-store, max-age=0');
  response.status(404).json({
    status: 'not_found',
    source: 'vercel-api-function',
    service: 'kesher',
    path: '/api/_forward',
    message: 'Internal API forwarding helper is not a public endpoint.',
    timestamp: new Date().toISOString(),
  });
}
