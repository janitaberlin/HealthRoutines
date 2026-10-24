import { formatEuro, parseAmount, progress } from '../lib/money';
import { weekLabel, weekStart } from '../lib/reflection';
import { addDays, dateKey } from '../lib/tracker';
import { loadCompass, loadMoney, saveMoney } from './storage';

/** Money-Ziel pro Woche: festlegen (gesperrt), dann eintragen, was wirklich erreicht wurde. */
const thisWeek = weekStart(dateKey(new Date()));
const weekend = [0, 6].includes(new Date().getDay());
let money = loadMoney();
// Am Wochenende plant man meist die nächste Woche.
let offset = weekend ? 1 : 0;

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const goalInput = $<HTMLInputElement>('money-goal');
const reachedInput = $<HTMLInputElement>('money-reached');
const doneBtn = $<HTMLButtonElement>('money-done');
const week = () => addDays(thisWeek, offset * 7);
const save = () => saveMoney(money);

function render(): void {
  money = loadMoney();
  const w = money[week()];
  document.querySelectorAll<HTMLButtonElement>('[data-money-week]').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.moneyWeek) === offset)));
  $('money-week-label').textContent = weekLabel(week());
  $('money-open').hidden = !!w?.locked;
  $('money-locked').hidden = !w?.locked;
  if (!w?.locked) {
    const fallback = offset === 0 && !w ? loadCompass().fields['affirm.money'] ?? '' : '';
    goalInput.value = w ? formatEuro(w.goal) : fallback;
  } else {
    $('money-goal-show').textContent = formatEuro(w.goal);
    if (document.activeElement !== reachedInput) reachedInput.value = w.reached === null ? '' : formatEuro(w.reached);
    $('money-bar').style.width = `${Math.round(progress(w) * 100)}%`;
    const done = w.reached !== null && w.reached >= w.goal;
    doneBtn.setAttribute('aria-pressed', String(done));
    $('money-note').textContent = done
      ? w.reached! > w.goal ? `Ziel übertroffen um ${formatEuro(w.reached! - w.goal)}. ✦` : 'Ziel erreicht. ✦'
      : w.reached ? `Noch ${formatEuro(w.goal - w.reached)} bis zum Ziel.` : `Festgelegt für ${weekLabel(week())}.`;
  }
  renderPast();
}

function renderPast(): void {
  const past = Object.entries(money).filter(([k]) => k < thisWeek).sort(([a], [b]) => b.localeCompare(a));
  $('money-past').hidden = !past.length;
  $('money-past-list').replaceChildren(
    ...past.map(([k, w]) => {
      const li = document.createElement('li');
      const done = w.reached !== null && w.reached >= w.goal;
      li.textContent = `${weekLabel(k)}: Ziel ${formatEuro(w.goal)} · erreicht ${w.reached === null ? '–' : formatEuro(w.reached)}${done ? ' ✓' : ''}`;
      return li;
    }),
  );
}

document.querySelectorAll<HTMLButtonElement>('[data-money-week]').forEach((b) =>
  b.addEventListener('click', () => {
    offset = Number(b.dataset.moneyWeek);
    render();
  }),
);

$('money-lock').addEventListener('click', () => {
  const goal = parseAmount(goalInput.value);
  if (!goal) {
    goalInput.focus();
    return;
  }
  money = loadMoney();
  money[week()] = { goal, reached: money[week()]?.reached ?? null, locked: true };
  save();
  render();
});

$('money-unlock').addEventListener('click', () => {
  if (!confirm('Festgelegtes Ziel wieder ändern?')) return;
  money = loadMoney();
  if (money[week()]) money[week()].locked = false;
  save();
  render();
});

reachedInput.addEventListener('change', () => {
  money = loadMoney();
  const w = money[week()];
  if (!w) return;
  w.reached = parseAmount(reachedInput.value);
  save();
  render();
});

doneBtn.addEventListener('click', () => {
  money = loadMoney();
  const w = money[week()];
  if (!w) return;
  const done = w.reached !== null && w.reached >= w.goal;
  w.reached = done ? null : Math.max(w.goal, w.reached ?? 0);
  save();
  render();
});

render();
