import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const readSource = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('Discovery preference persistence contracts', () => {
  it('rejects remote save failures so filter drawers can keep unsaved edits visible', () => {
    const source = readSource('src/context/AppContext.tsx');

    expect(source).toContain('setPreferences: (prefs: DiscoveryPreferences) => Promise<void>;');
    expect(source).toContain('const previousPreferences = preferences;');
    expect(source).toContain('const response = await discoveryService.saveDiscoveryPreferences(normalized);');
    expect(source).toContain('setPreferencesState(previousPreferences);');
    expect(source).toContain('throw error;');
    expect(source).not.toContain("console.error('Error saving preferences:', error);\n    }");
  });

  it('rejects discovery preference API responses that report persisted false', () => {
    const source = readSource('src/services/discoveryService.ts');

    expect(source).toContain('async saveDiscoveryPreferences(preferences: DiscoveryPreferences)');
    expect(source).toContain("const result = await apiFetch('/api/discovery/preferences'");
    expect(source).toContain('result?.persisted !== true');
    expect(source).toContain("throw new Error('Discovery preferences were not persisted')");
    expect(source).toContain('return result;');
  });
});
