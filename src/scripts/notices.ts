import { daysBetween } from '../lib/cycle';
import { dateKey } from '../lib/tracker';
import { loadLastBackup, shareBackup } from './storage';

/** Hinweise auf Heute: sonntags Plan your week, einmal im Monat die Sicherung. */
const today = dateKey(new Date());
document.getElementById('sunday-notice')!.hidden = new Date().getDay() !== 0;

const backup = document.getElementById('backup-notice')!;
const last = loadLastBackup();
backup.hidden = !!last && daysBetween(last, today) < 30;
document.getElementById('backup-now')!.addEventListener('click', async () => {
  if (await shareBackup()) backup.hidden = true;
});
