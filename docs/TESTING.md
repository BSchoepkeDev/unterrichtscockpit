# Teststrategie

## Automatisierte Prüfungen

GitHub Actions führt für Pull Requests und Pushes nach main folgende Prüfungen aus:

- Dependency-Audit
- TypeScript-Typprüfung
- Vitest-Unit-Tests
- Produktionsbuild
- Playwright-End-to-End-Tests in Chromium und WebKit
- Pages-Deploy nur für erfolgreiche Push-Läufe auf main

Lokal:

    npm ci
    npm run typecheck
    npm run test
    npm run build
    npx playwright install --with-deps chromium webkit
    npm run test:e2e

## Abgedeckte Kernabläufe

Die Unit- und Browsertests prüfen Planverwaltung, Import und OCR, Cockpit-Fortschritt, Timer, aktive Phasen, Notizen, PDF-Export, Sicherung/Wiederherstellung, Offlinebereitschaft und Persistenz nach Reload. Der Reset wird auf vollständige IndexedDB-Löschung und wiederhergestellte Standardeinstellungen geprüft.

E2E-Planinhalte werden nur im Test durch die Oberfläche erstellt. Die Produktionsbibliothek enthält und erzeugt keine Beispieldatensätze.

## Manuelle Geräteprüfung

Automatisierte WebKit-Tests ersetzen keinen realen iPad-Test. Bei relevanten Änderungen iPad Safari und installierte PWA prüfen, insbesondere Offline-Ersteinrichtung, Offline-Neustart, Timerfortsetzung, Updatehinweis, Dateiablage/Wiederherstellung und Reset. Ergebnis mit Gerät, Browser und geprüftem Versionsstand dokumentieren.
