# Unterrichtscockpit

Local-first Progressive Web App für Unterrichtsplanung auf iPads. Deployment: https://bschoepkedev.github.io/unterrichtscockpit/

Entwicklungsstufe 3 ergänzt das interaktive Unterrichtscockpit mit adaptiven Karten, Detailfenstern, persistentem Abhaken und Fortschrittsanzeige. Live-Timer (Stufe 4), vollständiger Durchführungslebenszyklus (Stufe 5), Import und Datensicherung folgen in späteren Stufen.

## Lokale Entwicklung
Node.js 22 verwenden. Befehle: `npm ci`, `npm run dev`, `npm run typecheck`, `npm run test`, `npm run build`, `npm run preview`, `npm run test:e2e`. Für E2E `npx playwright install chromium webkit` vorab ausführen. Der GitHub-Actions-Workflow prüft Abhängigkeiten und veröffentlicht erfolgreiche Builds von `main`.

## iPad, Datenschutz und Datenhaltung
In Safari über **Teilen → Zum Home-Bildschirm** installieren. Unterrichtspläne werden ausschließlich in IndexedDB auf dem verwendeten Gerät gespeichert, nicht auf GitHub. Browserdaten können verloren gehen. Bis zur Implementierung vollständiger Sicherungen keine unersetzlichen Daten speichern. Echte iPad-Safari- und Offline-Tests stehen aus.

Weitere Details: [Projektstatus](docs/PROJECT_STATUS.md), [Architektur](docs/ARCHITECTURE.md), [Entscheidungen](docs/DECISIONS.md), [Tests](docs/TESTING.md), [Datensicherung](docs/BACKUP_FORMAT.md).
