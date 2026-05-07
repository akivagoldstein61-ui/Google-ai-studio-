import type { TasteState } from './learnedTaste';
import { emptyTasteState } from './learnedTaste';

type SerializedTasteState = {
  fast: Record<string, number>;
  slow: Record<string, number>;
  lastUpdatedMs: number;
};

export function serializeTasteState(state: TasteState): SerializedTasteState {
  return {
    fast: Object.fromEntries(state.fast),
    slow: Object.fromEntries(state.slow),
    lastUpdatedMs: state.lastUpdatedMs,
  };
}

export function deserializeTasteState(raw: unknown): TasteState {
  if (!raw || typeof raw !== 'object') return emptyTasteState();
  const r = raw as Record<string, unknown>;
  try {
    return {
      fast: new Map(Object.entries((r.fast as Record<string, number>) ?? {})),
      slow: new Map(Object.entries((r.slow as Record<string, number>) ?? {})),
      lastUpdatedMs: typeof r.lastUpdatedMs === 'number' ? r.lastUpdatedMs : Date.now(),
    };
  } catch {
    return emptyTasteState();
  }
}

/** Deep-clone a TasteState so applyEvent() can mutate without aliasing. */
export function cloneTasteState(state: TasteState): TasteState {
  return {
    fast: new Map(state.fast),
    slow: new Map(state.slow),
    lastUpdatedMs: state.lastUpdatedMs,
  };
}

/** Convert a profile's public fields into opaque feature tags for taste tracking. */
export function profileToFeatureTags(profile: {
  tags: string[];
  observance: string;
  intent: string;
}): string[] {
  return [
    ...profile.tags.map(t => t.toLowerCase().replace(/\s+/g, '_')),
    `observance_${profile.observance}`,
    `intent_${profile.intent}`,
  ].filter(Boolean);
}
