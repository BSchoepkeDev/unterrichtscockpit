# Projektstatus – Entwicklungsstufe 6 / Version 0.6.0
Stand: 24.11.2026. Basis: `main`-Commit `1f7de48126058492b640df717510bcec9ba5fe04`. Produktivversion 0.6.0: https://bschoepkedev.github.io/unterrichtscockpit/.

## Stufe 6 implementiert
- Lokaler Import aus PDF, TXT, Markdown, CSV und eingefügtem Text; nativer Dateidialog, Dateityp-/Größenprüfung sowie verständliche Fehlerbehandlung.
- PDF.js-Textextraktion seitenweise mit Textpositionen; spaltenweise Sortierung bei erkannten Layoutspalten und zeilen-/tabellenbasierte Ausgabe.
- Deutsche Tesseract-OCR im Worker bei Seiten mit weniger als 80 nicht-leeren Zeichen. OCR-Sprachmodell, WASM und Worker-Dateien sind selbst gehostet und für den PWA-Precache vorgesehen.
- Regelbasierte Erkennung von Phasen, Reihenfolge, Zeitangaben, Planmetadaten und benannten Feldern; Tabellen-/CSV-Kopfzeilen, unsichere Zeiten, Quellen- und OCR-Prüfhinweise. Nicht erkannte Zeilen und Originaltext bleiben nachvollziehbar.
- Importvorschau mit editierbaren Feldern, Quelltext, Warnungen, Teilen, Zusammenführen, Umordnen und Entfernen. Übergang in den bestehenden Planeditor.
- Plan und Originaldatei werden nach Bestätigung atomar in IndexedDB gespeichert; Originaldownload erscheint am Plan in der Bibliothek und bleibt nach Reload erreichbar.
- Keine Datenbankmigration. Dateien über 30 MB und PDFs über 120 Seiten werden zur Begrenzung des mobilen Speicherverbrauchs abgewiesen.

## Qualitätssicherung
- Lokal erfolgreich: `npm ci`, TypeScript, 41/41 Unit-Tests, Produktions-Build und `npm audit --audit-level=moderate` (0 Befunde).
- PR [Run 45503729937](https://github.com/BSchoepkeDev/unterrichtscockpit/actions/runs/45503729937): 41/41 Unit-Tests, 34/34 Chromium-/WebKit-E2E-Tests, Audit (0 Befunde), TypeScript und Build erfolgreich.
- Main/Pages [Run 45505615271](https://github.com/BSchoepkeDev/unterrichtscockpit/actions/runs/45505615271): 41/41 Unit-Tests, 34/34 Chromium-/WebKit-E2E-Tests, Audit ohne Befunde, TypeScript, Build und Pages-Deployment erfolgreich. Produktiv: https://bschoepkedev.github.io/unterrichtscockpit/.
- Folgekorrektur [PR #6](https://github.com/BSchoepkeDev/unterrichtscockpit/pull/6), [Run 45505311877](https://github.com/BSchoepkeDev/unterrichtscockpit/actions/runs/45505311877): Settings-Writes werden transaktional zusammengeführt, damit schnelle Feldänderungen einander nicht überschreiben.
- Importfixtures enthalten ausschließlich synthetische Inhalte. Es wurden keine realen Unterrichtspläne zum Tuning verwendet.
- iPad/iPadOS-Safari-Abnahme steht aus; sie ist der abschließende Nutzertest dieser Stufe.

## Bekannte Grenzen
- OCR- und Parsergebnisse müssen manuell geprüft werden; Mehrspaltenfluss und tabellarische Feldzuordnung sind layoutabhängig.
- CSV unterstützt einfache Trennzeichen und Tabellenköpfe, aber nicht jede komplexe Anführungszeichen-/Escape-Konvention.
- DOCX, Bilder als eigenständige Uploads und andere Office-Formate werden nicht direkt importiert.
- IndexedDB ist kein Backup. Der Originalanhang wird bei Planlöschung vorerst nicht automatisch entfernt, um historische Referenzen nicht zu beschädigen.
- Importressourcen werden für Offlinebetrieb vorgemerkt; vollständige Offline- und Safari-Abnahme folgt in Stufe 10.

## Nächste Schritte
1. Abnahme auf echtem 10–11-Zoll-iPad mit iPadOS-Safari durchführen; Rückmeldung zu Import, OCR, Bearbeitung und Originaldatei dokumentieren.
2. Bei Bedarf iPad-spezifische Befunde beheben und erneut über CI/Pages veröffentlichen.
3. Danach den dokumentierten Übergabestand für Stufe 7 fortsetzen.
