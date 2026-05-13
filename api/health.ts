type JsonResponse = {
  setHeader(name: string, value: string): void;
  status(code: number): { json(body: unknown): void };
};

export default function handler(_request: unknown, response: JsonResponse) {
  response.setHeader('Cache-Control', 'no-store, max-age=0');
  response.status(200).json({
    status: 'ok',
    source: 'vercel-api-function',
    service: 'kesher',
    timestamp: new Date().toISOString(),
  });
}
