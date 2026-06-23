import { describe, expect, it } from 'vitest';
import { directionalScore } from '@/lib/filteringGrammar';
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
  tags: ['Torah', 'Hiking'],
};

const candidate = (overrides: Partial<Profile> = {}): Profile => ({
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
  tags: ['Torah', 'Cooking'],
  ...overrides,
});

describe('filtering grammar hard and soft behavior', () => {
  it('returns score 0 and hardViolation on hard-filter breach', () => {
    const result = directionalScore({
      viewer,
      candidate: candidate({ age: 44 }),
      hardCtx: { ageRange: [24, 34] },
      softWeights: { shared_interests: 1 },
      implicitAffinity: 1,
    });

    expect(result.score).toBe(0);
    expect(result.hardViolation).toBe('age_range');
  });

  it('uses soft weights only to rerank without hardViolation', () => {
    const result = directionalScore({
      viewer,
      candidate: candidate({ tags: ['Cooking'], city: 'Jerusalem' }),
      hardCtx: { ageRange: [24, 34] },
      softWeights: { shared_interests: 1, same_city: 1 },
      implicitAffinity: -0.25,
    });

    expect(result.hardViolation).toBeUndefined();
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(1);
  });
});
