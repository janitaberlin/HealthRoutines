import { describe, expect, it } from 'vitest';
import { journalDays } from './journal';

const questions = [
  { id: 'dankbar', text: 'Ich bin dankbar für …' },
  { id: 'energie-plus', text: 'Energy Check' },
];

describe('journal', () => {
  it('sammelt Antworten pro Tag, neueste zuerst', () => {
    const days = journalDays(
      {
        '2026-10-19': { 'energie-plus': 'Walk', dankbar: 'Sonne' },
        '2026-10-20': { dankbar: '  ', unbekannt: 'x' },
        '2026-10-21': { dankbar: 'Mama' },
      },
      questions,
    );
    expect(days.map((d) => d.day)).toEqual(['2026-10-21', '2026-10-19']);
    expect(days[1].items.map((i) => i.id)).toEqual(['dankbar', 'energie-plus']);
  });
});
