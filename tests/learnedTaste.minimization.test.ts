import { describe, expect, it } from 'vitest';
import { applyEvent, emptyTasteState, type EventName } from '@/lib/learnedTaste';

describe('learned taste minimization', () => {
  it('learns only from opaque candidateFeatures', () => {
    const state = applyEvent(emptyTasteState(1_000), {
      name: 'more_like_this',
      class: 'explicit_preference',
      candidateId: 'candidate-1',
      candidateFeatures: ['shared_values', 'quiet_date_energy'],
      occurredAt: 2_000,
    });

    expect(state.fast.get('shared_values')).toBeGreaterThan(0);
    expect(state.slow.get('quiet_date_energy')).toBeGreaterThan(0);
    expect([...state.fast.keys()]).toEqual(['shared_values', 'quiet_date_energy']);
  });

  it('does not learn from empty features', () => {
    const state = applyEvent(emptyTasteState(1_000), {
      name: 'more_like_this',
      class: 'explicit_preference',
      candidateId: 'candidate-1',
      candidateFeatures: [],
      occurredAt: 2_000,
    });

    expect([...state.fast.entries()]).toEqual([]);
    expect([...state.slow.entries()]).toEqual([]);
  });

  it('does not learn from zero-authority surface_seen events', () => {
    const state = emptyTasteState(1_000);
    const updated = applyEvent(state, {
      name: 'surface_seen',
      class: 'context',
      candidateId: 'candidate-1',
      candidateFeatures: ['visible_profile'],
      surface: 'daily_picks',
      occurredAt: 2_000,
    });

    expect(updated).toBe(state);
    expect([...updated.fast.entries()]).toEqual([]);
    expect([...updated.slow.entries()]).toEqual([]);
  });

  it('keeps message, raw photo, and precise-location channels out of the event taxonomy', () => {
    const eventNames = [
      'onboarding_completed',
      'hard_filter_edited',
      'soft_preference_edited',
      'taste_consent_granted',
      'taste_reset',
      'taste_pause',
      'like',
      'pass',
      'more_like_this',
      'less_like_this',
      'hide',
      'block',
      'tag_edited',
      'profile_open',
      'photo_carousel_depth',
      'prompt_expanded',
      'long_dwell',
      'reply_received',
      'surface_seen',
      'session_stage',
    ] satisfies EventName[];

    expect(eventNames).not.toEqual(expect.arrayContaining([
      'message_text',
      'raw_message',
      'photo_upload',
      'profile_photo',
      'precise_location',
      'gps_location',
    ]));
  });
});
