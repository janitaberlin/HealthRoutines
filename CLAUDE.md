# Janita's Health Routines

Statische Website zum Abhaken täglicher Routinen (Astro 5, GitHub Pages). Live: https://janitaberlin.github.io/HealthRoutines/
Sprache mit dem Nutzer: Deutsch. Design wie Janitas RecipeBook (schwarz-weiß mit hellem Beige).

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
- `src/pages/index.astro` + `src/scripts/today.ts` – Heute
- `src/lib/time.ts` + `src/pages/zeit/index.astro` + `src/scripts/time-page.ts` – Zeiterfassung (Stoppuhr Business/Job, Woche, 8 Wochen, Nachtragen); Bereiche in `CATEGORIES`, ids nie ändern
- `src/data/schedule.ts` + `src/lib/plan.ts` + `src/scripts/now.ts` – Tagesplan (Mo–Fr) und Karte „Jetzt dran“ auf Heute; Arbeitsblöcke (`work`) bieten die Stoppuhr an (`zeit/?start=business`)
- Fokus-Block 25/50/90 Min. in der Stoppuhr (`focus` in `Running`, Wahl in `focus-minutes`), Signal per Ton
- `src/pages/verlauf/index.astro` + `src/scripts/history.ts` – Verlauf und Sicherung
- Gespeichert wird in `localStorage` (`routine-checks`, `routine-notes`, `time-sessions`, `time-running`), pro Gerät; die Sicherung im Verlauf enthält alles. Punkte mit `note: true` haben ein Notizfeld; Schreiben hakt sie ab.
