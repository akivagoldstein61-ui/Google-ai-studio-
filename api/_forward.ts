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
