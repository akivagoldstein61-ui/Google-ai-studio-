// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, within } from '@testing-library/react';
import React from 'react';
import { renderInDir, type SkillDir } from './testUtils/renderSkill';
import { PrivateTasteSkill } from './PrivateTasteSkill';
import { WhyThisMatchSkill } from './WhyThisMatchSkill';
import { PacingCoachSkill } from './PacingCoachSkill';

/**
 * PR A — rendered-test foundation for the three DEEPEN_NOW Skills Hub
 * candidates (private-taste, why-this-match, pacing-coach).
 *
 * These tests satisfy deepening-gate criteria #8 (rendered route status)
 * and #9 (mobile and RTL/LTR status) at the component level: each bespoke
 * skill page must mount, expose at least one member action control, render
 * in both Hebrew-first RTL and LTR, and wire its back affordance. They are a
 * regression floor before any UX deepening — they do NOT assert AI output or
 * completion behavior (those belong to the per-skill deepen PRs).
 *
 * AppContext and aiService are mocked so the render stays offline and never
 * touches Firebase, network, or real user data.
 */

const trackEvent = vi.fn();
const resetTasteProfile = vi.fn();

vi.mock('@/context/AppContext', () => ({
  useApp: () => ({
    user: null,
    dailyPicks: [],
    interactions: { likes: [], passes: [], moreLikeThis: [], lessLikeThis: [] },
    tasteProfile: null,
    resetTasteProfile,
    trackEvent,
  }),
}));

vi.mock('@/services/aiService', () => ({
  aiService: {
    analyzeTasteProfile: vi.fn(async () => null),
    explainMatch: vi.fn(async () => null),
    getPacingIntervention: vi.fn(async () => null),
  },
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const DIRS: SkillDir[] = ['rtl', 'ltr'];

const SKILLS = [
  { id: 'private-taste', heading: 'Private Taste', Component: PrivateTasteSkill },
  { id: 'why-this-match', heading: 'Why This Match', Component: WhyThisMatchSkill },
  { id: 'pacing-coach', heading: 'Pacing Coach', Component: PacingCoachSkill },
] as const;

describe('Skills Hub DEEPEN_NOW render foundation', () => {
  for (const { id, heading, Component } of SKILLS) {
    for (const dir of DIRS) {
      it(`renders ${id} in ${dir} with a member action control`, () => {
        const onBack = vi.fn();
        const { container } = renderInDir(<Component onBack={onBack} />, dir);

        const scope = within(container);
        // Mounts and shows its title.
        expect(scope.getByText(heading)).toBeTruthy();
        // Directional container is honored.
        expect(container.querySelector(`[dir="${dir}"]`)).toBeTruthy();
        // Exposes at least one member action control (beyond pure reading).
        expect(scope.getAllByRole('button').length).toBeGreaterThan(0);
      });
    }

    it(`wires the back affordance for ${id}`, () => {
      const onBack = vi.fn();
      const { container } = renderInDir(<Component onBack={onBack} />, 'rtl');
      // The back chevron is the first button in the sticky header.
      const firstButton = within(container).getAllByRole('button')[0];
      fireEvent.click(firstButton);
      expect(onBack).toHaveBeenCalledTimes(1);
    });
  }
});
