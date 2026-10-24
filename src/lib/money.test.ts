import { describe, expect, it } from 'vitest';
import { formatEuro, parseAmount, parseMoney, progress } from './money';

describe('money', () => {
  it('liest Beträge', () => {
    expect(parseAmount('1000 €')).toBe(1000);
    expect(parseAmount('1.000')).toBe(1000);
    expect(parseAmount('1.250,50 Euro')).toBe(1250.5);
    expect(parseAmount('abc')).toBeNull();
    expect(parseAmount('')).toBeNull();
  });

  it('schreibt Beträge', () => {
    expect(formatEuro(1000)).toBe('1.000 €');
    expect(formatEuro(99.5)).toBe('99,50 €');
    expect(formatEuro(1234567)).toBe('1.234.567 €');
  });

  it('rechnet den Fortschritt und prüft gespeicherte Daten', () => {
    expect(progress({ goal: 1000, reached: 500, locked: true })).toBe(0.5);
    expect(progress({ goal: 1000, reached: 1500, locked: true })).toBe(1);
    expect(progress({ goal: 1000, reached: null, locked: true })).toBe(0);
    expect(parseMoney({ '2026-10-26': { goal: 1000, reached: null, locked: true }, x: { goal: 1 }, '2026-10-19': { goal: 'a' } })).toEqual({
      '2026-10-26': { goal: 1000, reached: null, locked: true },
    });
  });
});
