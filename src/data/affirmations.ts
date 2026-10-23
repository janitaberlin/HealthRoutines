/** Affirmationen: Fragen, Sprachen, Startwerte und Hintergrund (Janita 23.10.2026). */
export const affirmQuestions = [
  { id: 'affirm.seen', label: 'Was will gerade gesehen werden?' },
  { id: 'affirm.was', label: 'Wer war ich?' },
  { id: 'affirm.become', label: 'Wer will ich sein?' },
  { id: 'affirm.success', label: 'Womit will ich erfolgreich sein und wie soll das aussehen?' },
  { id: 'affirm.beliefs', label: 'Um diese Version von mir zu werden: Was muss ich über mich und die Welt glauben?' },
];

export const languages = [
  { id: 'de', label: 'Deutsch', lang: 'de-DE', prompt: 'Deutsch' },
  { id: 'en', label: 'English', lang: 'en-US', prompt: 'Englisch' },
  { id: 'es', label: 'Español', lang: 'es-ES', prompt: 'Spanisch' },
  { id: 'fr', label: 'Français', lang: 'fr-FR', prompt: 'Französisch' },
];

/** Bekannte Stimmen auf iPhone, Mac und Android; die Sprachausgabe selbst verrät das Geschlecht nicht. */
export const femaleVoices = ['anna', 'helena', 'petra', 'katja', 'marlene', 'vicki', 'samantha', 'karen', 'moira', 'tessa', 'serena', 'kate', 'victoria', 'allison', 'ava', 'susan', 'zoe', 'nicky', 'monica', 'mónica', 'paulina', 'marisol', 'amelie', 'amélie', 'audrey', 'aurelie', 'marie', 'female', 'frau', 'google deutsch', 'google français', 'google español', 'google us english'];
export const maleVoices = ['markus', 'yannick', 'hans', 'martin', 'daniel', 'alex', 'aaron', 'fred', 'tom', 'oliver', 'arthur', 'rishi', 'jorge', 'diego', 'juan', 'carlos', 'thomas', 'nicolas', 'jacques', 'male', 'mann', 'google uk english male'];

export const defaultAffirmations = {
  morning: [
    'Ich bin JANITA. Meine Energie ist meine Magie.',
    'Erfolg folgt der Freude.',
    'Ich folge heute dem, was sich lebendig anfühlt.',
    'Ich erschaffe mein Leben, ich verwalte es nicht.',
    'Ich darf gesehen werden, genau so, wie ich bin.',
  ].join('\n'),
  evening: [
    'Ich habe heute genug getan.',
    'Mein Körper darf jetzt loslassen.',
    'Ich bin sicher, ich bin geliebt, ich bin genug.',
    'Ich werde jeden Tag mehr zu der Frau, die ich sein will.',
    'Ruhe ist ein Teil meines Erfolgs.',
  ].join('\n'),
};

/** Hintergrund mit Quellen; vorsichtig formuliert, keine Heilsversprechen. */
export const science = {
  morning: [
    'Studien zur Selbstbestätigung (Self-Affirmation) zeigen: Wer sich kurz auf die eigenen Werte besinnt, reagiert in Stresssituationen gelassener und löst Aufgaben unter Druck besser (Creswell u. a. 2005 und 2013).',
    'Im Gehirn-Scan aktivieren solche Affirmationen Bereiche für Selbstwahrnehmung und Belohnung, besonders wenn sie in die Zukunft gerichtet sind (Cascio u. a. 2016).',
    'Am Morgen setzt du damit den Rahmen, durch den du den Tag wahrnimmst.',
  ],
  evening: [
    'Was wir kurz vor dem Schlafen aufnehmen, festigt das Gehirn im Schlaf im Gedächtnis (Diekelmann und Born 2010). Die Studien betreffen Lernen allgemein, nicht speziell Affirmationen.',
    'Ruhige Stimme und Musik helfen beim Runterkommen. Dass Sätze im Tiefschlaf „ins Unterbewusstsein“ wandern, ist dagegen nicht belegt: Wirksam ist die Zeit, in der du noch wach zuhörst.',
  ],
  tip: 'Wichtig: Affirmationen wirken am besten, wenn sie sich für dich glaubwürdig anfühlen. Sätze, die sich zu weit weg anfühlen, können sogar Zweifel verstärken (Wood u. a. 2009). Lieber „Ich werde jeden Tag …“ als „Ich bin schon …“, wenn es noch nicht stimmt.',
};
