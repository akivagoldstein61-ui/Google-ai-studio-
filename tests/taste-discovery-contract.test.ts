import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import type { Server } from 'node:http';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createApp } from '../server.ts';
import type { DiscoveryPreferences, Profile } from '../src/types.ts';
import {
  directionalScore,
  violatesHardFilters,
} from '../src/lib/filteringGrammar.ts';
import {
  applyEvent,
  emptyTasteState,
  implicitAffinity,
} from '../src/lib/learnedTaste.ts';
import {
  buildEvidencePacket,
  selectDailyPicks,
  selectExploreProfiles,
} from '../src/lib/integratedRanking.ts';

const viewer: Profile = {
  id: 'viewer',
  uid: 'viewer',
  displayName: 'Viewer',
  age: 30,
  gender: 'male',
  city: 'Tel Aviv',
  photos: [],
  bio: '',
  observance: 'masorti',
  intent: 'serious_relationship',
  prompts: [],
  isVerified: true,
  isPremium: false,
  tags: ['Torah', 'Hiking', 'Family'],
};

function candidate(overrides: Partial<Profile> = {}): Profile {
  return {
    id: overrides.id ?? `candidate-${Math.random()}`,
    uid: overrides.uid ?? overrides.id ?? 'candidate',
    displayName: overrides.displayName ?? 'Candidate',
    age: overrides.age ?? 29,
    gender: overrides.gender ?? 'female',
    city: overrides.city ?? 'Tel Aviv',
    photos: [],
    bio: '',
    observance: overrides.observance ?? 'masorti',
    intent: overrides.intent ?? 'serious_relationship',
    prompts: [],
    isVerified: overrides.isVerified ?? true,
    isPremium: overrides.isPremium ?? false,
    tags: overrides.tags ?? ['Torah', 'Hiking'],
    ...overrides,
  };
}

const preferences: DiscoveryPreferences = {
  genderPreference: ['female'],
  ageRange: [24, 34],
  maxDistance: 50,
  observancePreference: ['traditional', 'masorti', 'dati'],
  intentPreference: ['serious_relationship', 'marriage_minded'],
  hardFilters: ['verified'],
  softPreferences: ['shared_interests'],
  recommendationMode: 'balanced',
  dealbreakers: {
    age: true,
    distance: false,
    verified: true,
    intent: true,
    observance: true,
  },
  softPreferenceWeights: {
    shared_interests: 0.7,
    same_city: 0.2,
    similar_observance: 0.1,
  },
};

test('hard filters exclude candidates while soft preferences only change rank', () => {
  const outOfRange = candidate({ age: 40 });
  const lowSoftMatch = candidate({ id: 'low-soft', tags: ['Music'], city: 'Jerusalem' });

  assert.deepEqual(violatesHardFilters(outOfRange, preferences), {
    violates: true,
    reason: 'age',
  });

  const score = directionalScore({
    viewer,
    candidate: lowSoftMatch,
    preferences,
    implicitAffinity: -0.5,
  });

  assert.equal(score.hardViolation, undefined);
  assert.ok(score.score > 0, 'soft preference mismatch must not remove eligibility');
});

test('learned taste reranks only and can be paused by the user', () => {
  const base = emptyTasteState(1_000);
  const updated = applyEvent(base, {
    name: 'more_like_this',
    class: 'explicit_preference',
    candidateId: 'a',
    candidateFeatures: ['torah', 'hiking'],
    occurredAt: 2_000,
  });

  assert.ok(implicitAffinity(updated, ['torah']) > 0);

  const paused = applyEvent({ ...updated, learningPaused: true }, {
    name: 'more_like_this',
    class: 'explicit_preference',
    candidateId: 'b',
    candidateFeatures: ['music'],
    occurredAt: 3_000,
  });

  assert.equal(implicitAffinity(paused, ['music']), 0);
});

test('daily picks return five hard-eligible candidates and no undisclosed spillover', () => {
  const pool = [
    candidate({ id: 'bad-age', age: 41 }),
    ...Array.from({ length: 8 }, (_, index) =>
      candidate({
        id: `eligible-${index}`,
        uid: `eligible-${index}`,
        age: 26 + index,
        tags: index % 2 === 0 ? ['Torah', 'Hiking'] : ['Cooking'],
      }),
    ),
  ];

  const picks = selectDailyPicks({
    viewer,
    candidates: pool,
    preferences,
    tasteState: emptyTasteState(),
    limit: 5,
  });

  assert.equal(picks.length, 5);
  assert.ok(picks.every((pick) => pick.profile.id !== 'bad-age'));
  assert.ok(picks.every((pick) => pick.spilloverReason === undefined));
});

test('explore can label non-dealbreaker age spillover without changing Daily Picks', () => {
  const broadPrefs: DiscoveryPreferences = {
    ...preferences,
    dealbreakers: { ...preferences.dealbreakers, age: false },
  };
  const outOfRange = candidate({ id: 'age-spillover', age: 38 });

  const explore = selectExploreProfiles({
    viewer,
    candidates: [outOfRange],
    preferences: broadPrefs,
    tasteState: emptyTasteState(),
    allowDisclosedSpillover: true,
  });

  assert.equal(explore[0]?.profile.id, 'age-spillover');
  assert.equal(explore[0]?.spilloverReason, 'outside_age_range');
});

test('evidence packets expose only whitelisted visible signals', () => {
  const evidence = buildEvidencePacket({
    viewer,
    candidate: candidate({ tags: ['Torah', 'Cooking'] }),
    reasonCodes: ['shared_interests', 'taste_driven', 'hidden_weight'],
  });

  assert.deepEqual(Object.keys(evidence).sort(), [
    'activity_status',
    'shared_intent',
    'shared_interests',
    'shared_observance_label',
    'taste_driven',
  ]);
  assert.deepEqual(evidence.shared_interests, ['Torah']);
  assert.equal(evidence.taste_driven, true);
  assert.equal(JSON.stringify(evidence).includes('hidden_weight'), false);
});

test('launch surfaces avoid unsafe taste copy and prohibited launch signals', () => {
  const files = [
    'src/context/AppContext.tsx',
    'src/features/settings/PrivateTasteProfile.tsx',
    'src/features/discovery/ExploreScreen.tsx',
    'src/features/discovery/DailyPicksScreen.tsx',
    'src/ai/featureRegistry.ts',
    'src/ai/schemas.ts',
    'server/aiRoutes.ts',
    'src/types.ts',
  ];
  const banned = /chemistry_first|chemistry-first|Attraction|attraction_weight|AI-Powered Preferences|Ranking biases|dwell_time/;
  for (const file of files) {
    const contents = readFileSync(resolve(process.cwd(), file), 'utf8');
    assert.equal(banned.test(contents), false, `${file} contains a banned launch term`);
  }
});

test('taste and discovery routes mount through the Express app', async () => {
  process.env.KESHER_ENABLE_MOCK_AUTH = 'true';
  const app = await createApp();
  let server: Server | undefined;

  try {
    server = app.listen(0);
    await new Promise<void>((resolve) => server!.once('listening', resolve));
    const { port } = server.address() as { port: number };
    const baseUrl = `http://127.0.0.1:${port}`;

    const version = await fetch(`${baseUrl}/api/version`).then((res) => res.json());
    assert.equal(version.status, 'ok');
    assert.equal(version.repository, 'akivagoldstein61-ui/Google-ai-studio-');

    const profile = await fetch(`${baseUrl}/api/taste/profile`).then((res) => res.json());
    assert.equal(profile.profile.learning.paused, false);
    assert.equal(profile.profile.learning.optedOut, false);

    const daily = await fetch(`${baseUrl}/api/discovery/daily-picks`).then((res) => res.json());
    assert.equal(daily.items.length, 5);
    assert.ok(daily.items.every((item: any) => item.spilloverReason === undefined));
  } finally {
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server!.close((error) => (error ? reject(error) : resolve()));
      });
    }
  }
});
