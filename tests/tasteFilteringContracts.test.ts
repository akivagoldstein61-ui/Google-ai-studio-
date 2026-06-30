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

describe('canonical filtering preference contracts', () => {
  it('similar_age is a saved preference weight and reaches both ranking paths', () => {
    const types = readSource('src/types.ts');
    const grammar = readSource('src/lib/filteringGrammar.ts');
    const integratedRanking = readSource('src/lib/integratedRanking.ts');
    const serverDefaults = readSource('server/discoveryRoutes.ts');
    const appDefaults = readSource('src/context/AppContext.tsx');

    expect(types).toContain('similar_age?: number');
    expect(grammar).toContain('similar_age: preferences.softPreferenceWeights?.similar_age');
    expect(integratedRanking).toContain('similar_age: preferences.softPreferenceWeights?.similar_age');
    expect(serverDefaults).toContain("softPreferences: ['shared_interests', 'same_city', 'similar_age']");
    expect(appDefaults).toContain("softPreferences: ['shared_interests', 'same_city', 'similar_age']");
    expect(appDefaults).toContain('similar_age: 0.35');
  });

  it('saved preferences refresh visible discovery pools instead of only persisting settings', () => {
    const source = readSource('src/context/AppContext.tsx');

    expect(source).toContain('selectDailyPicks');
    expect(source).toContain('selectExploreProfiles');
    expect(source).toContain('rankLocalDiscovery');
    expect(source).toContain('refreshLocalDiscovery(normalized)');
    expect(source).toContain('await refreshRemoteDiscovery()');
    expect(source).toContain('setDailyPicks(ranked.daily)');
    expect(source).toContain('setExploreProfiles(ranked.explore)');
  });

  it('filtering skill persists canonical controls and shows pool impact before saving', () => {
    const source = readSource('src/features/skills/FilteringMarketplaceSkill.tsx');

    expect(source).toContain('data-testid="pool-impact-preview"');
    expect(source).toContain('setPreferences(next)');
    expect(source).toContain("id: 'similar_age'");
    expect(source).toContain("hardFilterId: 'verified'");
    expect(source).toContain("current_pool: poolImpact.tier");
  });

  it('Explore drawer uses canonical preference ids instead of arbitrary interest tags', () => {
    const source = readSource('src/features/discovery/ExploreScreen.tsx');

    expect(source).toContain("id: 'shared_interests'");
    expect(source).toContain("id: 'same_city'");
    expect(source).toContain("id: 'similar_observance'");
    expect(source).toContain("id: 'similar_age'");
    expect(source).toContain("id: 'open_exploration'");
    expect(source).not.toContain("'Urban'");
    expect(source).not.toContain("'Tech-focused'");
    expect(source).toContain('hardFilters: Array.from(hardFilters)');
  });
});

describe('private taste skill contracts', () => {
  it('taste learning is off by default until consent and resumes via taste_consent_granted', () => {
    const app = readSource('src/context/AppContext.tsx');

    expect(app).toContain('paused: true');
    expect(app).toContain('emptyTasteStateForProfile');
    expect(app).toContain("recordTasteEvent(paused ? 'taste_pause' : 'taste_consent_granted')");
  });

  it('Private Taste skill persists consent and rebuilt taste profile instead of using local-only state', () => {
    const source = readSource('src/features/skills/PrivateTasteSkill.tsx');

    expect(source).toContain('pauseTasteLearning(false)');
    expect(source).toContain('pauseTasteLearning(true)');
    expect(source).toContain('setTasteProfile(mergedProfile)');
    expect(source).toContain('mergeManualControls');
    expect(source).toContain('Current Owner Profile');
    expect(source).not.toContain('SAMPLE_TASTE_PROFILE');
  });

  it('Learned Taste skill recompute persists owner summaries', () => {
    const source = readSource('src/features/skills/LearnedTasteSkill.tsx');

    expect(source).toContain('setTasteProfile(persisted)');
    expect(source).toContain('Recompute and save');
    expect(source).toContain('learningPaused');
    expect(source).toContain('mergeManualControls');
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
