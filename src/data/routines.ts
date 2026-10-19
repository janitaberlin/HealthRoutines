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
      { id: 'outfit', text: 'Getting ready', hint: 'Outfit an, Make-up, Haare' },
      { id: 'supplements', text: 'Supplements nehmen' },
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
      { id: 'fokus-dienen', text: 'Wie und wem kann ich heute mit meinen Talenten dienen?', note: true },
    ],
  },
  {
    id: 'bewegung',
    title: 'Dream Walk',
    subtitle: 'Mittags · Freedom',
    icon: '↗',
    items: [
      { id: 'lunch', text: 'Healthy Lunch' },
      { id: 'walk-mittag', text: 'Power Walk 5k Steps' },
      { id: 'inspiration', text: 'Inspirational Talk oder Podcast', hint: 'gern beim Walk' },
    ],
  },
  {
    id: 'abend',
    title: 'Wellness',
    subtitle: 'Evening Ritual',
    icon: '☾',
    items: [
      { id: 'abendbeutel', text: 'Self Care: Pflege- und Gesundheitsroutine', hint: 'Bademantel, Haare hoch' },
      { id: 'tee-abend', text: 'Tee' },
      { id: 'venoprime', text: 'VenoPrime, 2 Kapseln', hint: 'zu einer Mahlzeit' },
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
  motto: 'Erfolg folgt der Freude.',
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
    'Erfolg folgt der Freude.',
    'Ich darf Nein sagen.',
    'Ich darf Ruhe brauchen.',
    'Ich darf meine Meinung ändern.',
    'Mein Wert hängt nicht von meiner Produktivität ab.',
    'Nicht jede Idee muss zu einem Projekt werden.',
    'Ich muss nicht dafür sorgen, dass alle zufrieden sind.',
    'Ich verwalte mein Leben nicht, ich erschaffe es.',
    'Ich bin die Marke.',
    'Ich zeige mich ganz.',
    'Mein Einkommen wächst, wenn ich meinen eigenen Wert erkenne.',
    'Menschen vertrauen mir wegen meiner Echtheit.',
    'Ich gebe Menschen Orientierung und sie fühlen sich verstanden.',
    'Ich verändere Menschen durch meine Präsenz.',
    'Meine Marke darf schön, hochwertig und luxuriös sein.',
    'Menschen kommen wegen meiner Ästhetik und bleiben wegen meiner Tiefe.',
    'Ich verkaufe meine Perspektive, nicht nur Produkte.',
    'Mein Rückzug ist Teil meiner Stärke.',
    'Ich werde für meine Klarheit und Präsenz bezahlt, nicht fürs Tun.',
    'Ich führe durch mein Sein, nicht durch Druck.',
    'Ich lebe, was ich lehre.',
    'Ich folge meinem inneren Ja.',
    'Ich bringe Menschen zurück in ihre Wahrheit.',
    'Ich muss mich nicht beweisen.',
    'Ich mache Tiefe leicht.',
    'Ich beende, was ich beginne, eins nach dem anderen.',
  ],
};

/**
 * Täglicher Mindset-Impuls aus Janitas Astro- und Human-Design-Deutung
 * (/mnt/project-files/coaching/mindset-profil.md). Reflexionsfragen, keine Tatsachen.
 */
export const impulses = [
  { theme: 'Sichtbarkeit', question: 'Wo mache ich mich heute kleiner als nötig?' },
  { theme: 'Echtheit', question: 'Was habe ich gelernt, das ich heute teilen könnte?' },
  { theme: 'Vision', question: 'Welcher Schritt heute bringt mich meiner Bewegung näher?' },
  { theme: 'Ganz oder gar nicht', question: 'Was ist der kleinste nächste Schritt, den ich ganz machen kann?' },
  { theme: 'Rückzug', question: 'Wann gönne ich mir heute bewusst Ruhe, ohne sie mir verdienen zu müssen?' },
  { theme: 'Wert', question: 'Wo darf ich heute meinen Wert klarer zeigen, auch beim Preis?' },
  { theme: 'Orientierung', question: 'Wem kann ich heute mit meiner Perspektive Halt geben?' },
  { theme: 'Energie', question: 'Wobei spüre ich heute: Das könnte Menschen bewegen?' },
  { theme: 'Ästhetik', question: 'Was mache ich heute schön, einfach weil es mir guttut?' },
  { theme: 'Sicherheit', question: 'Wo spiele ich gerade auf Nummer sicher, obwohl mein Wachstum woanders liegt?' },
  { theme: 'Verkörperung', question: 'Wie würde die Frau aus meiner Vision diesen Tag angehen?' },
  { theme: 'Abgeben', question: 'Was muss ich heute nicht selbst machen?' },
  { theme: 'Inneres Ja', question: 'Worauf antwortet mein Bauch heute mit einem klaren Ja?' },
  { theme: 'Frustration', question: 'Wo spüre ich Frust, und mache ich dort etwas ohne inneres Ja?' },
  { theme: 'Zyklen', question: 'Was schließe ich ab, bevor ich etwas Neues beginne?' },
  { theme: 'Aussprechen', question: 'Was kreist in meinem Kopf, das ich heute laut aussprechen sollte?' },
  { theme: 'Self-Coaching', question: 'Was würde ich einer Kundin in genau meiner Situation sagen?' },
  { theme: 'Ehrlich', question: 'Habe ich wirklich keine Lust, oder bin ich einfach erschöpft?' },
  { theme: 'Fokus', question: 'Welche Idee, welches Tool, welche Frage darf heute liegen bleiben?' },
  { theme: 'Grenzen', question: 'Wessen Stimmung trage ich gerade, die gar nicht meine ist?' },
  { theme: 'Präsenz', question: 'Wofür werde ich bezahlt, wenn nicht fürs Tun?' },
];
