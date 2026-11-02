import { describe, expect, it, vi } from 'vitest';
import {
  MAX_DATE,
  MIN_DATE,
  addDays,
  isTodayKey,
  isWeekendKey,
  monthEn,
  monthZh,
  normalizeDateKey,
  parseDateKey,
  toDateKey,
  todayKey,
  weekdayEn,
  weekdayZh,
} from '../domain/date';

describe('date', () => {
  it('formats a local date key', () => {
    expect(toDateKey(new Date(2026, 10, 2))).toBe('2026-11-02');
  });

  it('parses valid keys and rejects impossible dates', () => {
    expect(parseDateKey('2026-11-02')).not.toBeNull();
    expect(parseDateKey('2026-02-31')).toBeNull();
    expect(parseDateKey('2026-1-2')).toBeNull();
  });

  it('normalizes missing and out-of-range values', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 2, 12, 0, 0));
    expect(normalizeDateKey(null)).toBe('2026-11-02');
    expect(normalizeDateKey('bad')).toBe('2026-11-02');
    expect(normalizeDateKey('1800-01-01')).toBe(MIN_DATE);
    expect(normalizeDateKey('2200-01-01')).toBe(MAX_DATE);
    vi.useRealTimers();
  });

  it('adds days across month and year boundaries', () => {
    expect(addDays('2026-11-30', 1)).toBe('2026-12-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
  });

  it('knows today and weekends', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 2, 12, 0, 0));
    expect(todayKey()).toBe('2026-11-02');
    expect(isTodayKey('2026-11-02')).toBe(true);
    expect(isTodayKey('2026-11-03')).toBe(false);
    vi.useRealTimers();
    expect(isWeekendKey('2026-11-02')).toBe(false);
    expect(isWeekendKey('2026-11-08')).toBe(true);
  });

  it('formats weekdays and months', () => {
    expect(weekdayZh('2026-11-02')).toBe('星期一');
    expect(weekdayEn('2026-11-02')).toBe('MONDAY');
    expect(monthZh('2026-11-02')).toBe('十一月');
    expect(monthEn('2026-11-02')).toBe('NOVEMBER');
  });
});
