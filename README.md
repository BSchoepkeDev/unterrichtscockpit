# Unterrichtscockpit

Local-first Progressive Web App für Unterrichtsplanung auf iPads. Deployment: https://bschoepkedev.github.io/unterrichtscockpit/

Version 0.4.0 ergänzt das interaktive Unterrichtscockpit um Live-Gesamt- und Phasentimer, Zeitampel, automatische bzw. manuelle Phasenwechsel, Pausen, Zeitprognosen, Screen Wake Lock und Wiederherstellung nach dem Neuladen. Warnschwellen und Verhalten sind unter **Einstellungen** anpassbar. Vollständige Unterrichtshistorie und spontane Änderungen folgen in Stufe 5; Import und Datensicherung in späteren Stufen.

## Lokale Entwicklung
Node.js 22 verwenden. Befehle: `npm ci`, `npm run dev`, `npm run typecheck`, `npm run test`, `npm run build`, `npm run preview`, `npm run test:e2e`. Für E2E `npx playwright install chromium webkit` vorab ausführen. Der GitHub-Actions-Workflow prüft Abhängigkeiten und veröffentlicht erfolgreiche Builds von `main`.

## iPad, Datenschutz und Datenhaltung
In Safari über **Teilen → Zum Home-Bildschirm** installieren. Unterrichtspläne werden ausschließlich in IndexedDB auf dem verwendeten Gerät gespeichert, nicht auf GitHub. Browserdaten können verloren gehen. Bis zur Implementierung vollständiger Sicherungen keine unersetzlichen Daten speichern. Die Grundfunktionen bis Stufe 3 wurden auf dem iPad als funktionsfähig bestätigt; ein eigener iPad-Praxistest der Timer aus Stufe 4, die vollständige Offline-Abnahme und ein Backup stehen noch aus.

Weitere Details: [Projektstatus](docs/PROJECT_STATUS.md), [Architektur](docs/ARCHITECTURE.md), [Entscheidungen](docs/DECISIONS.md), [Tests](docs/TESTING.md), [Datensicherung](docs/BACKUP_FORMAT.md).
