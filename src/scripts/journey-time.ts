import { CATEGORIES, formatHours, todayKey, totals, weekDays, weekStart } from '../lib/time';
import { loadSessions } from './storage';

/** My Journey: Stunden dieser Woche je Bereich, Details auf der Zeit-Seite. */
const sums = totals(loadSessions(), weekDays(weekStart(todayKey())));
for (const c of CATEGORIES) {
  const el = document.querySelector<HTMLElement>(`[data-hours="${c.id}"]`);
  if (el) el.textContent = formatHours(sums[c.id]);
}
