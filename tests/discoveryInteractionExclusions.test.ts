import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const readSource = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('discovery interaction exclusion contracts', () => {
  it('removes previously acted-on profiles from discovery pools before ranking', () => {
    const server = readSource('server/discoveryRoutes.ts');

    expect(server).toContain('loadInteractionExclusions(viewerUid)');
    expect(server).toContain('normalizeInteractionExclusions');
    expect(server).toContain('excludesInteractedCandidate(profile, interactionExclusions)');
    expect(server).toContain('interactionExclusionsApplied');
    expect(server).toContain('likedUserIds');
    expect(server).toContain('passedUserIds');
    expect(server).toContain('matchedUserIds');
    expect(server).toContain('hiddenUserIds');
    expect(server).toContain('dismissedUserIds');
    expect(server).toContain('input.likes');
    expect(server).toContain('input.passes');
    expect(server).toContain('input.matches');
    expect(server).toContain('input.hidden');
    expect(server).toContain('input.dismissed');
  });

  it('still loads an acted-on candidate when recording the like or pass event itself', () => {
    const server = readSource('server/discoveryRoutes.ts');

    expect(server).toContain('type CandidatePoolOptions');
    expect(server).toContain('includeInteracted?: boolean');
    expect(server).toContain('loadCandidatePool(viewerUid, { includeInteracted: true })');
    expect(server).toContain('options.includeInteracted');
    expect(server).toContain('Promise.resolve(emptyInteractionExclusionState())');
  });

  it('fails like and pass requests when durable interaction persistence is unavailable or rejected', () => {
    const server = readSource('server/discoveryRoutes.ts');

    expect(server).toContain("res.status(503).json({ error: 'Discovery interaction persistence unavailable', persisted: false })");
    expect(server).toContain('const interactionPersisted = await db');
    expect(server).toContain("res.status(500).json({ error: 'Like was not persisted', profileId, persisted: false })");
    expect(server).toContain("res.status(500).json({ error: 'Pass was not persisted', profileId, persisted: false })");
    expect(server).toContain('res.json({ success: true, isMatch, match, persisted: true, tastePersisted })');
    expect(server).toContain('res.json({ success: true, profileId, persisted: true, tastePersisted })');
    expect(server).not.toContain('.doc(\'interactions\')\n    .set({\n      likes: FieldValue.arrayUnion(profileId),\n      updatedAt: FieldValue.serverTimestamp(),\n    }, { merge: true })\n    .catch(() => null);');
  });

  it('fails reciprocal match creation unless both match records are persisted', () => {
    const server = readSource('server/discoveryRoutes.ts');

    expect(server).toContain("res.status(500).json({ error: 'Could not verify reciprocal like', profileId, persisted: false })");
    expect(server).toContain("const matchPersisted = await db.collection('matches')");
    expect(server).toContain("const conversationPersisted = await db.collection('conversations')");
    expect(server).toContain("res.status(500).json({ error: 'Match was not persisted', profileId, persisted: false })");
  });

  it('reports explicit taste persistence failures back to discovery actions', () => {
    const server = readSource('server/discoveryRoutes.ts');

    expect(server).toContain('): Promise<boolean>');
    expect(server).toContain("tastePersisted = await persistDiscoveryTasteState(viewerUid, 'like', candidate)");
    expect(server).toContain("tastePersisted = await persistDiscoveryTasteState(viewerUid, 'pass', candidate)");
    expect(server).toContain("res.status(500).json({ error: 'Like taste state was not persisted', profileId, persisted: false })");
    expect(server).toContain("res.status(500).json({ error: 'Pass taste state was not persisted', profileId, persisted: false })");
    expect(server).toContain('.then(() => true)\n    .catch(() => false);');
    expect(server).not.toContain("await persistDiscoveryTasteState(viewerUid, 'like', candidate);\n    }");
    expect(server).not.toContain("await persistDiscoveryTasteState(viewerUid, 'pass', candidate);\n    }");
  });

  it('counts only successfully persisted discovery exposure impressions', () => {
    const server = readSource('server/discoveryRoutes.ts');

    expect(server).toContain('.then(() => true).catch(() => false)');
    expect(server).not.toContain('.catch(() => null);\n    return true;');
  });
});
