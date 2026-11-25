# Abschlussprotokoll und Entwicklungsübergabe – Unterrichtscockpit 1.0.0

## Produkt und aktueller Stand

Unterrichtscockpit ist eine installierbare PWA für persönliche Unterrichtsplanung und -durchführung. Produktivseite: <https://bschoepkedev.github.io/unterrichtscockpit/>. Quellrepository: <https://github.com/BSchoepkeDev/unterrichtscockpit>.

Version 1.0.0 umfasst:

- Planbibliothek ohne Beispieldatensätze; Planerstellung, Suche, Filter, Sortierung, Duplikation und Löschen.
- Unterrichts-Cockpit mit getrennten Durchführungen, Timer, Phasenwechsel, Fortschritt, spontanen Änderungen, Notizen, Historie und Nachbereitung.
- PDF-/Textimport mit lokalem OCR, PDF-Export sowie Sicherung und Wiederherstellung.
- Offlinebetrieb nach abgeschlossener Online-Einrichtung; bewusster Updatehinweis für installierte PWA.
- Lokaler Gesamtreset: IndexedDB mit Plänen, Durchführungen, Notizen, Anhängen, Aufnahmen, Einstellungen und Locks löschen. Die App startet mit Standardeinstellungen neu; installierte App- und Offline-Dateien bleiben erhalten.
- Aktive Unterrichtsphase erhält abhängig von ihren einstellbaren Zeitgrenzen eine dezente grüne, gelbe oder rote Fläche.

## Architektur und Daten

- React, TypeScript, Vite und Workbox PWA; Veröffentlichung über GitHub Pages.
- Browserdaten liegen lokal in IndexedDB (Datenbankname unterrichtscockpit-v1). Es gibt keine Benutzerkonten oder Cloud-Synchronisierung.
- Das versionierte Backupformat .ucbackup enthält den lokalen Datenbestand und wird vor Wiederherstellung geprüft. Details: [Backupformat](BACKUP_FORMAT.md).
- Browser-Spracherkennung kann einen Onlinedienst verwenden. Lokale Daten sollten regelmäßig exportiert werden; der Browser garantiert keine dauerhafte Speicherung.
- Der Reset kann nicht rückgängig gemacht werden. Exportiere bei Bedarf vorher ein Backup.

## Repository-Workflow für neue Funktionen

Der bewährte Ablauf ist Branch → Prüfung → Pull Request → Merge → Deployment:

1. Aktuellen main-Stand, Changelog, Projektstatus und betroffene Architektur lesen. Aufgabenstand und vorhandene Nutzeranforderungen berücksichtigen.
2. Einen kurzen Feature-Branch vom aktuellen main erstellen, z. B. feature/kurzer-name.
3. Änderung samt Akzeptanzkriterien implementieren. Datenmodell oder Backupformat nur ändern, wenn nötig; Migration und Rückwärtskompatibilität explizit prüfen.
4. Lokal npm run typecheck, npm run test, npm run build und, sofern Änderung die Oberfläche betrifft, npm run test:e2e ausführen. Passende Regressionstests ergänzen.
5. Changelog und docs/PROJECT_STATUS.md aktualisieren. Bei einer Veröffentlichung Paket- und Lockfile-Version konsistent nach SemVer erhöhen.
6. Pull Request gegen main eröffnen. CI muss Audit, TypeScript, Unit-Tests, Produktionsbuild und Chromium-/WebKit-E2E bestehen. Bei Fehlern Ursache beheben und CI erneut ausführen.
7. Erst nach grüner CI mergen. Der Pages-Deploy läuft beim Push auf main, nicht im PR-Lauf.
8. Main-Workflow und Pages-Deploy auf Erfolg prüfen. Bei geräteabhängigen Änderungen zusätzlich auf echtem iPad in Safari und installierter PWA abnehmen und das Ergebnis dokumentieren.

Branch-Namen und PR-Beschreibungen sollen Zweck und Prüfumfang nennen. Änderungen an persönlichen Daten, Export, Wiederherstellung oder Reset brauchen gezielte Tests für Datenintegrität und Abbruch-/Fehlerfälle.

## Prüfung von Version 1.0

Automatisierte CI umfasst TypeScript-Prüfung, Unit-Tests, Produktionsbuild, Dependency-Audit und Playwright-E2E in Chromium und WebKit. Reale iPad-Tests ergänzen diese Läufe, ersetzen sie aber nicht. Geräteergebnisse werden nur als bestanden dokumentiert, wenn sie tatsächlich auf dem Gerät bestätigt wurden.

## Nächster Schritt

Version 1.0.0 ist der abgeschlossene Ausgangspunkt. Es ist keine weitere Funktion für diesen Release eingeplant. Neue Arbeit beginnt mit einer konkreten Nutzeranforderung und folgt dem oben beschriebenen Branch-/CI-/PR-/Merge-Prozess.
