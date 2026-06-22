import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

/**
 * Route-truth guard. Asserts the App.tsx route table maps each path to its
 * intended screen wrapper, so a refactor cannot silently drop, rename, or
 * re-point a route. Uses a source scan to match the repo's existing convention
 * (see skillsRegistry.test.ts) and to avoid pulling Firebase into a render.
 */
const appSource = readFileSync('src/App.tsx', 'utf8');

const routeLine = (path: string): string | undefined =>
  appSource.split('\n').find((line) => line.includes(`path="${path}"`));

// path -> component/element expected on the same <Route> line
const EXPECTED_ROUTES: Record<string, string> = {
  '/daily': 'DailyPicksRoute',
  '/explore': 'ExploreRoute',
  '/inbox': 'InboxRoute',
  '/skills': 'SkillsRoute',
  '/settings': 'SettingsRoute',
  '/profile/:profileId': 'ProfileDetailRoute',
  '/profile/edit': 'ProfileEditRoute',
  '/inbox/:conversationId': 'ChatThreadRoute',
  '/settings/safety': 'SafetyCenterRoute',
  '/settings/ai-trust': 'AITrustHubRoute',
  '/settings/taste-profile': 'TasteProfileRoute',
  '/settings/personality': 'PersonalityProfileRoute',
  '/settings/personality-visibility': 'PersonalityVisibilityRoute',
  '/admin/ai-ops': 'AIOpsRoute',
  '/admin/experiments': 'ExperimentsRoute',
};

describe('App route table', () => {
  it('maps every declared route to its intended screen', () => {
    for (const [path, element] of Object.entries(EXPECTED_ROUTES)) {
      const line = routeLine(path);
      expect(line, `missing route for ${path}`).toBeTruthy();
      expect(line, `route ${path} should render ${element}`).toContain(element);
    }
  });

  it('guards operator routes behind AdminGuard', () => {
    for (const path of ['/admin/ai-ops', '/admin/experiments']) {
      expect(routeLine(path)).toContain('<AdminGuard>');
    }
  });

  it('keeps the demo shortcut and the catch-all redirect', () => {
    expect(routeLine('/demo')).toContain('Navigate to="/daily?demo=1"');
    expect(appSource).toContain('path="*"');
    expect(appSource).toContain('Navigate to="/daily" replace');
  });
});
