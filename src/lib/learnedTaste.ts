/**
 * Kesher Learned Taste — event taxonomy, dual-memory state, update rule.
 *
 * Implements kesher-learned-taste skill:
 *   Update = Authority × Confidence × Recency × Eligibility
 *
 *   - Fast taste state: half-life ~1-2 weeks (mood, recent activity).
 *   - Slow taste state: half-life ~2-3 months (durable preferences).
 *
 * PRIVACY: Message text, photos, and precise locations are NEVER captured into
 * the taste profile. Only the four event classes below are eligible.
 */

// ─────────────────────────────────────────────────────────────────────────────
// EVENT CLASSES
// ─────────────────────────────────────────────────────────────────────────────

export type EventClass =
  | 'policy_consent'
  | 'explicit_preference'
  | 'high_signal_implicit'
  | 'context';

export type EventName =
  // policy_consent
  | 'onboarding_completed'
  | 'hard_filter_edited'
  | 'soft_preference_edited'
  | 'taste_consent_granted'
  | 'taste_reset'
  | 'taste_pause'
  // explicit_preference
  | 'like'
  | 'pass'
  | 'more_like_this'
  | 'less_like_this'
  | 'hide'
  | 'block'
  | 'tag_edited'
  // high_signal_implicit
  | 'profile_open'
  | 'photo_carousel_depth'
  | 'prompt_expanded'
  | 'long_dwell'
  | 'reply_received'
  // context
  | 'surface_seen'
  | 'session_stage';

export interface TasteEvent {
  name: EventName;
  class: EventClass;
  candidateId?: string;
  /** opaque feature tags about the candidate, never PII */
  candidateFeatures?: string[];
  /** observed value, e.g. dwell time in ms; class-dependent */
  value?: number;
  surface?: 'daily_picks' | 'explore' | 'inbox' | 'profile';
  occurredAt: number; // epoch ms
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTHORITY HIERARCHY
// ─────────────────────────────────────────────────────────────────────────────

/** Returns authority weight in [0..1]. Higher = more trusted signal. */
export function authority(name: EventName): number {
  switch (name) {
    case 'block':
    case 'hide':
    case 'hard_filter_edited':
      return 1.0;
    case 'more_like_this':
    case 'less_like_this':
    case 'soft_preference_edited':
    case 'tag_edited':
    case 'taste_reset':
      return 0.85;
    case 'like':
    case 'reply_received':
      return 0.7;
    case 'pass':
      return 0.5;
    case 'profile_open':
    case 'prompt_expanded':
    case 'long_dwell':
      return 0.35;
    case 'photo_carousel_depth':
      return 0.25;
    case 'surface_seen':
    case 'session_stage':
    case 'onboarding_completed':
    case 'taste_consent_granted':
    case 'taste_pause':
      return 0.0;
  }
}

/**
 * Sign of the update: +1 attracts toward the candidate's features,
 * -1 pushes away, 0 is neutral.
 */
export function signOf(name: EventName): -1 | 0 | 1 {
  switch (name) {
    case 'like':
    case 'more_like_this':
    case 'soft_preference_edited':
    case 'reply_received':
    case 'long_dwell':
    case 'prompt_expanded':
    case 'profile_open':
    case 'photo_carousel_depth':
      return 1;
    case 'pass':
    case 'less_like_this':
    case 'hide':
    case 'block':
      return -1;
    default:
      return 0;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DUAL MEMORY STATE
// ─────────────────────────────────────────────────────────────────────────────

export interface TasteState {
  /** map: feature_tag -> weight (signed). normalized periodically. */
  fast: Map<string, number>;
  slow: Map<string, number>;
  lastUpdatedMs: number;
  learningPaused?: boolean;
  optedOut?: boolean;
}

export const FAST_HALFLIFE_MS = 14 * 24 * 60 * 60 * 1000;   // 2 weeks
export const SLOW_HALFLIFE_MS = 75 * 24 * 60 * 60 * 1000;   // ~2.5 months

function decayFactor(elapsedMs: number, halfLifeMs: number): number {
  if (elapsedMs <= 0) return 1;
  return Math.pow(0.5, elapsedMs / halfLifeMs);
}

function applyDecay(map: Map<string, number>, elapsedMs: number, halfLife: number) {
  const f = decayFactor(elapsedMs, halfLife);
  for (const [k, v] of map) map.set(k, v * f);
}

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE RULE
// ─────────────────────────────────────────────────────────────────────────────

export function applyEvent(state: TasteState, ev: TasteEvent): TasteState {
  if (ev.name === 'taste_reset') return resetTasteState(ev.occurredAt);
  if (ev.name === 'taste_pause') return { ...cloneTasteState(state), learningPaused: true };
  if (state.learningPaused || state.optedOut) return cloneTasteState(state);

  const a = authority(ev.name);
  const sign = signOf(ev.name);
  if (a === 0 || sign === 0) return state;

  // Decay both stores up to current event time
  const elapsed = Math.max(0, ev.occurredAt - state.lastUpdatedMs);
  applyDecay(state.fast, elapsed, FAST_HALFLIFE_MS);
  applyDecay(state.slow, elapsed, SLOW_HALFLIFE_MS);

  // Confidence: dwell-based for implicit, fixed for explicit
  const confidence = ev.name === 'long_dwell'
    ? Math.min(1, (ev.value ?? 0) / 8000)
    : ev.name === 'photo_carousel_depth'
      ? Math.min(1, (ev.value ?? 0) / 5)
      : 1.0;

  const features = ev.candidateFeatures ?? [];
  const fastDelta = a * confidence * sign;
  const slowDelta = a * confidence * sign * 0.4; // slow integrates more conservatively

  for (const tag of features) {
    state.fast.set(tag, (state.fast.get(tag) ?? 0) + fastDelta);
    state.slow.set(tag, (state.slow.get(tag) ?? 0) + slowDelta);
  }

  state.lastUpdatedMs = ev.occurredAt;
  return state;
}

// ─────────────────────────────────────────────────────────────────────────────
// SCORE A CANDIDATE
// ─────────────────────────────────────────────────────────────────────────────

/** Returns implicit affinity in [-1,1]. Combines fast 70% + slow 30%. */
export function implicitAffinity(state: TasteState, candidateFeatures: string[]): number {
  if (candidateFeatures.length === 0) return 0;
  let fastSum = 0, slowSum = 0;
  for (const tag of candidateFeatures) {
    fastSum += state.fast.get(tag) ?? 0;
    slowSum += state.slow.get(tag) ?? 0;
  }
  const fast = fastSum / candidateFeatures.length;
  const slow = slowSum / candidateFeatures.length;
  return clamp(0.7 * fast + 0.3 * slow, -1, 1);
}

// ─────────────────────────────────────────────────────────────────────────────
// RESET SEMANTICS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Per spec: a taste reset clears the learned vector, anchors, explanation cache,
 * and on-device summaries. It does NOT clear abuse, consent, or legal-retention
 * records. Those must be persisted separately.
 */
export function resetTasteState(now: number = Date.now()): TasteState {
  return { fast: new Map(), slow: new Map(), lastUpdatedMs: now, learningPaused: false, optedOut: false };
}

export function emptyTasteState(now: number = Date.now()): TasteState {
  return resetTasteState(now);
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function cloneTasteState(state: TasteState): TasteState {
  return {
    fast: new Map(state.fast),
    slow: new Map(state.slow),
    lastUpdatedMs: state.lastUpdatedMs,
    learningPaused: state.learningPaused ?? false,
    optedOut: state.optedOut ?? false,
  };
}
