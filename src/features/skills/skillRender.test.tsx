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

describe('Private Taste skill privacy boundaries', () => {
  it('keeps personalization off until explicit consent is accepted', () => {
    const { container } = renderInDir(<PrivateTasteSkill onBack={vi.fn()} />, 'rtl');
    const scope = within(container);

    expect(scope.getByText(/Off by default/i)).toBeTruthy();
    expect(scope.queryByText(/Active/i)).toBeNull();

    fireEvent.click(scope.getByLabelText(/Open private taste consent gate/i));
    expect(scope.getByText(/Enable Personalization\?/i)).toBeTruthy();
    expect(scope.queryByText(/Active/i)).toBeNull();

    fireEvent.click(scope.getByRole('button', { name: /Enable Personalization/i }));
    expect(scope.getByText(/Active/i)).toBeTruthy();
  });

  it('keeps reset reachable from an owner-only taste surface', () => {
    const { container } = renderInDir(<PrivateTasteSkill onBack={vi.fn()} />, 'rtl');
    const scope = within(container);

    expect(scope.getByText(/Owner View Only/i)).toBeTruthy();
    expect(scope.getByRole('button', { name: /Reset Owner Taste/i })).toBeTruthy();
    expect(scope.getByText(/Taste Reset Semantics/i)).toBeTruthy();
  });

  it('does not render raw taste internals or unsafe dating claims', () => {
    const { container } = renderInDir(<PrivateTasteSkill onBack={vi.fn()} />, 'rtl');
    const text = container.textContent?.toLowerCase() ?? '';

    for (const forbidden of [
      '0.8',
      '0.95',
      '-0.95',
      'taste vector',
      'raw taste',
      'hidden ranking weights',
      'protected-trait inference',
      'desirability',
      'attractiveness',
      'compatibility score',
      'perfect match',
    ]) {
      expect(text).not.toContain(forbidden);
    }
  });

  it('keeps captured events limited to allowed profile-interaction signals', () => {
    const { container } = renderInDir(<PrivateTasteSkill onBack={vi.fn()} />, 'rtl');
    const eventTable = within(container).getByText(/Event Signal Table/i).closest('section');
    expect(eventTable).toBeTruthy();
    const eventText = eventTable?.textContent?.toLowerCase() ?? '';

    expect(eventText).toContain('like / match');
    expect(eventText).toContain('more like this');
    expect(eventText).toContain('less like this');

    for (const forbidden of [
      'message content',
      'raw personality answers',
      'exact location',
      'hidden ranking weights',
    ]) {
      expect(eventText).not.toContain(forbidden);
    }
  });
});
