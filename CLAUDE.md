# JANITA (Health Routines)

Statische Website zum Abhaken täglicher Routinen (Astro 5, GitHub Pages). Live: https://janitaberlin.github.io/HealthRoutines/
App-Name überall „JANITA“ (Janita 19.10.2026); Repo und Link bleiben HealthRoutines.
Sprache mit dem Nutzer: Deutsch. Design seit 19.10.2026 dunkel und warm wie die App Rewire (Standard), hell per ◐ umschaltbar; Navigation als Leiste unten; Heute beginnt mit „Welcome, Janita.“, Wochenkarte (`src/scripts/week-card.ts`) und My-Life-Bildkarten. Türöffner bleibt beige.

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
- `src/pages/index.astro` + `src/scripts/today.ts` – Heute; Türöffner `#splash` (einmal pro App-Start ca. 2 Sek. „Welcome back, JANITA“ + Signatur aus dem Compass, Janita-Stil Beige/Schwarz, Schrift `--font-editorial` (Playfair Display als Ersatz für Editor’s Note); sessionStorage `splash-seen`)
- `src/lib/time.ts` + `src/pages/zeit/index.astro` + `src/scripts/time-page.ts` – Zeiterfassung (Stoppuhr Business/Job, Woche, 8 Wochen, Nachtragen); Bereiche in `CATEGORIES`, ids nie ändern
- `src/data/schedule.ts` + `src/lib/plan.ts` + `src/scripts/now.ts` – Tagesplan (Mo–Fr) und Karte „Jetzt dran“ auf Heute; Arbeitsblöcke (`work`) bieten die Stoppuhr an (`zeit/?start=business`)
- Fokus-Block 25/50/90 Min. in der Stoppuhr (`focus` in `Running`, Wahl in `focus-minutes`), Signal per Ton
- `src/pages/compass/index.astro` + `src/scripts/compass-page.ts` – My Inner Compass (Teil I Identität: 5 Fragen Wer/Was liebe/Wofür/Fühlen/Großvision; Teil II Lebensrhythmus = `rhythm` mit Blöcken aus schedule.ts; My Life = Vision Board mit 4 Bildern in public/vision/, auch im Spark-Ritual; North-Star-Vision, Why/What/How, 3 Ziele mit monatlichem Ziel-Check, tägliche Frage statt Neuverhandeln, Identität, 10/10 Life, Become Her, Spark Library); Startwerte in `src/data/compass.ts`, Logik `src/lib/compass.ts`; Ritual „Ignite my spark“ in `src/components/Spark.astro` + `src/scripts/spark.ts`; North Star auf Heute über `src/scripts/north-star.ts`. Regel: schlank halten, 3 Minuten am Morgen.
- `src/pages/verlauf/index.astro` + `src/scripts/history.ts` – Verlauf und Sicherung
- Gespeichert wird in `localStorage` (`routine-checks`, `routine-notes`, `time-sessions`, `time-running`, `inner-compass`), pro Gerät; die Sicherung im Verlauf enthält alles. Punkte mit `note: true` haben ein Notizfeld; Schreiben hakt sie ab.
