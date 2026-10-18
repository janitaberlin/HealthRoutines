import { addDays, dateKey, parseKey } from './tracker';

/** Bereiche der Zeiterfassung. Neue Bereiche hier ergänzen; die id nie ändern. */
export const CATEGORIES = [
  { id: 'business', label: 'Business' },
  { id: 'job', label: 'Job' },
] as const;
export type Category = (typeof CATEGORIES)[number]['id'];

/** Ein gestoppter Zeitraum; Zeiten in Millisekunden seit 1970. */
export interface Session {
  id: string;
  cat: Category;
  start: number;
  end: number;
}

/** Laufende Stoppuhr: Bereich und Startzeit. */
export interface Running {
  cat: Category;
  start: number;
}

const CATEGORY_IDS: string[] = CATEGORIES.map((c) => c.id);

/** Montag der Woche, in der `key` liegt. */
export function weekStart(key: string): string {
  const weekday = (parseKey(key).getDay() + 6) % 7;
  return addDays(key, -weekday);
}

export function weekDays(monday: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

/**
 * Minuten pro Tag und Bereich. Einträge über Mitternacht werden
 * auf die beteiligten Tage aufgeteilt.
 */
export function minutesByDay(sessions: Session[], days: string[]): Record<string, Record<Category, number>> {
  const result: Record<string, Record<Category, number>> = {};
  for (const day of days) result[day] = Object.fromEntries(CATEGORIES.map((c) => [c.id, 0])) as Record<Category, number>;
  for (const s of sessions) {
    for (const day of days) {
      const from = parseKey(day).getTime();
      const to = parseKey(addDays(day, 1)).getTime();
      const overlap = Math.min(s.end, to) - Math.max(s.start, from);
      if (overlap > 0) result[day][s.cat] += overlap / 60_000;
    }
  }
  return result;
}

/** Summe pro Bereich über die angegebenen Tage, in Minuten. */
export function totals(sessions: Session[], days: string[]): Record<Category, number> {
  const byDay = minutesByDay(sessions, days);
  const sum = Object.fromEntries(CATEGORIES.map((c) => [c.id, 0])) as Record<Category, number>;
  for (const day of days) for (const c of CATEGORIES) sum[c.id] += byDay[day][c.id];
  return sum;
}

/** „2 Std. 05 Min.“ bzw. „45 Min.“ */
export function formatMinutes(minutes: number): string {
  const total = Math.round(minutes);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (!h) return `${m} Min.`;
  return `${h} Std. ${String(m).padStart(2, '0')} Min.`;
}

/** Kurzform für Summen-Kacheln: „12:06 Std.“ */
export function formatHours(minutes: number): string {
  const total = Math.round(minutes);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')} Std.`;
}

/** Stoppuhr-Anzeige „1:05:09“. */
export function formatClock(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}:${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export function isCategory(x: unknown): x is Category {
  return typeof x === 'string' && CATEGORY_IDS.includes(x);
}

/** Liest gespeicherte Einträge robust ein. */
export function parseSessions(raw: string | null): Session[] {
  if (!raw) return [];
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.filter(
      (s): s is Session =>
        !!s &&
        typeof s.id === 'string' &&
        isCategory(s.cat) &&
        Number.isFinite(s.start) &&
        Number.isFinite(s.end) &&
        s.end > s.start,
    );
  } catch {
    return [];
  }
}

export function mergeSessions(a: Session[], b: Session[]): Session[] {
  const ids = new Set(a.map((s) => s.id));
  return [...a, ...b.filter((s) => !ids.has(s.id))].sort((x, y) => x.start - y.start);
}

export function todayKey(now = new Date()): string {
  return dateKey(now);
}
