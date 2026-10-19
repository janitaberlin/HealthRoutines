import { goalStates, northStarVision, reviewDays } from '../data/compass';
import { reviewDue } from '../lib/compass';
import { dateKey } from '../lib/tracker';
import { loadCompass, saveCompass } from './storage';

/** Ziele und „One inspired action“ auf der Startseite. */
function save(change: (c: ReturnType<typeof loadCompass>) => void): void {
  const compass = loadCompass();
  change(compass);
  // Erste Ziele starten den monatlichen Check, wie im Compass.
  if (!compass.fields['goals.reviewed'] && compass.goals.some((g) => g.text.trim())) compass.fields['goals.reviewed'] = dateKey(new Date());
  saveCompass(compass);
  render();
}

function grow(el: HTMLTextAreaElement): void {
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight + 1}px`;
}

function goalRow(i: number): HTMLLIElement {
  const li = document.createElement('li');
  li.className = 'goal-row';
  const num = document.createElement('span');
  num.className = 'goal-num';
  num.textContent = String(i + 1);
  const input = document.createElement('textarea');
  input.className = 'goal-input';
  input.rows = 1;
  input.addEventListener('input', () => grow(input));
  input.placeholder = ['Mein wichtigstes Ziel …', 'Zweites Ziel …', 'Drittes Ziel …'][i];
  input.enterKeyHint = 'done';
  input.addEventListener('change', () => save((c) => (c.goals[i].text = input.value.trim())));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      input.blur();
    }
  });
  const badge = document.createElement('button');
  badge.type = 'button';
  badge.addEventListener('click', () =>
    save((c) => {
      const next = (goalStates.findIndex((s) => s.id === c.goals[i].state) + 1) % goalStates.length;
      c.goals[i].state = goalStates[next].id;
    }),
  );
  li.append(num, input, badge);
  return li;
}

function render(): void {
  const compass = loadCompass();
  const vision = document.getElementById('north-star-vision');
  if (vision) vision.textContent = compass.fields['northstar.vision']?.trim() || northStarVision;
  const list = document.getElementById('north-star-list');
  // Ziele direkt auf Heute: tippen zum Schreiben, Etikett tippen wechselt den Stand.
  if (list) {
    if (!list.children.length) list.append(...compass.goals.map((_, i) => goalRow(i)));
    compass.goals.forEach((g, i) => {
      const row = list.children[i];
      const input = row.querySelector('textarea')!;
      if (document.activeElement !== input) input.value = g.text;
      grow(input);
      const state = goalStates.find((s) => s.id === g.state)!;
      const badge = row.querySelector('button')!;
      badge.className = `state state-${g.state}`;
      badge.textContent = state.label;
      badge.title = state.hint;
      badge.hidden = !g.text.trim();
    });
  }
  // Hinweis nur, wenn Ziele da sind und der monatliche Check fällig ist.
  const review = document.getElementById('north-star-review');
  if (review)
    review.hidden =
      !compass.goals.some((g) => g.text.trim()) || !reviewDue(compass.fields['goals.reviewed'], dateKey(new Date()), reviewDays);
  const action = document.getElementById('today-action');
  if (action) {
    const text = compass.actions[dateKey(new Date())];
    action.hidden = !text;
    action.querySelector('strong')!.textContent = text ?? '';
  }
}

document.addEventListener('compass-changed', render);
// Nach dem Laden der Schrift und beim Drehen die Höhe der Ziel-Felder neu messen.
const regrow = () => document.querySelectorAll<HTMLTextAreaElement>('.goal-input').forEach(grow);
document.fonts?.ready.then(regrow);
window.addEventListener('resize', regrow);
window.addEventListener('storage', render);
render();
