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
