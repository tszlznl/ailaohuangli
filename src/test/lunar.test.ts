import { describe, expect, it } from 'vitest';
import { getElement, readLunar } from '../domain/lunar';

describe('lunar', () => {
  it('reads the design reference date', () => {
    const lunar = readLunar('2026-11-02');
    expect(lunar.yearGanZhi).toBe('丙午');
    expect(lunar.monthInChinese).toBe('九');
    expect(lunar.dayInChinese).toBe('廿四');
    expect(lunar.naYin).toContain('金');
    expect(lunar.tianShenType).toBe('黄道');
    expect(lunar.hijri?.latin).toMatch(/\d{4}$/);
  });

  it('reads the weekend reference date', () => {
    const lunar = readLunar('2026-11-08');
    expect(lunar.dayInChinese).toBe('三十');
  });

  it('maps nayin to an element and suffix', () => {
    expect(getElement('白蜡金')).toEqual({ name: '金', suffix: '算力旺' });
    expect(getElement('屋上土')).toEqual({ name: '土', suffix: '缓存稳' });
  });
});
