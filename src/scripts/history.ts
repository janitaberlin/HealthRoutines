import { routines } from '../data/routines';
import { addDays, countDone, dateKey, mergeChecks, parseChecks, parseKey, ratio, streak } from '../lib/tracker';
import { loadChecks, saveChecks } from './storage';

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
  const blob = new Blob([JSON.stringify(checks, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `health-routines-${today}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
});

document.getElementById('import')!.addEventListener('change', async (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const imported = parseChecks(await file.text());
  const days = Object.keys(imported).length;
  if (!days) {
    status.textContent = 'Die Datei enthält keine Haken.';
    return;
  }
  checks = mergeChecks(checks, imported);
  saveChecks(checks);
  status.textContent = `${days} Tage übernommen.`;
  render();
});

render();
