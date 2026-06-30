/**
 * Personality-adjacent safety tests.
 *
 * These tests pin the trust boundaries promised in the AI Trust Hub and
 * in CLAUDE.md Section 5. They are intentionally narrow and string-level
 * so a regression to "perfect match", autosend, or private-signal leakage
 * fails CI loudly.
 */

import { describe, it, expect } from 'vitest';
import {
  WHY_MATCH_ALLOWED_SIGNALS,
  WHY_MATCH_FORBIDDEN_SIGNALS,
  BANNED_MATCH_PHRASES,
  containsBannedPhrase,
  filterWhyMatchSignals,
  DATA_CLASS,
} from './dataClassification';
import { outputValidators } from './outputValidators';
import { PROMPT_TEMPLATES } from './prompts';
import { SYSTEM_INSTRUCTIONS } from './policies';
import { AI_FEATURE_REGISTRY, getFeatureById } from './featureRegistry';
import {
  TRUST_HUB_DOES,
  TRUST_HUB_RED_LINES,
  TRUST_HUB_CONTROLS,
} from './trustHubCopy';
import { assertNonEmptyDraft } from '../services/messageCoachInput';
import { personalityService } from '../personality/personalityService';
import {
  KESHER_PERSONALITY_ITEMS,
  PERSONALITY_INSTRUMENT_VERSION,
} from '../personality/scoring';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Data classification contract', () => {
  it('exposes the four required data classes', () => {
    expect(DATA_CLASS.PUBLIC_PROFILE).toBe('PUBLIC_PROFILE');
    expect(DATA_CLASS.PERMISSIONED_SUMMARY).toBe('PERMISSIONED_SUMMARY');
    expect(DATA_CLASS.PRIVATE_INFERRED).toBe('PRIVATE_INFERRED');
    expect(DATA_CLASS.SYSTEM_ONLY_SAFETY).toBe('SYSTEM_ONLY_SAFETY');
  });

  it('declares why_match as PUBLIC_PROFILE only and forbids private/safety classes', () => {
    const f = getFeatureById('why_match');
    expect(f).toBeDefined();
    expect(f!.data_classes_allowed).toEqual([DATA_CLASS.PUBLIC_PROFILE]);
    expect(f!.data_classes_forbidden).toContain(DATA_CLASS.PRIVATE_INFERRED);
    expect(f!.data_classes_forbidden).toContain(DATA_CLASS.SYSTEM_ONLY_SAFETY);
  });

  it('excludes private_preferences and hidden_ranking_weights from why_match input', () => {
    const f = getFeatureById('why_match')!;
    expect(f.excluded_data).toContain('private_preferences');
    expect(f.excluded_data).toContain('hidden_ranking_weights');
    expect(f.excluded_data).toContain('private_taste_profile');
    expect(f.excluded_data).toContain('safety_flags');
  });
});

describe('WhyThisMatch — server-side signal allowlist', () => {
  it('drops unknown / forbidden signals from client input', () => {
    const input = [
      'interests',                  // allowed
      'observance',                 // allowed
      'private_preferences',        // forbidden — must be dropped
      'hidden_ranking_weights',     // forbidden — must be dropped
      'attractiveness_score',       // forbidden — must be dropped
      'something_random',           // unknown — must be dropped
    ];
    const out = filterWhyMatchSignals(input);
    expect(out).toEqual(['interests', 'observance']);
  });

  it('returns an empty array for non-array input', () => {
    expect(filterWhyMatchSignals(null)).toEqual([]);
    expect(filterWhyMatchSignals('interests')).toEqual([]);
    expect(filterWhyMatchSignals(undefined)).toEqual([]);
  });

  it('exposes a non-empty allowlist', () => {
    expect(WHY_MATCH_ALLOWED_SIGNALS.length).toBeGreaterThan(0);
    expect(WHY_MATCH_ALLOWED_SIGNALS).toContain('interests');
    expect(WHY_MATCH_ALLOWED_SIGNALS).toContain('intent');
    expect(WHY_MATCH_ALLOWED_SIGNALS).toContain('observance');
  });

  it('forbidden signals are disjoint from allowed signals', () => {
    const allowed = new Set<string>(WHY_MATCH_ALLOWED_SIGNALS);
    for (const f of WHY_MATCH_FORBIDDEN_SIGNALS) {
      expect(allowed.has(f)).toBe(false);
    }
  });
});

describe('WhyThisMatch — banned phrase guard', () => {
  for (const phrase of BANNED_MATCH_PHRASES) {
    it(`detects banned phrase "${phrase}" case-insensitively`, () => {
      expect(containsBannedPhrase(`This is your ${phrase} for sure.`)).toBe(phrase);
      expect(containsBannedPhrase(phrase.toUpperCase())).toBe(phrase);
    });
  }

  it('returns null for clean text', () => {
    expect(containsBannedPhrase('You both value family and Shabbat.')).toBeNull();
  });

  it('rejects WhyMatch output containing a banned phrase in reasons', () => {
    const bad = {
      reasons: ['You share values', 'This looks like a perfect match'],
      first_question: 'q',
      signals_used: ['interests'],
      signals_not_used: [...WHY_MATCH_FORBIDDEN_SIGNALS],
      confidence: 0.5,
      evidence_label: 'HEURISTIC',
    };
    expect(() => outputValidators.validateWhyMatch(bad)).toThrow(/banned phrase/);
  });

  it('rejects WhyMatch output containing a banned phrase in first_question', () => {
    const bad = {
      reasons: ['ok 1', 'ok 2'],
      first_question: 'Want to find your soulmate today?',
      signals_used: [],
      signals_not_used: [...WHY_MATCH_FORBIDDEN_SIGNALS],
      confidence: 0.5,
      evidence_label: 'HEURISTIC',
    };
    expect(() => outputValidators.validateWhyMatch(bad)).toThrow(/banned phrase/);
  });
});

describe('WhyThisMatch — signals_used / signals_not_used', () => {
  it('passes through valid signals_used and signals_not_used arrays', () => {
    const valid = {
      reasons: ['ok', 'ok'],
      first_question: 'q',
      signals_used: ['interests', 'observance'],
      signals_not_used: [...WHY_MATCH_FORBIDDEN_SIGNALS],
      confidence: 0.6,
      evidence_label: 'HEURISTIC',
    };
    const out = outputValidators.validateWhyMatch(valid);
    expect(out.signals_used).toEqual(['interests', 'observance']);
    expect(out.signals_not_used).toEqual([...WHY_MATCH_FORBIDDEN_SIGNALS]);
  });

  it('rejects output where signals_used contains a forbidden signal', () => {
    const bad = {
      reasons: ['ok 1', 'ok 2'],
      first_question: 'q',
      signals_used: ['interests', 'private_preferences'],
      signals_not_used: [],
      confidence: 0.5,
      evidence_label: 'HEURISTIC',
    };
    expect(() => outputValidators.validateWhyMatch(bad)).toThrow(/forbidden signal/);
  });

  it('drops unknown signal names silently from signals_used', () => {
    const out = outputValidators.validateWhyMatch({
      reasons: ['a', 'b'],
      first_question: 'q',
      signals_used: ['interests', 'something_unknown'],
      signals_not_used: [...WHY_MATCH_FORBIDDEN_SIGNALS],
      confidence: 0.5,
      evidence_label: 'HEURISTIC',
    });
    expect(out.signals_used).toEqual(['interests']);
  });
});

describe('WhyThisMatch — prompt template carries the allowlist', () => {
  it('embeds the user-supplied whitelisted signals into the prompt', () => {
    const prompt = PROMPT_TEMPLATES.WHY_MATCH({
      user_profile: { displayName: 'A' },
      candidate_profile: { displayName: 'B' },
      signals: ['interests', 'observance'],
    });
    expect(prompt).toContain('Whitelisted match signals');
    expect(prompt).toContain('schema_version');
    expect(prompt).toContain('signals_used');
    expect(prompt).toContain('signals_not_used');
    expect(prompt).toContain('evidence_label');
  });

  it('explicitly forbids the banned phrases in the prompt', () => {
    const prompt = PROMPT_TEMPLATES.WHY_MATCH({
      user_profile: {},
      candidate_profile: {},
      signals: [],
    });
    for (const phrase of BANNED_MATCH_PHRASES) {
      expect(prompt.toLowerCase()).toContain(phrase.toLowerCase());
    }
  });

  it('WHY_MATCH system instruction explicitly rules out hidden inference', () => {
    expect(SYSTEM_INSTRUCTIONS.WHY_MATCH).toMatch(/private taste profile/i);
    expect(SYSTEM_INSTRUCTIONS.WHY_MATCH).toMatch(/hidden ranking/i);
    expect(SYSTEM_INSTRUCTIONS.WHY_MATCH).toMatch(/perfect match/i);
    expect(SYSTEM_INSTRUCTIONS.WHY_MATCH).toMatch(/lens, not a verdict/i);
  });
});

describe('Message coach — rewrite-first, no autosend', () => {
  it('assertNonEmptyDraft throws on empty / whitespace input', () => {
    expect(() => assertNonEmptyDraft('')).toThrow(/non-empty user draft/i);
    expect(() => assertNonEmptyDraft('   ')).toThrow(/non-empty user draft/i);
    expect(() => assertNonEmptyDraft(undefined)).toThrow(/non-empty user draft/i);
    expect(() => assertNonEmptyDraft(null)).toThrow(/non-empty user draft/i);
  });

  it('assertNonEmptyDraft accepts a real draft', () => {
    expect(() => assertNonEmptyDraft('hi there')).not.toThrow();
  });

  it('aiService source does NOT define an autosend / sendOnBehalf function', () => {
    const path = resolve(__dirname, '..', 'services', 'aiService.ts');
    const src = readFileSync(path, 'utf-8');
    // Match identifier-form definitions only — avoids matching prose like
    // "auto-sending" inside comments.
    expect(src).not.toMatch(/\bautoSend\s*[(:=]/);
    expect(src).not.toMatch(/\bsendOnBehalf\s*[(:=]/);
    expect(src).not.toMatch(/\bsendMessage\s*[(:=]/);
    expect(src).not.toMatch(/\bsubmitMessage\s*[(:=]/);
  });

  it('aiService.coachMessage uses the pure draft guard', () => {
    const path = resolve(__dirname, '..', 'services', 'aiService.ts');
    const src = readFileSync(path, 'utf-8');
    expect(src).toContain('assertNonEmptyDraft(text)');
  });

  it('rephrase prompt instructs the model not to invent facts and not to autosend', () => {
    const p = PROMPT_TEMPLATES.REPHRASE_MESSAGE('hello');
    expect(p.toLowerCase()).toContain('never send');
    expect(p.toLowerCase()).toContain('do not invent');
    expect(p.toLowerCase()).toContain('what_changed');
  });

  it('MESSAGE_COACH system instruction forbids autosend and demands a draft', () => {
    expect(SYSTEM_INSTRUCTIONS.MESSAGE_COACH).toMatch(/never send/i);
    expect(SYSTEM_INSTRUCTIONS.MESSAGE_COACH).toMatch(/non-empty user draft/i);
  });

  it('rephrase feature declares safety flags as forbidden input', () => {
    const f = getFeatureById('rephrase_message')!;
    expect(f.excluded_data).toContain('safety_flags');
    expect(f.data_classes_forbidden).toContain(DATA_CLASS.SYSTEM_ONLY_SAFETY);
  });
});

describe('validateRephrase — structured output', () => {
  it('accepts a valid rephrase response', () => {
    const out = outputValidators.validateRephrase({
      options: ['hi there', 'hello!'],
      what_changed: 'softened tone',
    });
    expect(out.options.length).toBe(2);
  });

  it('rejects fewer than one option', () => {
    expect(() =>
      outputValidators.validateRephrase({ options: [], what_changed: 'x' })
    ).toThrow(/missing options/i);
  });

  it('rejects more than four options', () => {
    expect(() =>
      outputValidators.validateRephrase({
        options: ['a', 'b', 'c', 'd', 'e'],
        what_changed: 'x',
      })
    ).toThrow(/too many options/i);
  });

  it('rejects missing what_changed', () => {
    expect(() =>
      outputValidators.validateRephrase({ options: ['a', 'b'] })
    ).toThrow(/what_changed/i);
  });
});

describe('AI Trust Hub copy', () => {
  it('promises private taste profile stays private', () => {
    const all = [...TRUST_HUB_DOES, ...TRUST_HUB_RED_LINES, ...TRUST_HUB_CONTROLS].join(' ');
    expect(all.toLowerCase()).toMatch(/private taste profile/);
  });

  it('rules out compatibility / attractiveness scores', () => {
    const reds = TRUST_HUB_RED_LINES.join(' ').toLowerCase();
    expect(reds).toMatch(/compatibility score/);
    expect(reds).toMatch(/attractiveness/);
  });

  it('rules out AI sending messages on the user’s behalf', () => {
    const reds = TRUST_HUB_RED_LINES.join(' ').toLowerCase();
    expect(reds).toMatch(/auto-chatting|on your behalf/);
  });

  it('rules out sensitive identity inference from photos', () => {
    const reds = TRUST_HUB_RED_LINES.join(' ').toLowerCase();
    expect(reds).toMatch(/identity inference from photos/);
  });

  it('frames personality as a lens, not a verdict', () => {
    const does = TRUST_HUB_DOES.join(' ').toLowerCase();
    expect(does).toMatch(/personality is a lens/);
    expect(does).toMatch(/not a verdict/);
  });

  it('promises reset / delete controls', () => {
    const controls = TRUST_HUB_CONTROLS.join(' ').toLowerCase();
    expect(controls).toMatch(/reset/);
    expect(controls).toMatch(/delete/);
  });
});

describe('AI feature registry — no LLM personality scoring features', () => {
  it('does not contain a personality scoring feature', () => {
    const ids = AI_FEATURE_REGISTRY.map((f) => f.id);
    for (const id of ids) {
      expect(id.toLowerCase()).not.toMatch(/personality_score|attractiveness|compatibility_score/);
    }
  });
});

describe('Personality service', () => {
  it('reports the deterministic Kesher reflection as active', () => {
    expect(personalityService.getStatus()).toBe('active');
  });

  it('scores only the active Kesher reflection instrument', async () => {
    const record = await personalityService.submitInstrumentResponses({
      user_id: 'user-1',
      instrument_type: 'kesher_reflection',
      instrument_version: PERSONALITY_INSTRUMENT_VERSION,
      locale: 'he-IL',
      responses: Object.fromEntries(KESHER_PERSONALITY_ITEMS.map((item) => [item.id, 4])),
    });

    expect(record.instrument_type).toBe('kesher_reflection');
    expect(record.visibility_status).toBe('private');
    expect(record.score_metadata.complete).toBe(true);
    expect(record.score_metadata.response_vector_hash).toBeTruthy();
    expect(await personalityService.getRecord('user-1')).toEqual(record);
  });

  it('rejects unsupported personality instruments', async () => {
    await expect(
      personalityService.submitInstrumentResponses({
        instrument_type: 'bfi2',
        instrument_version: '1.0',
        locale: 'he-IL',
        responses: { q1: 3 },
      })
    ).rejects.toThrow(/unsupported personality instrument/i);
  });
});
