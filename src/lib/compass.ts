import { goalStates } from '../data/compass';

export type GoalState = (typeof goalStates)[number]['id'];
export interface Goal {
  text: string;
  state: GoalState;
}
export interface LibraryItem {
  id: string;
  type: string;
  text: string;
  link?: string;
}

/** Alles, was Janita im Inner Compass selbst einträgt. Fehlende Felder nehmen die Startwerte. */
export interface Compass {
  fields: Record<string, string>;
  goals: Goal[];
  library: LibraryItem[];
  /** One inspired action pro Tag: Datum → Text. */
  actions: Record<string, string>;
}

export function emptyCompass(): Compass {
  return {
    fields: {},
    goals: [0, 1, 2].map(() => ({ text: '', state: 'exploring' as GoalState })),
    library: [],
    actions: {},
  };
}

const STATES: string[] = goalStates.map((s) => s.id);
const isRecord = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);
const strings = (x: unknown): Record<string, string> =>
  isRecord(x) ? Object.fromEntries(Object.entries(x).filter((e): e is [string, string] => typeof e[1] === 'string')) : {};

export function parseCompass(raw: string | null): Compass {
  const result = emptyCompass();
  if (!raw) return result;
  try {
    const data: unknown = JSON.parse(raw);
    if (!isRecord(data)) return result;
    result.fields = strings(data.fields);
    result.actions = strings(data.actions);
    if (Array.isArray(data.goals)) {
      data.goals.slice(0, 3).forEach((g, i) => {
        if (isRecord(g) && typeof g.text === 'string')
          result.goals[i] = { text: g.text, state: STATES.includes(g.state as string) ? (g.state as GoalState) : 'exploring' };
      });
    }
    if (Array.isArray(data.library)) {
      result.library = data.library.filter(
        (it): it is LibraryItem => isRecord(it) && typeof it.id === 'string' && typeof it.type === 'string' && typeof it.text === 'string',
      );
    }
    return result;
  } catch {
    return result;
  }
}

/** Gleicher Eintrag für den ganzen Tag, wechselt täglich. */
export function pickForDay<T>(items: readonly T[], dayKey: string): T {
  const [y, m, d] = dayKey.split('-').map(Number);
  const n = Math.floor(new Date(y, m - 1, d).getTime() / 86_400_000);
  return items[((n % items.length) + items.length) % items.length];
}

/** Nur zulässige Links (http/https), sonst nichts. */
export function safeLink(link: string | undefined): string | undefined {
  if (!link) return undefined;
  try {
    const u = new URL(link.trim());
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : undefined;
  } catch {
    return undefined;
  }
}
