import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

/**
 * Source-scan guard (matches the repo's existing convention of asserting wiring
 * by reading component source, e.g. skillsRegistry.test.ts). Prevents regression
 * of the fix where /admin/* screens were reachable by any signed-in member.
 */
describe('operator surface route guarding', () => {
  const appSource = readFileSync('src/App.tsx', 'utf8');
  const guardSource = readFileSync('src/components/auth/AdminGuard.tsx', 'utf8');

  it('wraps every /admin/* route element in AdminGuard', () => {
    const adminRoutes = appSource
      .split('\n')
      .filter((line) => line.includes('path="/admin/'));

    expect(adminRoutes.length).toBeGreaterThanOrEqual(2);
    for (const line of adminRoutes) {
      expect(line).toContain('<AdminGuard>');
    }
  });

  it('decides access through the fail-closed canViewAdminSurface helper', () => {
    expect(guardSource).toContain('canViewAdminSurface');
    expect(guardSource).toContain('Navigate to="/daily"');
  });
});
