import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const readSource = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('Daily picks live pacing contracts', () => {
  it('uses live session timing and persisted decision velocity for pacing interventions', () => {
    const source = readSource('src/features/discovery/DailyPicksScreen.tsx');

    expect(source).toContain('useRef<number | null>(null)');
    expect(source).toContain('decisionTimestampsRef');
    expect(source).toContain('startDailyPicksSession');
    expect(source).toContain('recordDailyDecision');
    expect(source).toContain('getPacingMetrics');
    expect(source).toContain('const { sessionLength, swipeVelocity } = getPacingMetrics()');
    expect(source).toContain('aiService.getPacingIntervention(sessionLength, swipeVelocity)');
    expect(source).toContain('const advanceAfterSavedDecision = (nextDirection: number) => {');
    expect(source).toContain('recordDailyDecision();\n    setDirection(nextDirection);');
    expect(source).toContain('const isMatch = await likeProfile(currentProfile.id);');
    expect(source).toContain('await passProfile(currentProfile.id);');
    expect(source).toContain('advanceAfterSavedDecision(1);');
    expect(source).toContain('advanceAfterSavedDecision(-1);');
    expect(source).not.toContain('recordDailyDecision();\n    setDirection(1);');
    expect(source).not.toContain('recordDailyDecision();\n    setDirection(-1);');
    expect(source).not.toContain('passProfile(currentProfile.id);\n    setTimeout');
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

  it('surfaces failed daily pick interaction persistence instead of advancing silently', () => {
    const screen = readSource('src/features/discovery/DailyPicksScreen.tsx');
    const appContext = readSource('src/context/AppContext.tsx');

    expect(screen).toContain("const [actionError, setActionError] = useState<string | null>(null)");
    expect(screen).toContain("const [actionSaving, setActionSaving] = useState<DailyAction | null>(null)");
    expect(screen).toContain('setActionSaving(\'like\')');
    expect(screen).toContain('setActionSaving(\'pass\')');
    expect(screen).toContain('await moreLikeThis(currentProfile.id);');
    expect(screen).toContain('await lessLikeThis(currentProfile.id);');
    expect(screen).toContain('Could not save your choice. Please try again.');
    expect(screen).toContain('Could not update your taste learning. Please try again.');
    expect(screen).toContain('role="alert"');
    expect(screen).toContain('disabled={Boolean(actionSaving)}');

    expect(appContext).toContain('passProfile: (profileId: string) => Promise<void>');
    expect(appContext).toContain('moreLikeThis: (profileId: string) => Promise<void>');
    expect(appContext).toContain('lessLikeThis: (profileId: string) => Promise<void>');
    expect(appContext).toContain("await discoveryService.recordTasteEvent('like'");
    expect(appContext).toContain('const result = await discoveryService.likeProfile');
    expect(appContext).toContain("await discoveryService.recordTasteEvent('pass'");
    expect(appContext).toContain('await discoveryService.passProfile');
    expect(appContext).toContain("throw error;\n    }\n  };\n\n  const passProfile");
    expect(appContext).not.toContain("console.error('Error saving like:', error);\n    }\n\n    setExploreProfiles");
    expect(appContext).not.toContain("console.error('Error saving pass:', error);\n    }\n  };");
  });
});
