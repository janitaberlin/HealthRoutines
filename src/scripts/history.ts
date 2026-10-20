import { routines } from '../data/routines';
import { addDays, countDone, dateKey, mergeChecks, parseChecks, parseKey, ratio, streak } from '../lib/tracker';
import { mergeSessions, parseSessions } from '../lib/time';
import { parseCompass } from '../lib/compass';
import { parseReflections } from '../lib/reflection';
import { loadBoard, loadChecks, loadCompass, loadNotes, loadReflections, loadSessions, parseBoard, saveBoard, saveChecks, saveCompass, saveNotes, saveReflections, saveSessions } from './storage';

const WEEKS = 5;
const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const today = dateKey(new Date());
let checks = loadChecks();
const allIds = routines.flatMap((r) => r.items.map((i) => i.id));

/** Raster Montag bis Sonntag, letzte Zeile enthält heute. */
function gridDays(): string[] {
  const weekday = (parseKey(today).getDay() + 6) % 7;
  const start = addDays(today, -weekday - (WEEKS - 1) * 7);
  return Array.from({ length: WEEKS * 7 }, (_, i) => addDays(start, i));
}

function heatmap(ids: string[]): HTMLElement {
  const grid = document.createElement('div');
  grid.className = 'heatmap';
  for (const w of WEEKDAYS) {
    const head = document.createElement('span');
    head.className = 'heat-head';
    head.textContent = w;
    grid.append(head);
  }
  for (const day of gridDays()) {
    const cell = document.createElement('span');
    cell.className = 'heat-cell';
    if (day > today) cell.classList.add('is-future');
    else {
      const share = ratio(checks, day, ids);
      cell.style.setProperty('--level', String(share));
      if (share === 1) cell.classList.add('is-full');
      cell.title = `${parseKey(day).toLocaleDateString('de-DE')}: ${Math.round(share * 100)} %`;
    }
    if (day === today) cell.classList.add('is-today');
    cell.textContent = String(parseKey(day).getDate());
    grid.append(cell);
  }
  return grid;
}

function streakText(n: number): string {
  return n === 1 ? '1 Tag am Stück' : `${n} Tage am Stück`;
}

function render(): void {
  const overview = document.getElementById('overview')!;
  const s = streak(checks, today, allIds);
  overview.replaceChildren(heatmap(allIds));
  const p = document.createElement('p');
  p.className = 'streak';
  p.textContent = s ? `🔥 Alles erledigt: ${streakText(s)}` : 'Noch keine Serie, bei der alles erledigt war.';
  overview.prepend(p);

  const stats = document.getElementById('routine-stats')!;
  stats.replaceChildren(
    ...routines.map((r) => {
      const ids = r.items.map((i) => i.id);
      const card = document.createElement('section');
      card.className = 'routine';
      const title = document.createElement('h3');
      title.textContent = `${r.icon} ${r.title}`;
      const rs = streak(checks, today, ids);
      const sub = document.createElement('p');
      sub.className = 'muted';
      sub.textContent = rs ? `🔥 ${streakText(rs)}` : 'Keine aktuelle Serie';
      const list = document.createElement('ul');
      list.className = 'stat-list';
      for (const item of r.items) {
        const li = document.createElement('li');
        const n = countDone(checks, today, item.id, 7);
        li.innerHTML = `<span></span><span class="stat-dots" aria-label="${n} von 7 Tagen"></span>`;
        li.firstElementChild!.textContent = item.text;
        const dots = li.lastElementChild!;
        for (let i = 6; i >= 0; i--) {
          const dot = document.createElement('i');
          if (checks[addDays(today, -i)]?.includes(item.id)) dot.className = 'on';
          dots.append(dot);
        }
        list.append(li);
      }
      card.append(title, sub, heatmap(ids), list);
      return card;
    }),
  );
}

const status = document.getElementById('backup-status')!;

document.getElementById('export')!.addEventListener('click', () => {
  const backup = { checks, sessions: loadSessions(), notes: loadNotes(), compass: loadCompass(), board: loadBoard(), reflections: loadReflections() };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `health-routines-${today}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
});

document.getElementById('import')!.addEventListener('change', async (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const text = await file.text();
  // Neue Sicherungen enthalten { checks, sessions }, alte nur die Haken.
  let data: unknown = null;
  try {
    data = JSON.parse(text);
  } catch {
    // unten als leer behandelt
  }
  const isNew = !!data && typeof data === 'object' && 'checks' in data;
  const imported = parseChecks(isNew ? JSON.stringify((data as { checks: unknown }).checks) : text);
  const importedSessions = isNew ? parseSessions(JSON.stringify((data as { sessions?: unknown }).sessions ?? [])) : [];
  const days = Object.keys(imported).length;
  if (!days && !importedSessions.length) {
    status.textContent = 'Die Datei enthält keine Daten.';
    return;
  }
  checks = mergeChecks(checks, imported);
  saveChecks(checks);
  saveSessions(mergeSessions(loadSessions(), importedSessions));
  const importedNotes = isNew ? (data as { notes?: unknown }).notes : null;
  if (importedNotes && typeof importedNotes === 'object' && !Array.isArray(importedNotes)) {
    const current = loadNotes();
    for (const [d, n] of Object.entries(importedNotes as Record<string, Record<string, string>>)) current[d] = { ...n, ...(current[d] ?? {}) };
    saveNotes(current);
  }
  const importedCompass = isNew ? (data as { compass?: unknown }).compass : null;
  if (importedCompass && typeof importedCompass === 'object') saveCompass(parseCompass(JSON.stringify(importedCompass)));
  const importedBoard = isNew ? parseBoard((data as { board?: unknown }).board) : [];
  if (importedBoard.length) {
    const current = loadBoard();
    saveBoard([...current, ...importedBoard.filter((b) => !current.some((c) => c.id === b.id))]);
  }
  const importedReflections = isNew ? parseReflections((data as { reflections?: unknown }).reflections) : {};
  saveReflections({ ...importedReflections, ...loadReflections() });
  status.textContent = `${days} Tage und ${importedSessions.length} Zeiteinträge übernommen.`;
  render();
});

render();
