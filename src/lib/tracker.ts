/** Abgehakte Punkte pro Tag: Datum (JJJJ-MM-TT) → ids der erledigten Punkte. */
export type Checks = Record<string, string[]>;

export function dateKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function parseKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: string, days: number): string {
  const d = parseKey(key);
  d.setDate(d.getDate() + days);
  return dateKey(d);
}

export function isChecked(checks: Checks, day: string, id: string): boolean {
  return checks[day]?.includes(id) ?? false;
}

/** Hakt einen Punkt an oder ab und gibt einen neuen Stand zurück. */
export function toggle(checks: Checks, day: string, id: string): Checks {
  const current = checks[day] ?? [];
  const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
  const result = { ...checks };
  if (next.length) result[day] = next;
  else delete result[day];
  return result;
}

/** Anteil erledigter Punkte (0–1) an einem Tag. */
export function ratio(checks: Checks, day: string, ids: string[]): number {
  if (!ids.length) return 0;
  return ids.filter((id) => isChecked(checks, day, id)).length / ids.length;
}

/**
 * Tage am Stück, an denen alle Punkte erledigt waren. Ist heute noch nicht fertig,
 * zählt die Serie bis gestern, damit sie morgens nicht auf 0 springt.
 */
export function streak(checks: Checks, today: string, ids: string[]): number {
  let day = ratio(checks, today, ids) === 1 ? today : addDays(today, -1);
  let count = 0;
  while (ratio(checks, day, ids) === 1) {
    count++;
    day = addDays(day, -1);
  }
  return count;
}

/** An wie vielen der letzten `days` Tage (inkl. heute) war ein Punkt erledigt. */
export function countDone(checks: Checks, today: string, id: string, days: number): number {
  let n = 0;
  for (let i = 0; i < days; i++) if (isChecked(checks, addDays(today, -i), id)) n++;
  return n;
}

/** Liest gespeicherte Daten robust ein; Unbrauchbares wird verworfen. */
export function parseChecks(raw: string | null): Checks {
  if (!raw) return {};
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== 'object' || Array.isArray(data)) return {};
    const result: Checks = {};
    for (const [day, ids] of Object.entries(data)) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(day) && Array.isArray(ids)) {
        const clean = ids.filter((x): x is string => typeof x === 'string');
        if (clean.length) result[day] = clean;
      }
    }
    return result;
  } catch {
    return {};
  }
}

/** Führt zwei Stände zusammen (z. B. beim Einspielen einer Sicherung). */
export function mergeChecks(a: Checks, b: Checks): Checks {
  const result: Checks = { ...a };
  for (const [day, ids] of Object.entries(b)) result[day] = [...new Set([...(result[day] ?? []), ...ids])];
  return result;
}
