import { affirmQuestions, defaultAffirmations, femaleVoices, languages, maleVoices } from '../data/affirmations';
import { buildPrompt, claudeLink, lines, pickVoice, type Gender } from '../lib/affirm';
import { Ambient } from './ambient';
import { loadCompass, saveCompass } from './storage';

/** My Affirmations: Morning/Evening anhören mit Stimme und Musik, mit Claude aus eigenen Antworten erstellen. */
type Mode = 'morning' | 'evening';
const SETTINGS = { morning: { rate: 0.95, pause: 2500, loopMinutes: 0 }, evening: { rate: 0.82, pause: 5000, loopMinutes: 20 } };

let compass = loadCompass();
let mode: Mode = new Date().getHours() >= 17 ? 'evening' : 'morning';
let playing = false;
let timer = 0;
const music = new Ambient();

const field = (key: string, fallback = '') => compass.fields[key]?.trim() || fallback;
const setField = (key: string, value: string) => {
  compass = loadCompass();
  compass.fields[key] = value;
  saveCompass(compass);
};
const current = () => lines(field(`affirm.${mode}`, defaultAffirmations[mode]));

const list = document.getElementById('affirm-list')!;
const status = document.getElementById('affirm-status')!;
const playBtn = document.getElementById('affirm-play') as HTMLButtonElement;
const langSel = document.getElementById('affirm-lang') as HTMLSelectElement;
const genderSel = document.getElementById('affirm-gender') as HTMLSelectElement;
const musicBox = document.getElementById('affirm-music') as HTMLInputElement;

function render(): void {
  for (const tab of document.querySelectorAll<HTMLButtonElement>('[data-mode]')) tab.setAttribute('aria-selected', String(tab.dataset.mode === mode));
  for (const el of document.querySelectorAll<HTMLElement>('[data-why]')) el.hidden = el.dataset.why !== mode;
  document.getElementById('why-title')!.textContent = mode === 'morning' ? 'Warum morgens' : 'Warum abends beim Einschlafen';
  list.replaceChildren(
    ...current().map((t) => {
      const li = document.createElement('li');
      li.textContent = t;
      return li;
    }),
  );
}

function voice(): SpeechSynthesisVoice | null {
  const lang = languages.find((l) => l.id === langSel.value) ?? languages[0];
  return pickVoice(speechSynthesis.getVoices(), lang.lang, genderSel.value as Gender, femaleVoices, maleVoices);
}

function stop(text = ''): void {
  playing = false;
  window.clearTimeout(timer);
  speechSynthesis.cancel();
  music.stop();
  playBtn.classList.remove('is-playing');
  playBtn.setAttribute('aria-label', 'Abspielen');
  list.querySelectorAll('li').forEach((li) => li.classList.remove('is-now'));
  status.textContent = text;
}

function play(): void {
  if (!('speechSynthesis' in window)) {
    status.textContent = 'Dieses Gerät kann leider nicht vorlesen.';
    return;
  }
  const sentences = current();
  if (!sentences.length) return;
  const v = voice();
  const lang = languages.find((l) => l.id === langSel.value) ?? languages[0];
  const { rate, pause, loopMinutes } = SETTINGS[mode];
  const until = Date.now() + loopMinutes * 60000;
  playing = true;
  playBtn.classList.add('is-playing');
  playBtn.setAttribute('aria-label', 'Stoppen');
  if (musicBox.checked) music.start(mode === 'evening' ? 0.14 : 0.18);
  status.textContent = v ? `Stimme: ${v.name}` : `Keine ${lang.label}-Stimme auf diesem Gerät gefunden, es liest die Standardstimme.`;
  if (mode === 'evening') status.textContent += ' · läuft bis zu 20 Min., Bildschirm anlassen';
  let i = 0;
  const next = () => {
    if (!playing) return;
    if (i >= sentences.length) {
      if (Date.now() < until) i = 0;
      else return stop('Fertig. ✦');
    }
    list.querySelectorAll('li').forEach((li, n) => li.classList.toggle('is-now', n === i));
    const u = new SpeechSynthesisUtterance(sentences[i]);
    u.lang = lang.lang;
    if (v) u.voice = v;
    u.rate = rate;
    u.pitch = 1;
    u.onend = () => {
      i++;
      timer = window.setTimeout(next, pause);
    };
    speechSynthesis.speak(u);
  };
  // Musik erst kurz einklingen lassen.
  timer = window.setTimeout(next, musicBox.checked ? 2500 : 0);
}

playBtn.addEventListener('click', () => (playing ? stop() : play()));
for (const tab of document.querySelectorAll<HTMLButtonElement>('[data-mode]'))
  tab.addEventListener('click', () => {
    stop();
    mode = tab.dataset.mode as Mode;
    render();
  });

langSel.value = field('affirm.lang', 'de');
genderSel.value = field('affirm.gender', 'frau');
musicBox.checked = field('affirm.music', 'an') === 'an';
langSel.addEventListener('change', () => {
  setField('affirm.lang', langSel.value);
  updateLink();
});
genderSel.addEventListener('change', () => setField('affirm.gender', genderSel.value));
musicBox.addEventListener('change', () => setField('affirm.music', musicBox.checked ? 'an' : 'aus'));

// Fragen und eigene Affirmationen (leer gelassen = Startwerte).
for (const el of document.querySelectorAll<HTMLTextAreaElement>('[data-field]')) {
  const key = el.dataset.field!;
  el.value = compass.fields[key] ?? el.dataset.default ?? '';
  el.addEventListener('input', () => {
    setField(key, el.value);
    updateLink();
    render();
  });
}

const claude = document.getElementById('affirm-claude') as HTMLAnchorElement;
function updateLink(): void {
  const lang = languages.find((l) => l.id === langSel.value) ?? languages[0];
  claude.href = claudeLink(buildPrompt(affirmQuestions.map((q) => ({ label: q.label, text: field(q.id) })), lang.prompt));
}

window.addEventListener('pagehide', () => stop());
updateLink();
render();
