export default function handler(request: any, response: any) {
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
