/**
 * Janitas Routinen. Jeder Punkt hat eine feste `id`: Abgehakte Tage hängen an dieser id,
 * deshalb beim Umbenennen eines Punkts die id behalten.
 */
export interface RoutineItem {
  id: string;
  text: string;
  /** Kleiner Hinweis unter dem Punkt, z. B. Zeitpunkt oder Abstand. */
  hint?: string;
  /** Zeigt ein Notizfeld, z. B. für Dankbarkeit; Text wird pro Tag gespeichert. */
  note?: boolean;
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
      { id: 'dankbar', text: 'Ich bin dankbar für …', note: true },
      { id: 'sport-morgen', text: '15 Min. Sport oder Sportkurs' },
      { id: 'tageslicht', text: 'Tageslicht tanken', hint: 'kurz raus oder ans offene Fenster' },
      { id: 'outfit', text: 'Shower & Getting ready', hint: 'Outfit an, Make-up, Haare' },
    ],
  },
  {
    id: 'fokus',
    title: 'Tagesfokus',
    subtitle: 'Inspired Action',
    icon: '✦',
    items: [
      { id: 'fokus-erleben', text: 'Was möchte ich heute erleben?', note: true, hint: 'z. B. Bewegung, Schönheit, Nähe, ein Moment für mich' },
      { id: 'fokus-erschaffen', text: 'Was möchte ich heute erschaffen?', note: true, hint: 'den größten Hebel wählen, ein Ergebnis für Mathilde' },
      { id: 'fokus-abgeben', text: 'Was muss nicht mehr von mir erledigt werden?', note: true, hint: 'delegieren, automatisieren, vereinfachen oder streichen' },
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
      { id: 'walk-mittag', text: 'Mittags 1 Std. Walk', hint: '5k Steps' },
    ],
  },
  {
    id: 'abend',
    title: 'Wellness',
    subtitle: 'Evening Ritual',
    icon: '☾',
    items: [
      { id: 'abendbeutel', text: 'Self Care: Pflege- und Gesundheitsroutine', hint: 'Bademantel, Haare hoch' },
      { id: 'handy-weg', text: 'Handy 1 Std. vor dem Schlafen weg' },
      { id: 'lesen', text: 'Lesen' },
      { id: 'energie-plus', text: 'Was hat mir heute Energie gegeben?', note: true },
    ],
  },
];

/** Feste Grundsätze ohne Haken: selbstverständlich, aber wichtig. */
export const principles = {
  title: 'Home & Love',
  icon: '♡',
  text: 'Selbstverständlich, aber wichtig.',
  items: ['Bewusste Zeit mit Johannes: kochen, essen, reden, kuscheln', 'Etwas Schönes für zu Hause: Blumen, Musik oder Kerzen'],
};

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
    'Ich entwickle Menschen und Systeme.',
    'Ich baue schon heute Elemente meines Traumlebens ein.',
    'Meine Zeit gehört mir.',
    'Selbstbestimmung ist mein größter Luxus.',
    'Erfolg, Freiheit, Gesundheit, Schönheit und Liebe dürfen gleichzeitig stattfinden.',
    'Ich handle aus Inspiration, nicht aus Pflicht.',
    'Ich führe mit Vision, mein Team setzt um.',
    'Ich vertraue meiner Kreativität.',
    'Mathilde wächst, weil ich klar entscheide, was wirklich zählt.',
    'Ich darf es mir leicht machen.',
    'Ich muss heute nichts beweisen.',
    'Mein Körper ist mein Zuhause, ich behandle ihn liebevoll.',
    'Ich darf Pausen machen, ohne mich schuldig zu fühlen.',
    'Ich umgebe mich mit Schönheit und Menschen, die mich inspirieren.',
    'Ich lebe einen 10/10-Tag, nicht irgendwann, sondern heute.',
    'Was ich nicht selbst machen muss, gebe ich ab.',
    'Ich bin die Frau, die ihre Vision lebt.',
    'Genug zu tun ist kein Grund, nicht zu leben.',
    'Ich wachse an schwierigen Tagen, durch die Art, wie ich mit mir umgehe.',
    'Ich wähle Ruhe statt Hektik.',
    'Geld fließt zu mir, weil ich Wert erschaffe.',
    'Ich bin mutig genug, groß zu träumen.',
  ],
};
