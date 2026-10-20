/** Meine Antworten: alle Notizen pro Tag gesammelt. */
export interface JournalItem {
  id: string;
  question: string;
  text: string;
}
export interface JournalDay {
  day: string;
  items: JournalItem[];
}

/** Tage mit Antworten, neueste zuerst; Reihenfolge der Fragen wie in `questions`. */
export function journalDays(answers: Record<string, Record<string, string>>, questions: { id: string; text: string }[]): JournalDay[] {
  const known = new Map(questions.map((q, i) => [q.id, { q, i }]));
  return Object.entries(answers)
    .map(([day, byId]) => ({
      day,
      items: Object.entries(byId)
        .filter(([id, text]) => known.has(id) && typeof text === 'string' && text.trim())
        .sort(([a], [b]) => known.get(a)!.i - known.get(b)!.i)
        .map(([id, text]) => ({ id, question: known.get(id)!.q.text, text: text.trim() })),
    }))
    .filter((d) => d.items.length)
    .sort((a, b) => b.day.localeCompare(a.day));
}
