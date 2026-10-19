import { routines } from '../data/routines';
import { addDays, dateKey, isChecked, parseKey, ratio, toggle } from '../lib/tracker';
import { loadChecks, loadNotes, saveChecks, saveNotes } from './storage';

const today = dateKey(new Date());
let day = today;
let checks = loadChecks();
let notes = loadNotes();
const allIds = routines.flatMap((r) => r.items.map((i) => i.id));

const label = document.getElementById('day-label')!;
const dateText = document.getElementById('day-date')!;
const totalBar = document.getElementById('total-bar')!;
const totalText = document.getElementById('total-text')!;
const nextBtn = document.querySelector<HTMLButtonElement>('[data-shift="1"]')!;

function dayName(key: string): string {
  if (key === today) return 'Heute';
  if (key === addDays(today, -1)) return 'Gestern';
  return parseKey(key).toLocaleDateString('de-DE', { weekday: 'long' });
}

function render(): void {
  label.textContent = dayName(day);
  dateText.textContent = parseKey(day).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
  nextBtn.disabled = day >= today;

  for (const btn of document.querySelectorAll<HTMLButtonElement>('[data-item]')) {
    btn.setAttribute('aria-pressed', String(isChecked(checks, day, btn.dataset.item!)));
  }
  for (const field of document.querySelectorAll<HTMLTextAreaElement>('[data-note]')) {
    if (document.activeElement !== field) field.value = notes[day]?.[field.dataset.note!] ?? '';
    grow(field);
  }
  for (const r of routines) {
    const ids = r.items.map((i) => i.id);
    const done = ids.filter((id) => isChecked(checks, day, id)).length;
    const section = document.querySelector<HTMLElement>(`[data-routine="${r.id}"]`)!;
    section.querySelector('[data-count]')!.textContent = `${done}/${ids.length}`;
    section.classList.toggle('is-done', done === ids.length);
  }
  const share = ratio(checks, day, allIds);
  totalBar.style.width = `${Math.round(share * 100)}%`;
  const done = Math.round(share * allIds.length);
  totalText.textContent = done === allIds.length ? 'Alles erledigt ✦' : `${done} von ${allIds.length} erledigt`;
  // Goldene Sterne, sobald am selben Tag der letzte Haken gesetzt wird (nicht beim Öffnen oder Blättern).
  const allDone = done === allIds.length;
  if (allDone && wasDone[day] === false) celebrate();
  wasDone[day] = allDone;
}

const wasDone: Record<string, boolean> = {};

function celebrate(): void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const layer = document.createElement('div');
  layer.className = 'stars';
  layer.setAttribute('aria-hidden', 'true');
  const canvas = document.createElement('canvas');
  const text = document.createElement('p');
  text.textContent = 'Alles erledigt';
  layer.append(canvas, text);
  document.body.append(layer);
  goldRain(canvas);
  setTimeout(() => layer.remove(), 4300);
}

const RISE = 0.7;

/** Feuerwerk „Goldregen“: Raketen steigen auf, platzen oben auf, goldene Funken hängen wie eine Traube nach unten. */
function goldRain(canvas: HTMLCanvasElement): void {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const w = innerWidth;
  const h = innerHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);
  type Spark = { x: number; y: number; vx: number; vy: number; life: number; delay: number };
  const sparks: Spark[] = [];
  const bursts = [
    { x: w * 0.5, y: h * 0.2, delay: 0 },
    { x: w * 0.22, y: h * 0.3, delay: 0.35 },
    { x: w * 0.78, y: h * 0.27, delay: 0.6 },
  ];
  for (const b of bursts) {
    for (let i = 0; i < 140; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4.5;
      sparks.push({ x: b.x, y: b.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, delay: b.delay + RISE });
    }
  }
  const start = performance.now();
  let last = start;
  // Rakete steigt von unten auf und platzt dann auf.
  const rocket = (b: (typeof bursts)[number], t: number): void => {
    const p = (t - b.delay) / RISE;
    if (p < 0 || p > 1) return;
    const eased = 1 - (1 - p) ** 2;
    const y = h + 10 - (h + 10 - b.y) * eased;
    ctx.fillStyle = 'rgba(255, 247, 220, 1)';
    ctx.beginPath();
    ctx.arc(b.x + Math.sin(p * 12) * 1.5, y, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(243, 220, 154, 0.5)';
    ctx.fillRect(b.x - 0.8 + (Math.random() - 0.5) * 2, y + 4, 1.6, 6 + Math.random() * 8);
  };
  const frame = (now: number): void => {
    const t = (now - start) / 1000;
    const dt = Math.min((now - last) / 16.7, 3);
    last = now;
    // Leicht ausblenden statt löschen, so entstehen die hängenden Goldspuren.
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    for (const b of bursts) rocket(b, t);
    for (const s of sparks) {
      if (t < s.delay || s.life <= 0) continue;
      s.vx *= 0.96 ** dt;
      s.vy = s.vy * 0.96 ** dt + 0.09 * dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.life -= 0.0075 * dt;
      const a = Math.max(s.life, 0);
      ctx.fillStyle = `rgba(243, 220, 154, ${a})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 1.4, 0, Math.PI * 2);
      ctx.fill();
      if (Math.random() < 0.08) {
        ctx.fillStyle = `rgba(255, 247, 220, ${a})`;
        ctx.fillRect(s.x - 1.5, s.y - 1.5, 3, 3);
      }
    }
    if (t < 4) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

function grow(field: HTMLTextAreaElement): void {
  field.style.height = 'auto';
  field.style.height = `${field.scrollHeight}px`;
}

// Notiz schreiben hakt den Punkt automatisch ab.
document.addEventListener('input', (e) => {
  const field = (e.target as HTMLElement).closest<HTMLTextAreaElement>('[data-note]');
  if (!field) return;
  const id = field.dataset.note!;
  const text = field.value;
  const dayNotes = { ...(notes[day] ?? {}) };
  if (text.trim()) dayNotes[id] = text;
  else delete dayNotes[id];
  notes = { ...notes, [day]: dayNotes };
  if (!Object.keys(dayNotes).length) delete notes[day];
  saveNotes(notes);
  if (text.trim() && !isChecked(checks, day, id)) {
    checks = toggle(checks, day, id);
    saveChecks(checks);
  }
  render();
});

document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  const item = target.closest<HTMLButtonElement>('[data-item]');
  if (item) {
    checks = toggle(checks, day, item.dataset.item!);
    saveChecks(checks);
    render();
    return;
  }
  const nav = target.closest<HTMLButtonElement>('[data-shift]');
  if (nav) {
    const next = addDays(day, Number(nav.dataset.shift));
    if (next <= today) day = next;
    render();
  }
});

// Andere Tabs bzw. Rückkehr in die App am nächsten Tag berücksichtigen.
window.addEventListener('storage', () => {
  checks = loadChecks();
  notes = loadNotes();
  render();
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  if (dateKey(new Date()) !== today) location.reload();
});

render();
