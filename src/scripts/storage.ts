import { parseReflections, type Reflections } from '../lib/reflection';
import { parseCompass, type Compass } from '../lib/compass';
import { isCategory, parseSessions, type Running, type Session } from '../lib/time';
import { parseChecks, type Checks } from '../lib/tracker';

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
