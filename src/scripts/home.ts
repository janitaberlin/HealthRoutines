import { identity, routines } from '../data/routines';
import { totals } from '../lib/time';
import { dateKey, parseKey, ratio } from '../lib/tracker';
import { loadChecks, loadCompass, loadSessions } from './storage';

/** Startseite: Satz des Tages und kurze Live-Angaben in den vier Kästen. */
const today = dateKey(new Date());
const dayNumber = Math.floor(parseKey(today).getTime() / 86_400_000);
document.getElementById('identity-sentence')!.textContent = identity.sentences[dayNumber % identity.sentences.length];

function setBox(id: string, text: string): void {
  const el = document.querySelector<HTMLElement>(`[data-box="${id}"]`);
  if (el) el.textContent = text;
}

const ids = routines.flatMap((r) => r.items.map((i) => i.id));
const done = Math.round(ratio(loadChecks(), today, ids) * ids.length);
setBox('routinen', done === ids.length ? 'Alles erledigt' : `${done} von ${ids.length} heute`);

const goals = loadCompass().goals.filter((g) => g.text.trim()).length;
if (goals) setBox('vision', goals === 1 ? '1 Ziel' : `${goals} Ziele`);

const minutes = Math.round(totals(loadSessions(), [today]).business);
if (minutes) setBox('fokus', `Heute ${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')} Std.`);
