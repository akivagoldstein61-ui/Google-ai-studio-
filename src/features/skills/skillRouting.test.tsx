// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import {
  BESPOKE_SKILL_COMPONENTS,
  resolveSkillView,
} from './SkillsRouter';
import { SKILLS, isInteractiveSkill } from './skillRegistry';

/**
 * PR 1 — route→component resolution snapshot.
 *
 * Asserts that every registered skill route resolves to either a bespoke page
 * or an explicitly-flagged PlannedSkillPage (interactive vs read-only), and
 * that no member-selectable skill silently falls through to the hub. This is
 * the structural guard that keeps SkillsRouter and the registry in sync.
 */
describe('Skills route → component resolution', () => {
  it('resolves every registered skill to a bespoke page or an explicit PlannedSkillPage', () => {
    const unresolved = SKILLS.filter((skill) => resolveSkillView(skill.id).kind === 'not-found').map(
      (skill) => skill.id,
    );
    expect(unresolved).toEqual([]);
  });

  it('only maps bespoke components to real registered skill ids', () => {
    const validIds = new Set(SKILLS.map((skill) => skill.id));
    const orphans = Object.keys(BESPOKE_SKILL_COMPONENTS).filter((id) => !validIds.has(id));
    expect(orphans).toEqual([]);
  });

  it('flags PlannedSkillPage read-only mode exactly for non-interactive skills', () => {
    for (const skill of SKILLS) {
      const view = resolveSkillView(skill.id);
      if (view.kind === 'planned') {
        expect(view.readOnly).toBe(!isInteractiveSkill(skill));
      }
    }
  });

  it('renders a deterministic route→component map (snapshot)', () => {
    const map = SKILLS.map((skill) => {
      const view = resolveSkillView(skill.id);
      if (view.kind === 'bespoke') return `${skill.id} -> bespoke`;
      if (view.kind === 'planned') return `${skill.id} -> planned(${view.readOnly ? 'reference' : 'interactive'})`;
      return `${skill.id} -> NOT_FOUND`;
    });
    expect(map).toMatchInlineSnapshot(`
      [
        "personality-assessment -> bespoke",
        "personality-profile -> bespoke",
        "personality-engine -> planned(reference)",
        "personality-research -> planned(reference)",
        "personality-ocean -> bespoke",
        "personality-visibility -> bespoke",
        "consent-ux -> bespoke",
        "israeli-privacy -> bespoke",
        "privacy-recommendation -> bespoke",
        "private-taste -> bespoke",
        "private-recommendations -> planned(reference)",
        "why-this-match -> bespoke",
        "permissioned-sharing -> bespoke",
        "compatibility-reflection -> bespoke",
        "explainable-ai -> planned(reference)",
        "filtering-marketplace -> bespoke",
        "learned-taste -> bespoke",
        "maps-date-planner -> planned(interactive)",
        "pacing-coach -> bespoke",
        "ai-runtime-governance -> bespoke",
        "ai-feature-modules -> planned(reference)",
        "gemini-integration -> planned(reference)",
        "low-latency-ai -> planned(reference)",
        "high-thinking-routing -> planned(reference)",
        "grounded-search -> planned(interactive)",
        "image-analysis -> planned(reference)",
        "voice-integration -> planned(reference)",
        "google-ai-studio-app-builder -> planned(reference)",
        "sparkmatch-dating-app-skill -> planned(reference)",
        "video-generator -> planned(reference)",
        "system-prompt -> planned(reference)",
        "calm-ux -> planned(reference)",
        "psychometric-validation -> bespoke",
        "dark-pattern-audit -> bespoke",
        "personality-delivery -> planned(reference)",
      ]
    `);
  });
});
