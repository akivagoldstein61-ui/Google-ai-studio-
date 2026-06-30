import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const readSource = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('discovery preference API contracts', () => {
  it('exposes canonical get and save routes under the discovery API', () => {
    const server = readSource('server/discoveryRoutes.ts');
    const app = readSource('server.ts');

    expect(app).toContain('app.use("/api/discovery", discoveryRoutes)');
    expect(server).toContain("router.get('/preferences'");
    expect(server).toContain("router.post('/preferences'");
    expect(server).toContain('normalizePreferences(req.body?.preferences ?? req.body)');
    expect(server).toContain("doc('discovery_preferences')");
    expect(server).toContain('updatedAt: FieldValue.serverTimestamp()');
    expect(server).toContain('preferences: nextPreferences');
  });

  it('routes client hydration and saves through the canonical API service', () => {
    const service = readSource('src/services/discoveryService.ts');
    const appContext = readSource('src/context/AppContext.tsx');

    expect(service).toContain("getDiscoveryPreferences()");
    expect(service).toContain("apiFetch('/api/discovery/preferences')");
    expect(service).toContain('saveDiscoveryPreferences(preferences: DiscoveryPreferences)');
    expect(service).toContain("apiFetch('/api/discovery/preferences', {");
    expect(appContext).toContain('discoveryService.getDiscoveryPreferences()');
    expect(appContext).toContain('discoveryService.saveDiscoveryPreferences(normalized)');
    expect(appContext).toContain('normalizeDiscoveryPreferences(response?.preferences ?? normalized)');
    expect(appContext).not.toContain('private/discovery_preferences`), normalized');
  });
});
