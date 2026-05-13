/**
 * Experiment harness — lightweight A/B framework for Kesher AI features.
 *
 * Goals:
 *   - Server- and client-callable. Same assignment determinism in both places.
 *   - Sticky per-user: a user always sees the same arm for a given experiment.
 *   - Whitelisted experiments only (no ad-hoc UI variants slipping into prod).
 *   - Per-experiment exposure logging for downstream analysis.
 *   - Safe defaults: an experiment that fails to assign → control.
 *
 * Non-goals:
 *   - Statistical analysis (export the events; analyze in BigQuery).
 *   - Real-time traffic shaping (handled by Vercel / feature flags).
 *
 * Assignment is FNV-1a hash of `${uid}:${experimentId}` → uniform 0..1.
 * Each arm declares a weight (0..1); arms are scanned in order, first
 * cumulative-weight match wins. Total weight need not equal 1.0; any
 * remainder defaults to control.
 */

import { track } from './observability';

export type ExperimentId =
  | 'compat_lens_layout_v1'
  | 'why_match_high_thinking'
  | 'bio_coach_temperature'
  | 'daily_picks_intro_tone'
  | 'pacing_coach_threshold';

export interface ExperimentArm {
  arm: string;
  weight: number;
  config?: Record<string, unknown>;
}

export interface ExperimentDefinition {
  id: ExperimentId;
  description: string;
  arms: ExperimentArm[];
  /** If true, exposure event is logged on every read. */
  logExposure: boolean;
  /** If true, scoped to a single Gemini feature_id for audit clarity. */
  featureId?: string;
  /** Active window. Outside this window the experiment returns control. */
  startsAt?: string;  // ISO
  endsAt?: string;    // ISO
}

export const EXPERIMENT_REGISTRY: Record<ExperimentId, ExperimentDefinition> = {
  compat_lens_layout_v1: {
    id: 'compat_lens_layout_v1',
    description: 'Single-card vs four-lens layout for Compatibility Reflection.',
    arms: [
      { arm: 'control_single_card', weight: 0.5 },
      { arm: 'four_lenses', weight: 0.5, config: { lensCount: 4 } },
    ],
    logExposure: true,
    featureId: 'compatibility_reflection',
  },
  why_match_high_thinking: {
    id: 'why_match_high_thinking',
    description: 'Low vs high thinking budget for Why-This-Match.',
    arms: [
      { arm: 'control_low_thinking', weight: 0.7, config: { thinking: 'low' } },
      { arm: 'high_thinking', weight: 0.3, config: { thinking: 'high' } },
    ],
    logExposure: true,
    featureId: 'why_match',
  },
  bio_coach_temperature: {
    id: 'bio_coach_temperature',
    description: 'Bio coach creativity — 0.3 vs 0.5 temperature.',
    arms: [
      { arm: 'control_0_3', weight: 0.5, config: { temperature: 0.3 } },
      { arm: 'warmer_0_5', weight: 0.5, config: { temperature: 0.5 } },
    ],
    logExposure: false,
    featureId: 'bio_coach',
  },
  daily_picks_intro_tone: {
    id: 'daily_picks_intro_tone',
    description: 'Daily picks intro — calm vs intentional framing.',
    arms: [
      { arm: 'control_calm', weight: 0.5 },
      { arm: 'intentional', weight: 0.5 },
    ],
    logExposure: true,
    featureId: 'daily_picks_intro',
  },
  pacing_coach_threshold: {
    id: 'pacing_coach_threshold',
    description: 'Threshold (swipes/min) above which pacing coach is shown.',
    arms: [
      { arm: 'control_high_threshold', weight: 0.5, config: { swipesPerMin: 5 } },
      { arm: 'low_threshold', weight: 0.5, config: { swipesPerMin: 3 } },
    ],
    logExposure: true,
    featureId: 'pacing_coach',
  },
};

// FNV-1a 32-bit hash → uniform 0..1
function hash01(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return (h >>> 0) / 0xffffffff;
}

export interface Assignment {
  experimentId: ExperimentId;
  arm: string;
  config: Record<string, unknown>;
  isControl: boolean;
}

/**
 * Deterministically assign a user to an experiment arm.
 *
 * @param uid stable user identifier (Firebase uid)
 * @param experimentId one of EXPERIMENT_REGISTRY keys
 * @param now optional clock override for testing
 */
export function assign(
  uid: string,
  experimentId: ExperimentId,
  now: Date = new Date(),
): Assignment {
  const def = EXPERIMENT_REGISTRY[experimentId];
  if (!def) return controlAssignment(experimentId);

  // Window check
  if (def.startsAt && now < new Date(def.startsAt)) return controlAssignment(experimentId);
  if (def.endsAt && now > new Date(def.endsAt)) return controlAssignment(experimentId);

  const r = hash01(`${uid}:${experimentId}`);
  let cumulative = 0;
  for (const arm of def.arms) {
    cumulative += arm.weight;
    if (r < cumulative) {
      return {
        experimentId,
        arm: arm.arm,
        config: arm.config ?? {},
        isControl: arm.arm.startsWith('control'),
      };
    }
  }
  return controlAssignment(experimentId);
}

function controlAssignment(experimentId: ExperimentId): Assignment {
  const def = EXPERIMENT_REGISTRY[experimentId];
  const ctrl = def?.arms.find((a) => a.arm.startsWith('control')) ?? def?.arms[0];
  return {
    experimentId,
    arm: ctrl?.arm ?? 'control',
    config: ctrl?.config ?? {},
    isControl: true,
  };
}

/**
 * Read assignment and emit an exposure event for downstream analysis.
 * Safe to call from React components or server routes.
 */
export function getExperimentArm(
  uid: string,
  experimentId: ExperimentId,
): Assignment {
  const a = assign(uid, experimentId);
  const def = EXPERIMENT_REGISTRY[experimentId];
  if (def?.logExposure) {
    track('experiment_exposure', {
      experiment_id: experimentId,
      arm: a.arm,
      is_control: a.isControl,
      feature_id: def.featureId ?? null,
    });
  }
  return a;
}

/**
 * Tiny helper for tests / admin tools — never call from production code.
 * Returns the assignment distribution for N synthetic uids.
 */
export function simulateAssignment(
  experimentId: ExperimentId,
  n: number = 10000,
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (let i = 0; i < n; i++) {
    const a = assign(`synthetic_uid_${i}`, experimentId);
    counts[a.arm] = (counts[a.arm] || 0) + 1;
  }
  return counts;
}
