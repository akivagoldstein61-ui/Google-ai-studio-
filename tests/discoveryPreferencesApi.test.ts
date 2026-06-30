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

  it('sanitizes malformed preference payloads before ranking can consume them', () => {
    const server = readSource('server/discoveryRoutes.ts');

    expect(server).toContain('const VALID_GENDERS');
    expect(server).toContain('const VALID_OBSERVANCE');
    expect(server).toContain('const VALID_INTENTS');
    expect(server).toContain('const VALID_RECOMMENDATION_MODES');
    expect(server).toContain('const VALID_HARD_FILTERS');
    expect(server).toContain('const VALID_SOFT_PREFERENCES');
    expect(server).toContain('normalizeStringList(input.genderPreference');
    expect(server).toContain('normalizeAgeRange(input.ageRange)');
    expect(server).toContain('normalizeNumber(input.maxDistance, 0, MAX_DISTANCE_KM');
    expect(server).toContain('normalizeSoftPreferenceWeights(input.softPreferenceWeights)');
    expect(server).toContain('normalizePoolImpact(input.poolImpact)');
    expect(server).not.toContain('...DEFAULT_DISCOVERY_PREFERENCES,\n    ...input,');
  });

  it('fails preference saves when durable persistence is unavailable or rejected', () => {
    const server = readSource('server/discoveryRoutes.ts');

    expect(server).toContain("res.setHeader('Cache-Control', 'no-store, max-age=0');\n\n  if (!db) {");
    expect(server).toContain('res.status(503).json({');
    expect(server).toContain("error: 'Discovery preference persistence unavailable'");
    expect(server).toContain('const batch = db.batch();');
    expect(server).toContain("batch.set(userPrivate.doc('discovery_preferences'), {");
    expect(server).toContain("batch.set(userPrivate.doc('taste_events').collection('events').doc(), {");
    expect(server).toContain('const persisted = await batch.commit()');
    expect(server).toContain('.then(() => true)');
    expect(server).toContain('.catch(() => false)');
    expect(server).toContain('if (!persisted) {');
    expect(server).toContain('res.status(500).json({');
    expect(server).toContain("error: 'Discovery preferences were not persisted'");
    expect(server).toContain('persisted: true,');
    expect(server).not.toContain('persisted: Boolean(db)');
    expect(server).not.toContain('let persisted = false');
  });
});
