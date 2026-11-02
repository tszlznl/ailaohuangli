import { describe, expect, it } from 'vitest';
import { CATEGORY_DEFS, getBestCategory, getLowTrait, getTopTrait, scoreCategory, scoreModel, verdictForScore } from '../domain/scoring';
import { getModelById } from '../domain/models';

const sonnet = getModelById('claude-sonnet-5-5')!;

describe('scoring', () => {
  it('uses thresholds 75/60', () => {
    expect(verdictForScore(75)).toBe('宜');
    expect(verdictForScore(74)).toBe('平');
    expect(verdictForScore(60)).toBe('平');
    expect(verdictForScore(59)).toBe('忌');
  });

  it('keeps category weights normalized', () => {
    for (const def of CATEGORY_DEFS) {
      const sum = Object.values(def.weights).reduce((total, value) => total + value, 0);
      expect(sum).toBeCloseTo(1);
    }
  });

  it('scores four categories and an overall value', () => {
    const score = scoreModel(sonnet, '2026-11-02');
    expect(score.categories).toHaveLength(4);
    expect(score.overall).toBeGreaterThanOrEqual(0);
    expect(score.overall).toBeLessThanOrEqual(100);
    for (const category of score.categories) {
      expect(category.score).toBeGreaterThanOrEqual(0);
      expect(category.score).toBeLessThanOrEqual(100);
    }
  });

  it('is deterministic', () => {
    expect(scoreCategory(sonnet, 'code', '2026-11-02')).toBe(scoreCategory(sonnet, 'code', '2026-11-02'));
    expect(scoreModel(sonnet, '2026-11-02')).toEqual(scoreModel(sonnet, '2026-11-02'));
  });

  it('finds the best category and strongest/weakest traits', () => {
    const score = scoreModel(sonnet, '2026-11-02');
    expect(score.categories).toContain(getBestCategory(score.categories));
    expect(getTopTrait(sonnet)).toBe('writing');
    expect(getLowTrait(sonnet)).toBe('value');
  });
});
