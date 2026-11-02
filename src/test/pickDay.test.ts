import { describe, expect, it } from 'vitest';
import { ACTIVITIES } from '../domain/pools';
import { generatePickDay } from '../domain/pickDay';

const ORDER = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

describe('generatePickDay', () => {
  it('always produces 3 吉, 4 平 and 5 凶', () => {
    for (const activity of ACTIVITIES) {
      const reading = generatePickDay('2026-11-02', activity.id);
      const counts = reading.hours.reduce<Record<string, number>>(
        (result, hour) => {
          result[hour.verdict] = (result[hour.verdict] ?? 0) + 1;
          return result;
        },
        { 吉: 0, 平: 0, 凶: 0 },
      );
      expect(counts).toEqual({ 吉: 3, 平: 4, 凶: 5 });
      expect(reading.best).toHaveLength(2);
      expect(reading.worst).toHaveLength(2);
      expect(reading.hours.map((hour) => hour.branch)).toEqual(ORDER);
      expect(reading.yi.length).toBeGreaterThan(0);
      expect(reading.ji.length).toBeGreaterThan(0);
    }
  });

  it('falls back to release for unknown activities', () => {
    expect(generatePickDay('2026-11-02', 'missing').activity.id).toBe('release');
  });

  it('is deterministic', () => {
    expect(generatePickDay('2026-11-02', 'release')).toEqual(
      generatePickDay('2026-11-02', 'release'),
    );
  });

  it('keeps best and worst consistent with verdicts', () => {
    const reading = generatePickDay('2026-11-02', 'release');
    expect(reading.best.every((hour) => hour.verdict === '吉')).toBe(true);
    expect(reading.worst.every((hour) => hour.verdict === '凶')).toBe(true);
    expect(reading.summary).toContain('最宜');
    expect(reading.summary).toContain('大忌');
  });
});
