import { describe, expect, it } from 'vitest';
import { parseReflections, weekLabel, weekStart } from './reflection';

describe('reflection', () => {
  it('findet den Montag der Woche', () => {
    expect(weekStart('2026-10-20')).toBe('2026-10-19');
    expect(weekStart('2026-10-25')).toBe('2026-10-19');
    expect(weekStart('2026-10-19')).toBe('2026-10-19');
  });

  it('beschriftet die Woche', () => {
    expect(weekLabel('2026-10-19')).toBe('19.–25. Okt.');
    expect(weekLabel('2026-10-26')).toBe('26. Okt. – 1. Nov.');
  });

  it('liest gespeicherte Antworten robust', () => {
    const r = parseReflections({ '2026-10-19': { become: 'mutiger', outcome: 3 }, quatsch: { become: 'x' }, '2026-10-12': { become: '' } });
    expect(r).toEqual({ '2026-10-19': { become: 'mutiger', outcome: '' } });
    expect(parseReflections('kaputt')).toEqual({});
  });
});
