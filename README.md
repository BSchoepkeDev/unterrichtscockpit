# Unterrichtscockpit

Local-first Progressive Web App für Unterrichtsplanung und -durchführung auf iPads. Produktiv: https://bschoepkedev.github.io/unterrichtscockpit/

Version 1.0.1 behebt die iPad-Dateiauswahl für Sicherungen. Version 1.0.0 bündelt die getesteten Kernfunktionen für Unterrichtsplanung und -durchführung: Bibliothek ohne Beispieldaten, lokale Datensicherung und Wiederherstellung, PDF-/Textimport mit OCR, PDF-Export, Notizen, Timer, Offlinebetrieb und ein vollständiger Reset der lokalen Datenbank. Die aktive Phase wird je nach Zeitrahmen grün, gelb oder rot eingefärbt. Details zu Datensicherung, Grenzen und Projektübergabe stehen in [Datensicherung](docs/BACKUP_FORMAT.md), [Abschlussprotokoll](docs/FINAL_HANDOFF_VERSION_1.0.md) und [Changelog](CHANGELOG.md).

## Lokale Entwicklung

Node.js 22 verwenden. `npm ci`, `npm run dev`, `npm run typecheck`, `npm run test`, `npm run build`, `npm run preview` und `npm run test:e2e`. Für Browserprüfungen zunächst `npx playwright install chromium webkit` ausführen. GitHub Actions führt Abhängigkeitsprüfung, Typprüfung, Unit- und Browserprüfungen sowie den Pages-Deploy aus.

## Import

Unter **Import** können PDF-, TXT-, Markdown- und CSV-Dateien oder eingefügter Text verarbeitet werden. PDF-Dateien bis 30 MB und 120 Seiten werden seitenweise untersucht. Seiten mit weniger als 80 lesbaren Zeichen werden lokal mit dem deutschen Tesseract-Sprachmodell per OCR gelesen. Optional kann OCR für alle Seiten erzwungen werden, etwa wenn eine Seite auswählbaren PDF-Text und zusätzlich Text in einem Bild enthält. Dateien, OCR-Daten und Ergebnisse werden nicht an einen Server übertragen. PDF-Text, OCR und Zuordnungen bleiben editierbar; Vorschau, Teilen, Zusammenführen und Reihenfolge können vor der Bestätigung angepasst werden. Erst das Speichern im Planeditor schreibt den Plan und den Originalanhang gemeinsam in IndexedDB. Der Originalanhang ist anschließend über die Plan-Karte in der Bibliothek erreichbar.

Die regelbasierte Erkennung ist für beliebige Dokumentlayouts nicht garantiert. Unsichere Zeiten, OCR- und Mehrspalteninhalte erhalten Prüfhinweise. Tabellen, Stichpunkte, nummerierte Zeilen und gemischte Inhalte werden unterstützt, müssen aber durch die Lehrkraft geprüft werden. DOCX-Dateien werden derzeit nicht importiert; Inhalte daraus können in den Editor kopiert oder als PDF/TXT exportiert werden.

## iPad, Datenschutz und Datenhaltung

In Safari über **Teilen → Zum Home-Bildschirm** installieren. Am Desktop die Installationsoption im Browsermenü verwenden, falls angeboten. Nach einem erfolgreichen Online-Aufruf zeigt die App an, ob ihr App-Shell-Cache und die gebündelten OCR-Ressourcen für Offline-Nutzung vorliegen. Der erste Besuch braucht eine Internetverbindung. Offline sind nur Pläne, Durchführungen, Notizen und Originaldateien verfügbar, die bereits in diesem Browser gespeichert wurden. Spracherkennung, Teilen und Drucken können Internet oder Browserunterstützung benötigen.

Pläne, Durchführungen, Notizen und Anhänge werden ausschließlich lokal in IndexedDB gespeichert, nicht auf GitHub. Unter **Datensicherung** eine Sicherung herunterladen und auf iPadOS in „Dateien“ kontrollieren. Die App kann nicht verifizieren, ob Downloads dauerhaft gesichert wurden. Browserdaten können verloren gehen; regelmäßige externe Sicherungen bleiben erforderlich. Sicherungsdateien können vertrauliche Unterrichtsinhalte enthalten. Automatisierte Chromium-/WebKit-Prüfungen ersetzen keine vollständige Offline- und iPad-Safari-Abnahme auf dem Gerät.

Weitere Details: [Projektstatus](docs/PROJECT_STATUS.md), [Architektur](docs/ARCHITECTURE.md), [Entscheidungen](docs/DECISIONS.md), [Tests](docs/TESTING.md), [Datensicherung](docs/BACKUP_FORMAT.md).
