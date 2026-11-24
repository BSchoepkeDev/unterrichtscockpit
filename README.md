# Unterrichtscockpit

Local-first Progressive Web App für Unterrichtsplanung auf iPads. Deployment: https://bschoepkedev.github.io/unterrichtscockpit/

Version 0.5.0 ergänzt unabhängige Unterrichtsdurchführungen, globale Startkonfliktprüfung, fortsetzbare Timer, spontane Sitzungsanpassungen, Überspringen und Reaktivieren sowie Historie und Nachbereitung mit ausdrücklich ausgewählter Planübernahme. Vorherige Versionen ergänzten Bibliothek, Cockpit und Live-Zeitmanagement. Import und Datensicherung folgen in späteren Stufen.

## Lokale Entwicklung
Node.js 22 verwenden. Befehle: `npm ci`, `npm run dev`, `npm run typecheck`, `npm run test`, `npm run build`, `npm run preview`, `npm run test:e2e`. Für E2E `npx playwright install chromium webkit` vorab ausführen. Der GitHub-Actions-Workflow prüft Abhängigkeiten und veröffentlicht erfolgreiche Builds von `main`.

## iPad, Datenschutz und Datenhaltung
In Safari über **Teilen → Zum Home-Bildschirm** installieren. Unterrichtspläne werden ausschließlich in IndexedDB auf dem verwendeten Gerät gespeichert, nicht auf GitHub. Browserdaten können verloren gehen. Bis zur Implementierung vollständiger Sicherungen keine unersetzlichen Daten speichern. Die Grundfunktionen bis Stufe 3 wurden auf dem iPad als funktionsfähig bestätigt; iPad-Praxistests der Timer und Stufe 5, vollständige Offline-Abnahme und Backup stehen noch aus.

Weitere Details: [Projektstatus](docs/PROJECT_STATUS.md), [Architektur](docs/ARCHITECTURE.md), [Entscheidungen](docs/DECISIONS.md), [Tests](docs/TESTING.md), [Datensicherung](docs/BACKUP_FORMAT.md).
