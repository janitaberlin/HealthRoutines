import { describe, expect, it } from 'vitest';
import { addDays, countDone, dateKey, mergeChecks, parseChecks, ratio, streak, toggle } from './tracker';

const ids = ['a', 'b'];

describe('tracker', () => {
  it('formatiert Datum lokal', () => {
    expect(dateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('rechnet über Monatsgrenzen', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('hakt an und wieder ab', () => {
    let c = toggle({}, '2026-10-18', 'a');
    expect(c).toEqual({ '2026-10-18': ['a'] });
    c = toggle(c, '2026-10-18', 'a');
    expect(c).toEqual({});
  });

  it('berechnet den Anteil', () => {
    expect(ratio({ '2026-10-18': ['a'] }, '2026-10-18', ids)).toBe(0.5);
    expect(ratio({}, '2026-10-18', [])).toBe(0);
  });

  it('zählt Serien, auch wenn heute noch offen ist', () => {
    const c = { '2026-10-16': ['a', 'b'], '2026-10-17': ['a', 'b'], '2026-10-18': ['a'] };
    expect(streak(c, '2026-10-18', ids)).toBe(2);
    expect(streak({ ...c, '2026-10-18': ['a', 'b'] }, '2026-10-18', ids)).toBe(3);
    expect(streak({ '2026-10-15': ['a', 'b'] }, '2026-10-18', ids)).toBe(0);
  });

  it('zählt erledigte Tage im Zeitraum', () => {
    const c = { '2026-10-18': ['a'], '2026-10-12': ['a'], '2026-10-11': ['a'] };
    expect(countDone(c, '2026-10-18', 'a', 7)).toBe(2);
  });

  it('liest Daten robust ein', () => {
    expect(parseChecks('kaputt')).toEqual({});
    expect(parseChecks('[1]')).toEqual({});
    expect(parseChecks('{"2026-10-18":["a",3],"x":["b"]}')).toEqual({ '2026-10-18': ['a'] });
  });

  it('führt Stände zusammen', () => {
    expect(mergeChecks({ d: ['a'] }, { d: ['a', 'b'], e: ['c'] })).toEqual({ d: ['a', 'b'], e: ['c'] });
  });
});
