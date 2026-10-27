import { challengeStart, challenges } from '../data/challenge';
import { LENGTH, dayNumber } from '../lib/challenge';
import { dateKey } from '../lib/tracker';
import { loadChallenge } from './storage';

/** Karte auf Heute: Aufgabe des Tages der Money-Challenge, vorher Countdown, danach verschwindet sie. */
const card = document.querySelector<HTMLElement>('.challenge-card')!;
const n = dayNumber(challengeStart, dateKey(new Date()));
const eyebrow = document.getElementById('home-ch-day')!;
const task = document.getElementById('home-ch-task')!;
if (n > LENGTH) card.hidden = true;
else if (n < 1) {
  eyebrow.textContent = `30-Day Money Challenge · startet in ${1 - n} ${1 - n === 1 ? 'Tag' : 'Tagen'}`;
  task.textContent = 'Jetzt dein Ziel für die 30 Tage festlegen ›';
} else {
  const done = loadChallenge().days[n]?.done;
  eyebrow.textContent = `Money Challenge · Tag ${n} von ${LENGTH}${done ? ' · erledigt ✓' : ''}`;
  task.textContent = `${challenges[n - 1]} ›`;
}
