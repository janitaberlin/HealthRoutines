import { parseMoney, type MoneyGoals } from '../lib/money';
import { parseUsage, recordUse, type Usage } from '../lib/usage';
import { parseCycle, type CycleData } from '../lib/cycle';
import { parseReflections, type Reflections } from '../lib/reflection';
import { parseCompass, type Compass } from '../lib/compass';
import { isCategory, parseSessions, type Running, type Session } from '../lib/time';
import { dateKey, parseChecks, type Checks } from '../lib/tracker';

const KEY = 'routine-checks';

export function loadChecks(): Checks {
  try {
    return parseChecks(localStorage.getItem(KEY));
  } catch {
    return {};
  }
}

export function saveChecks(checks: Checks): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(checks));
  } catch {
    // Speicher nicht verfügbar – Haken gelten nur bis zum Neuladen.
  }
}

const SESSIONS_KEY = 'time-sessions';
const RUNNING_KEY = 'time-running';

export function loadSessions(): Session[] {
  try {
    return parseSessions(localStorage.getItem(SESSIONS_KEY));
  } catch {
    return [];
  }
}

export function saveSessions(sessions: Session[]): void {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch {
    // Speicher nicht verfügbar.
  }
}

export function loadRunning(): Running | null {
  try {
    const data = JSON.parse(localStorage.getItem(RUNNING_KEY) ?? 'null');
    return data && isCategory(data.cat) && Number.isFinite(data.start) ? data : null;
  } catch {
    return null;
  }
}

export function saveRunning(running: Running | null): void {
  try {
    if (running) localStorage.setItem(RUNNING_KEY, JSON.stringify(running));
    else localStorage.removeItem(RUNNING_KEY);
  } catch {
    // Speicher nicht verfügbar.
  }
}

const NOTES_KEY = 'routine-notes';

/** Notizen pro Tag: Datum → Punkt-id → Text. */
export type Notes = Record<string, Record<string, string>>;

export function loadNotes(): Notes {
  try {
    const data = JSON.parse(localStorage.getItem(NOTES_KEY) ?? '{}');
    return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
  } catch {
    return {};
  }
}

export function saveNotes(notes: Notes): void {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch {
    // Speicher nicht verfügbar.
  }
}

const COMPASS_KEY = 'inner-compass';

export function loadCompass(): Compass {
  try {
    return parseCompass(localStorage.getItem(COMPASS_KEY));
  } catch {
    return parseCompass(null);
  }
}

export function saveCompass(compass: Compass): void {
  try {
    localStorage.setItem(COMPASS_KEY, JSON.stringify(compass));
  } catch {
    // Speicher nicht verfügbar.
  }
}

/** Eigenes Vision Board: Bilder (verkleinert als JPG-Data-URL) mit kurzem Text. */
export interface BoardImage {
  id: string;
  src: string;
  text: string;
}

const BOARD_KEY = 'vision-board';

export function parseBoard(raw: unknown): BoardImage[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((b) => b && typeof b.id === 'string' && typeof b.src === 'string' && b.src.startsWith('data:image/'))
    .map((b) => ({ id: b.id, src: b.src, text: typeof b.text === 'string' ? b.text : '' }));
}

export function loadBoard(): BoardImage[] {
  try {
    return parseBoard(JSON.parse(localStorage.getItem(BOARD_KEY) ?? '[]'));
  } catch {
    return [];
  }
}

/** Gibt false zurück, wenn der Speicher voll ist. */
export function saveBoard(board: BoardImage[]): boolean {
  try {
    localStorage.setItem(BOARD_KEY, JSON.stringify(board));
    return true;
  } catch {
    return false;
  }
}

const REFLECTION_KEY = 'week-reflection';

export function loadReflections(): Reflections {
  try {
    return parseReflections(JSON.parse(localStorage.getItem(REFLECTION_KEY) ?? '{}'));
  } catch {
    return {};
  }
}

export function saveReflections(reflections: Reflections): void {
  try {
    localStorage.setItem(REFLECTION_KEY, JSON.stringify(reflections));
  } catch {
    // Speicher nicht verfügbar.
  }
}

const CYCLE_KEY = 'cycle';

export function loadCycle(): CycleData {
  try {
    return parseCycle(JSON.parse(localStorage.getItem(CYCLE_KEY) ?? '{}'));
  } catch {
    return parseCycle(null);
  }
}

export function saveCycle(cycle: CycleData): void {
  try {
    localStorage.setItem(CYCLE_KEY, JSON.stringify(cycle));
  } catch {
    // Speicher nicht verfügbar.
  }
}

const USAGE_KEY = 'usage';

export function loadUsage(): Usage {
  try {
    return parseUsage(JSON.parse(localStorage.getItem(USAGE_KEY) ?? '{}'));
  } catch {
    return {};
  }
}

/** Merkt sich, dass ein Bereich heute genutzt wurde. */
export function trackUse(area: string): void {
  try {
    localStorage.setItem(USAGE_KEY, JSON.stringify(recordUse(loadUsage(), dateKey(new Date()), area)));
  } catch {
    // Speicher nicht verfügbar.
  }
}

const MONEY_KEY = 'money-goals';

export function loadMoney(): MoneyGoals {
  try {
    return parseMoney(JSON.parse(localStorage.getItem(MONEY_KEY) ?? '{}'));
  } catch {
    return {};
  }
}

export function saveMoney(money: MoneyGoals): void {
  try {
    localStorage.setItem(MONEY_KEY, JSON.stringify(money));
  } catch {
    // Speicher nicht verfügbar.
  }
}

const BACKUP_KEY = 'backup-last';

export function loadLastBackup(): string | null {
  try {
    return localStorage.getItem(BACKUP_KEY);
  } catch {
    return null;
  }
}

export function saveLastBackup(day: string): void {
  try {
    localStorage.setItem(BACKUP_KEY, day);
  } catch {
    // Speicher nicht verfügbar.
  }
}

/** Alles, was die App speichert, als eine Sicherungsdatei. */
export function buildBackup(): string {
  const backup = {
    checks: loadChecks(),
    sessions: loadSessions(),
    notes: loadNotes(),
    compass: loadCompass(),
    board: loadBoard(),
    reflections: loadReflections(),
    cycle: loadCycle(),
    usage: loadUsage(),
    money: loadMoney(),
  };
  return JSON.stringify(backup, null, 2);
}

/**
 * Sicherung teilen (iPhone: Teilen-Menü, dort Google Drive oder „In Dateien sichern“), sonst herunterladen.
 * Gibt false zurück, wenn abgebrochen.
 */
export async function shareBackup(): Promise<boolean> {
  const day = dateKey(new Date());
  const name = `janita-sicherung-${day}.json`;
  const file = new File([buildBackup()], name, { type: 'application/json' });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'JANITA Sicherung' });
    } catch {
      return false;
    }
  } else {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(file);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  }
  saveLastBackup(day);
  return true;
}
