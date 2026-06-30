import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const readSource = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('taste-driven discovery refresh contracts', () => {
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

  it('all live taste controls refresh discovery after persisted ranking state changes', () => {
    const app = readSource('src/context/AppContext.tsx');
    const setTasteProfileHandler = app.slice(app.indexOf('const setTasteProfile'), app.indexOf('const findKnownProfile'));
    const likeHandler = app.slice(app.indexOf('const likeProfile'), app.indexOf('const passProfile'));
    const passHandler = app.slice(app.indexOf('const passProfile'), app.indexOf('const moreLikeThis'));
    const pauseHandler = app.slice(app.indexOf('const pauseTasteLearning'), app.indexOf('const optOutTasteLearning'));
    const optOutHandler = app.slice(app.indexOf('const optOutTasteLearning'), app.indexOf('const exportTasteProfile'));

    expect(setTasteProfileHandler).toContain('const result = await discoveryService.saveTasteProfile(normalized);');
    expect(setTasteProfileHandler).toContain('setTasteStateRaw(persistedTasteState);');
    expect(setTasteProfileHandler).toContain('await refreshRemoteDiscovery()');
    expect(setTasteProfileHandler.indexOf('setTasteStateRaw(persistedTasteState);')).toBeLessThan(setTasteProfileHandler.indexOf('await refreshRemoteDiscovery()'));

    expect(likeHandler).toContain('const result = await discoveryService.likeProfile(profile.uid ?? profileId);');
    expect(likeHandler).toContain('result?.persisted !== true || result?.tastePersisted !== true');
    expect(likeHandler).toContain('await refreshRemoteDiscovery()');
    expect(likeHandler.indexOf('const result = await discoveryService.likeProfile')).toBeLessThan(likeHandler.indexOf('await refreshRemoteDiscovery()'));

    expect(passHandler).toContain('const result = await discoveryService.passProfile(profile.uid ?? profileId);');
    expect(passHandler).toContain('result?.persisted !== true || result?.tastePersisted !== true');
    expect(passHandler).toContain('await refreshRemoteDiscovery()');
    expect(passHandler.indexOf('const result = await discoveryService.passProfile')).toBeLessThan(passHandler.indexOf('await refreshRemoteDiscovery()'));

    expect(pauseHandler).toContain("await discoveryService.recordTasteEvent(paused ? 'taste_pause' : 'taste_consent_granted', undefined");
    expect(pauseHandler).toContain('setTasteStateRaw(updatedTasteState);');
    expect(pauseHandler).toContain('await refreshRemoteDiscovery()');
    expect(pauseHandler.indexOf('setTasteStateRaw(updatedTasteState);')).toBeLessThan(pauseHandler.indexOf('await refreshRemoteDiscovery()'));

    expect(optOutHandler).toContain("await discoveryService.recordTasteEvent('taste_pause', undefined, { paused: true, optedOut: true });");
    expect(optOutHandler).toContain('setTasteStateRaw(optedOutTasteState);');
    expect(optOutHandler).toContain('await refreshRemoteDiscovery()');
    expect(optOutHandler.indexOf('setTasteStateRaw(optedOutTasteState);')).toBeLessThan(optOutHandler.indexOf('await refreshRemoteDiscovery()'));
  });

  it('local taste profile and consent controls rerank local discovery immediately', () => {
    const app = readSource('src/context/AppContext.tsx');
    const setTasteProfileHandler = app.slice(app.indexOf('const setTasteProfile'), app.indexOf('const findKnownProfile'));
    const pauseHandler = app.slice(app.indexOf('const pauseTasteLearning'), app.indexOf('const optOutTasteLearning'));
    const optOutHandler = app.slice(app.indexOf('const optOutTasteLearning'), app.indexOf('const exportTasteProfile'));

    expect(setTasteProfileHandler).toContain('refreshLocalDiscovery(preferences, nextTasteState)');
    expect(pauseHandler).toContain('refreshLocalDiscovery(preferences, updatedTasteState)');
    expect(optOutHandler).toContain('refreshLocalDiscovery(preferences, optedOutTasteState)');
  });
});
