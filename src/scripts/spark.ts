import { identityDefaults, sparkQuestions } from '../data/compass';
import { pickForDay } from '../lib/compass';
import { dateKey } from '../lib/tracker';
import { loadCompass, saveCompass, trackUse } from './storage';

const STEPS = ['Remember', 'Feel', 'Create'];
const dialog = document.getElementById('spark') as HTMLDialogElement | null;
let step = 1;

function field(key: string, fallback: string): string {
  return loadCompass().fields[key]?.trim() || fallback;
}

function fill(): void {
  const today = dateKey(new Date());
  const compass = loadCompass();
  document.getElementById('spark-signature')!.textContent = field('identity.signature', identityDefaults.signature);
  document.getElementById('spark-design')!.textContent = field('identity.design', identityDefaults.design);
  const talents = field('identity.talents', identityDefaults.talents).split('\n').filter((t) => t.trim());
  document.getElementById('spark-talents')!.replaceChildren(
    ...talents.map((t) => {
      const li = document.createElement('li');
      li.textContent = t;
      return li;
    }),
  );
  const memory = document.getElementById('spark-memory')!;
  if (compass.library.length) {
    const item = pickForDay(compass.library, today);
    memory.hidden = false;
    memory.textContent = `Aus deiner Spark Library · ${item.type}: ${item.text}`;
  } else memory.hidden = true;
  document.getElementById('spark-question')!.textContent = pickForDay(sparkQuestions, today);
  (document.getElementById('spark-action') as HTMLTextAreaElement).value = compass.actions[today] ?? '';
}

function show(n: number): void {
  step = n;
  for (const s of dialog!.querySelectorAll<HTMLElement>('.spark-step')) s.hidden = Number(s.dataset.step) !== n;
  document.getElementById('spark-step-label')!.textContent = `${n} / 3 · ${STEPS[n - 1]}`;
  (document.getElementById('spark-back') as HTMLButtonElement).hidden = n === 1;
  document.getElementById('spark-next')!.textContent = n === 3 ? 'Fertig' : 'Weiter';
}

if (dialog) {
  document.addEventListener('click', (e) => {
    if (!(e.target as HTMLElement).closest('[data-ignite]')) return;
    fill();
    show(1);
    dialog.showModal();
    trackUse('ritual');
  });
  document.getElementById('spark-back')!.addEventListener('click', () => show(step - 1));
  document.getElementById('spark-next')!.addEventListener('click', () => {
    if (step < 3) return show(step + 1);
    const today = dateKey(new Date());
    const text = (document.getElementById('spark-action') as HTMLTextAreaElement).value.trim();
    const compass = loadCompass();
    if (text) compass.actions[today] = text;
    else delete compass.actions[today];
    saveCompass(compass);
    dialog.close();
    document.dispatchEvent(new CustomEvent('compass-changed'));
  });
}
