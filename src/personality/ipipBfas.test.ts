import { describe, expect, it } from 'vitest';
import {
  IPIP_BFAS_ITEMS,
  IPIP_BFAS_SCORING_VERSION,
  canScoreIpipBfasLocale,
  scoreIpipBfasResponses,
} from './ipipBfas';

const responses = (value: number) =>
  Object.fromEntries(IPIP_BFAS_ITEMS.map((item) => [item.id, value]));

describe('IPIP-BFAS 100 scoring', () => {
  it('ships the full English IPIP-BFAS 100 item bank with five domains and ten aspects', () => {
    expect(IPIP_BFAS_ITEMS).toHaveLength(100);
    expect(new Set(IPIP_BFAS_ITEMS.map((item) => item.domain))).toEqual(
      new Set(['Neuroticism', 'Agreeableness', 'Conscientiousness', 'Extraversion', 'Openness']),
    );
    expect(new Set(IPIP_BFAS_ITEMS.map((item) => item.aspect))).toEqual(
      new Set([
        'Volatility',
        'Withdrawal',
        'Compassion',
        'Politeness',
        'Industriousness',
        'Orderliness',
        'Enthusiasm',
        'Assertiveness',
        'Intellect',
        'Openness',
      ]),
    );
    expect(IPIP_BFAS_ITEMS.filter((item) => item.keyed === '-')).toHaveLength(46);
  });

  it('reverse-keys negative items before aspect and domain aggregation', () => {
    const result = scoreIpipBfasResponses({
      ...responses(3),
      ipip_bfas_001: 5,
      ipip_bfas_007: 5,
    });

    expect(result.itemScores.ipip_bfas_001).toBe(5);
    expect(result.itemScores.ipip_bfas_007).toBe(1);
    expect(result.aspectScores.Volatility.rawAverage).toBeCloseTo(3, 5);
    expect(result.domainScores.Neuroticism.rawAverage).toBeCloseTo(3, 5);
  });

  it('returns display bands and evidence labels instead of exposing public raw score claims', () => {
    const result = scoreIpipBfasResponses(responses(4));

    expect(result.instrumentType).toBe('ipip_bfas_100');
    expect(result.scoringVersion).toBe(IPIP_BFAS_SCORING_VERSION);
    expect(result.evidenceLabel).toBe('HEURISTIC');
    expect(result.complete).toBe(true);
    expect(result.domainBands.Openness).toMatchObject({
      band: 'mid',
      tendency: expect.stringContaining('tendency'),
    });
  });

  it('flags incomplete and straightlined response sets', () => {
    const incomplete = responses(3);
    delete incomplete.ipip_bfas_100;

    expect(scoreIpipBfasResponses(incomplete).qualityFlags).toContain('incomplete');
    expect(scoreIpipBfasResponses(responses(3)).qualityFlags).toContain('straightlining');
  });

  it('keeps Hebrew scoring disabled until localization validation is complete', () => {
    expect(canScoreIpipBfasLocale('en-US')).toBe(true);
    expect(canScoreIpipBfasLocale('he-IL')).toBe(false);
  });
});
