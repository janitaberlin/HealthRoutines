import { weekLabel, weekStart, type WeekEntry } from '../lib/reflection';
import { dateKey } from '../lib/tracker';
import { loadReflections, saveReflections } from './storage';

/** Plan your week + Wochenreflexion im Verlauf: drei Fragen für die laufende Woche, frühere Wochen darunter. */
const week = weekStart(dateKey(new Date()));
document.getElementById('reflection-week')!.textContent = weekLabel(week);

for (const field of document.querySelectorAll<HTMLTextAreaElement>('[data-reflect]')) {
  const key = field.dataset.reflect as keyof WeekEntry;
  field.value = loadReflections()[week]?.[key] ?? '';
  field.addEventListener('input', () => {
    const all = loadReflections();
    const entry = { plan: '', become: '', outcome: '', ...all[week], [key]: field.value };
    if (entry.plan.trim() || entry.become.trim() || entry.outcome.trim()) all[week] = entry;
    else delete all[week];
    saveReflections(all);
  });
}

const past = Object.entries(loadReflections())
  .filter(([k]) => k < week)
  .sort(([a], [b]) => b.localeCompare(a));
const list = document.getElementById('reflection-past')!;
list.hidden = !past.length;
for (const [k, e] of past) {
  const item = document.createElement('details');
  item.className = 'reflection-old';
  const summary = document.createElement('summary');
  summary.textContent = weekLabel(k);
  item.append(summary);
  for (const [label, text] of [['Money-Making Activities', e.plan], ['Who did I become?', e.become], ['Outcome', e.outcome]]) {
    if (!text.trim()) continue;
    const h = document.createElement('p');
    h.className = 'eyebrow';
    h.textContent = label;
    const p = document.createElement('p');
    p.className = 'reflection-text';
    p.textContent = text;
    item.append(h, p);
  }
  list.append(item);
}
