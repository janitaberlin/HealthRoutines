import type { Block } from '../data/schedule';

function minutes(hm: string): number {
  const [h, m] = hm.split(':').map(Number);
  return h * 60 + m;
}

export function isWeekend(now: Date): boolean {
  return now.getDay() === 0 || now.getDay() === 6;
}

/** Aktueller und nächster Block; zwischen zwei Blöcken ist `current` leer. */
export function planAt(blocks: Block[], now: Date): { current: Block | null; next: Block | null } {
  const t = now.getHours() * 60 + now.getMinutes();
  const current = blocks.find((b) => t >= minutes(b.from) && t < minutes(b.to)) ?? null;
  const next = blocks.find((b) => minutes(b.from) > t) ?? null;
  return { current, next };
}

/** Verbleibende Minuten im Block. */
export function minutesLeft(block: Block, now: Date): number {
  return minutes(block.to) - (now.getHours() * 60 + now.getMinutes());
}
