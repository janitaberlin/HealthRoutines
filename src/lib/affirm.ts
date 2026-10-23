/** Affirmationen: Prompt für Claude bauen, Text in Sätze teilen, passende Stimme wählen. */
export interface VoiceLike {
  name: string;
  lang: string;
}
export type Gender = 'frau' | 'mann';

export function lines(text: string): string[] {
  return text
    .split('\n')
    .map((l) => l.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim())
    .filter(Boolean);
}

export function buildPrompt(answers: { label: string; text: string }[], language: string): string {
  const filled = answers.filter((a) => a.text.trim());
  return [
    `Erstelle mir aus meinen Antworten persönliche Affirmationen auf ${language}.`,
    '',
    ...filled.flatMap((a) => [`${a.label}`, a.text.trim(), '']),
    'Bitte zwei Listen:',
    '1. Morning Affirmations (6–8 Sätze): kraftvoll, für den Start in den Tag.',
    '2. Evening Affirmations (6–8 Sätze): ruhig und weich, zum Einschlafen.',
    'Regeln: Ich-Form, Gegenwart, kurz, glaubwürdig (lieber „Ich werde jeden Tag …“ als etwas, das sich noch nicht wahr anfühlt), ein Satz pro Zeile, keine Nummern, keine Emojis.',
  ].join('\n');
}

export function claudeLink(prompt: string): string {
  return `https://claude.ai/new?q=${encodeURIComponent(prompt)}`;
}

/** Stimme für Sprache und Geschlecht; ohne bekannten Namen die erste Stimme der Sprache. */
export function pickVoice<V extends VoiceLike>(voices: V[], lang: string, gender: Gender, female: string[], male: string[]): V | null {
  const base = lang.slice(0, 2).toLowerCase();
  const inLang = voices.filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith(base));
  const exact = inLang.filter((v) => v.lang.toLowerCase().replace('_', '-') === lang.toLowerCase());
  const pool = exact.length ? exact : inLang;
  const known = gender === 'frau' ? female : male;
  const other = gender === 'frau' ? male : female;
  const has = (v: V, list: string[]) => list.some((n) => v.name.toLowerCase().includes(n));
  // Natürlicher klingende Stimmen (Premium/Erweitert, z. B. am iPhone nachgeladen) zuerst.
  const sorted = [...pool].sort((a, b) => Number(isNatural(b)) - Number(isNatural(a)));
  return sorted.find((v) => has(v, known)) ?? sorted.find((v) => !has(v, other)) ?? sorted[0] ?? null;
}

export function isNatural(v: VoiceLike): boolean {
  return /premium|enhanced|erweitert|natural|neural|siri/i.test(v.name);
}
