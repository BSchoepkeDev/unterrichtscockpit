# Unterrichtscockpit

Local-first Progressive Web App für Unterrichtsplanung und -durchführung auf iPads. Produktiv: https://bschoepkedev.github.io/unterrichtscockpit/

Version 0.6.1 macht Version und kurze Build-ID in der App sichtbar. Die Importkorrektur ergänzt Vollseiten-OCR für PDFs mit Text in eingebetteten Bildern sowie eine downloadbare Importvorlage. Version 0.6.0 führte den lokalen PDF- und Textimport mit PDF.js, deutscher Tesseract-OCR, regelbasierter Strukturierung, bearbeitbarer Vorschau und lokalem Originalanhang ein. Dateien und Ergebnisse verlassen das Gerät nicht. OCR und automatische Feldzuordnung können Fehler enthalten; jede Vorschau muss vor dem Speichern geprüft werden.

## Lokale Entwicklung

Node.js 22 verwenden. `npm ci`, `npm run dev`, `npm run typecheck`, `npm run test`, `npm run build`, `npm run preview` und `npm run test:e2e`. Für Browserprüfungen zunächst `npx playwright install chromium webkit` ausführen. GitHub Actions führt Abhängigkeitsprüfung, Typprüfung, Unit- und Browserprüfungen sowie den Pages-Deploy aus.

## Import

Unter **Import** können PDF-, TXT-, Markdown- und CSV-Dateien oder eingefügter Text verarbeitet werden. PDF-Dateien bis 30 MB und 120 Seiten werden seitenweise untersucht. Seiten mit weniger als 80 lesbaren Zeichen werden lokal mit dem deutschen Tesseract-Sprachmodell per OCR gelesen. Optional kann OCR für alle Seiten erzwungen werden, etwa wenn eine Seite auswählbaren PDF-Text und zusätzlich Text in einem Bild enthält. Dateien, OCR-Daten und Ergebnisse werden nicht an einen Server übertragen. PDF-Text, OCR und Zuordnungen bleiben editierbar; Vorschau, Teilen, Zusammenführen und Reihenfolge können vor der Bestätigung angepasst werden. Erst das Speichern im Planeditor schreibt den Plan und den Originalanhang gemeinsam in IndexedDB. Der Originalanhang ist anschließend über die Plan-Karte in der Bibliothek erreichbar.

Die regelbasierte Erkennung ist für beliebige Dokumentlayouts nicht garantiert. Unsichere Zeiten, OCR- und Mehrspalteninhalte erhalten Prüfhinweise. Tabellen, Stichpunkte, nummerierte Zeilen und gemischte Inhalte werden unterstützt, müssen aber durch die Lehrkraft geprüft werden. DOCX-Dateien werden derzeit nicht importiert; Inhalte daraus können in den Editor kopiert oder als PDF/TXT exportiert werden.

## iPad, Datenschutz und Datenhaltung

In Safari über **Teilen → Zum Home-Bildschirm** installieren. Pläne, Durchführungen und Anhänge werden ausschließlich lokal in IndexedDB gespeichert, nicht auf GitHub. Browserdaten können verloren gehen. Bis zur Implementierung vollständiger Sicherungen in Stufe 9 keine unersetzlichen Daten speichern. Der Import-Build bündelt die benötigten PDF- und OCR-Ressourcen im Service-Worker-Precache. Vollständige Offline- und iPad-Safari-Abnahme ist noch offen und wird nicht durch automatisierte WebKit-Tests ersetzt.

Weitere Details: [Projektstatus](docs/PROJECT_STATUS.md), [Architektur](docs/ARCHITECTURE.md), [Entscheidungen](docs/DECISIONS.md), [Tests](docs/TESTING.md), [Datensicherung](docs/BACKUP_FORMAT.md).
