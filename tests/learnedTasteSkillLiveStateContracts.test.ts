import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const readSource = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('Learned Taste skill live state contracts', () => {
  it('uses the app taste state and live discovery candidates instead of a demo sandbox', () => {
    const source = readSource('src/features/skills/LearnedTasteSkill.tsx');

    expect(source).toContain('tasteState,');
    expect(source).toContain('dailyPicks,');
    expect(source).toContain('exploreProfiles,');
    expect(source).toContain('Live Taste State Inspector');
    expect(source).toContain('uniqueProfiles([...dailyPicks, ...exploreProfiles])');
    expect(source).toContain('implicitAffinity(tasteState, profileToFeatureTags(candidate))');
    expect(source).toContain("summarizeTasteMap(tasteState.fast, 'fast')");
    expect(source).toContain("summarizeTasteMap(tasteState.slow, 'slow')");
    expect(source).not.toContain('const DEMO_EVENTS');
    expect(source).not.toContain('CANDIDATE_FEATURES');
    expect(source).not.toContain('Taste State Sandbox');
    expect(source).not.toContain('applyEvent(next');
  });

  it('keeps event taxonomy labels aligned with canonical learned-taste classes', () => {
    const source = readSource('src/features/skills/LearnedTasteSkill.tsx');

    expect(source).toContain("{ name: 'reply_received', label: 'Reply received', classLabel: 'high_signal_implicit' }");
    expect(source).toContain("{ name: 'profile_open', label: 'Profile open', classLabel: 'high_signal_implicit' }");
    expect(source).toContain("{ name: 'long_dwell', label: 'Long dwell (8 s)', classLabel: 'high_signal_implicit' }");
    expect(source).not.toContain("{ name: 'reply_received', label: 'Reply received', classLabel: 'explicit_preference' }");
  });
});
