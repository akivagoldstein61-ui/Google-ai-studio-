// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// vitest globals are off, so RTL's automatic afterEach cleanup is not wired —
// unmount between tests so prior DOM doesn't leak into the next render.
afterEach(() => cleanup());

/**
 * Behavioral + safety tests for the already-deepened "Live" skills.
 *
 * These verify the runtime contracts of the three member-interactive skills:
 *  - they call the real /api/ai/* route via aiService,
 *  - they send ONLY allowlisted / coarse inputs (no private taste, raw scores,
 *    messages, or exact location),
 *  - they degrade to a deterministic "we don't invent" fallback on failure,
 *  - they never auto-send and never expose raw weights / model internals.
 *
 * aiService and AppContext are mocked so no network/Firebase is touched.
 */

let mockApp: any;
vi.mock('@/context/AppContext', () => ({ useApp: () => mockApp }));

vi.mock('@/services/aiService', () => ({
  aiService: {
    explainMatch: vi.fn(),
    analyzeTasteProfile: vi.fn(),
    getPacingIntervention: vi.fn(),
  },
}));

import { aiService } from '@/services/aiService';
import { WhyThisMatchSkill } from './WhyThisMatchSkill';
import { PrivateTasteSkill } from './PrivateTasteSkill';
import { PacingCoachSkill } from './PacingCoachSkill';

const FORBIDDEN_SIGNALS = [
  'private_taste_profile',
  'raw_personality_scores',
  'private_messages',
  'exact_location',
  'hidden_ranking_signals',
  'protected_trait_inference',
];

beforeEach(() => {
  vi.clearAllMocks();
  mockApp = { trackEvent: vi.fn() };
});

describe('WhyThisMatchSkill — visible-signal explanation', () => {
  beforeEach(() => {
    mockApp = {
      trackEvent: vi.fn(),
      user: { age: 30, city: 'Tel Aviv', observance: 'traditional', intent: 'serious_relationship', tags: ['family'], prompts: [], personalityScores: { o: 1 } },
      dailyPicks: [{ id: 'c1', uid: 'c1', displayName: 'Noa', age: 28, city: 'Tel Aviv', observance: 'traditional', intent: 'serious_relationship', tags: ['family'], prompts: [] }],
    };
  });

  it('sends only whitelisted visible signals and fields to explainMatch', async () => {
    (aiService.explainMatch as any).mockResolvedValue({
      reasons_he: ['ערך משותף של משפחה'],
      signals_used: ['visible_values'],
      signals_not_used: ['private_taste_profile'],
    });

    render(<WhyThisMatchSkill onBack={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /explain this match/i }));

    await screen.findByText('ערך משותף של משפחה');

    const arg = (aiService.explainMatch as any).mock.calls[0][0];
    expect(arg.signals).toEqual(['visible_values', 'visible_intent', 'visible_observance', 'visible_interests', 'visible_prompts']);
    for (const f of FORBIDDEN_SIGNALS) expect(arg.signals).not.toContain(f);
    expect(Object.keys(arg.user_profile).sort()).toEqual(['age', 'city', 'intent', 'observance', 'prompts', 'tags']);
    expect(arg.user_profile).not.toHaveProperty('personalityScores');
    expect(arg.candidate_profile).not.toHaveProperty('personalityScores');
  });

  it('renders the explanation in an RTL container with no compatibility-score claims', async () => {
    (aiService.explainMatch as any).mockResolvedValue({ reasons_he: ['אתם באותו אזור'], signals_used: ['visible_values'] });
    render(<WhyThisMatchSkill onBack={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /explain this match/i }));

    const reasons = await screen.findByText('אתם באותו אזור');
    const rtlRegion = reasons.closest('[dir="rtl"]');
    expect(rtlRegion).toBeTruthy();
    expect(rtlRegion?.textContent ?? '').not.toMatch(/\d+\s*\/\s*10|%|perfect match|soulmate/i);
  });

  it('shows a deterministic fallback (no invented reasons) when the route fails', async () => {
    (aiService.explainMatch as any).mockRejectedValue(new Error('route down'));
    render(<WhyThisMatchSkill onBack={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /explain this match/i }));

    await screen.findByText(/we don't invent reasons/i);
    expect(screen.queryByText('אתם באותו אזור')).toBeNull();
  });
});

describe('PrivateTasteSkill — consent-gated, owner-only taste model', () => {
  beforeEach(() => {
    mockApp = {
      trackEvent: vi.fn(),
      user: { uid: 'u1' },
      interactions: { likes: ['a'], passes: [], moreLikeThis: [], lessLikeThis: [] },
      tasteProfile: {},
      resetTasteProfile: vi.fn(),
    };
  });

  const enablePersonalization = () => {
    const section = screen.getByText('Personalization', { selector: 'h2, h2 *' }).closest('section')!;
    fireEvent.click(within(section).getAllByRole('button')[0]);
    fireEvent.click(screen.getByRole('button', { name: /^enable personalization$/i }));
  };

  it('hides the live taste model until personalization is explicitly enabled', () => {
    render(<PrivateTasteSkill onBack={() => {}} />);
    expect(screen.getByText(/enable personalization above to build/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /build my taste model/i })).toBeNull();
  });

  it('builds a category-only model from real signals and reassures no internal values are shown', async () => {
    (aiService.analyzeTasteProfile as any).mockResolvedValue({
      hard_dealbreakers: ['Long-distance'],
      soft_preferences: ['Family-oriented'],
      things_to_avoid: [],
      explanation: 'You lean toward people who value family.',
    });
    render(<PrivateTasteSkill onBack={() => {}} />);
    enablePersonalization();

    fireEvent.click(screen.getByRole('button', { name: /build my taste model/i }));
    await screen.findByText('Family-oriented');

    expect((aiService.analyzeTasteProfile as any).mock.calls[0]).toEqual([mockApp.interactions, mockApp.tasteProfile]);
    expect(screen.getByText(/internal scoring values are never shown/i)).toBeInTheDocument();
  });

  it('shows a deterministic fallback (never invents preferences) when the route fails', async () => {
    (aiService.analyzeTasteProfile as any).mockRejectedValue(new Error('route down'));
    render(<PrivateTasteSkill onBack={() => {}} />);
    enablePersonalization();

    fireEvent.click(screen.getByRole('button', { name: /build my taste model/i }));
    await screen.findByText(/we never invent preferences/i);
  });
});

describe('PacingCoachSkill — coarse, dismissible nudge', () => {
  it('sends only coarse numeric signals to the pacing route', async () => {
    (aiService.getPacingIntervention as any).mockResolvedValue({ message_he: 'קח רגע לנשום' });
    render(<PacingCoachSkill onBack={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /check my pacing/i }));

    await screen.findByText('קח רגע לנשום');
    const call = (aiService.getPacingIntervention as any).mock.calls[0];
    expect(call).toHaveLength(2);
    expect(typeof call[0]).toBe('number');
    expect(typeof call[1]).toBe('number');
  });

  it('lets the member dismiss the nudge', async () => {
    (aiService.getPacingIntervention as any).mockResolvedValue({ message_he: 'קח רגע לנשום' });
    render(<PacingCoachSkill onBack={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /check my pacing/i }));

    await screen.findByText('קח רגע לנשום');
    fireEvent.click(screen.getByLabelText('Dismiss'));
    expect(screen.queryByText('קח רגע לנשום')).toBeNull();
  });

  it('renders no nudge when the route fails (no intrusive fallback)', async () => {
    (aiService.getPacingIntervention as any).mockRejectedValue(new Error('route down'));
    render(<PacingCoachSkill onBack={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /check my pacing/i }));

    await waitFor(() => expect(aiService.getPacingIntervention as any).toHaveBeenCalled());
    expect(screen.queryByLabelText('Dismiss')).toBeNull();
  });
});
