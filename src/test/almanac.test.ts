import { describe, expect, it } from 'vitest';
import { generateAlmanac } from '../domain/almanac';

describe('generateAlmanac', () => {
  it('builds the reference weekday almanac', () => {
    const almanac = generateAlmanac('2026-11-02');
    expect(almanac.lunar.text).toContain('丙午');
    expect(almanac.lunar.text).toContain('九月廿四');
    expect(almanac.element.name).toBe('金');
    expect(almanac.theme).toBe('green');
    expect(almanac.isWeekend).toBe(false);
    for (const panel of [almanac.yi, almanac.ji]) {
      expect(panel.items.length).toBeGreaterThanOrEqual(3);
      expect(panel.items.length).toBeLessThanOrEqual(6);
      expect(new Set(panel.items).size).toBe(panel.items.length);
      for (const item of panel.items) {
        expect([...item]).toHaveLength(2);
      }
    }
    expect(almanac.yi.headline).toContain('Claude Opus 5.5');
    expect(almanac.ji.headline).toContain('Kimi K2.7 Code');
    expect(almanac.yi.items.slice(0, 2)).toEqual(['推理', '编码']);
    expect(almanac.ji.items.slice(0, 2)).toEqual(['硬写', '盲查']);
    expect(almanac.fortunes).toHaveLength(4);
    for (const fortune of almanac.fortunes) {
      expect(fortune.stars).toBeGreaterThanOrEqual(1);
      expect(fortune.stars).toBeLessThanOrEqual(5);
      expect(fortune.note.length).toBeGreaterThan(0);
    }
  });

  it('is deterministic for the same date', () => {
    expect(generateAlmanac('2026-11-02')).toEqual(generateAlmanac('2026-11-02'));
  });

  it('uses the red theme on weekends', () => {
    const almanac = generateAlmanac('2026-11-08');
    expect(almanac.theme).toBe('red');
    expect(almanac.isWeekend).toBe(true);
  });

  it('changes content across dates', () => {
    const first = generateAlmanac('2026-11-02');
    const second = generateAlmanac('2026-11-03');
    expect(first.yi.items).not.toEqual(second.yi.items);
  });

  it('varies the daily group size between three and six', () => {
    const sizes = new Set(
      ['2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06', '2026-11-07'].map(
        (dateKey) => generateAlmanac(dateKey).yi.items.length,
      ),
    );
    expect(sizes.size).toBeGreaterThan(1);
  });
});
