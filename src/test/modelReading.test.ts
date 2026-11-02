import { describe, expect, it } from 'vitest';
import { DEFAULT_MODEL_ID, MODELS } from '../domain/models';
import { generateModelReading } from '../domain/modelReading';

describe('generateModelReading', () => {
  it('produces a valid reading for every model', () => {
    for (const model of MODELS) {
      const reading = generateModelReading('2026-11-02', model.id);
      expect(reading.model.id).toBe(model.id);
      expect(reading.categories).toHaveLength(4);
      expect(['宜', '平', '忌']).toContain(reading.overall.verdict);
      expect(reading.overall.score).toBeGreaterThanOrEqual(0);
      expect(reading.overall.score).toBeLessThanOrEqual(100);
      expect(reading.alternatives).toHaveLength(3);
      expect(reading.alternatives.every((item) => item.model.id !== model.id)).toBe(true);
      expect(reading.judgment.length).toBeGreaterThan(0);
      expect(reading.verdictText.length).toBeGreaterThan(0);
    }
  });

  it('falls back to the default model for invalid ids', () => {
    const reading = generateModelReading('2026-11-02', 'missing');
    expect(reading.model.id).toBe(DEFAULT_MODEL_ID);
  });

  it('is deterministic', () => {
    expect(generateModelReading('2026-11-02', 'claude-sonnet-5-5')).toEqual(
      generateModelReading('2026-11-02', 'claude-sonnet-5-5'),
    );
  });

  it('names the best 宜 category in the verdict text', () => {
    const reading = generateModelReading('2026-11-02', 'claude-opus-5-5');
    const yiCategory = [...reading.categories]
      .filter((category) => category.verdict === '宜')
      .sort((a, b) => b.score - a.score)[0];
    expect(reading.overall.verdict).toBe('宜');
    expect(reading.verdictText).toContain(yiCategory.label);
  });
});
