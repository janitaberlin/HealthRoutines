import { affirmQuestions, defaultAffirmations, femaleVoices, languages, maleVoices } from '../data/affirmations';
import { buildPrompt, claudeLink, lines, pickVoice, type Gender } from '../lib/affirm';
import { Ambient } from './ambient';
import { dateKey } from '../lib/tracker';
import { loadCompass, loadMoney, saveCompass } from './storage';
import { formatEuro } from '../lib/money';
import { weekStart } from '../lib/reflection';
import { deleteRecording, loadRecording, saveRecording, startRecording } from './recording';

/** My Affirmations (Morning/Evening) und Power Talk auf Ziele: anhören mit Stimme und Musik, mit Claude aus eigenen Antworten erstellen. */
type Mode = 'morning' | 'power' | 'evening';
const MODES: Mode[] = ['morning', 'power', 'evening'];
const LABEL: Record<Mode, string> = { morning: 'Morning', power: 'Power Talk', evening: 'Evening' };
const WHY: Record<Mode, string> = { morning: 'Warum morgens', power: 'Warum ein Power Talk', evening: 'Warum abends beim Einschlafen' };
const TEXT = {
  morning: { title: 'Your morning words', sub: 'Set the frame for your day.', start: 'Start morning session' },
  power: { title: 'Your power talk', sub: 'Wake up your energy and your money mindset.', start: 'Start power talk' },
  evening: { title: 'Tonight’s reset', sub: 'Let go and fall asleep with your own words.', start: 'Start evening session' },
};
const SETTINGS = { morning: { rate: 0.95, pause: 2500, loopMinutes: 0 }, power: { rate: 1.02, pause: 1400, loopMinutes: 0 }, evening: { rate: 0.82, pause: 5000, loopMinutes: 20 } };

let compass = loadCompass();
// Auf Ziele läuft nur der Power Talk, auf Affirm Morning und Evening.
const fixed = document.querySelector<HTMLElement>('[data-fixed-mode]')?.dataset.fixedMode as Mode | undefined;
const asked = new URLSearchParams(location.search).get('mode') as Mode | null;
let mode: Mode = fixed ?? (asked && asked in TEXT ? asked : new Date().getHours() >= 17 ? 'evening' : 'morning');
let playing = false;
let timer = 0;
let spoken: SpeechSynthesisUtterance | null = null;
let audio: HTMLAudioElement | null = null;
const recUrls: Partial<Record<Mode, string>> = {};
const music = new Ambient();

const field = (key: string, fallback = '') => compass.fields[key]?.trim() || fallback;
const setField = (key: string, value: string) => {
  compass = loadCompass();
  compass.fields[key] = value;
  saveCompass(compass);
};
/** Ziel der laufenden Woche aus Ziele; sonst das alte Feld, sonst 1000 €. */
const moneyGoal = () => {
  const w = loadMoney()[weekStart(dateKey(new Date()))];
  return w ? formatEuro(w.goal) : field('affirm.money', '1000 €');
};
const current = () => lines(field(`affirm.${mode}`, defaultAffirmations[mode]).replaceAll('{ziel}', moneyGoal()));

const status = document.getElementById('affirm-status')!;
const playBtn = document.getElementById('affirm-play') as HTMLButtonElement;
const langSel = document.getElementById('affirm-lang') as HTMLSelectElement;
const genderSel = document.getElementById('affirm-gender') as HTMLSelectElement;
const musicBox = document.getElementById('affirm-music') as HTMLInputElement;

function render(): void {
  for (const tab of document.querySelectorAll<HTMLButtonElement>('[data-mode]')) tab.setAttribute('aria-selected', String(tab.dataset.mode === mode));
  for (const el of document.querySelectorAll<HTMLElement>('[data-why]')) el.hidden = el.dataset.why !== mode;
  for (const el of document.querySelectorAll<HTMLElement>('[data-words]')) el.hidden = el.dataset.words !== mode;
  document.getElementById('affirm-title')!.textContent = TEXT[mode].title;
  document.getElementById('affirm-sub')!.textContent = TEXT[mode].sub;
  document.getElementById('affirm-play-label')!.textContent = TEXT[mode].start;
  document.getElementById('affirm-now')!.textContent = current()[0] ?? '';
  const days = playedDays().length;
  const goalBox = document.getElementById('money-goal-box');
  if (goalBox) goalBox.hidden = mode !== 'power';
  const goalShow = document.getElementById('money-goal-show');
  if (goalShow) goalShow.textContent = moneyGoal();
  const daysEl = document.getElementById('affirm-days');
  if (daysEl) daysEl.textContent = String(Math.max(days, 1)).padStart(2, '0');
  document.getElementById('why-title')!.textContent = WHY[mode];
}

/** Tage, an denen ich zugehört habe: „Day 07“ wie im Vorbild. */
function playedDays(): string[] {
  return field('affirm.played').split(',').filter(Boolean);
}
function markPlayed(): void {
  const today = dateKey(new Date());
  const days = playedDays();
  if (!days.includes(today)) setField('affirm.played', [...days, today].join(','));
}

function voice(): SpeechSynthesisVoice | null {
  const lang = languages.find((l) => l.id === langSel.value) ?? languages[0];
  return pickVoice(speechSynthesis.getVoices(), lang.lang, genderSel.value as Gender, femaleVoices, maleVoices);
}

function stop(text = ''): void {
  playing = false;
  window.clearTimeout(timer);
  speechSynthesis.cancel();
  audio?.pause();
  audio = null;
  music.stop();
  playBtn.classList.remove('is-playing');
  document.getElementById('affirm-play-label')!.textContent = TEXT[mode].start;
  document.getElementById('affirm-now')!.textContent = current()[0] ?? '';
  status.textContent = text;
}

/** Eigene Aufnahme abspielen; Evening wiederholt sie bis zu 20 Min. */
function playRecording(): void {
  const src = recUrls[mode];
  if (!src) {
    status.textContent = `Noch keine eigene Aufnahme für ${LABEL[mode]}. Unten bei „Mit meiner Stimme“ aufnehmen.`;
    return;
  }
  const until = Date.now() + SETTINGS[mode].loopMinutes * 60000;
  const a = new Audio(src);
  audio = a;
  playing = true;
  markPlayed();
  render();
  playBtn.classList.add('is-playing');
  document.getElementById('affirm-play-label')!.textContent = 'Stop';
  if (musicBox.checked) music.start(mode === 'evening' ? 0.12 : 0.16, mode === 'power' ? 4500 : 9000);
  status.textContent = 'Deine eigene Stimme';
  if (mode === 'evening') status.textContent += ' · läuft bis zu 20 Min., Bildschirm anlassen';
  a.onended = () => {
    if (!playing || audio !== a) return;
    if (Date.now() < until) timer = window.setTimeout(() => playing && audio === a && void a.play(), 4000);
    else stop('Fertig. ✦');
  };
  a.play().catch(() => stop('Die Aufnahme ließ sich nicht abspielen. Bitte nochmal tippen.'));
}

function play(): void {
  if (genderSel.value === 'ich') return playRecording();
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
  markPlayed();
  render();
  playBtn.classList.add('is-playing');
  document.getElementById('affirm-play-label')!.textContent = 'Stop';
  if (musicBox.checked) music.start(mode === 'evening' ? 0.14 : 0.18, mode === 'power' ? 4500 : 9000);
  status.textContent = v ? `Stimme: ${v.name}` : `Keine ${lang.label}-Stimme auf diesem Gerät gefunden, es liest die Standardstimme.`;
  if (mode === 'evening') status.textContent += ' · läuft bis zu 20 Min., Bildschirm anlassen';
  let i = 0;
  const next = () => {
    if (!playing) return;
    if (i >= sentences.length) {
      if (Date.now() < until) i = 0;
      else return stop('Fertig. ✦');
    }
    document.getElementById('affirm-now')!.textContent = sentences[i];
    const u = new SpeechSynthesisUtterance(sentences[i]);
    spoken = u; // iPhone: ohne Referenz wird onend manchmal nie ausgelöst
    u.lang = lang.lang;
    if (v) u.voice = v;
    u.rate = rate;
    u.pitch = 1;
    u.onend = () => {
      i++;
      timer = window.setTimeout(next, pause);
    };
    u.onerror = (e) => {
      if (!playing || e.error === 'interrupted' || e.error === 'canceled') return;
      stop('Vorlesen ging nicht. Bitte Lautstärke prüfen und nochmal starten.');
    };
    speechSynthesis.speak(u);
  };
  // iPhone erlaubt Vorlesen nur direkt nach dem Tippen: deshalb sofort starten, die Musik blendet sich sanft ein.
  speechSynthesis.cancel();
  next();
}

playBtn.addEventListener('click', () => (playing ? stop() : play()));
for (const tab of document.querySelectorAll<HTMLButtonElement>('[data-mode]'))
  tab.addEventListener('click', () => {
    stop();
    mode = tab.dataset.mode as Mode;
    render();
    renderRec();
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

// Money-Ziel der Woche für den Power Talk.
const goalInput = document.getElementById('money-goal') as HTMLInputElement | null;
if (goalInput) goalInput.value = field('affirm.money');
goalInput?.addEventListener('input', () => {
  setField('affirm.money', goalInput!.value);
  render();
});

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

const claude = document.getElementById('affirm-claude') as HTMLAnchorElement | null;
function updateLink(): void {
  if (!claude) return;
  const lang = languages.find((l) => l.id === langSel.value) ?? languages[0];
  claude.href = claudeLink(buildPrompt(affirmQuestions.map((q) => ({ label: q.label, text: field(q.id) })), lang.prompt));
}

// Aufnahme mit eigener Stimme, je Modus eine.
const recBtn = document.getElementById('rec-btn') as HTMLButtonElement;
const recDel = document.getElementById('rec-del') as HTMLButtonElement;
const recStatus = document.getElementById('rec-status')!;
let recorder: { stop: () => Promise<Blob> } | null = null;
const modeLabel = () => LABEL[mode];

function renderRec(): void {
  const has = !!recUrls[mode];
  recDel.hidden = !has || !!recorder;
  if (recorder) return;
  recBtn.textContent = has ? '● Neu aufnehmen' : '● Aufnehmen';
  recStatus.textContent = has ? `Deine Aufnahme für ${modeLabel()} ist gespeichert. Bei Stimme „Meine Aufnahme“ wählen.` : `Noch keine Aufnahme für ${modeLabel()}.`;
}

async function loadRecs(): Promise<void> {
  for (const m of MODES) {
    const blob = await loadRecording(`affirm-${m}`);
    if (recUrls[m]) URL.revokeObjectURL(recUrls[m]!);
    recUrls[m] = blob ? URL.createObjectURL(blob) : undefined;
  }
  renderRec();
}

recBtn.addEventListener('click', async () => {
  if (recorder) {
    const r = recorder;
    recorder = null;
    recBtn.classList.remove('is-recording');
    const blob = await r.stop();
    try {
      await saveRecording(`affirm-${mode}`, blob);
    } catch {
      recStatus.textContent = 'Speichern hat nicht geklappt.';
      return;
    }
    genderSel.value = 'ich';
    setField('affirm.gender', 'ich');
    await loadRecs();
    return;
  }
  stop();
  try {
    recorder = await startRecording();
  } catch {
    recStatus.textContent = 'Kein Zugriff aufs Mikrofon. Bitte in den Einstellungen erlauben.';
    return;
  }
  recBtn.classList.add('is-recording');
  recBtn.textContent = '■ Aufnahme beenden';
  recDel.hidden = true;
  recStatus.textContent = `Aufnahme läuft (${modeLabel()}). Lies deine Sätze oben langsam vor.`;
});

recDel.addEventListener('click', async () => {
  await deleteRecording(`affirm-${mode}`);
  await loadRecs();
});

window.addEventListener('pagehide', () => stop());
void loadRecs();
updateLink();
render();
