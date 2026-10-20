import { describe, expect, it } from 'vitest';
import { parseUsage, recordUse, trackedSince, usageDays } from './usage';

describe('usage', () => {
  it('zählt Bereiche pro Tag nur einmal', () => {
    let u = recordUse({}, '2026-10-20', 'zyklus');
    u = recordUse(u, '2026-10-20', 'zyklus');
    u = recordUse(u, '2026-10-19', 'zyklus');
    u = recordUse(u, '2026-09-01', 'zyklus');
    u = recordUse(u, '2026-10-20', 'heute');
    const d = usageDays(u, '2026-10-20');
    expect(d.zyklus).toBe(2);
    expect(d.heute).toBe(1);
    expect(d.compass).toBe(0);
    expect(trackedSince(u)).toBe('2026-09-01');
  });

  it('liest gespeicherte Daten robust', () => {
    expect(parseUsage({ '2026-10-20': ['heute', 3], bad: ['x'] })).toEqual({ '2026-10-20': ['heute'] });
    expect(parseUsage('kaputt')).toEqual({});
  });
});
