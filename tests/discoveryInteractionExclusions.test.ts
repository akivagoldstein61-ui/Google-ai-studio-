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

  it('counts only successfully persisted discovery exposure impressions', () => {
    const server = readSource('server/discoveryRoutes.ts');

    expect(server).toContain('.then(() => true).catch(() => false)');
    expect(server).not.toContain('.catch(() => null);\n    return true;');
  });
});
