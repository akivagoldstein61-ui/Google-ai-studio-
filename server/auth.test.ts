import test from 'node:test';
import assert from 'node:assert/strict';
import type { NextFunction, Response } from 'express';
import { createAuthMiddleware, type AuthenticatedRequest } from './auth.js';

function mockReq(headers: Record<string, string | undefined> = {}): AuthenticatedRequest {
  return {
    headers,
    header(name: string) {
      return headers[name.toLowerCase()];
    },
  } as unknown as AuthenticatedRequest;
}

function mockRes() {
  const state: { statusCode?: number; body?: unknown } = {};
  const res = {
    status(code: number) {
      state.statusCode = code;
      return this;
    },
    json(body: unknown) {
      state.body = body;
      return this;
    },
  } as unknown as Response;

  return { res, state };
}

async function runMiddleware(req: AuthenticatedRequest, nodeEnv: string, verifier?: (token: string) => Promise<any>) {
  process.env.NODE_ENV = nodeEnv;
  process.env.KESHER_ENABLE_MOCK_AUTH = 'true';
  const middleware = createAuthMiddleware(verifier || (async () => ({ uid: 'verified-user', source: 'firebase' })));
  const { res, state } = mockRes();
  let nextCalled = false;
  const next: NextFunction = () => {
    nextCalled = true;
  };

  await middleware(req, res, next);
  return { req, nextCalled, state };
}

test('accepts valid bearer token and sets firebase auth context', async () => {
  const req = mockReq({ authorization: 'Bearer token-1' });
  const result = await runMiddleware(req, 'production');

  assert.equal(result.nextCalled, true);
  assert.equal(result.req.auth?.uid, 'verified-user');
  assert.equal(result.req.auth?.source, 'firebase');
});

test('requires token in production', async () => {
  const req = mockReq();
  const result = await runMiddleware(req, 'production');

  assert.equal(result.nextCalled, false);
  assert.equal(result.state.statusCode, 401);
});

test('allows local dev mock auth fallback when token missing', async () => {
  const req = mockReq({ 'x-kesher-mock-auth': 'dev-uid' });
  const result = await runMiddleware(req, 'development');

  assert.equal(result.nextCalled, true);
  assert.equal(result.req.auth?.uid, 'dev-uid');
  assert.equal(result.req.auth?.source, 'mock');
});

test('rejects invalid bearer token even in local dev', async () => {
  const req = mockReq({ authorization: 'Bearer bad-token' });
  const result = await runMiddleware(
    req,
    'development',
    async () => {
      throw new Error('invalid token');
    }
  );

  assert.equal(result.nextCalled, false);
  assert.equal(result.state.statusCode, 401);
});
