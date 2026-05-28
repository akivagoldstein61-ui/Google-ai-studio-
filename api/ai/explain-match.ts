import type { Request, Response } from 'express';
import handler from '../[...path].ts';

export default function route(request: Request, response: Response) {
  const url = typeof request.url === 'string' ? request.url : '';
  const queryStart = url.indexOf('?');
  const search = queryStart >= 0 ? url.slice(queryStart) : '';
  request.url = `/api/ai/explain-match${search}`;
  return handler(request, response);
}
