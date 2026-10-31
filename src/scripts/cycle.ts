import { dayInfo, energyByPhase, ENERGY, flowDays, PHASES, setEnergy, setNote, toggleFlow, togglePeriod, cycleLength, type Phase } from '../lib/cycle';
import { addDays, dateKey, parseKey } from '../lib/tracker';
import { loadCycle, saveCycle } from './storage';

/** Zyklus eintragen (Heute-Karte und Zyklus-Seite) und auf der Zyklus-Seite das Diagramm zeichnen. */
const today = dateKey(new Date());
let day = today;
const PHASE_LABEL = Object.fromEntries(PHASES.map((p) => [p.id, p.label])) as Record<Phase, string>;
const PHASE_TIP = Object.fromEntries(PHASES.map((p) => [p.id, p.tip])) as Record<Phase, string>;
const DAYS = 56;

function render(): void {
  const data = loadCycle();
  const info = dayInfo(data, day);
  const dateText = day === today ? 'Heute' : parseKey(day).toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' });
  for (const el of document.querySelectorAll('[data-cycle-day]')) {
    el.textContent = info ? `${dateText} · Zyklustag ${info.cycleDay}` : dateText;
  }
  for (const el of document.querySelectorAll('[data-cycle-phase]')) {
    el.textContent = info ? PHASE_LABEL[info.phase] : 'Noch keine Periode eingetragen';
  }
  for (const el of document.querySelectorAll<HTMLElement>('[data-cycle-tip]')) {
    el.hidden = !info;
    el.textContent = info ? PHASE_TIP[info.phase] : '';
  }
  for (const btn of document.querySelectorAll<HTMLButtonElement>('[data-cycle-period]')) {
    btn.setAttribute('aria-pressed', String(data.periods.includes(day)));
  }
  for (const btn of document.querySelectorAll<HTMLButtonElement>('[data-energy]')) {
    btn.setAttribute('aria-pressed', String(data.energy[day] === Number(btn.dataset.energy)));
  }
  for (const btn of document.querySelectorAll<HTMLButtonElement>('[data-cycle-flow]')) {
    btn.setAttribute('aria-pressed', String((data.flow ?? []).includes(day)));
  }
  for (const box of document.querySelectorAll<HTMLTextAreaElement>('[data-cycle-note]')) {
    if (document.activeElement !== box || listening) box.value = data.notes?.[day] ?? '';
  }
  drawChart();
  drawPhases();
  drawFlow();
}

/** Lieblingsmodus-Tage mit Zyklustag, damit sich Muster zeigen. */
function drawFlow(): void {
  const box = document.getElementById('flow-list');
  if (!box) return;
  const list = flowDays(loadCycle());
  if (!list.length) {
    box.innerHTML = '<p class="muted">Noch kein Tag markiert. Tippe an einem Tag, an dem alles leicht geht, auf „✦ Mein Lieblingsmodus“.</p>';
    return;
  }
  box.replaceChildren(
    ...list.map((f) => {
      const item = document.createElement('div');
      item.className = 'flow-item';
      const head = document.createElement('p');
      head.className = 'flow-head';
      const date = parseKey(f.day).toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' });
      head.textContent = `✦ ${date}${f.info ? ` · Zyklustag ${f.info.cycleDay} · ${PHASE_LABEL[f.info.phase]}` : ''}`;
      item.append(head);
      if (f.note) {
        const note = document.createElement('p');
        note.className = 'flow-note';
        note.textContent = f.note;
        item.append(note);
      }
      return item;
    }),
  );
}

/* Sprechen statt tippen: Spracherkennung des Browsers (de-DE), Text wird an die Notiz angehängt. */
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};
const RecognitionCtor = (window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition }).SpeechRecognition
  ?? (window as unknown as { webkitSpeechRecognition?: new () => Recognition }).webkitSpeechRecognition;
let listening: Recognition | null = null;
let micBox: HTMLTextAreaElement | null = null;

function hint(text: string): void {
  for (const el of document.querySelectorAll<HTMLElement>('[data-cycle-mic-hint]')) {
    el.hidden = !text;
    el.textContent = text;
  }
}

function setMic(on: boolean): void {
  for (const btn of document.querySelectorAll<HTMLButtonElement>('[data-cycle-mic]')) {
    btn.setAttribute('aria-pressed', String(on));
    btn.textContent = on ? '■ Fertig' : '🎙 Erzählen';
  }
}

function startMic(box: HTMLTextAreaElement): void {
  if (!RecognitionCtor) {
    hint('Hier geht Sprechen über die Tastatur: ins Feld tippen und unten auf der Tastatur das Mikrofon antippen.');
    box.focus();
    return;
  }
  const rec = new RecognitionCtor();
  rec.lang = 'de-DE';
  rec.continuous = true;
  rec.interimResults = true;
  const base = box.value.trim();
  let finalText = '';
  micBox = box;
  rec.onresult = (e) => {
    let interim = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const res = e.results[i];
      if (res.isFinal) finalText += `${res[0].transcript.trim()} `;
      else interim += res[0].transcript;
    }
    const text = [base, (finalText + interim).trim()].filter(Boolean).join(base ? '\n' : '');
    box.value = text;
    saveCycle(setNote(loadCycle(), day, [base, finalText.trim()].filter(Boolean).join('\n')));
  };
  rec.onerror = (e) => {
    if (e.error === 'not-allowed' || e.error === 'service-not-allowed') hint('Mikrofon ist gesperrt. Alternativ ins Feld tippen und auf der Tastatur das Mikrofon nutzen.');
    else if (e.error !== 'no-speech' && e.error !== 'aborted') hint('Sprechen hat gerade nicht geklappt. Ins Feld tippen und das Mikrofon der Tastatur nutzen geht immer.');
  };
  rec.onend = () => {
    listening = null;
    micBox = null;
    setMic(false);
    render();
  };
  try {
    rec.start();
    listening = rec;
    hint('');
    setMic(true);
  } catch {
    hint('Sprechen hat gerade nicht geklappt. Ins Feld tippen und das Mikrofon der Tastatur nutzen geht immer.');
  }
}

let noteTimer = 0;
document.addEventListener('input', (e) => {
  const box = (e.target as HTMLElement).closest<HTMLTextAreaElement>('[data-cycle-note]');
  if (!box || box === micBox) return;
  clearTimeout(noteTimer);
  noteTimer = window.setTimeout(() => saveCycle(setNote(loadCycle(), day, box.value)), 300);
});
document.addEventListener('focusout', (e) => {
  const box = (e.target as HTMLElement).closest<HTMLTextAreaElement>('[data-cycle-note]');
  if (!box || box === micBox) return;
  clearTimeout(noteTimer);
  saveCycle(setNote(loadCycle(), day, box.value));
  render();
});

function drawChart(): void {
  const box = document.getElementById('cycle-chart');
  if (!box) return;
  const data = loadCycle();
  const W = 340;
  const H = 150;
  const top = 10;
  const bottom = 104;
  const step = W / DAYS;
  const start = addDays(today, -(DAYS - 1));
  const y = (v: number) => bottom - ((v - 1) / 4) * (bottom - top);
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Energie und Zyklusphasen der letzten 8 Wochen');
  const add = (tag: string, attrs: Record<string, string | number>, text?: string) => {
    const el = document.createElementNS(ns, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
    if (text) el.textContent = text;
    svg.append(el);
    return el;
  };
  for (let lvl = 1; lvl <= 5; lvl++) add('line', { x1: 0, x2: W, y1: y(lvl), y2: y(lvl), class: 'grid' });
  add('text', { x: 2, y: y(5) - 2, class: 'axis' }, 'high');
  add('text', { x: 2, y: y(1) - 2, class: 'axis' }, 'low');
  let path = '';
  const dots: [number, number][] = [];
  for (let i = 0; i < DAYS; i++) {
    const d = addDays(start, i);
    const info = dayInfo(data, d);
    if (info) add('rect', { x: i * step, y: 112, width: step + 0.2, height: 10, class: `ph-${info.phase}` });
    if ((data.flow ?? []).includes(d)) add('text', { x: i * step + step / 2, y: 7, class: 'flow-star', 'text-anchor': 'middle' }, '✦');
    const v = data.energy[d];
    if (v) {
      const cx = i * step + step / 2;
      path += `${path && data.energy[addDays(d, -1)] ? 'L' : 'M'} ${cx} ${y(v)} `;
      dots.push([cx, y(v)]);
    }
    if (i % 7 === 0) add('text', { x: i * step, y: 138, class: 'axis' }, parseKey(d).toLocaleDateString('de-DE', { day: 'numeric', month: 'numeric' }));
  }
  if (path) add('path', { d: path, class: 'energy-line' });
  for (const [cx, cy] of dots) add('circle', { cx, cy, r: 2.2, class: 'dot' });
  add('line', { x1: W - step / 2, x2: W - step / 2, y1: top - 4, y2: 124, class: 'today' });
  box.replaceChildren(svg);
}

function drawPhases(): void {
  const box = document.getElementById('cycle-phases');
  if (!box) return;
  const data = loadCycle();
  const avg = energyByPhase(data);
  box.replaceChildren(
    ...PHASES.map((p) => {
      const row = document.createElement('div');
      row.className = 'phase-row';
      const a = avg[p.id];
      const label = a.days ? `${ENERGY[Math.round(a.avg) - 1]} · ${a.days} ${a.days === 1 ? 'Tag' : 'Tage'}` : 'noch keine Einträge';
      row.innerHTML = `<span class="phase-name"><i class="ph-${p.id}"></i></span><span class="phase-bar"><b></b></span><span class="phase-val"></span>`;
      row.querySelector('.phase-name')!.append(p.label);
      (row.querySelector('.phase-bar b') as HTMLElement).style.width = `${a.days ? (a.avg / 5) * 100 : 0}%`;
      row.querySelector('.phase-val')!.textContent = label;
      return row;
    }),
  );
  const len = document.createElement('p');
  len.className = 'muted';
  len.textContent = `Zykluslänge: ca. ${cycleLength(data.periods)} Tage`;
  box.append(len);
}

document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  if (target.closest('[data-cycle-period]')) {
    saveCycle(togglePeriod(loadCycle(), day));
    render();
    return;
  }
  if (target.closest('[data-cycle-flow]')) {
    saveCycle(toggleFlow(loadCycle(), day));
    render();
    return;
  }
  const mic = target.closest<HTMLButtonElement>('[data-cycle-mic]');
  if (mic) {
    if (listening) listening.stop();
    else {
      const box = mic.closest('.cycle-note-wrap')?.querySelector<HTMLTextAreaElement>('[data-cycle-note]');
      if (box) startMic(box);
    }
    return;
  }
  const chip = target.closest<HTMLButtonElement>('[data-energy]');
  if (chip) {
    saveCycle(setEnergy(loadCycle(), day, Number(chip.dataset.energy)));
    render();
  }
});

const picker = document.getElementById('cycle-date') as HTMLInputElement | null;
if (picker) {
  picker.max = today;
  picker.value = today;
  picker.addEventListener('change', () => {
    day = picker.value && picker.value <= today ? picker.value : today;
    render();
  });
}

render();
