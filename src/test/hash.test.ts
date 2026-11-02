import { describe, expect, it } from 'vitest';
import { fnv1a, jitter, mulberry32, pickOne, random, shuffle } from '../domain/hash';

describe('hash', () => {
  it('is deterministic for the same input', () => {
    expect(fnv1a('2026-11-02|claude-sonnet-5-5')).toBe(fnv1a('2026-11-02|claude-sonnet-5-5'));
  });

  it('pins the fnv1a value used as the product seed', () => {
    expect(fnv1a('2026-11-02|claude-sonnet-5-5')).toBe(219022959);
  });

  it('changes for different input', () => {
    expect(fnv1a('2026-11-02')).not.toBe(fnv1a('2026-11-03'));
  });

  it('produces numbers in range', () => {
    for (let i = 0; i < 100; i += 1) {
      expect(random(`seed-${i}`)).toBeGreaterThanOrEqual(0);
      expect(random(`seed-${i}`)).toBeLessThan(1);
    }
  });

  it('keeps jitter and shuffle stable', () => {
    expect(jitter('x', -6, 6)).toBe(jitter('x', -6, 6));
    expect(jitter('x', -6, 6)).toBeGreaterThanOrEqual(-6);
    expect(jitter('x', -6, 6)).toBeLessThanOrEqual(6);
    expect(shuffle('x', [1, 2, 3, 4])).toEqual(shuffle('x', [1, 2, 3, 4]));
  });

  it('picks an item from the array', () => {
    expect(['a', 'b', 'c']).toContain(pickOne('seed', ['a', 'b', 'c']));
  });

  it('exposes a deterministic sequence', () => {
    const first = mulberry32(123);
    const second = mulberry32(123);
    expect([first(), first(), first()]).toEqual([second(), second(), second()]);
  });
});
