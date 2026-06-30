import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const readSource = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('Live implicit taste signal contracts', () => {
  it('exposes privacy-bounded taste signal capture through app context', () => {
    const source = readSource('src/context/AppContext.tsx');
    const signalHandler = source.slice(source.indexOf('const recordTasteSignal'), source.indexOf('const resetTasteProfile'));

    expect(source).toContain('recordTasteSignal: (name: EventName, profileId: string, options?: TasteSignalOptions) => void');
    expect(source).toContain('function eventClassForTasteSignal(name: EventName): EventClass');
    expect(source).toContain("case 'profile_open':");
    expect(source).toContain("case 'long_dwell':");
    expect(source).toContain("return 'high_signal_implicit';");
    expect(signalHandler).toContain('const event: TasteEvent = {');
    expect(signalHandler).toContain('candidateFeatures: profileToFeatureTags(profile)');
    expect(signalHandler).toContain('discoveryService.recordTasteEvent(name, profile.uid ?? profileId, options)');
    expect(signalHandler).toContain('.then(() => {');
    expect(signalHandler).toContain('applyTasteEvent(user.uid, event, { persistRemote: false });');
    expect(signalHandler).toContain('return refreshRemoteDiscovery();');
    expect(signalHandler.indexOf('discoveryService.recordTasteEvent')).toBeLessThan(signalHandler.indexOf('applyTasteEvent(user.uid, event, { persistRemote: false })'));
    expect(signalHandler.indexOf('applyTasteEvent(user.uid, event, { persistRemote: false })')).toBeLessThan(signalHandler.indexOf('return refreshRemoteDiscovery();'));
    expect(signalHandler).not.toContain('discoveryService.recordTasteEvent(name, profile.uid ?? profileId, options).catch(() => null)');
    expect(source).not.toMatch(/candidateFeatures:\s*profile[,}]/);
  });

  it('requires durable taste event persistence before live implicit state advances', () => {
    const service = readSource('src/services/discoveryService.ts');
    const server = readSource('server/tasteRoutes.ts');

    expect(service).toContain("if (result?.persisted !== true)");
    expect(service).toContain("throw new Error('Taste event was not persisted')");
    expect(server).toContain("res.status(503).json({ error: 'Taste event persistence unavailable', persisted: false })");
    expect(server).toContain("res.status(500).json({ error: 'Taste event candidate profile was not loaded', candidateId, persisted: false })");
    expect(server).toContain('const batch = db.batch();');
    expect(server).toContain("batch.set(userPrivate.doc('taste_events').collection('events').doc(), {");
    expect(server).toContain('const serializedTasteState = serializeTasteState(nextState);');
    expect(server).toContain("batch.set(userPrivate.doc('taste_state'), serializedTasteState, { merge: false });");
    expect(server).toContain('const persisted = await batch.commit().then(() => true).catch(() => false);');
    expect(server).toContain("res.status(500).json({ error: 'Taste event was not persisted', persisted: false })");
    expect(server).toContain('persisted: true');
    expect(server).toContain('tasteState: serializedTasteState');
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
