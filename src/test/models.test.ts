import { describe, expect, it } from 'vitest';
import { DEFAULT_MODEL_ID, MODELS, getModelById, getModelGroups } from '../domain/models';

describe('models', () => {
  it('contains 34 unique models', () => {
    expect(MODELS).toHaveLength(34);
    expect(new Set(MODELS.map((model) => model.id)).size).toBe(34);
    expect(new Set(MODELS.map((model) => model.name)).size).toBe(34);
  });

  it('has valid traits and statuses', () => {
    for (const model of MODELS) {
      for (const value of Object.values(model.traits)) {
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(5);
      }
      expect(['ga', 'preview']).toContain(model.status);
    }
  });

  it('resolves the default model', () => {
    expect(getModelById(DEFAULT_MODEL_ID)?.name).toBe('Claude Sonnet 5.5');
    expect(getModelById('missing')).toBeUndefined();
  });

  it('groups models by vendor without empty groups', () => {
    const groups = getModelGroups();
    expect(groups).toHaveLength(18);
    for (const group of groups) {
      expect(group.models.length).toBeGreaterThan(0);
    }
    expect(groups.reduce((sum, group) => sum + group.models.length, 0)).toBe(34);
  });
});
