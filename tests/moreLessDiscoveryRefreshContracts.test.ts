import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const readSource = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('more and less taste refresh contracts', () => {
  it('live more/less taste updates refresh visible discovery pools after persisted taste writes', () => {
    const app = readSource('src/context/AppContext.tsx');
    const moreHandler = app.slice(app.indexOf('const moreLikeThis'), app.indexOf('const lessLikeThis'));
    const lessHandler = app.slice(app.indexOf('const lessLikeThis'), app.indexOf('const recordTasteSignal'));

    expect(moreHandler).toContain("await discoveryService.recordTasteEvent('more_like_this', profile.uid ?? profileId, {");
    expect(moreHandler).toContain('setTasteProfileState(persistedProfile)');
    expect(moreHandler).toContain('setTasteStateRaw(persistedTasteState)');
    expect(moreHandler).toContain('await refreshRemoteDiscovery()');
    expect(moreHandler.indexOf("await discoveryService.recordTasteEvent('more_like_this'")).toBeLessThan(moreHandler.indexOf('await refreshRemoteDiscovery()'));

    expect(lessHandler).toContain("await discoveryService.recordTasteEvent('less_like_this', profile.uid ?? profileId, {");
    expect(lessHandler).toContain('setTasteProfileState(persistedProfile)');
    expect(lessHandler).toContain('setTasteStateRaw(persistedTasteState)');
    expect(lessHandler).toContain('await refreshRemoteDiscovery()');
    expect(lessHandler.indexOf("await discoveryService.recordTasteEvent('less_like_this'")).toBeLessThan(lessHandler.indexOf('await refreshRemoteDiscovery()'));
  });
});
