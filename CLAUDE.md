# JANITA (Health Routines)

Statische Website zum Abhaken täglicher Routinen (Astro 5, GitHub Pages). Live: https://janitaberlin.github.io/HealthRoutines/
App-Name überall „JANITA“ (Janita 19.10.2026); Repo und Link bleiben HealthRoutines.
Sprache mit dem Nutzer: Deutsch. Design seit 19.10.2026 dunkel und warm wie die App Rewire (Standard), hell per ◐ umschaltbar; Navigation als Leiste unten; oben in der Kopfleiste steht „DREAM BIG“ (Janita 19.10.2026, App-Name bleibt JANITA); Heute ist kurz wie Rewire: „Welcome, JANITA.“ mit feiner Goldwelle, die sich leicht bewegt, Wochenkarte (`src/scripts/week-card.ts`), 4 Bild-Kästen Vision/Routinen/Fokus/My Life (`src/scripts/home.ts`), darunter Jetzt dran und Zyklus-Karte (Janita 20.10.2026), dann My Goals (3 Ziele direkt eintippen, Etikett tippen wechselt Exploring/Committed/Evolving, `src/scripts/north-star.ts`) mit Daily Question, Mindset-Impuls, Ritual-Karte. Abhakliste auf eigener Seite `src/pages/routinen/`: nur Routinen, oben goldene Fortschrittslinie mit Funken; ist alles erledigt, Goldregen-Feuerwerk (Canvas, 3 Bursts, Funken hängen wie eine Traube) über die ganze App; im Verlauf haben volle Tage einen goldenen Stern (Janita 19.10.2026). Türöffner schwarz mit goldenem Funken über der Signatur (Janita 19.10.2026). Schrift Inter (klar wie Rewire), Playfair Display nur für den Namen. Janitas Regeln (19.10.2026): nie kursiv; JANITA immer in Großbuchstaben; nicht „Ignite my spark“ (Ritual heißt „Remember Who You Are“, Karte mit Play-Knopf); Motto „Erfolg folgt der Freude.“ statt „I create. I lead. I live.“.

**Versionen:** Version 1 = Commit `1fe2ecc` (19.10.2026, siehe `VERSIONEN.md`). Alles danach ist Version 2; Janita will ab jetzt nur noch kleine Änderungen.

**Git-Workflow:** Immer direkt auf `main` committen und pushen, keine Branches, keine Pull Requests; vorher `npm test` und `npm run build` grün. Startet die Sitzung auf einem anderen Branch, Änderungen nach `main` übernehmen. Schlägt der Push fehl, Janita sofort sagen.

## Befehle

- `npm run dev` – Vorschau unter http://localhost:4321/HealthRoutines/
- `npm test` – Unit-Tests (Vitest)
- `npm run build` – baut die Seite
- `npm run icons` – App-Icons aus `public/icon*.svg` neu erzeugen

## Routinen ändern

Alle Routinen stehen in `src/data/routines.ts`. Jeder Punkt hat eine feste `id`; abgehakte Tage hängen daran. Beim Umformulieren eines Punkts die `id` behalten, sonst verschwindet sein Verlauf. Neue Punkte bekommen eine neue, eindeutige id (Kleinbuchstaben, `-`).

Mindset-Impulse und Affirmationen beruhen auf Janitas Astro-/Human-Design-Deutung (`/mnt/project-files/coaching/mindset-profil.md`); immer als Reflexion formulieren.

Inhalte: keine erfundenen medizinischen Fakten. Supplemente nur aus `/mnt/project-files/health/supplemente-plan.md` (bzw. Janitas Angaben), mit Einnahmehinweis von dort.

## Code-Überblick

- `src/lib/tracker.ts` – Haken, Serien, Auswertung (getestet in `tracker.test.ts`)
- `src/pages/routinen/index.astro` + `src/scripts/today.ts` – Abhakliste; `src/pages/index.astro` – Heute (Startseite); Türöffner `#splash` (einmal pro App-Start ca. 2 Sek. „Welcome back, JANITA“ + fester Satz „Your energy is your magic.“ (Janita 19.10.2026), schwarz mit hellem Text, Schrift `--font-editorial` (Playfair Display als Ersatz für Editor’s Note); sessionStorage `splash-seen`)
- `src/lib/time.ts` + `src/pages/zeit/index.astro` + `src/scripts/time-page.ts` – Zeiterfassung (Stoppuhr Business/Job, Woche, 8 Wochen, Nachtragen); Bereiche in `CATEGORIES`, ids nie ändern
- `src/data/schedule.ts` + `src/lib/plan.ts` + `src/scripts/now.ts` – Tagesplan (Mo–Fr) und Karte „Jetzt dran“ auf Heute; Arbeitsblöcke (`work`) bieten die Stoppuhr an (`zeit/?start=business`)
- Fokus-Block 25/50/90 Min. in der Stoppuhr (`focus` in `Running`, Wahl in `focus-minutes`), Signal per Ton
- `src/pages/compass/index.astro` + `src/scripts/compass-page.ts` – My Inner Compass (Teil I Identität: unter „Wer bin ich?“ Bodygraph `src/components/HumanDesign.astro` nur mit bestätigten Chart-Daten als Reflexionsrahmen; 5 Fragen Wer/Was liebe/Meine Werte/Fühlen/Großvision; Teil II Lebensrhythmus = `rhythm` mit Blöcken aus schedule.ts; My Life = 4 Lebensbereiche mit Bildern in public/vision/ (auch im Morgenritual), darunter eigenes Vision Board mit Handy-Bildern (`src/scripts/vision-board.ts`, localStorage `vision-board`, in der Sicherung); North-Star-Vision, Why/What/How, 3 Ziele mit monatlichem Ziel-Check, tägliche Frage statt Neuverhandeln, Identität, 10/10 Life, Become Her, Spark Library); Startwerte in `src/data/compass.ts`, Logik `src/lib/compass.ts`; Morgenritual „Remember Who You Are“ in `src/components/Spark.astro` + `src/scripts/spark.ts`; North Star auf Heute über `src/scripts/north-star.ts`. Regel: schlank halten, 3 Minuten am Morgen.
- `src/pages/zyklus/index.astro` + `src/scripts/cycle.ts` + `src/lib/cycle.ts` – Zyklus (Janita 20.10.2026): Periode und Energie (Total low … Total high) pro Tag eintragen, auch auf Heute (Karte unter den 4 Bildern, Janita 20.10.2026; `src/components/CycleLog.astro`); 4 Phasen nach Kalender geschätzt (Eisprung ≈ Zykluslänge − 14, Länge aus eigenen Daten, sonst 28), immer als Schätzung kennzeichnen; je Phase ein Tipp (Orientierung, keine medizinische Aussage) unter der Phase; Diagramm 8 Wochen Energie vs. Phase, Energie je Phase; localStorage `cycle`, in der Sicherung
- `src/pages/verlauf/index.astro` + `src/scripts/history.ts` – Verlauf und Sicherung; oben Plan your week („Was sind meine Money-Making Activities diese Woche?“) und Wochenreflexion „Who did I become this week?“ + „What is the outcome?“ (To-dos) pro Woche ab Montag, frühere Wochen aufklappbar (`src/scripts/reflection.ts`, `src/lib/reflection.ts`, localStorage `week-reflection`, in der Sicherung; Janita 20.10.2026)
- `src/pages/antworten/` + `src/scripts/answers.ts` + `src/lib/journal.ts` – Meine Antworten (Janita 21.10.2026): alle Notizen, One inspired action und Wochenreflexion nach Datum, Filter nach Bereich; Link im Verlauf
- Nutzung (`src/lib/usage.ts`, localStorage `usage`): pro Tag, welche Seite bzw. das Ritual geöffnet wurde; im Verlauf „Was ich nutze“ (30 Tage). Janita will, dass Claude daraus ehrlich sagt, was sie nicht braucht.
- Hinweise auf Heute (`src/scripts/notices.ts`): sonntags Plan your week & Reflexion; Sicherung, wenn die letzte über 30 Tage her ist (`backup-last`) – Teilen-Menü, Janita speichert die Datei in Google Drive (automatisch geht nicht, Daten liegen nur auf dem Handy)
- Gespeichert wird in `localStorage` (`routine-checks`, `routine-notes`, `time-sessions`, `time-running`, `inner-compass`, `week-reflection`, `cycle`, `usage`, `backup-last`), pro Gerät; die Sicherung (`buildBackup` in storage.ts) enthält alles. Punkte mit `note: true` haben ein Notizfeld; Schreiben hakt sie ab.
