/** Hinweis auf Heute: sonntags Plan your week. Die Sicherung steht nur im Verlauf, nicht auf Heute (Janita 23.10.2026). */
document.getElementById('sunday-notice')!.hidden = new Date().getDay() !== 0;
