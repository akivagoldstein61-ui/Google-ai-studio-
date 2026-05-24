import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createAuthMiddleware } from './authMiddleware.ts';

const ORIGINAL_ENV = process.env;

function makeResponse() {
  const res = {
    statusCode: 200,
    body: undefined as unknown,
    status: vi.fn((code: number) => {
      res.statusCode = code;
      return res;
    }),
    json: vi.fn((body: unknown) => {
      res.body = body;
      return res;
    }),
  };

  return res;
}

describe('authMiddleware', () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.AI_ROUTE_AUTH_MODE;
    delete process.env.KESHER_ENABLE_MOCK_AUTH;
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it('verifies a valid bearer token and attaches auth context', async () => {
    process.env.NODE_ENV = 'production';
    const verifyIdToken = vi.fn().mockResolvedValue({ uid: 'user-123', email_verified: true });
    const middleware = createAuthMiddleware(verifyIdToken);
    const req: any = { headers: { authorization: 'Bearer valid-token' } };
    const res = makeResponse() as any;
    const next = vi.fn();

    await middleware(req, res, next);

    expect(verifyIdToken).toHaveBeenCalledWith('valid-token');
    expect(req.uid).toBe('user-123');
    expect(req.user.uid).toBe('user-123');
    expect(req.authContext).toEqual({ uid: 'user-123', mode: 'firebase' });
    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('requires auth in production when no bearer token is provided', async () => {
    process.env.NODE_ENV = 'production';
    const verifyIdToken = vi.fn();
    const middleware = createAuthMiddleware(verifyIdToken);
    const req: any = { headers: {} };
    const res = makeResponse() as any;
    const next = vi.fn();

    await middleware(req, res, next);

    expect(verifyIdToken).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.body).toEqual({ error: 'Authentication required' });
  });

  it('allows local mock auth in non-production prototype mode', async () => {
    process.env.NODE_ENV = 'development';
    const verifyIdToken = vi.fn();
    const middleware = createAuthMiddleware(verifyIdToken);
    const req: any = { headers: {} };
    const res = makeResponse() as any;
    const next = vi.fn();

    await middleware(req, res, next);

    expect(verifyIdToken).not.toHaveBeenCalled();
    expect(req.uid).toBe('local-dev-user');
    expect(req.authContext).toEqual({ uid: 'local-dev-user', mode: 'local-dev-mock' });
    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('does not allow local mock auth when strict mode is enabled', async () => {
    process.env.NODE_ENV = 'development';
    process.env.AI_ROUTE_AUTH_MODE = 'strict';
    const middleware = createAuthMiddleware(vi.fn());
    const req: any = { headers: {} };
    const res = makeResponse() as any;
    const next = vi.fn();

    await middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.body).toEqual({ error: 'Authentication required' });
  });

  it('rejects an invalid bearer token even when local mock auth is enabled', async () => {
    process.env.NODE_ENV = 'development';
    const verifyIdToken = vi.fn().mockRejectedValue(new Error('bad token'));
    const middleware = createAuthMiddleware(verifyIdToken);
    const req: any = { headers: { authorization: 'Bearer invalid-token' } };
    const res = makeResponse() as any;
    const next = vi.fn();

    await middleware(req, res, next);

    expect(verifyIdToken).toHaveBeenCalledWith('invalid-token');
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.body).toEqual({ error: 'Invalid token' });
  });
});
