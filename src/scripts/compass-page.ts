import { reviewDays } from '../data/compass';
import { reviewDue, safeLink, type GoalState } from '../lib/compass';
import { dateKey } from '../lib/tracker';
import { loadCompass, saveCompass } from './storage';

let compass = loadCompass();

function save(): void {
  saveCompass(compass);
  document.dispatchEvent(new CustomEvent('compass-changed'));
}

function grow(el: HTMLTextAreaElement): void {
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight + 2}px`;
}

// Freitextfelder: leer gelassen = Startwert.
for (const el of document.querySelectorAll<HTMLTextAreaElement>('[data-field]')) {
  const key = el.dataset.field!;
  el.value = compass.fields[key] ?? el.dataset.default ?? '';
  el.addEventListener('input', () => {
    compass.fields[key] = el.value;
    save();
    grow(el);
  });
  grow(el);
  el.closest('details')?.addEventListener('toggle', () => grow(el));
}

// Nach dem Laden der Schrift und bei Größenänderung neu messen.
const growAll = () => document.querySelectorAll<HTMLTextAreaElement>('[data-field]').forEach(grow);
window.addEventListener('load', growAll);
window.addEventListener('resize', growAll);
document.fonts?.ready.then(growAll);

// North Star
for (const box of document.querySelectorAll<HTMLElement>('[data-goal]')) {
  const i = Number(box.dataset.goal);
  const text = box.querySelector<HTMLTextAreaElement>('[data-goal-text]')!;
  const buttons = [...box.querySelectorAll<HTMLButtonElement>('[data-state]')];
  const mark = () => buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.state === compass.goals[i].state)));
  text.value = compass.goals[i].text;
  text.addEventListener('input', () => {
    compass.goals[i].text = text.value;
    // Wer Ziele festlegt, hat sie gerade überprüft: erster Check erst in einem Monat.
    compass.fields['goals.reviewed'] ??= dateKey(new Date());
    save();
  });
  for (const b of buttons)
    b.addEventListener('click', () => {
      compass.goals[i].state = b.dataset.state as GoalState;
      save();
      mark();
    });
  mark();
}
// Monatlicher Ziel-Check statt tägliches Neuverhandeln (auf Vision).
function renderReview(): void {
  if (!document.getElementById('goal-review-text')) return;
  const last = compass.fields['goals.reviewed'];
  const due = reviewDue(last, dateKey(new Date()), reviewDays);
  document.getElementById('goal-review-text')!.textContent = last
    ? `Zuletzt überprüft am ${last.split('-').reverse().join('.')}.`
    : 'Noch nicht überprüft.';
  document.getElementById('goal-reflect')!.hidden = !due;
}
document.getElementById('goal-review-btn')?.addEventListener('click', () => {
  compass.fields['goals.reviewed'] = dateKey(new Date());
  save();
  renderReview();
});
renderReview();

// Spark Library (in My Journey unter Vertiefen)
const list = document.getElementById('library-list');
function renderLibrary(): void {
  if (!list) return;
  list.replaceChildren(
    ...[...compass.library].reverse().map((item) => {
      const li = document.createElement('li');
      const type = document.createElement('span');
      type.className = 'library-type';
      type.textContent = item.type;
      const link = safeLink(item.link);
      const text = document.createElement(link ? 'a' : 'span');
      text.textContent = item.text;
      if (link) {
        (text as HTMLAnchorElement).href = link;
        (text as HTMLAnchorElement).target = '_blank';
        (text as HTMLAnchorElement).rel = 'noopener';
      }
      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'library-del';
      del.textContent = '×';
      del.setAttribute('aria-label', `${item.text} entfernen`);
      del.addEventListener('click', () => {
        compass.library = compass.library.filter((x) => x.id !== item.id);
        save();
        renderLibrary();
      });
      li.append(type, text, del);
      return li;
    }),
  );
}

document.getElementById('library-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = document.getElementById('library-text') as HTMLInputElement;
  const link = document.getElementById('library-link') as HTMLInputElement;
  if (!text.value.trim()) return;
  compass.library.push({
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    type: (document.getElementById('library-type') as HTMLSelectElement).value,
    text: text.value.trim(),
    link: safeLink(link.value),
  });
  save();
  text.value = '';
  link.value = '';
  renderLibrary();
});

window.addEventListener('storage', () => {
  compass = loadCompass();
  renderLibrary();
});
renderLibrary();
