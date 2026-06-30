import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { applyEvent, emptyTasteState, implicitAffinity } from '../src/lib/learnedTaste';
import { profileToFeatureTags, serializeTasteState } from '../src/lib/tastePersistence';
import type { Profile } from '../src/types';

const readSource = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('taste and filtering server contracts', () => {
  it('/api/taste/events applies the canonical learned-taste state and persists it', () => {
    const source = readSource('server/tasteRoutes.ts');

    expect(source).toContain('applyEvent');
    expect(source).toContain('deserializeTasteState');
    expect(source).toContain('serializeTasteState(nextState)');
    expect(source).toContain('profileToFeatureTags(candidate)');
    expect(source).toContain('EVENT_CLASS_BY_NAME');
    expect(source).toContain('candidateFeaturesCaptured');
  });

  it('client discovery actions are marked to avoid double weighting after taste event recording', () => {
    const source = readSource('src/services/discoveryService.ts');

    expect(source).toContain("body: JSON.stringify({ profileId, tasteEventAlreadyRecorded: true })");
  });

  it('direct discovery API calls still update learned taste when no client marker is present', () => {
    const source = readSource('server/discoveryRoutes.ts');

    expect(source).toContain("req.body?.tasteEventAlreadyRecorded !== true");
    expect(source).toContain("persistDiscoveryTasteState(viewerUid, 'like', candidate)");
    expect(source).toContain("persistDiscoveryTasteState(viewerUid, 'pass', candidate)");
    expect(source).toContain('serializeTasteState(next)');
  });
});

describe('canonical learned-taste behavior', () => {
  const candidate: Pick<Profile, 'tags' | 'observance' | 'intent'> = {
    tags: ['Traditional', 'Hiking'],
    observance: 'traditional',
    intent: 'serious_relationship',
  };

  it('explicit positive and negative events move affinity in opposite directions', () => {
    const tags = profileToFeatureTags(candidate);
    const liked = applyEvent(emptyTasteState(1_000), {
      name: 'more_like_this',
      class: 'explicit_preference',
      candidateFeatures: tags,
      occurredAt: 2_000,
    });
    const passed = applyEvent(emptyTasteState(1_000), {
      name: 'less_like_this',
      class: 'explicit_preference',
      candidateFeatures: tags,
      occurredAt: 2_000,
    });

    expect(implicitAffinity(liked, tags)).toBeGreaterThan(0);
    expect(implicitAffinity(passed, tags)).toBeLessThan(0);
  });

  it('pause blocks subsequent event learning without clearing state export shape', () => {
    const tags = profileToFeatureTags(candidate);
    const paused = applyEvent(emptyTasteState(1_000), {
      name: 'taste_pause',
      class: 'policy_consent',
      occurredAt: 2_000,
    });
    const afterLike = applyEvent(paused, {
      name: 'like',
      class: 'explicit_preference',
      candidateFeatures: tags,
      occurredAt: 3_000,
    });

    expect(implicitAffinity(afterLike, tags)).toBe(0);
    expect(serializeTasteState(afterLike)).toMatchObject({
      fast: {},
      slow: {},
      learningPaused: true,
    });
  });
});
