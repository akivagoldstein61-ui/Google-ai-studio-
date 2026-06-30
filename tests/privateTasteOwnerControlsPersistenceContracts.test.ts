import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const readSource = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('private taste owner-control persistence contracts', () => {
  it('AppContext rolls back and rethrows failed private taste owner-control writes', () => {
    const source = readSource('src/context/AppContext.tsx');

    expect(source).toContain('resetTasteProfile: () => Promise<void>');
    expect(source).toContain('setTasteProfile: (profile: TasteProfileDraft) => Promise<void>');
    expect(source).toContain('const previousProfile = tasteProfile');
    expect(source).toContain('const previousInteractions = interactions');
    expect(source).toContain('const previousTasteState = tasteState');
    expect(source).toContain('setTasteProfileState(previousProfile)');
    expect(source).toContain('setInteractions(previousInteractions)');
    expect(source).toContain('setTasteStateRaw(previousTasteState)');
    expect(source).toContain('await discoveryService.resetTasteProfile();');
    expect(source).not.toContain('await discoveryService.resetTasteProfile().catch(() => null)');
    expect((source.match(/throw error;/g) ?? []).length).toBeGreaterThanOrEqual(6);
  });

  it('Private Taste settings awaits owner actions and shows persistence failures', () => {
    const source = readSource('src/features/settings/PrivateTasteProfile.tsx');

    expect(source).toContain("const [pendingAction, setPendingAction]");
    expect(source).toContain("const [actionError, setActionError]");
    expect(source).toContain('role="alert"');
    expect(source).toContain('await setTasteProfile(normalizeTasteProfileDraft(editedProfile))');
    expect(source).toContain('await resetTasteProfile();');
    expect(source).toContain('await pauseTasteLearning(!tasteProfile.learning.paused)');
    expect(source).toContain("await runProfileAction('optOut'");
    expect(source).toContain("await runProfileAction('delete'");
    expect(source).toContain('disabled={isBusy}');
  });

  it('Private Taste skill only reports persisted model changes after awaiting persistence', () => {
    const source = readSource('src/features/skills/PrivateTasteSkill.tsx');

    expect(source).toContain('const [consentError, setConsentError]');
    expect(source).toContain('const [modelError, setModelError]');
    expect(source).toContain('await pauseTasteLearning(false)');
    expect(source).toContain('await pauseTasteLearning(true)');
    expect(source).toContain('await optOutTasteLearning();');
    expect(source).toContain('await setTasteProfile(mergedProfile);');
    expect(source).toMatch(/await setTasteProfile\(mergedProfile\);[\s\S]*persisted: true/);
    expect(source).toContain('role="alert"');
  });

  it('Learned Taste recompute awaits persistence before marking the skill persisted', () => {
    const source = readSource('src/features/skills/LearnedTasteSkill.tsx');

    expect(source).toContain('const [saveError, setSaveError]');
    expect(source).toContain('await setTasteProfile(persisted);');
    expect(source).toMatch(/await setTasteProfile\(persisted\);[\s\S]*persisted: true/);
    expect(source).toContain('Could not save learned taste summary. Please try again.');
    expect(source).toContain('role="alert"');
  });
});
