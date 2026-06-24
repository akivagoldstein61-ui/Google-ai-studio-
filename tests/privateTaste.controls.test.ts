import { describe, expect, it } from 'vitest';
import { applyEvent, emptyTasteState, resetTasteState } from '@/lib/learnedTaste';

describe('private taste controls', () => {
  it('taste_pause stops learning', () => {
    const paused = applyEvent(emptyTasteState(1_000), {
      name: 'taste_pause',
      class: 'policy_consent',
      occurredAt: 2_000,
    });

    const updated = applyEvent(paused, {
      name: 'more_like_this',
      class: 'explicit_preference',
      candidateId: 'candidate-1',
      candidateFeatures: ['family_oriented'],
      occurredAt: 3_000,
    });

    expect(updated.learningPaused).toBe(true);
    expect([...updated.fast.entries()]).toEqual([]);
    expect([...updated.slow.entries()]).toEqual([]);
  });

  it('taste_reset clears fast and slow taste memory', () => {
    const learned = applyEvent(emptyTasteState(1_000), {
      name: 'more_like_this',
      class: 'explicit_preference',
      candidateId: 'candidate-1',
      candidateFeatures: ['values_overlap'],
      occurredAt: 2_000,
    });

    expect(learned.fast.size).toBeGreaterThan(0);

    const reset = resetTasteState(3_000);

    expect(reset.fast.size).toBe(0);
    expect(reset.slow.size).toBe(0);
    expect(reset.lastUpdatedMs).toBe(3_000);
  });

  it('optedOut blocks learning', () => {
    const updated = applyEvent({ ...emptyTasteState(1_000), optedOut: true }, {
      name: 'more_like_this',
      class: 'explicit_preference',
      candidateId: 'candidate-1',
      candidateFeatures: ['shared_learning'],
      occurredAt: 2_000,
    });

    expect(updated.optedOut).toBe(true);
    expect([...updated.fast.entries()]).toEqual([]);
    expect([...updated.slow.entries()]).toEqual([]);
  });
});
