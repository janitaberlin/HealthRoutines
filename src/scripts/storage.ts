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
