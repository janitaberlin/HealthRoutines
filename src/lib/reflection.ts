import { addDays, parseKey } from './tracker';

/** Wochenreflexion: Montag der Woche → Antworten. */
export interface WeekEntry {
  become: string;
  outcome: string;
}
export type Reflections = Record<string, WeekEntry>;

/** Montag der Woche, in der `day` liegt. */
export function weekStart(day: string): string {
  return addDays(day, -((parseKey(day).getDay() + 6) % 7));
}

const MONTHS = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sept.', 'Okt.', 'Nov.', 'Dez.'];

/** „13.–19. Okt.“ für die Woche ab Montag `start`. */
export function weekLabel(start: string): string {
  const a = parseKey(start);
  const b = parseKey(addDays(start, 6));
  const month = (d: Date) => MONTHS[d.getMonth()];
  return a.getMonth() === b.getMonth()
    ? `${a.getDate()}.–${b.getDate()}. ${month(b)}`
    : `${a.getDate()}. ${month(a)} – ${b.getDate()}. ${month(b)}`;
}

export function parseReflections(raw: unknown): Reflections {
  const out: Reflections = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(k) || !v || typeof v !== 'object') continue;
    const e = v as Record<string, unknown>;
    const become = typeof e.become === 'string' ? e.become : '';
    const outcome = typeof e.outcome === 'string' ? e.outcome : '';
    if (become || outcome) out[k] = { become, outcome };
  }
  return out;
}
