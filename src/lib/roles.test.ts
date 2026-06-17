import { describe, expect, it } from 'vitest';
import { canViewAdminSurface, isAdminUser } from './roles';

describe('isAdminUser', () => {
  it('returns true only for an explicit admin role', () => {
    expect(isAdminUser({ role: 'admin' })).toBe(true);
  });

  it('is fail-closed for non-admin, missing, or absent users', () => {
    expect(isAdminUser({ role: 'member' })).toBe(false);
    expect(isAdminUser({ role: '' })).toBe(false);
    expect(isAdminUser({ role: undefined })).toBe(false);
    expect(isAdminUser(null)).toBe(false);
    expect(isAdminUser(undefined)).toBe(false);
  });
});

describe('canViewAdminSurface', () => {
  it('always allows admins, regardless of demo mode', () => {
    expect(canViewAdminSurface({ role: 'admin' }, false)).toBe(true);
    expect(canViewAdminSurface({ role: 'admin' }, true)).toBe(true);
  });

  it('allows demo mode to preview admin surfaces without an admin role', () => {
    expect(canViewAdminSurface({ role: 'member' }, true)).toBe(true);
    expect(canViewAdminSurface(null, true)).toBe(true);
  });

  it('blocks non-admin members in real (non-demo) sessions', () => {
    expect(canViewAdminSurface({ role: 'member' }, false)).toBe(false);
    expect(canViewAdminSurface(null, false)).toBe(false);
    expect(canViewAdminSurface(undefined, false)).toBe(false);
  });
});
