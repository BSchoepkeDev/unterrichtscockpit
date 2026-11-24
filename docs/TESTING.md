# Teststrategie und tatsächliche Ergebnisse

## Automatisierte Prüfung
`npm ci`, `npm audit --audit-level=moderate`, `npm run typecheck`, `npm run test`, `npm run build`, `npx playwright install --with-deps chromium webkit`, `npm run test:e2e`.

## Verifizierter Stufe-2-Lauf
[GitHub Actions Run 45454402849](https://github.com/BSchoepkeDev/unterrichtscockpit/actions/runs/45454402849) auf Commit `0ae987bee26eded1a550ab5449a5c7eea5b0131a`: npm ci, Audit (0 Schwachstellen), TypeScript, Vite-Build und Pages-Artefakt erfolgreich. Vitest: 11 von 11 Tests bestanden (4 bestehende, 7 neue). Playwright: 12 von 12 Tests bestanden (6 Szenarien in Chromium und WebKit).

Unit-Tests prüfen Validierung, Speichern und Wiederöffnen, unabhängige Duplikate, historische Snapshots nach Löschung, Schreibkonflikte, Suche/Filter/Sortierung und Unterrichtspunkt-Reihenfolge.

Browser-Tests prüfen Beispielpläne nach Reload, Navigation/Theme, Plan-CRUD mit Suche und Reload, Löschbestätigung, Abbruchbestätigung, Touch-Reihenfolge und unabhängige Punkt-Duplikation.

Ein vorheriger Browser-Test meldete in Run 45453768870 einen mehrdeutigen Selektor für „Duplizieren“; die Selektoren wurden auf die Bibliothek begrenzt und die Editor-Schließung abgewartet. Der Folgelauf bestätigte den Fix.

## Offene Geräteabnahme
Auf einem echten 10–11-Zoll-iPad mit iPadOS 26: Safari/Standalone, Querformat/Hochformat, Bildschirmtastatur, Touch, VoiceOver, Dark/Light Mode, Neuladen und PWA-Neustart. Browser-Persistenz ist keine garantierte Datensicherung. Vollständige Offline- und Backup-Abnahme erst in den entsprechenden späteren Entwicklungsstufen.
