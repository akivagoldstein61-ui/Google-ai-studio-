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

  it('ignores raw message, photo, and precise-location fields at runtime', () => {
    const updated = applyEvent(emptyTasteState(1_000), {
      name: 'more_like_this',
      class: 'explicit_preference',
      candidateId: 'candidate-1',
      messageText: 'private message content',
      photoUrl: 'https://example.invalid/profile.jpg',
      preciseLocation: { lat: 32.0853, lng: 34.7818 },
      occurredAt: 2_000,
    } as any);

    expect([...updated.fast.entries()]).toEqual([]);
    expect([...updated.slow.entries()]).toEqual([]);
  });

  it('keeps message, raw photo, and precise-location channels out of the event taxonomy', () => {
    const taxonomy: Record<EventName, true> = {
      onboarding_completed: true,
      hard_filter_edited: true,
      soft_preference_edited: true,
      taste_consent_granted: true,
      taste_reset: true,
      taste_pause: true,
      like: true,
      pass: true,
      more_like_this: true,
      less_like_this: true,
      hide: true,
      block: true,
      tag_edited: true,
      profile_open: true,
      photo_carousel_depth: true,
      prompt_expanded: true,
      long_dwell: true,
      reply_received: true,
      surface_seen: true,
      session_stage: true,
    };
    const eventNames = Object.keys(taxonomy);

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
