import { schedule, weekendText } from '../data/schedule';
import { isWeekend, minutesLeft, planAt } from '../lib/plan';
import { formatMinutes } from '../lib/time';

const title = document.getElementById('now-title')!;
const text = document.getElementById('now-text')!;
const actions = document.getElementById('now-actions')!;

function render(): void {
  const now = new Date();
  for (const li of document.querySelectorAll<HTMLElement>('[data-block]')) li.classList.remove('is-now');
  if (isWeekend(now)) {
    title.textContent = 'Wochenende';
    text.textContent = weekendText;
    actions.hidden = true;
    return;
  }
  const { current, next } = planAt(schedule, now);
  if (current) {
    title.textContent = `${current.title} · bis ${current.to}`;
    text.textContent = `${current.text} · noch ${formatMinutes(minutesLeft(current, now))}`;
    document.querySelector(`[data-block="${current.from}"]`)?.classList.add('is-now');
  } else {
    title.textContent = next ? `Gleich: ${next.title} um ${next.from}` : 'Feierabend';
    text.textContent = next ? 'Kurz durchatmen.' : 'Kein Gefühl, noch etwas leisten zu müssen.';
  }
  actions.hidden = !current?.work;
}

render();
setInterval(render, 30_000);
