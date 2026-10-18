import { addDays, parseKey } from '../lib/tracker';
import {
  CATEGORIES,
  formatClock,
  formatHours,
  formatMinutes,
  minutesByDay,
  todayKey,
  totals,
  weekDays,
  weekStart,
  type Category,
  type Session,
} from '../lib/time';
import { loadRunning, loadSessions, saveRunning, saveSessions } from './storage';

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const label = (cat: Category) => CATEGORIES.find((c) => c.id === cat)!.label;

let sessions = loadSessions();
let running = loadRunning();
let monday = weekStart(todayKey());

const clock = document.getElementById('timer-clock')!;
const timerLabel = document.getElementById('timer-label')!;
const stopBtn = document.getElementById('timer-stop') as HTMLButtonElement;
const startBtns = document.querySelectorAll<HTMLButtonElement>('[data-start]');

/** Laufende Stoppuhr zählt in der Auswertung schon mit. */
function withRunning(): Session[] {
  return running ? [...sessions, { id: 'laufend', cat: running.cat, start: running.start, end: Date.now() }] : sessions;
}

function renderTimer(): void {
  const isRunning = !!running;
  stopBtn.hidden = !isRunning;
  for (const b of startBtns) b.hidden = isRunning;
  timerLabel.textContent = running ? `${label(running.cat)} läuft` : 'Stoppuhr';
  clock.textContent = formatClock(running ? Date.now() - running.start : 0);
  document.querySelector('.timer')!.classList.toggle('is-running', isRunning);
  const today = totals(withRunning(), [todayKey()]);
  document.getElementById('timer-today')!.textContent =
    'Heute: ' + CATEGORIES.map((c) => `${c.label} ${formatMinutes(today[c.id])}`).join(' · ');
}

function bars(container: HTMLElement, columns: { label: string; values: Record<Category, number>; title: string }[]): void {
  const max = Math.max(60, ...columns.map((c) => CATEGORIES.reduce((s, cat) => s + c.values[cat.id], 0)));
  container.replaceChildren(
    ...columns.map((col) => {
      const wrap = document.createElement('div');
      wrap.className = 'chart-col';
      const sum = CATEGORIES.reduce((s, cat) => s + col.values[cat.id], 0);
      const value = document.createElement('span');
      value.className = 'chart-value';
      value.textContent = sum ? (sum / 60).toFixed(1).replace('.', ',') : '';
      const stack = document.createElement('div');
      stack.className = 'chart-stack';
      stack.title = col.title;
      for (const cat of CATEGORIES) {
        const seg = document.createElement('i');
        seg.className = `swatch-${cat.id}`;
        seg.style.height = `${(col.values[cat.id] / max) * 100}%`;
        stack.append(seg);
      }
      const name = document.createElement('span');
      name.className = 'chart-label';
      name.textContent = col.label;
      wrap.append(value, stack, name);
      return wrap;
    }),
  );
}

function renderWeek(): void {
  const all = withRunning();
  const days = weekDays(monday);
  const thisMonday = weekStart(todayKey());
  const end = parseKey(days[6]).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
  const start = parseKey(days[0]).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
  document.getElementById('week-label')!.textContent =
    monday === thisMonday ? 'Diese Woche' : monday === addDays(thisMonday, -7) ? 'Letzte Woche' : `${start} – ${end}`;
  document.querySelector<HTMLButtonElement>('[data-week="1"]')!.disabled = monday >= thisMonday;

  const sum = totals(all, days);
  const totalAll = CATEGORIES.reduce((s, c) => s + sum[c.id], 0);
  document.getElementById('week-totals')!.innerHTML = '';
  for (const item of [...CATEGORIES.map((c) => ({ id: c.id as string, label: c.label, min: sum[c.id] })), { id: 'gesamt', label: 'Gesamt', min: totalAll }]) {
    const box = document.createElement('div');
    box.className = `total total-${item.id}`;
    box.innerHTML = '<span></span><strong></strong>';
    box.firstElementChild!.textContent = item.label;
    box.lastElementChild!.textContent = formatHours(item.min);
    document.getElementById('week-totals')!.append(box);
  }

  const byDay = minutesByDay(all, days);
  bars(
    document.getElementById('week-chart')!,
    days.map((d, i) => ({
      label: WEEKDAYS[i],
      values: byDay[d],
      title: `${parseKey(d).toLocaleDateString('de-DE')}: ` + CATEGORIES.map((c) => `${c.label} ${formatMinutes(byDay[d][c.id])}`).join(', '),
    })),
  );

  const weeks = Array.from({ length: 8 }, (_, i) => addDays(thisMonday, (i - 7) * 7));
  bars(
    document.getElementById('weeks-chart')!,
    weeks.map((w) => {
      const values = totals(all, weekDays(w));
      return {
        label: parseKey(w).toLocaleDateString('de-DE', { day: 'numeric', month: 'numeric' }),
        values,
        title: `Woche ab ${parseKey(w).toLocaleDateString('de-DE')}: ` + CATEGORIES.map((c) => `${c.label} ${formatMinutes(values[c.id])}`).join(', '),
      };
    }),
  );

  const from = parseKey(monday).getTime();
  const to = parseKey(addDays(monday, 7)).getTime();
  const list = document.getElementById('entries')!;
  const inWeek = sessions.filter((s) => s.end > from && s.start < to).sort((a, b) => b.start - a.start);
  list.replaceChildren(
    ...inWeek.map((s) => {
      const li = document.createElement('li');
      const day = new Date(s.start).toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'numeric' });
      const time = (t: number) => new Date(t).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
      li.innerHTML = '<i></i><span class="entry-text"></span><strong></strong><button type="button" class="entry-del" aria-label="Eintrag löschen">×</button>';
      li.children[0].className = `swatch swatch-${s.cat}`;
      li.children[1].textContent = `${label(s.cat)} · ${day}, ${time(s.start)}–${time(s.end)}`;
      li.children[2].textContent = formatMinutes((s.end - s.start) / 60_000);
      (li.children[3] as HTMLButtonElement).dataset.del = s.id;
      return li;
    }),
  );
  if (!inWeek.length) {
    const li = document.createElement('li');
    li.className = 'muted';
    li.textContent = 'Noch keine Einträge in dieser Woche.';
    list.append(li);
  }
}

function render(): void {
  renderTimer();
  renderWeek();
}

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function stop(): void {
  if (!running) return;
  const end = Date.now();
  // Unter einer Minute zählt nicht (versehentlich gestartet).
  if (end - running.start >= 60_000) {
    sessions = [...sessions, { id: newId(), cat: running.cat, start: running.start, end }];
    saveSessions(sessions);
  }
  running = null;
  saveRunning(null);
}

document.addEventListener('click', (e) => {
  const t = e.target as HTMLElement;
  const start = t.closest<HTMLButtonElement>('[data-start]');
  if (start) {
    stop();
    running = { cat: start.dataset.start as Category, start: Date.now() };
    saveRunning(running);
    render();
    return;
  }
  if (t.closest('#timer-stop')) {
    stop();
    render();
    return;
  }
  const nav = t.closest<HTMLButtonElement>('[data-week]');
  if (nav) {
    monday = addDays(monday, Number(nav.dataset.week) * 7);
    renderWeek();
    return;
  }
  const del = t.closest<HTMLButtonElement>('[data-del]');
  if (del && confirm('Diesen Eintrag löschen?')) {
    sessions = sessions.filter((s) => s.id !== del.dataset.del);
    saveSessions(sessions);
    render();
  }
});

const form = document.getElementById('add-form') as HTMLFormElement;
const dateInput = form.elements.namedItem('date') as HTMLInputElement;
dateInput.value = todayKey();
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const day = parseKey(String(data.get('date')));
  const at = (hm: string) => {
    const [h, m] = hm.split(':').map(Number);
    return new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m).getTime();
  };
  const startMs = at(String(data.get('from')));
  let endMs = at(String(data.get('to')));
  if (endMs <= startMs) endMs += 86_400_000; // über Mitternacht
  sessions = [...sessions, { id: newId(), cat: data.get('cat') as Category, start: startMs, end: endMs }];
  saveSessions(sessions);
  document.getElementById('add-status')!.textContent = `Gespeichert: ${formatMinutes((endMs - startMs) / 60_000)}`;
  monday = weekStart(String(data.get('date')));
  render();
});

window.addEventListener('storage', () => {
  sessions = loadSessions();
  running = loadRunning();
  render();
});
setInterval(renderTimer, 1000);
setInterval(renderWeek, 60_000);
render();
