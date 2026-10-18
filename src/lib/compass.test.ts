import { describe, expect, it } from 'vitest';
import { emptyCompass, parseCompass, pickForDay, safeLink } from './compass';

describe('compass', () => {
  it('startet mit drei leeren Zielen', () => {
    expect(emptyCompass().goals).toHaveLength(3);
    expect(parseCompass('kaputt').goals[0]).toEqual({ text: '', state: 'exploring' });
  });

  it('liest gespeicherte Daten robust', () => {
    const c = parseCompass(
      JSON.stringify({
        fields: { talents: 'X', bad: 3 },
        goals: [{ text: 'Mathilde', state: 'committed' }, { text: 'Y', state: 'quatsch' }],
        library: [{ id: '1', type: 'Musik', text: 'Song' }, { id: 2 }],
        actions: { '2026-10-19': 'Reel drehen' },
      }),
    );
    expect(c.fields).toEqual({ talents: 'X' });
    expect(c.goals[0]).toEqual({ text: 'Mathilde', state: 'committed' });
    expect(c.goals[1].state).toBe('exploring');
    expect(c.goals[2].text).toBe('');
    expect(c.library).toHaveLength(1);
    expect(c.actions['2026-10-19']).toBe('Reel drehen');
  });

  it('wählt pro Tag stabil', () => {
    const items = ['a', 'b', 'c'];
    expect(pickForDay(items, '2026-10-19')).toBe(pickForDay(items, '2026-10-19'));
    expect(pickForDay(items, '2026-10-19')).not.toBe(pickForDay(items, '2026-10-20'));
  });

  it('lässt nur Web-Links zu', () => {
    expect(safeLink('https://open.spotify.com/x')).toBe('https://open.spotify.com/x');
    expect(safeLink('javascript:alert(1)')).toBeUndefined();
    expect(safeLink('kein link')).toBeUndefined();
  });
});
