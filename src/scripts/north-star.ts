import { goalStates, northStarVision } from '../data/compass';
import { dateKey } from '../lib/tracker';
import { loadCompass } from './storage';

/** North Star und „One inspired action“ auf der Startseite (nur Anzeige). */
function render(): void {
  const compass = loadCompass();
  const vision = document.getElementById('north-star-vision');
  if (vision) vision.textContent = compass.fields['northstar.vision']?.trim() || northStarVision;
  const list = document.getElementById('north-star-list');
  const empty = document.getElementById('north-star-empty');
  if (list && empty) {
    const goals = compass.goals.filter((g) => g.text.trim());
    empty.hidden = goals.length > 0;
    list.replaceChildren(
      ...goals.map((g) => {
        const li = document.createElement('li');
        const text = document.createElement('span');
        text.textContent = g.text;
        const badge = document.createElement('span');
        badge.className = `state state-${g.state}`;
        badge.textContent = goalStates.find((s) => s.id === g.state)!.label;
        li.append(text, badge);
        return li;
      }),
    );
  }
  const action = document.getElementById('today-action');
  if (action) {
    const text = compass.actions[dateKey(new Date())];
    action.hidden = !text;
    action.querySelector('strong')!.textContent = text ?? '';
  }
}

document.addEventListener('compass-changed', render);
window.addEventListener('storage', render);
render();
