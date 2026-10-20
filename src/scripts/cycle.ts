import { dayInfo, energyByPhase, ENERGY, PHASES, setEnergy, togglePeriod, cycleLength, type Phase } from '../lib/cycle';
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
  drawChart();
  drawPhases();
}

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
