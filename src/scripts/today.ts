import { routines } from '../data/routines';
import { addDays, dateKey, isChecked, parseKey, ratio, toggle } from '../lib/tracker';
import { loadChecks, saveChecks } from './storage';

const today = dateKey(new Date());
let day = today;
let checks = loadChecks();
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
  totalText.textContent = done === allIds.length ? 'Alles erledigt 🎉' : `${done} von ${allIds.length} erledigt`;
}

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
  render();
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  if (dateKey(new Date()) !== today) location.reload();
});

render();
