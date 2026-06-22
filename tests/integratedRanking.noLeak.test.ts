import { describe, expect, it } from 'vitest';
import { rank } from '@/lib/integratedRanking';
import { applyEvent, emptyTasteState } from '@/lib/learnedTaste';
import type { Profile } from '@/types';

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

const candidate: Profile = {
  id: 'candidate',
  uid: 'candidate',
  displayName: 'Candidate',
  age: 29,
  gender: 'female',
  city: 'Tel Aviv',
  photos: [],
  bio: '',
  observance: 'masorti',
  intent: 'serious_relationship',
  prompts: [],
  isVerified: true,
  isPremium: false,
  tags: ['Torah', 'Cooking', 'Family'],
};

describe('integrated ranking evidence minimization', () => {
  it('exposes only the whitelisted evidence packet without ranking internals', () => {
    const viewerTaste = applyEvent(emptyTasteState(1_000), {
      name: 'more_like_this',
      class: 'explicit_preference',
      candidateId: 'candidate',
      candidateFeatures: ['shared_values'],
      occurredAt: 2_000,
    });

    const result = rank({
      viewer,
      candidate,
      viewerHardCtx: { ageRange: [24, 34], genderPreference: ['female'] },
      viewerSoftWeights: { shared_interests: 1, shared_observance_label: 1, same_city: 1 },
      candidateHardCtx: { ageRange: [24, 36], genderPreference: ['male'] },
      candidateSoftWeights: { shared_interests: 1, shared_observance_label: 1, same_city: 1 },
      viewerTaste,
      candidateTaste: emptyTasteState(1_000),
      candidateFeatures: ['shared_values'],
      viewerFeatures: ['shared_values'],
      fairness: {
        candidateAccountAgeMs: 14 * 24 * 60 * 60 * 1_000,
        impressionsLast7d: 10,
        impressionsLast24h: 1,
      },
      candidateLastActiveAgoMs: 60_000,
    });

    expect(Object.keys(result.evidence).sort()).toEqual([
      'activity_status',
      'shared_intent',
      'shared_interests',
      'shared_observance_label',
      'taste_driven',
    ]);
    expect(typeof result.evidence.taste_driven).toBe('boolean');
    expect(JSON.stringify(result.evidence)).not.toMatch(/weight|affinity|score/i);
  });
});
