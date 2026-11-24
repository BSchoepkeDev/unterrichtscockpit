# Projektstatus – Entwicklungsstufe 6 / Version 0.6.0
Stand: 24.11.2026. Basis: `main`-Commit `1aa7e390bf11df992fd68dd42704b404e47af878`. Produktivversion 0.5.0: https://bschoepkedev.github.io/unterrichtscockpit/.

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
- Importfixtures enthalten ausschließlich synthetische Inhalte. Es wurden keine realen Unterrichtspläne zum Tuning verwendet.
- iPad/iPadOS-Safari-Abnahme steht aus; sie ist der abschließende Nutzertest dieser Stufe.

## Bekannte Grenzen
- OCR- und Parsergebnisse müssen manuell geprüft werden; Mehrspaltenfluss und tabellarische Feldzuordnung sind layoutabhängig.
- CSV unterstützt einfache Trennzeichen und Tabellenköpfe, aber nicht jede komplexe Anführungszeichen-/Escape-Konvention.
- DOCX, Bilder als eigenständige Uploads und andere Office-Formate werden nicht direkt importiert.
- IndexedDB ist kein Backup. Der Originalanhang wird bei Planlöschung vorerst nicht automatisch entfernt, um historische Referenzen nicht zu beschädigen.
- Importressourcen werden für Offlinebetrieb vorgemerkt; vollständige Offline- und Safari-Abnahme folgt in Stufe 10.

## Nächste Schritte
1. PR-CI und Audit auf dem echten GitHub-Branch erfolgreich abschließen.
2. Auf `main` integrieren, Main-CI und GitHub-Pages-Deployment verifizieren.
3. Nutzerabnahme auf dem echten 10–11-Zoll-iPad anfordern.
4. Stufe 6 dokumentieren und Übergabestand für Stufe 7 erstellen.
