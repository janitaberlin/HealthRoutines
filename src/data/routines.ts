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
  icon: string;
  items: RoutineItem[];
}

export const routines: Routine[] = [
  {
    id: 'morgen',
    title: 'Morgenroutine',
    icon: '☀︎',
    items: [
      { id: 'wasser-morgen', text: 'Großes Glas Wasser' },
      { id: 'tageslicht', text: 'Tageslicht tanken', hint: 'kurz raus oder ans offene Fenster' },
      { id: 'fruehstueck', text: 'Frühstück mit Eiweiß' },
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
    icon: '↗',
    items: [
      { id: 'spaziergang', text: 'Spaziergang' },
      { id: 'training', text: 'Training, Yoga oder Dehnen' },
    ],
  },
  {
    id: 'abend',
    title: 'Abendroutine',
    icon: '☾',
    items: [
      { id: 'wasser-tag', text: 'Genug getrunken über den Tag' },
      { id: 'handy-weg', text: 'Handy 30 Min. vor dem Schlafen weg' },
      { id: 'reflexion', text: '3 Dinge, die heute gut waren' },
    ],
  },
];
