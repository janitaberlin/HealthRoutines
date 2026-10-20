import { describe, expect, it } from 'vitest';
import { addDays } from './tracker';
import { cycleLength, dayInfo, energyByPhase, mergeCycle, parseCycle, periodStarts, setEnergy, togglePeriod } from './cycle';

const run = (start: string, days: number) => Array.from({ length: days }, (_, i) => addDays(start, i));

describe('cycle', () => {
  it('liest gespeicherte Daten robust', () => {
    const c = parseCycle({ periods: ['2026-10-01', 'x', '2026-10-01'], energy: { '2026-10-02': 3, '2026-10-03': 9, bad: 2 } });
    expect(c.periods).toEqual(['2026-10-01']);
    expect(c.energy).toEqual({ '2026-10-02': 3 });
    expect(parseCycle('kaputt')).toEqual({ periods: [], energy: {} });
  });

  it('findet Periodenstarts und Zykluslänge', () => {
    const periods = [...run('2026-08-01', 5), ...run('2026-08-31', 4), ...run('2026-09-30', 5)];
    expect(periodStarts(periods)).toEqual(['2026-08-01', '2026-08-31', '2026-09-30']);
    expect(cycleLength(periods)).toBe(30);
    expect(cycleLength([])).toBe(28);
  });

  it('schätzt Zyklustag und Phase', () => {
    const data = { periods: run('2026-10-01', 4), energy: {} };
    expect(dayInfo(data, '2026-09-30')).toBeNull();
    expect(dayInfo(data, '2026-10-03')).toEqual({ cycleDay: 3, phase: 'periode' });
    expect(dayInfo(data, '2026-10-05')).toEqual({ cycleDay: 5, phase: 'follikel' });
    expect(dayInfo(data, '2026-10-14')).toEqual({ cycleDay: 14, phase: 'eisprung' });
    expect(dayInfo(data, '2026-10-20')).toEqual({ cycleDay: 20, phase: 'luteal' });
  });

  it('nimmt 5 Periodentage an, wenn nur der erste eingetragen ist', () => {
    const data = { periods: ['2026-10-01'], energy: {} };
    expect(dayInfo(data, '2026-10-05')?.phase).toBe('periode');
    expect(dayInfo(data, '2026-10-06')?.phase).toBe('follikel');
  });

  it('rechnet Energie je Phase und schaltet Einträge um', () => {
    let data = togglePeriod({ periods: [], energy: {} }, '2026-10-01');
    data = setEnergy(data, '2026-10-02', 1);
    data = setEnergy(data, '2026-10-03', 2);
    data = setEnergy(data, '2026-10-20', 5);
    const avg = energyByPhase(data);
    expect(avg.periode).toEqual({ avg: 1.5, days: 2 });
    expect(avg.luteal).toEqual({ avg: 5, days: 1 });
    expect(setEnergy(data, '2026-10-20', 5).energy['2026-10-20']).toBeUndefined();
    expect(togglePeriod(data, '2026-10-01').periods).toEqual([]);
    expect(mergeCycle(data, { periods: ['2026-11-01'], energy: { '2026-10-02': 4 } }).energy['2026-10-02']).toBe(1);
  });
});
