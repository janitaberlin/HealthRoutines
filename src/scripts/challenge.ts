import { challengeStart, challenges } from '../data/challenge';
import { LENGTH, dayDate, dayNumber, doneCount, totalEarned } from '../lib/challenge';
import { formatEuro, parseAmount } from '../lib/money';
import { dateKey, parseKey } from '../lib/tracker';
import { loadChallenge, saveChallenge } from './storage';

/** 30-Tage-Money-Challenge oben auf Money: Aufgabe des Tages, verdient, Gesamtziel, 30 Felder. */
const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const today = dayNumber(challengeStart, dateKey(new Date()));
// Ausgewählter Tag: heute, vor dem Start Tag 1, danach Tag 30; antippen im Raster wechselt.
let selected = Math.min(Math.max(today, 1), LENGTH);
let c = loadChallenge();

const DAYS = ['So.', 'Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.'];
const label = (n: number) => {
  const d = parseKey(dayDate(challengeStart, n));
  return `${DAYS[d.getDay()]} ${d.getDate()}.${d.getMonth() + 1}.`;
};

function render(): void {
  c = loadChallenge();
  const started = today >= 1;
  const day = c.days[selected];
  $('ch-day').textContent = !started
    ? `Startet am 1. November · noch ${1 - today} ${1 - today === 1 ? 'Tag' : 'Tage'}`
    : `Tag ${selected} von ${LENGTH} · ${label(selected)}${selected === today ? ' · heute' : ''}`;
  $('ch-task').textContent = challenges[selected - 1];
  const open = started && selected <= today;
  $('ch-done').hidden = !open;
  $('ch-earned-box').hidden = !open;
  $('ch-done').textContent = day?.done ? '✓ Erledigt' : '✓ Challenge erledigt';
  $('ch-done').classList.toggle('is-done', !!day?.done);
  const earned = $<HTMLInputElement>('ch-earned');
  if (document.activeElement !== earned) earned.value = day?.earned != null ? formatEuro(day.earned) : '';

  $('ch-goal-open').hidden = c.locked;
  $('ch-goal-locked').hidden = !c.locked;
  if (c.locked && c.goal) {
    const total = totalEarned(c);
    $('ch-total').textContent = formatEuro(total);
    $('ch-goal-show').textContent = formatEuro(c.goal);
    $('ch-bar').style.width = `${Math.min(100, Math.round((total / c.goal) * 100))}%`;
  }

  $('ch-grid').replaceChildren(
    ...Array.from({ length: LENGTH }, (_, i) => {
      const n = i + 1;
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = String(n);
      b.className = 'challenge-cell';
      if (c.days[n]?.done) b.classList.add('is-done');
      if (n === today) b.classList.add('is-today');
      if (n === selected) b.setAttribute('aria-current', 'true');
      if (n > today) b.classList.add('is-future');
      b.setAttribute('aria-label', `Tag ${n}${c.days[n]?.done ? ', erledigt' : ''}`);
      b.addEventListener('click', () => {
        selected = n;
        render();
      });
      return b;
    }),
  );
  const done = doneCount(c);
  $('ch-hint').textContent = started ? `${done} von ${Math.min(today, LENGTH)} Challenges erledigt. Tippe auf einen Tag, um seine Aufgabe zu sehen.` : 'Tippe auf einen Tag, um dir die Aufgaben schon anzusehen.';
}

function update(fn: (d: { done: boolean; earned: number | null }) => void): void {
  c = loadChallenge();
  const d = c.days[selected] ?? { done: false, earned: null };
  fn(d);
  if (d.done || d.earned !== null) c.days[selected] = d;
  else delete c.days[selected];
  saveChallenge(c);
  render();
}

$('ch-done').addEventListener('click', () => update((d) => (d.done = !d.done)));
$('ch-earned').addEventListener('change', () => update((d) => (d.earned = parseAmount($<HTMLInputElement>('ch-earned').value))));

$('ch-lock').addEventListener('click', () => {
  const goal = parseAmount($<HTMLInputElement>('ch-goal').value);
  if (!goal) return $('ch-goal').focus();
  c = loadChallenge();
  c.goal = goal;
  c.locked = true;
  saveChallenge(c);
  render();
});
$('ch-unlock').addEventListener('click', () => {
  if (!confirm('Festgelegtes Ziel wieder ändern?')) return;
  c = loadChallenge();
  c.locked = false;
  saveChallenge(c);
  $<HTMLInputElement>('ch-goal').value = c.goal ? formatEuro(c.goal) : '';
  render();
});

render();
