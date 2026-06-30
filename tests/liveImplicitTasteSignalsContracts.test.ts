import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const readSource = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('Live implicit taste signal contracts', () => {
  it('exposes privacy-bounded taste signal capture through app context', () => {
    const source = readSource('src/context/AppContext.tsx');

    expect(source).toContain('recordTasteSignal: (name: EventName, profileId: string, options?: TasteSignalOptions) => void');
    expect(source).toContain('function eventClassForTasteSignal(name: EventName): EventClass');
    expect(source).toContain("case 'profile_open':");
    expect(source).toContain("case 'long_dwell':");
    expect(source).toContain("return 'high_signal_implicit';");
    expect(source).toContain('candidateFeatures: profileToFeatureTags(profile)');
    expect(source).toContain('discoveryService.recordTasteEvent(name, profile.uid ?? profileId, options)');
    expect(source).not.toMatch(/candidateFeatures:\s*profile[,}]/);
  });

  it('records real profile detail opens and dwell without capturing private content', () => {
    const source = readSource('src/components/discovery/ProfileDetail.tsx');

    expect(source).toContain('recordTasteSignal');
    expect(source).toContain("recordTasteSignal('profile_open', profileId, { surface: 'profile' })");
    expect(source).toContain("recordTasteSignal('long_dwell', profileId, { surface: 'profile', value: 8000 })");
    expect(source).toContain('window.setTimeout');
    expect(source).toContain('window.clearTimeout(dwellTimer)');
    expect(source).not.toContain("recordTasteSignal('profile_open', profile.bio");
    expect(source).not.toContain("recordTasteSignal('profile_open', profile.prompts");
    expect(source).not.toContain("recordTasteSignal('long_dwell', profile.bio");
    expect(source).not.toContain("recordTasteSignal('long_dwell', profile.prompts");
  });
});
