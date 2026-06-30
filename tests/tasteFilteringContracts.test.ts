import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { emptySystemExclusionState, violatesSystemExclusions } from '../src/lib/filteringGrammar';
import { applyEvent, emptyTasteState, implicitAffinity } from '../src/lib/learnedTaste';
import { estimateDistanceKm, selectDailyPicks, selectExploreProfiles } from '../src/lib/integratedRanking';
import { profileToFeatureTags, serializeTasteState } from '../src/lib/tastePersistence';
import type { DiscoveryPreferences, Profile } from '../src/types';

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

  it('server discovery loads reciprocal candidate contexts instead of ranking against empty candidate state', () => {
    const server = readSource('server/discoveryRoutes.ts');
    const ranking = readSource('src/lib/integratedRanking.ts');

    expect(server).toContain('loadCandidateRankingContexts(candidates)');
    expect(server).toContain('candidateContexts,');
    expect(server).toContain('loadOptionalPreferences(uid)');
    expect(server).toContain('loadOptionalTasteState(uid)');
    expect(server).toContain('reciprocalPreferencesUsed');
    expect(ranking).toContain('export interface CandidateRankingContext');
    expect(ranking).toContain('candidateContexts?: Record<string, CandidateRankingContext>');
    expect(ranking).toContain('candidatePreferences ? hardCtxFromPreferences(candidatePreferences');
    expect(ranking).not.toContain('candidateHardCtx: {},\n        candidateSoftWeights: {},');
  });

  it('server discovery loads candidate exposure fairness rather than using one fixed multiplier state', () => {
    const server = readSource('server/discoveryRoutes.ts');
    const ranking = readSource('src/lib/integratedRanking.ts');

    expect(server).toContain('loadOptionalFairnessState(uid)');
    expect(server).toContain("doc('discovery_exposure')");
    expect(server).toContain('exposureFairnessUsed');
    expect(server).toContain('context.fairness');
    expect(ranking).toContain('fairness?: FairnessState');
    expect(ranking).toContain('fairness: candidateContext?.fairness ?? neutralFairnessState(candidate)');
    expect(ranking).not.toContain('candidateAccountAgeMs: 14 * 24 * 60 * 60 * 1000,\n          impressionsLast7d: 10,\n          impressionsLast24h: 1');
  });

  it('server discovery records served impressions into rolling exposure counters', () => {
    const server = readSource('server/discoveryRoutes.ts');
    const recordCalls = server.match(/recordDiscoveryImpressions\(items\)/g) ?? [];

    expect(recordCalls).toHaveLength(2);
    expect(server).toContain('async function recordDiscoveryImpressions');
    expect(server).toContain('recentImpressionMs');
    expect(server).toContain('impressionsLast24h');
    expect(server).toContain('impressionsLast7d');
    expect(server).toContain('totalImpressions');
    expect(server).toContain('EXPOSURE_RETENTION_MS');
    expect(server).toContain('EXPOSURE_EVENT_LIMIT');
    expect(server).toContain('exposureImpressionsRecorded');
  });

  it('server discovery applies canonical system exclusions before ranking', () => {
    const server = readSource('server/discoveryRoutes.ts');
    const grammar = readSource('src/lib/filteringGrammar.ts');

    expect(grammar).toContain('export function violatesSystemExclusions');
    expect(server).toContain('loadSystemExclusions(viewerUid)');
    expect(server).toContain('violatesSystemExclusions(profile, exclusions)');
    expect(server).toContain("doc('system_exclusions')");
    expect(server).toContain("doc('safety')");
    expect(server).toContain('systemExclusionsApplied');
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

  it('max distance filters daily picks and labels Explore spillover from real distance estimates', () => {
    const viewer = profile({ id: 'viewer', uid: 'viewer', gender: 'male', city: 'Tel Aviv' });
    const near = profile({ id: 'near', uid: 'near', city: 'Tel Aviv' });
    const far = profile({ id: 'far', uid: 'far', city: 'Jerusalem' });
    const prefs = preferences({ maxDistance: 10, dealbreakers: { distance: true } });

    expect(estimateDistanceKm(viewer, far)).toBeGreaterThan(10);
    expect(selectDailyPicks({
      viewer,
      candidates: [far, near],
      preferences: prefs,
      tasteState: emptyTasteState(),
    }).map((item) => item.profile.id)).toEqual(['near']);

    const exploratory = selectExploreProfiles({
      viewer,
      candidates: [far, near],
      preferences: preferences({ maxDistance: 10, dealbreakers: { distance: false } }),
      tasteState: emptyTasteState(),
      allowDisclosedSpillover: true,
    });
    expect(exploratory.find((item) => item.profile.id === 'far')?.spilloverReason).toBe('outside_distance');
  });

  it('candidate exposure fairness context changes ranking order', () => {
    const viewer = profile({ id: 'viewer', uid: 'viewer', gender: 'male', city: 'Tel Aviv' });
    const saturated = profile({ id: 'saturated', uid: 'saturated', city: 'Tel Aviv', tags: ['Hiking', 'Family'] });
    const starved = profile({ id: 'starved', uid: 'starved', city: 'Tel Aviv', tags: ['Hiking', 'Family'] });
    const ranked = selectDailyPicks({
      viewer,
      candidates: [saturated, starved],
      preferences: preferences({ maxDistance: 100 }),
      tasteState: emptyTasteState(),
      candidateContexts: {
        saturated: {
          fairness: {
            candidateAccountAgeMs: 30 * 24 * 60 * 60 * 1000,
            impressionsLast7d: 200,
            impressionsLast24h: 600,
          },
        },
        starved: {
          fairness: {
            candidateAccountAgeMs: 30 * 24 * 60 * 60 * 1000,
            impressionsLast7d: 0,
            impressionsLast24h: 0,
          },
        },
      },
    });

    expect(ranked.map((item) => item.profile.id)).toEqual(['starved', 'saturated']);
    expect(ranked[0].score).toBeGreaterThan(ranked[1].score);
  });

  it('system exclusions reject blocked, reported, and suspected-bot candidates', () => {
    const state = emptySystemExclusionState();
    state.blockedUserIds.add('blocked-user');
    state.reportedUserIds.add('reported-user');
    state.suspectedBotIds.add('bot-by-id');

    expect(violatesSystemExclusions(profile({ id: 'blocked-user', uid: 'blocked-user' }), state))
      .toEqual({ violates: true, reason: 'blocked' });
    expect(violatesSystemExclusions(profile({ id: 'reported-user', uid: 'reported-user' }), state))
      .toEqual({ violates: true, reason: 'reported' });
    expect(violatesSystemExclusions(profile({ id: 'bot-by-id', uid: 'bot-by-id' }), state))
      .toEqual({ violates: true, reason: 'suspected_bot' });
    expect(violatesSystemExclusions({
      ...profile({ id: 'flagged-bot', uid: 'flagged-bot' }),
      suspectedBot: true,
    } as Profile, emptySystemExclusionState()))
      .toEqual({ violates: true, reason: 'suspected_bot' });
    expect(violatesSystemExclusions(profile({ id: 'allowed', uid: 'allowed' }), state))
      .toEqual({ violates: false });
  });
});

describe('private taste skill contracts', () => {
  it('taste learning is off by default until consent and resumes via taste_consent_granted', () => {
    const app = readSource('src/context/AppContext.tsx');
    const server = readSource('server/tasteRoutes.ts');

    expect(app).toContain('paused: true');
    expect(app).toContain('emptyTasteStateForProfile');
    expect(app).toContain("recordTasteEvent(paused ? 'taste_pause' : 'taste_consent_granted')");
    expect(server).toContain('paused: true');
    expect(server).toContain('profile.learning.paused || previousState.learningPaused');
  });

  it('client taste reset preserves pause and opt-out consent state', () => {
    const source = readSource('src/context/AppContext.tsx');

    expect(source).toContain('const emptyProfile = normalizeTasteProfile({');
    expect(source).toContain('paused: tasteProfile.learning.paused');
    expect(source).toContain('optedOut: tasteProfile.learning.optedOut');
    expect(source).toContain('emptyTasteStateForProfile(emptyProfile)');
    expect(source).not.toContain('const emptyProfile = cloneDefaultTasteProfile();\n    setTasteProfileState(emptyProfile);\n\n    const emptyInteractions');
  });

  it('server taste pause and reset preserve pause and opt-out consent state', () => {
    const source = readSource('server/tasteRoutes.ts');

    expect(source).toContain('const previousProfile = req.uid ? await loadTasteProfile(req.uid) : cloneEmptyTasteProfile()');
    expect(source).toContain('paused: previousProfile.learning.paused');
    expect(source).toContain('optedOut: previousProfile.learning.optedOut');
    expect(source).toContain('learningPaused: profile.learning.paused');
    expect(source).toContain('optedOut: profile.learning.optedOut');
    expect(source).toContain("typeof req.body?.optedOut === 'boolean'");
    expect(source).toContain('existingProfile.learning.optedOut');
    expect(source).not.toContain('learningPaused: true,\n      optedOut: false');
    expect(source).not.toContain('optedOut: req.body?.optedOut === true');
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

  it('Private Taste settings profile preserves manual controls and does not resume learning on reset', () => {
    const source = readSource('src/features/settings/PrivateTasteProfile.tsx');

    expect(source).toContain('const TasteListEditor');
    expect(source).not.toContain('const renderListEditor');
    expect(source).toContain('emptyPrivateTasteProfile(true)');
    expect(source).toContain("learningPaused ? 'Paused' : 'Refresh from Activity'");
    expect(source).not.toContain('hard_dealbreakers: [],\n    learning: current.learning');
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

  it('reset clears learned vectors without granting fresh taste-learning consent', () => {
    const tags = profileToFeatureTags(candidate);
    const learned = applyEvent(emptyTasteState(1_000), {
      name: 'like',
      class: 'explicit_preference',
      candidateFeatures: tags,
      occurredAt: 2_000,
    });
    const paused = applyEvent(learned, {
      name: 'taste_pause',
      class: 'policy_consent',
      occurredAt: 3_000,
    });
    const reset = applyEvent(paused, {
      name: 'taste_reset',
      class: 'policy_consent',
      occurredAt: 4_000,
    });

    expect(implicitAffinity(reset, tags)).toBe(0);
    expect(serializeTasteState(reset)).toMatchObject({
      fast: {},
      slow: {},
      learningPaused: true,
    });
  });
});

function profile(overrides: Partial<Profile>): Profile {
  return {
    id: 'profile',
    uid: 'profile',
    displayName: 'Profile',
    age: 27,
    gender: 'female',
    city: 'Tel Aviv',
    photos: [],
    bio: '',
    observance: 'traditional',
    intent: 'serious_relationship',
    prompts: [],
    isVerified: true,
    isPremium: false,
    tags: ['Hiking', 'Family'],
    ...overrides,
  };
}

function preferences(overrides: Partial<DiscoveryPreferences> = {}): DiscoveryPreferences {
  return {
    genderPreference: ['female'],
    ageRange: [22, 35],
    maxDistance: 50,
    observancePreference: ['traditional', 'masorti', 'secular', 'dati', 'modern_orthodox'],
    intentPreference: ['serious_relationship'],
    hardFilters: ['verified'],
    softPreferences: ['shared_interests', 'same_city', 'similar_age'],
    recommendationMode: 'balanced',
    dealbreakers: {
      age: true,
      distance: true,
      gender: true,
      intent: true,
      observance: true,
      verified: true,
      ...overrides.dealbreakers,
    },
    softPreferenceWeights: {
      shared_interests: 0.6,
      same_city: 0.25,
      similar_age: 0.35,
      ...overrides.softPreferenceWeights,
    },
    ...overrides,
  };
}
