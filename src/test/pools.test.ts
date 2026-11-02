import { describe, expect, it } from 'vitest';
import {
  ACTIVITIES,
  APHORISMS,
  BRANCHES,
  CLASHES,
  DEITIES,
  FORTUNE_LABELS,
  JI_BY_TRAIT,
  JI_DAILY,
  TABOOS,
  YI_BY_TRAIT,
  YI_DAILY,
  getActivity,
} from '../domain/pools';

describe('pools', () => {
  it('has complete day copy pools', () => {
    expect(DEITIES).toHaveLength(8);
    expect(CLASHES).toHaveLength(6);
    expect(TABOOS).toHaveLength(6);
    expect(FORTUNE_LABELS).toHaveLength(4);
    expect(APHORISMS.length).toBeGreaterThanOrEqual(10);
  });

  it('has two-character daily word pools', () => {
    expect(YI_DAILY.length).toBeGreaterThanOrEqual(6);
    expect(JI_DAILY.length).toBeGreaterThanOrEqual(6);
    for (const term of [...YI_DAILY, ...JI_DAILY]) {
      expect([...term]).toHaveLength(2);
    }
  });

  it('has two-character words for every trait', () => {
    expect(Object.keys(YI_BY_TRAIT)).toHaveLength(7);
    expect(Object.keys(JI_BY_TRAIT)).toHaveLength(7);
    for (const term of [
      ...Object.values(YI_BY_TRAIT).flat(),
      ...Object.values(JI_BY_TRAIT).flat(),
    ]) {
      expect([...term]).toHaveLength(2);
    }
  });

  it('has 12 branches in order', () => {
    expect(BRANCHES.map((branch) => branch.branch)).toEqual([
      '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥',
    ]);
  });

  it('has 5 activities with 12 weights each', () => {
    expect(ACTIVITIES).toHaveLength(5);
    for (const activity of ACTIVITIES) {
      expect(activity.weights).toHaveLength(12);
      expect(activity.yi.length).toBeGreaterThan(0);
      expect(activity.ji.length).toBeGreaterThan(0);
    }
  });

  it('falls back to the release activity', () => {
    expect(getActivity('missing').id).toBe('release');
  });
});
