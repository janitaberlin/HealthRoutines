/**
 * Janitas Routinen. Jeder Punkt hat eine feste `id`: Abgehakte Tage hängen an dieser id,
 * deshalb beim Umbenennen eines Punkts die id behalten.
 */
export interface RoutineItem {
  id: string;
  text: string;
  /** Kleiner Hinweis unter dem Punkt, z. B. Zeitpunkt oder Abstand. */
  hint?: string;
}

export interface Routine {
  id: string;
  title: string;
  /** Kurzer Untertitel aus Janitas Vision, z. B. „Body & Beauty“. */
  subtitle?: string;
  icon: string;
  items: RoutineItem[];
}

export const routines: Routine[] = [
  {
    id: 'morgen',
    title: 'Morgenroutine',
    subtitle: 'Body & Beauty',
    icon: '☀︎',
    items: [
      { id: 'tee-morgen', text: 'Tee' },
      { id: 'sport-morgen', text: '15 Min. Sport oder Sportkurs' },
      { id: 'tageslicht', text: 'Tageslicht tanken', hint: 'kurz raus oder ans offene Fenster' },
      { id: 'outfit', text: 'Lieblingsoutfit anziehen' },
      { id: 'fruehstueck', text: 'Gutes Frühstück mit Eiweiß' },
    ],
  },
  {
    id: 'fokus',
    title: 'Tagesfokus',
    subtitle: 'Inspired Action',
    icon: '✦',
    items: [
      { id: 'fokus-erleben', text: 'Was möchte ich heute erleben?', hint: 'z. B. Bewegung, Schönheit, Nähe, ein Moment für mich' },
      { id: 'fokus-erschaffen', text: 'Was möchte ich heute erschaffen?', hint: 'den größten Hebel wählen, ein Ergebnis für Mathilde' },
      { id: 'fokus-abgeben', text: 'Was muss nicht mehr von mir erledigt werden?', hint: 'delegieren, automatisieren, vereinfachen oder streichen' },
    ],
  },
  {
    id: 'supplemente',
    title: 'Supplemente',
    icon: '◎',
    items: [
      { id: 'venoprime', text: 'VenoPrime, 2 Kapseln', hint: 'zu einer Mahlzeit' },
      { id: 'magnesium', text: 'Magnesium Komplex 7 Ultra', hint: 'abends, mind. 2 Std. Abstand zu Eisen' },
    ],
  },
  {
    id: 'bewegung',
    title: 'Bewegung',
    subtitle: 'Freedom',
    icon: '↗',
    items: [
      { id: 'spaziergang', text: 'Spaziergang an der frischen Luft' },
    ],
  },
  {
    id: 'home-love',
    title: 'Home & Love',
    icon: '♡',
    items: [
      { id: 'johannes', text: 'Bewusste Zeit mit Johannes', hint: 'kochen, essen, reden, kuscheln' },
      { id: 'schoenes', text: 'Etwas Schönes für zu Hause', hint: 'Blumen, Musik oder Kerzen' },
    ],
  },
  {
    id: 'abend',
    title: 'Abendroutine',
    subtitle: 'Evening Ritual',
    icon: '☾',
    items: [
      { id: 'wasser-tag', text: 'Genug getrunken über den Tag' },
      { id: 'abendbeutel', text: 'Abendbeutel: Pflege- und Gesundheitsroutine', hint: 'Bademantel, Haare hoch' },
      { id: 'handy-weg', text: 'Handy 30 Min. vor dem Schlafen weg' },
      { id: 'reflexion', text: '3 Dinge, die heute gut waren' },
      { id: 'lesen', text: 'Lesen' },
    ],
  },
];

/** Janitas Founder-Identität; oben auf „Heute“ steht jeden Tag ein anderer Satz. */
export const identity = {
  motto: 'I create. I lead. I live.',
  sentences: [
    'Ich erschaffe Marken und Erlebnisse, die Menschen lieben.',
    'Ich muss nicht alles selbst machen, um etwas Großes aufzubauen.',
    'Ich treffe Entscheidungen aus Klarheit, nicht aus Zeitdruck.',
    'Mein Wert hängt nicht von meiner Tagesleistung ab.',
    'Ich darf viel Geld verdienen, ohne meine Gesundheit oder meine Freiheit dafür aufzugeben.',
    'Ich gestalte mein Leben bewusst, statt es auf später zu verschieben.',
    'Ich wähle heute den größten Hebel.',
    'Regeneration ist Teil meiner langfristigen Leistungsfähigkeit.',
  ],
};
