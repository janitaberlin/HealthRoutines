import { addDays, parseKey } from './tracker';

/** Zyklus: Periodentage und Energie (1 total low … 5 total high) pro Datum. */
export interface CycleData {
  periods: string[];
  energy: Record<string, number>;
}

export type Phase = 'periode' | 'follikel' | 'eisprung' | 'luteal';

/** Tipps als Orientierung im Sinne von Cycle Syncing, keine medizinische Aussage; die eigene Energie zählt mehr. */
export const PHASES: { id: Phase; label: string; tip: string }[] = [
  { id: 'periode', label: 'Periode', tip: 'Tempo rausnehmen: sanfte Bewegung wie Spazieren oder Yoga, Wärme, früher ins Bett. Gute Zeit für Rückblick und Planen statt großer Projekte.' },
  { id: 'follikel', label: 'Follikelphase', tip: 'Viele spüren jetzt steigende Energie: Raum für Neues, Ideen, Konzepte und kraftvolleres Training.' },
  { id: 'eisprung', label: 'Eisprung', tip: 'Oft die sichtbarste Zeit: Calls, Videos, Präsentationen und wichtige Gespräche hierhin legen.' },
  { id: 'luteal', label: 'Lutealphase', tip: 'Zu Ende bringen statt neu starten: Details, Aufräumen, Routinen. Gegen Ende mehr Pausen und Ruhe einplanen.' },
];

export const ENERGY = ['Total low', 'Low', 'Okay', 'High', 'Total high'];

const DEFAULT_LENGTH = 28;
const DEFAULT_BLEEDING = 5;
const KEY = /^\d{4}-\d{2}-\d{2}$/;

export function emptyCycle(): CycleData {
  return { periods: [], energy: {} };
}

export function parseCycle(raw: unknown): CycleData {
  const out = emptyCycle();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
  const r = raw as Record<string, unknown>;
  if (Array.isArray(r.periods)) out.periods = [...new Set(r.periods.filter((d): d is string => typeof d === 'string' && KEY.test(d)))].sort();
  if (r.energy && typeof r.energy === 'object' && !Array.isArray(r.energy)) {
    for (const [d, v] of Object.entries(r.energy as Record<string, unknown>)) {
      if (KEY.test(d) && typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= 5) out.energy[d] = v;
    }
  }
  return out;
}

export function mergeCycle(a: CycleData, b: CycleData): CycleData {
  return { periods: [...new Set([...a.periods, ...b.periods])].sort(), energy: { ...b.energy, ...a.energy } };
}

export function daysBetween(from: string, to: string): number {
  return Math.round((parseKey(to).getTime() - parseKey(from).getTime()) / 86400000);
}

/** Erste Tage jeder Blutung: Periodentage, deren Vortag keiner ist. */
export function periodStarts(periods: string[]): string[] {
  const set = new Set(periods);
  return [...set].filter((d) => !set.has(addDays(d, -1))).sort();
}

/** Durchschnittliche Zykluslänge aus den eigenen Daten (21–45 Tage), sonst 28. */
export function cycleLength(periods: string[]): number {
  const starts = periodStarts(periods);
  const gaps = starts.slice(1).map((s, i) => daysBetween(starts[i], s)).filter((g) => g >= 21 && g <= 45);
  return gaps.length ? Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length) : DEFAULT_LENGTH;
}

export interface DayInfo {
  cycleDay: number;
  phase: Phase;
}

/**
 * Zyklustag und Phase für einen Tag. Geschätzt nach Kalender: Eisprung um Tag (Zykluslänge − 14) ±1.
 * Ohne eingetragene Periode davor: null.
 */
export function dayInfo(data: CycleData, day: string): DayInfo | null {
  const start = periodStarts(data.periods).filter((s) => s <= day).pop();
  if (!start) return null;
  const cycleDay = daysBetween(start, day) + 1;
  const set = new Set(data.periods);
  let run = 1;
  while (set.has(addDays(start, run))) run++;
  const bleeding = run > 1 ? run : DEFAULT_BLEEDING;
  const ovulation = Math.max(10, cycleLength(data.periods) - 14);
  let phase: Phase;
  if (set.has(day) || cycleDay <= bleeding) phase = 'periode';
  else if (cycleDay < ovulation - 1) phase = 'follikel';
  else if (cycleDay <= ovulation + 1) phase = 'eisprung';
  else phase = 'luteal';
  return { cycleDay, phase };
}

/** Durchschnittliche Energie je Phase über alle Tage mit Eintrag. */
export function energyByPhase(data: CycleData): Record<Phase, { avg: number; days: number }> {
  const sums: Record<Phase, number[]> = { periode: [], follikel: [], eisprung: [], luteal: [] };
  for (const [d, v] of Object.entries(data.energy)) {
    const info = dayInfo(data, d);
    if (info) sums[info.phase].push(v);
  }
  const out = {} as Record<Phase, { avg: number; days: number }>;
  for (const p of PHASES) {
    const list = sums[p.id];
    out[p.id] = { avg: list.length ? list.reduce((a, b) => a + b, 0) / list.length : 0, days: list.length };
  }
  return out;
}

export function togglePeriod(data: CycleData, day: string): CycleData {
  const periods = data.periods.includes(day) ? data.periods.filter((d) => d !== day) : [...data.periods, day].sort();
  return { ...data, periods };
}

export function setEnergy(data: CycleData, day: string, level: number | null): CycleData {
  const energy = { ...data.energy };
  if (level === null || energy[day] === level) delete energy[day];
  else energy[day] = level;
  return { ...data, energy };
}
