import { addDays, parseKey } from './tracker';

/** Stand der Money-Challenge: Gesamtziel (gesperrt) und pro Tag erledigt + verdient. */
export interface ChallengeDay {
  done: boolean;
  earned: number | null;
}
export interface Challenge {
  goal: number | null;
  locked: boolean;
  days: Record<string, ChallengeDay>;
}

export const LENGTH = 30;

/** Tag 1 … 30; 0 oder kleiner = noch nicht gestartet, über 30 = vorbei. */
export function dayNumber(start: string, today: string): number {
  return Math.round((parseKey(today).getTime() - parseKey(start).getTime()) / 86400000) + 1;
}

export function dayDate(start: string, n: number): string {
  return addDays(start, n - 1);
}

export function totalEarned(c: Challenge): number {
  return Object.values(c.days).reduce((sum, d) => sum + (d.earned ?? 0), 0);
}

export function doneCount(c: Challenge): number {
  return Object.values(c.days).filter((d) => d.done).length;
}

export function parseChallenge(raw: unknown): Challenge {
  const out: Challenge = { goal: null, locked: false, days: {} };
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
  const r = raw as Record<string, unknown>;
  if (typeof r.goal === 'number' && Number.isFinite(r.goal)) out.goal = r.goal;
  out.locked = r.locked === true && out.goal !== null;
  if (r.days && typeof r.days === 'object' && !Array.isArray(r.days)) {
    for (const [k, v] of Object.entries(r.days as Record<string, unknown>)) {
      const n = Number(k);
      if (!Number.isInteger(n) || n < 1 || n > LENGTH || !v || typeof v !== 'object') continue;
      const d = v as Record<string, unknown>;
      const earned = typeof d.earned === 'number' && Number.isFinite(d.earned) ? d.earned : null;
      if (d.done === true || earned !== null) out.days[k] = { done: d.done === true, earned };
    }
  }
  return out;
}
