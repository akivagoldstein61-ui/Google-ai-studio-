import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const readSource = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('Daily picks live pacing contracts', () => {
  it('uses live session timing and decision velocity for pacing interventions', () => {
    const source = readSource('src/features/discovery/DailyPicksScreen.tsx');

    expect(source).toContain('useRef<number | null>(null)');
    expect(source).toContain('decisionTimestampsRef');
    expect(source).toContain('startDailyPicksSession');
    expect(source).toContain('recordDailyDecision');
    expect(source).toContain('getPacingMetrics');
    expect(source).toContain('const { sessionLength, swipeVelocity } = getPacingMetrics()');
    expect(source).toContain('aiService.getPacingIntervention(sessionLength, swipeVelocity)');
    expect(source).toContain('recordDailyDecision();\n    setDirection(1);');
    expect(source).toContain('recordDailyDecision();\n    setDirection(-1);');
    expect(source).not.toContain('aiService.getPacingIntervention(10, 5)');
    expect(source).not.toContain('Mock session length and velocity');
  });

  it('keeps pacing telemetry bounded to counts and timing rather than profile content', () => {
    const source = readSource('src/features/discovery/DailyPicksScreen.tsx');

    expect(source).toContain('decisionCount / elapsedMinutes');
    expect(source).toContain('sessionStartedAtRef.current');
    expect(source).not.toContain('getPacingIntervention(currentProfile');
    expect(source).not.toContain('getPacingIntervention(dailyPicks');
    expect(source).not.toContain('swipeVelocity: currentProfile');
  });
});
