import { totals, weekDays, weekStart } from '../lib/time';
import { routines } from '../data/routines';
import { dateKey, ratio } from '../lib/tracker';
import { loadChecks, loadSessions } from './storage';

/** Wochenkarte auf Heute: Tage mit Haken, heute erledigte Routinen und Business-Zeit (Create) dieser Woche. */
function render(): void {
  const today = dateKey(new Date());
  const checks = loadChecks();
  const days = weekDays(weekStart(today));
  document.querySelectorAll<HTMLElement>('#week-days span').forEach((el, i) => {
    el.classList.toggle('is-today', days[i] === today);
    el.classList.toggle('is-done', (checks[days[i]]?.length ?? 0) > 0);
  });
  const ids = routines.flatMap((r) => r.items.map((i) => i.id));
  const done = Math.round(ratio(checks, today, ids) * ids.length);
  document.getElementById('week-streak')!.innerHTML = `${done}<small>von ${ids.length}</small>`;
  const minutes = Math.round(totals(loadSessions(), days).business);
  const h = Math.floor(minutes / 60);
  document.getElementById('week-invested')!.innerHTML = h ? `${h}:${String(minutes % 60).padStart(2, '0')}<small>Std.</small>` : `${minutes}<small>Min.</small>`;
}

// Haken auf derselben Seite ändern die Karte sofort.
document.addEventListener('click', (e) => {
  if ((e.target as HTMLElement).closest('[data-item]')) setTimeout(render, 0);
});
window.addEventListener('storage', render);
render();
