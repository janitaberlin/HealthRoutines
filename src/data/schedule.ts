/** Janitas Tagesplan nach ihrem 10/10-Tag (Mo–Fr). Zeiten als „HH:MM“. */
export interface Block {
  from: string;
  to: string;
  title: string;
  text: string;
  /** Arbeitsblock: „Jetzt“-Karte bietet die Stoppuhr an. */
  work?: boolean;
}

export const schedule: Block[] = [
  { from: '07:00', to: '09:00', title: 'Body & Beauty', text: 'Tee, Sport, Tageslicht, Getting ready' },
  { from: '09:00', to: '12:00', title: 'Creation', text: 'Der größte Hebel des Tages zuerst', work: true },
  { from: '12:00', to: '13:00', title: 'Walk', text: '1 Std. raus, 5k Steps' },
  { from: '13:00', to: '14:00', title: 'Freedom', text: 'Lunch, Pause, etwas Schönes' },
  { from: '14:00', to: '16:30', title: 'Founder Focus', text: 'Zahlen, Feedback, Team. Darf auch mal wegfallen.', work: true },
  { from: '17:00', to: '20:00', title: 'Home & Love', text: 'Kochen, essen, Zeit mit Johannes' },
  { from: '20:00', to: '22:00', title: 'Wellness', text: 'Self Care, Handy weg, lesen, schlafen' },
];

export const weekendText = 'Wochenende: nichts muss. Wenn dich eine Idee packt, darfst du kreativ werden, weil du Lust hast.';
