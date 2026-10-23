import { addDays } from './tracker';

/** Nutzung: pro Tag, welche Bereiche geöffnet wurden. */
export type Usage = Record<string, string[]>;

export const AREAS: { id: string; label: string }[] = [
  { id: 'heute', label: 'Heute' },
  { id: 'routinen', label: 'Routinen' },
  { id: 'ritual', label: 'Ritual' },
  { id: 'affirmationen', label: 'Affirmationen' },
  { id: 'vision', label: 'Vision Board' },
  { id: 'compass', label: 'Compass' },
  { id: 'zeit', label: 'Zeit' },
  { id: 'zyklus', label: 'Zyklus' },
  { id: 'verlauf', label: 'Verlauf' },
  { id: 'antworten', label: 'Meine Antworten' },
];

export function parseUsage(raw: unknown): Usage {
  const out: Usage = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
  for (const [d, v] of Object.entries(raw as Record<string, unknown>)) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(d) && Array.isArray(v)) out[d] = v.filter((x): x is string => typeof x === 'string');
  }
  return out;
}

export function recordUse(usage: Usage, day: string, area: string): Usage {
  if (usage[day]?.includes(area)) return usage;
  return { ...usage, [day]: [...(usage[day] ?? []), area] };
}

/** An wie vielen der letzten `days` Tage (bis heute) jeder Bereich genutzt wurde. */
export function usageDays(usage: Usage, today: string, days = 30): Record<string, number> {
  const out: Record<string, number> = Object.fromEntries(AREAS.map((a) => [a.id, 0]));
  for (let i = 0; i < days; i++) for (const a of usage[addDays(today, -i)] ?? []) if (a in out) out[a]++;
  return out;
}

/** Erster Tag mit Daten, damit „seit“ ehrlich ist. */
export function trackedSince(usage: Usage): string | null {
  return Object.keys(usage).sort()[0] ?? null;
}
