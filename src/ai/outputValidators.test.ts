import { describe, it, expect } from 'vitest';
import { outputValidators } from './outputValidators';

describe('outputValidators', () => {
  describe('validateBioCoach', () => {
    it('accepts valid output with drafts array', () => {
      const input = { drafts: ['Draft 1', 'Draft 2'] };
      expect(outputValidators.validateBioCoach(input)).toBe(input);
    });

    it('rejects null output', () => {
      expect(() => outputValidators.validateBioCoach(null)).toThrow('missing drafts array');
    });

    it('rejects output without drafts', () => {
      expect(() => outputValidators.validateBioCoach({ text: 'hello' })).toThrow('missing drafts array');
    });

    it('rejects output where drafts is not an array', () => {
      expect(() => outputValidators.validateBioCoach({ drafts: 'not an array' })).toThrow('missing drafts array');
    });
  });

  describe('validateTasteProfile', () => {
    it('accepts valid output with weights', () => {
      const input = { weights: { values_vs_lifestyle: 0.7 } };
      expect(outputValidators.validateTasteProfile(input)).toBe(input);
    });

    it('rejects null output', () => {
      expect(() => outputValidators.validateTasteProfile(null)).toThrow('missing weights');
    });

    it('rejects output without weights object', () => {
      expect(() => outputValidators.validateTasteProfile({ score: 5 })).toThrow('missing weights');
    });

    it('rejects output where values_vs_lifestyle is not a number', () => {
      expect(() => outputValidators.validateTasteProfile({ weights: { values_vs_lifestyle: 'high' } })).toThrow('missing weights');
    });
  });

  describe('validateWhyMatch', () => {
    it('accepts valid output with reasons array', () => {
      const input = { reasons: ['Shared values', 'Same city'] };
      expect(outputValidators.validateWhyMatch(input)).toBe(input);
    });

    it('rejects null output', () => {
      expect(() => outputValidators.validateWhyMatch(null)).toThrow('missing reasons array');
    });

    it('rejects output without reasons', () => {
      expect(() => outputValidators.validateWhyMatch({ explanation: 'text' })).toThrow('missing reasons array');
    });

    it('rejects output where reasons is not an array', () => {
      expect(() => outputValidators.validateWhyMatch({ reasons: 'single reason' })).toThrow('missing reasons array');
    });
  });

  describe('validateSafetyScan', () => {
    it('accepts valid output with risk_level', () => {
      const input = { risk_level: 'low', flags: [] };
      expect(outputValidators.validateSafetyScan(input)).toBe(input);
    });

    it('rejects null output', () => {
      expect(() => outputValidators.validateSafetyScan(null)).toThrow('missing risk_level');
    });

    it('rejects output without risk_level', () => {
      expect(() => outputValidators.validateSafetyScan({ score: 0 })).toThrow('missing risk_level');
    });
  });

  describe('validateDatePlanner', () => {
    it('accepts valid output with venues array', () => {
      const input = { venues: [{ name: 'Cafe', address: '123 St' }] };
      expect(outputValidators.validateDatePlanner(input)).toBe(input);
    });

    it('rejects null output', () => {
      expect(() => outputValidators.validateDatePlanner(null)).toThrow('missing venues array');
    });

    it('rejects output without venues', () => {
      expect(() => outputValidators.validateDatePlanner({ suggestions: [] })).toThrow('missing venues array');
    });

    it('rejects output where venues is not an array', () => {
      expect(() => outputValidators.validateDatePlanner({ venues: 'one venue' })).toThrow('missing venues array');
    });
  });

  describe('validateProfileCompleteness', () => {
    it('accepts valid output with completeness_score', () => {
      const input = { completeness_score: 85, suggestions: [] };
      expect(outputValidators.validateProfileCompleteness(input)).toBe(input);
    });

    it('accepts zero score', () => {
      const input = { completeness_score: 0 };
      expect(outputValidators.validateProfileCompleteness(input)).toBe(input);
    });

    it('rejects null output', () => {
      expect(() => outputValidators.validateProfileCompleteness(null)).toThrow('missing score');
    });

    it('rejects output without completeness_score', () => {
      expect(() => outputValidators.validateProfileCompleteness({ score: 85 })).toThrow('missing score');
    });

    it('rejects output where completeness_score is not a number', () => {
      expect(() => outputValidators.validateProfileCompleteness({ completeness_score: 'high' })).toThrow('missing score');
    });
  });
});
