import { pickForDay, safeLink, type GoalState } from '../lib/compass';
import { dateKey } from '../lib/tracker';
import { loadCompass, saveCompass } from './storage';

/** Gelegentliche Reflexion zu den Zielen, eine pro Tag. */
const reflections = [
  'Passt dieses Ziel noch zu dir, oder hat es sich verändert?',
  'Welches Ziel fühlt sich gerade lebendig an, welches eher nach Pflicht?',
  'Was wäre ein kleiner Schritt, der sich heute leicht anfühlt?',
];

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

// North Star
for (const box of document.querySelectorAll<HTMLElement>('[data-goal]')) {
  const i = Number(box.dataset.goal);
  const text = box.querySelector<HTMLTextAreaElement>('[data-goal-text]')!;
  const buttons = [...box.querySelectorAll<HTMLButtonElement>('[data-state]')];
  const mark = () => buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.state === compass.goals[i].state)));
  text.value = compass.goals[i].text;
  text.addEventListener('input', () => {
    compass.goals[i].text = text.value;
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
document.getElementById('goal-reflect')!.textContent = pickForDay(reflections, dateKey(new Date()));

// Spark Library
const list = document.getElementById('library-list')!;
function renderLibrary(): void {
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

document.getElementById('library-form')!.addEventListener('submit', (e) => {
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
