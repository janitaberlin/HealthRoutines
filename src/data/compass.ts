/**
 * Inhalte für „My Inner Compass“. Das sind nur Startwerte aus Janitas eigenen Texten
 * (18.10.2026); in der App kann sie alles bearbeiten, gespeichert wird im Browser.
 */

/** Janitas North-Star-Vision (18.10.2026), steht über den drei Zielen. */
export const northStarVision =
  'Ich erschaffe mein 10/10-Leben, in dem ich durch mein Sein, meine unternehmerischen Talente und meine Fähigkeit, Menschen zu inspirieren, vollständig wirke.';

/** Tägliche Frage: Ziele werden nicht jeden Morgen neu verhandelt (Janita 18.10.2026). */
export const dailyQuestion = 'Was kann ich heute tun, um das Leben, für das ich mich entschieden habe, tatsächlich zu leben?';

/** Ziele monatlich überprüfen. */
export const reviewDays = 30;

/** Drei Ebenen (Janita 18.10.2026): WHY klar, WHAT bewusst noch offen, HOW die tägliche Arbeit. */
export const levels = [
  {
    id: 'why',
    label: 'Why',
    hint: 'Mein 10/10-Leben',
    text: 'Freiheit, Lebendigkeit, Selbstbestimmung, Liebe, Gesundheit, finanzielle Unabhängigkeit und die Möglichkeit, durch mein Sein zu wirken.',
  },
  {
    id: 'what',
    label: 'What',
    hint: 'Noch offen, und das ist okay',
    text: 'Ein erfolgreiches Unternehmen, eine Personal Brand oder eine andere Form unternehmerischer Tätigkeit, die mir dieses Leben ermöglicht.',
  },
  {
    id: 'how',
    label: 'How',
    hint: 'Die tägliche Arbeit',
    text: 'Die tägliche Arbeit, die ich dafür tatsächlich leisten möchte.',
  },
];

export const identityDefaults = {
  signature: 'My energy is my signature.',
  talents: [
    'Komplexe Zusammenhänge erkennen und verstehen',
    'Strategisch und unternehmerisch denken',
    'Geschäftsideen und Businessmodelle entwickeln',
    'Aus Ideen konkrete Konzepte machen',
    'Menschen coachen, inspirieren und Klarheit schaffen',
    'Visionen entwickeln und anderen helfen, größer zu denken',
    'Kreativität mit wirtschaftlichem Denken verbinden',
  ].join('\n'),
  loves: [
    'Businesskonzepte und neue Ideen',
    'Potenziale erkennen und etwas aufbauen, das vorher nicht existiert hat',
    'Schönes Essen und meine Rezepte',
    'Bewegung',
    'Ästhetik',
    'Tiefe Gespräche',
    'Freude, Liebe, Leichtigkeit und die kleinen Momente',
  ].join('\n'),
  design: 'Generatorin · 6/2 · sakrale Autorität. Erfolg folgt der Freude.',
};

export const visionAreas = [
  {
    id: 'body',
    title: 'Body & Beauty',
    text: 'Ich fühle mich so fit, stark, gesund, attraktiv und lebendig wie vor fünf Jahren. Mein Körper fühlt sich leicht und voller Energie an.',
  },
  {
    id: 'business',
    title: 'Business & Wealth',
    text: 'Ein Unternehmen, das mich begeistert und mir finanzielle Freiheit ermöglicht.\n\nDrei Wege, noch keine Entscheidung:\n1. Mathilde: meine Schmuckmarke mit eigener Markenwelt\n2. Janita Berlin Coaching: Mindset, Business, persönliche Entwicklung\n3. Personal Brand: Mindset, Identität, Visionen, Future Self',
  },
  {
    id: 'love',
    title: 'Love & Relationships',
    text: 'Eine liebevolle, erfüllende Ehe, echte Verbundenheit und Menschen um mich, mit denen ich mich lebendig fühle.',
  },
  {
    id: 'freedom',
    title: 'Lifestyle & Freedom',
    text: 'Zeitliche und finanzielle Freiheit, Reisen, ein schönes Zuhause, Ästhetik. Ich gestalte meinen Tag nach meinen eigenen Prioritäten.',
  },
  {
    id: 'soul',
    title: 'Soul & Energy',
    text: 'Ich bin in Verbindung mit meiner inneren Freude. Ich weiß nicht nur, wer ich bin, ich fühle es. Meine Augen strahlen, meine Energie ist spürbar.',
  },
];

export const becomeHerQuestions = [
  { id: 'denkt', q: 'Wie denkt sie?' },
  { id: 'entscheidet', q: 'Welche Entscheidungen trifft sie?' },
  { id: 'bewegt', q: 'Wie bewegt sie sich?' },
  { id: 'spricht', q: 'Wie spricht sie?' },
  { id: 'fuehrt', q: 'Wie führt sie ihr Unternehmen?' },
  { id: 'koerper', q: 'Wie kümmert sie sich um ihren Körper?' },
  { id: 'toleriert', q: 'Was toleriert sie nicht mehr?' },
  { id: 'freude', q: 'Was tut sie jeden Tag aus echter Freude?' },
];

/** FEEL: eine Frage pro Tag. */
export const sparkQuestions = [
  'Was würde ich heute tun, wenn ich nichts beweisen müsste?',
  'Welche Idee lässt meine Augen leuchten?',
  'Wann habe ich mich zuletzt wirklich lebendig gefühlt?',
  'Wie würde ich heute leben, entscheiden und handeln, wenn ich bereits mein Higher Self wäre?',
  'Was würde ich erschaffen, wenn ich keine Angst hätte?',
  'What would the woman I’m becoming do today?',
  'Worüber könnte ich stundenlang voller Leidenschaft sprechen?',
  'Was würde ich heute tun, wenn niemand etwas von mir erwarten würde?',
];

export const libraryTypes = ['Musik', 'Moment', 'Idee', 'Erfolg', 'Rezept', 'Ort', 'Buch', 'Film', 'Mensch', 'Sprachnachricht'];

export const goalStates = [
  { id: 'exploring', label: 'Exploring', hint: 'Ich finde heraus, ob ich das wirklich möchte.' },
  { id: 'committed', label: 'Committed', hint: 'Dafür habe ich mich entschieden.' },
  { id: 'evolving', label: 'Evolving', hint: 'Mein Ziel verändert sich mit mir.' },
] as const;
