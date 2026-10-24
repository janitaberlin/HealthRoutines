/** Money-Ziele pro Woche (Montag → Ziel, erreicht, gesperrt). Janita 24.10.2026. */
export interface MoneyWeek {
  goal: number;
  reached: number | null;
  locked: boolean;
}
export type MoneyGoals = Record<string, MoneyWeek>;

/** „1000 €“, „1.000“, „1000,50“ → Zahl; sonst null. */
export function parseAmount(text: string): number | null {
  let t = text.replace(/[€\s]/g, '').replace(/euro/i, '');
  if (!t) return null;
  if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, '');
  const n = Number(t);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/** 1000 → „1.000 €“, 99.5 → „99,50 €“. */
export function formatEuro(n: number): string {
  const [int, dec] = n.toFixed(Number.isInteger(n) ? 0 : 2).split('.');
  return `${int.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}${dec ? `,${dec}` : ''} €`;
}

export function progress(w: MoneyWeek): number {
  return w.goal > 0 && w.reached !== null ? Math.min(1, w.reached / w.goal) : 0;
}

export function parseMoney(raw: unknown): MoneyGoals {
  const out: MoneyGoals = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(k) || !v || typeof v !== 'object') continue;
    const e = v as Record<string, unknown>;
    if (typeof e.goal !== 'number' || !Number.isFinite(e.goal)) continue;
    out[k] = { goal: e.goal, reached: typeof e.reached === 'number' && Number.isFinite(e.reached) ? e.reached : null, locked: e.locked === true };
  }
  return out;
}
