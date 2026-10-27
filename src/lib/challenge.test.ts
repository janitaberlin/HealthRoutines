import { describe, expect, it } from 'vitest';
import { challenges } from '../data/challenge';
import { LENGTH, dayDate, dayNumber, doneCount, parseChallenge, totalEarned } from './challenge';

describe('challenge', () => {
  it('hat für jeden Tag eine Aufgabe', () => {
    expect(challenges).toHaveLength(LENGTH);
  });

  it('zählt die Tage ab dem Start', () => {
    expect(dayNumber('2026-11-01', '2026-10-27')).toBe(-4);
    expect(dayNumber('2026-11-01', '2026-11-01')).toBe(1);
    expect(dayNumber('2026-11-01', '2026-11-30')).toBe(30);
    expect(dayDate('2026-11-01', 30)).toBe('2026-11-30');
  });

  it('summiert und prüft gespeicherte Daten', () => {
    const c = parseChallenge({ goal: 3000, locked: true, days: { 1: { done: true, earned: 200 }, 2: { done: false, earned: 50.5 }, 31: { done: true }, x: {} } });
    expect(Object.keys(c.days)).toEqual(['1', '2']);
    expect(totalEarned(c)).toBe(250.5);
    expect(doneCount(c)).toBe(1);
    expect(parseChallenge({ locked: true }).locked).toBe(false);
  });
});
