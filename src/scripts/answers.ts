import { routines } from '../data/routines';
import { journalDays } from '../lib/journal';
import { weekLabel } from '../lib/reflection';
import { parseKey } from '../lib/tracker';
import { loadCompass, loadNotes, loadReflections } from './storage';

/** Meine Antworten: Notizen aus den Routinen, One inspired action und Wochenreflexion, nach Datum. */
const ACTION = { id: 'inspired-action', text: 'One inspired action' };
const questions = [...routines.flatMap((r) => r.items.filter((i) => i.note)), ACTION];

const answers: Record<string, Record<string, string>> = structuredClone(loadNotes());
for (const [day, text] of Object.entries(loadCompass().actions)) (answers[day] ??= {})[ACTION.id] = text;
const days = journalDays(answers, questions);
const weeks = Object.entries(loadReflections()).sort(([a], [b]) => b.localeCompare(a));

/** Filter nach Bereich; die Daily-Intention-Fragen (ids fokus-…) zusammen. */
const group = (id: string) => (id.startsWith('fokus-') ? 'fokus' : id);
const GROUPS = [
  { id: 'dankbar', label: 'Dankbarkeit' },
  { id: 'fokus', label: 'Daily Intention' },
  { id: 'energie-plus', label: 'Energy Check' },
  { id: ACTION.id, label: 'Inspired Action' },
];
const filters = [
  { id: 'alle', label: 'Alle' },
  ...GROUPS.filter((g) => days.some((d) => d.items.some((i) => group(i.id) === g.id))),
  ...(weeks.length ? [{ id: 'woche', label: 'Wochenreflexion' }] : []),
];
let active = 'alle';

function block(title: string, sort: string, items: { label: string; text: string }[]): HTMLElement {
  const section = document.createElement('section');
  section.dataset.sort = sort;
  section.className = 'answer-day';
  const h = document.createElement('h2');
  h.textContent = title;
  section.append(h);
  for (const item of items) {
    const q = document.createElement('p');
    q.className = 'answer-q';
    q.textContent = item.label;
    const a = document.createElement('p');
    a.className = 'answer-a';
    a.textContent = item.text;
    section.append(q, a);
  }
  return section;
}

function render(): void {
  const out: HTMLElement[] = [];
  if (active === 'alle' || active === 'woche') {
    for (const [week, e] of weeks) {
      const items = [
        { label: 'Money-Making Activities', text: e.plan },
        { label: 'Who did I become this week?', text: e.become },
        { label: 'What is the outcome?', text: e.outcome },
      ].filter((i) => i.text.trim());
      if (items.length) out.push(block(`Woche ${weekLabel(week)}`, `${week}z`, items));
    }
  }
  if (active !== 'woche') {
    for (const d of days) {
      const items = d.items.filter((i) => active === 'alle' || group(i.id) === active).map((i) => ({ label: i.question, text: i.text }));
      if (!items.length) continue;
      const title = parseKey(d.day).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      out.push(block(title, d.day, items));
    }
  }
  out.sort((a, b) => (b.dataset.sort ?? '').localeCompare(a.dataset.sort ?? ''));
  const box = document.getElementById('answers')!;
  if (!out.length) {
    const p = document.createElement('p');
    p.className = 'muted';
    p.textContent = 'Noch keine Antworten. Alles, was du in die Notizfelder schreibst, erscheint hier.';
    box.replaceChildren(p);
  } else box.replaceChildren(...out);
  for (const b of document.querySelectorAll<HTMLButtonElement>('[data-filter]')) b.setAttribute('aria-pressed', String(b.dataset.filter === active));
}

document.getElementById('answer-filter')!.replaceChildren(
  ...filters.map((f) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'energy-chip';
    b.dataset.filter = f.id;
    b.textContent = f.label;
    b.addEventListener('click', () => {
      active = f.id;
      render();
    });
    return b;
  }),
);
render();
