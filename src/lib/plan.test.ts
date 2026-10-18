import { describe, expect, it } from 'vitest';
import { schedule } from '../data/schedule';
import { isWeekend, minutesLeft, planAt } from './plan';

const at = (h: number, m = 0) => new Date(2026, 9, 19, h, m); // Montag

describe('plan', () => {
  it('findet den aktuellen und nächsten Block', () => {
    expect(planAt(schedule, at(10)).current?.title).toBe('Creation');
    expect(planAt(schedule, at(10)).next?.title).toBe('Walk');
    expect(planAt(schedule, at(16, 45)).current).toBeNull();
    expect(planAt(schedule, at(16, 45)).next?.title).toBe('Home & Love');
    expect(planAt(schedule, at(23)).next).toBeNull();
  });

  it('rechnet die Restzeit', () => {
    expect(minutesLeft(schedule[1], at(11, 15))).toBe(45);
  });

  it('erkennt das Wochenende', () => {
    expect(isWeekend(new Date(2026, 9, 18))).toBe(true);
    expect(isWeekend(at(9))).toBe(false);
  });
});
