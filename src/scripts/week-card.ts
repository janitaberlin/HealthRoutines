import { totals, weekDays, weekStart } from '../lib/time';
import { activeStreak, dateKey } from '../lib/tracker';
import { loadChecks, loadSessions } from './storage';

/** Wochenkarte auf Heute: Tage mit Haken, Serie und Business-Zeit dieser Woche. */
function render(): void {
  const today = dateKey(new Date());
  const checks = loadChecks();
  const days = weekDays(weekStart(today));
  document.querySelectorAll<HTMLElement>('#week-days span').forEach((el, i) => {
    el.classList.toggle('is-today', days[i] === today);
    el.classList.toggle('is-done', (checks[days[i]]?.length ?? 0) > 0);
  });
  const streak = activeStreak(checks, today);
  document.getElementById('week-streak')!.innerHTML = `${streak}<small>${streak === 1 ? 'Tag' : 'Tage'}</small>`;
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
