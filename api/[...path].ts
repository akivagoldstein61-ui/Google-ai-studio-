type VercelRequestLike = {
  url?: string | null;
};

type JsonResponse = {
  setHeader(name: string, value: string): void;
  status(code: number): { json(body: unknown): void };
};

export default function handler(request: VercelRequestLike, response: JsonResponse) {
  response.setHeader('Cache-Control', 'no-store, max-age=0');
  response.status(404).json({
    status: 'not_found',
    source: 'vercel-api-function',
    service: 'kesher',
    path: request?.url ?? null,
    message: 'This API route is not implemented as a Vercel Function in this prototype deployment.',
    timestamp: new Date().toISOString(),
  });
}
