import { describe, expect, it } from 'vitest';
import { formatClock, formatHours, formatMinutes, mergeSessions, minutesByDay, parseSessions, totals, weekDays, weekStart } from './time';

const at = (d: number, h: number, m = 0) => new Date(2026, 9, d, h, m).getTime();

describe('time', () => {
  it('findet den Montag', () => {
    expect(weekStart('2026-10-18')).toBe('2026-10-12'); // Sonntag
    expect(weekStart('2026-10-12')).toBe('2026-10-12');
    expect(weekDays('2026-10-12')).toHaveLength(7);
  });

  it('summiert pro Tag und teilt über Mitternacht', () => {
    const sessions = [
      { id: '1', cat: 'business' as const, start: at(13, 9), end: at(13, 11, 30) },
      { id: '2', cat: 'job' as const, start: at(13, 23), end: at(14, 1) },
    ];
    const byDay = minutesByDay(sessions, ['2026-10-13', '2026-10-14']);
    expect(byDay['2026-10-13']).toEqual({ business: 150, job: 60 });
    expect(byDay['2026-10-14']).toEqual({ business: 0, job: 60 });
    expect(totals(sessions, weekDays('2026-10-12'))).toEqual({ business: 150, job: 120 });
  });

  it('formatiert Zeiten', () => {
    expect(formatMinutes(45)).toBe('45 Min.');
    expect(formatMinutes(125)).toBe('2 Std. 05 Min.');
    expect(formatClock(3_909_000)).toBe('1:05:09');
    expect(formatHours(726)).toBe('12:06 Std.');
  });

  it('liest Einträge robust ein und führt sie zusammen', () => {
    expect(parseSessions('kaputt')).toEqual([]);
    const ok = { id: 'a', cat: 'job', start: 1, end: 2 };
    expect(parseSessions(JSON.stringify([ok, { ...ok, cat: 'x' }, { ...ok, end: 0 }]))).toEqual([ok]);
    expect(mergeSessions([ok as never], [ok as never, { ...ok, id: 'b' } as never])).toHaveLength(2);
  });
});
