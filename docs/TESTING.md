# Tests
Ausführen mit `npm ci`, `npm audit --audit-level=moderate`, `npm run typecheck`, `npm run test`, `npm run build`, `npx playwright install --with-deps chromium webkit`, `npm run test:e2e`.

Unit-Tests der Stufe 2 prüfen Erstellen, Speichern, persistentes Wiederöffnen, unabhängige Duplikate, historische Snapshots nach Löschung, Konkurrenzkonflikte, Suche/Sortierung/Filter, Reihenfolge und Validierung.

Browser-Tests prüfen Erstellen, Bearbeiten, Duplizieren, Suche und Neuladen sowie bestätigtes Löschen und Abbruch. Chromium und WebKit sind in CI konfiguriert. Reale Safari-/iPadOS-Tests sind gesondert erforderlich. Aktuelle CI-Ergebnisse nicht durch frühere Stufe-1-Ergebnisse ersetzen.
