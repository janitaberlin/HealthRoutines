import { describe, expect, it } from 'vitest';
import { buildPrompt, claudeLink, lines, pickVoice } from './affirm';

describe('affirm', () => {
  it('teilt eingefügte Listen in Sätze', () => {
    expect(lines('1. Ich bin da.\n- Ich darf.\n\n• Ich wachse.\n  Ruhe.  ')).toEqual(['Ich bin da.', 'Ich darf.', 'Ich wachse.', 'Ruhe.']);
  });

  it('baut den Prompt nur mit ausgefüllten Antworten', () => {
    const p = buildPrompt([{ label: 'Wer war ich?', text: 'leise' }, { label: 'Leer', text: ' ' }], 'Deutsch');
    expect(p).toContain('Wer war ich?\nleise');
    expect(p).not.toContain('Leer');
    expect(claudeLink('a b')).toBe('https://claude.ai/new?q=a%20b');
  });

  it('wählt die Stimme nach Sprache und Geschlecht', () => {
    const voices = [
      { name: 'Anna', lang: 'de-DE' },
      { name: 'Markus', lang: 'de-DE' },
      { name: 'Samantha', lang: 'en-US' },
    ];
    const f = ['anna', 'samantha'];
    const m = ['markus'];
    expect(pickVoice(voices, 'de-DE', 'mann', f, m)?.name).toBe('Markus');
    expect(pickVoice(voices, 'de-DE', 'frau', f, m)?.name).toBe('Anna');
    expect(pickVoice(voices, 'en-US', 'mann', f, m)?.name).toBe('Samantha');
    expect(pickVoice(voices, 'fr-FR', 'frau', f, m)).toBeNull();
  });
});
