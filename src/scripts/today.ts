import { routines } from '../data/routines';
import { addDays, dateKey, isChecked, parseKey, ratio, toggle } from '../lib/tracker';
import { loadChecks, loadNotes, saveChecks, saveNotes } from './storage';

const today = dateKey(new Date());
let day = today;
let checks = loadChecks();
let notes = loadNotes();
const allIds = routines.flatMap((r) => r.items.map((i) => i.id));

const label = document.getElementById('day-label')!;
const dateText = document.getElementById('day-date')!;
const totalBar = document.getElementById('total-bar')!;
const totalText = document.getElementById('total-text')!;
const nextBtn = document.querySelector<HTMLButtonElement>('[data-shift="1"]')!;

function dayName(key: string): string {
  if (key === today) return 'Heute';
  if (key === addDays(today, -1)) return 'Gestern';
  return parseKey(key).toLocaleDateString('de-DE', { weekday: 'long' });
}

function render(): void {
  label.textContent = dayName(day);
  dateText.textContent = parseKey(day).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
  nextBtn.disabled = day >= today;

  for (const btn of document.querySelectorAll<HTMLButtonElement>('[data-item]')) {
    btn.setAttribute('aria-pressed', String(isChecked(checks, day, btn.dataset.item!)));
  }
  for (const field of document.querySelectorAll<HTMLTextAreaElement>('[data-note]')) {
    if (document.activeElement !== field) field.value = notes[day]?.[field.dataset.note!] ?? '';
    grow(field);
  }
  for (const r of routines) {
    const ids = r.items.map((i) => i.id);
    const done = ids.filter((id) => isChecked(checks, day, id)).length;
    const section = document.querySelector<HTMLElement>(`[data-routine="${r.id}"]`)!;
    section.querySelector('[data-count]')!.textContent = `${done}/${ids.length}`;
    section.classList.toggle('is-done', done === ids.length);
  }
  const share = ratio(checks, day, allIds);
  totalBar.style.width = `${Math.round(share * 100)}%`;
  const done = Math.round(share * allIds.length);
  totalText.textContent = done === allIds.length ? 'Alles erledigt ✦' : `${done} von ${allIds.length} erledigt`;
  // Goldene Sterne, sobald am selben Tag der letzte Haken gesetzt wird (nicht beim Öffnen oder Blättern).
  const allDone = done === allIds.length;
  if (allDone && wasDone[day] === false) celebrate();
  wasDone[day] = allDone;
}

const wasDone: Record<string, boolean> = {};

function celebrate(): void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const layer = document.createElement('div');
  layer.className = 'stars';
  layer.setAttribute('aria-hidden', 'true');
  // Dichter Goldregen über die ganze App: feine goldene Tropfen und Glitzer, ca. 2 Sek.
  for (let i = 0; i < 220; i++) {
    const drop = document.createElement('span');
    drop.className = i % 4 ? 'drop' : 'glitter';
    drop.style.left = `${Math.random() * 100}%`;
    drop.style.animationDelay = `${Math.random() * 0.9}s`;
    drop.style.animationDuration = `${0.7 + Math.random() * 0.6}s`;
    if (drop.className === 'drop') drop.style.height = `${14 + Math.random() * 26}px`;
    layer.append(drop);
  }
  const text = document.createElement('p');
  text.textContent = 'Alles erledigt';
  layer.append(text);
  document.body.append(layer);
  setTimeout(() => layer.remove(), 2600);
}

function grow(field: HTMLTextAreaElement): void {
  field.style.height = 'auto';
  field.style.height = `${field.scrollHeight}px`;
}

// Notiz schreiben hakt den Punkt automatisch ab.
document.addEventListener('input', (e) => {
  const field = (e.target as HTMLElement).closest<HTMLTextAreaElement>('[data-note]');
  if (!field) return;
  const id = field.dataset.note!;
  const text = field.value;
  const dayNotes = { ...(notes[day] ?? {}) };
  if (text.trim()) dayNotes[id] = text;
  else delete dayNotes[id];
  notes = { ...notes, [day]: dayNotes };
  if (!Object.keys(dayNotes).length) delete notes[day];
  saveNotes(notes);
  if (text.trim() && !isChecked(checks, day, id)) {
    checks = toggle(checks, day, id);
    saveChecks(checks);
  }
  render();
});

document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  const item = target.closest<HTMLButtonElement>('[data-item]');
  if (item) {
    checks = toggle(checks, day, item.dataset.item!);
    saveChecks(checks);
    render();
    return;
  }
  const nav = target.closest<HTMLButtonElement>('[data-shift]');
  if (nav) {
    const next = addDays(day, Number(nav.dataset.shift));
    if (next <= today) day = next;
    render();
  }
});

// Andere Tabs bzw. Rückkehr in die App am nächsten Tag berücksichtigen.
window.addEventListener('storage', () => {
  checks = loadChecks();
  notes = loadNotes();
  render();
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  if (dateKey(new Date()) !== today) location.reload();
});

render();
