# Projektstatus – Entwicklungsstufe 2 (Version 0.2.0)

Stand: 24.11.2026. Die Implementierung wurde im Pull Request #1 geprüft: https://github.com/BSchoepkeDev/unterrichtscockpit/pull/1

## Implementiert
- Unterrichtspläne erstellen, bearbeiten, umbenennen, duplizieren und bestätigt löschen.
- Suche in Titel, Thema, Fach, Gruppe, Schlagwörtern und Unterrichtspunkt-Titeln; Fachfilter und Sortierung.
- Editor für optionale Metadaten, Unterrichtspunkte, Phasen, Uhrzeiten, Dauer, Materialien, Aufträge, Hinweise und Originalquelltext.
- Punkte hinzufügen, duplizieren, ändern, nach oben/unten verschieben und bestätigt löschen.
- Dauersummen mit Hinweisen auf fehlende oder widersprüchliche Zeitwerte; validierte Speicherung, Abbruchbestätigung und Konflikterkennung.
- Dexie-Datenbankschema v1 unverändert; historische Durchführungs-Snapshots bleiben erhalten.
- Tastaturfokus und Escape/Tab-Bedienung im Editor.

## Verifizierte Tests
GitHub Actions [Run 45454402849](https://github.com/BSchoepkeDev/unterrichtscockpit/actions/runs/45454402849) für Commit `0ae987bee26eded1a550ab5449a5c7eea5b0131a`:
- `npm ci`: erfolgreich.
- `npm audit --audit-level=moderate`: erfolgreich; 0 gemeldete Schwachstellen.
- `npm run typecheck`: erfolgreich.
- `npm run test`: 11/11 Unit-Tests bestanden.
- `npm run build`: erfolgreich.
- `npm run test:e2e`: 12/12 Playwright-Tests in Chromium und WebKit bestanden.
- Build-Artefakt erfolgreich erzeugt. Keine automatische Pages-Veröffentlichung aus Pull Requests.
Vorheriger CI-Fehler in Run 45453768870: uneindeutiger Playwright-Selektor; behoben und nachfolgend erfolgreich geprüft.

## Grenzen und Risiken
- Import, Live-Cockpit, Zeitmanagement, echte Durchführungen, Historie-Oberfläche, PDF-Export und vollständige Sicherung sind spätere Stufen.
- Keine iPad-Safari-Abnahme und keine vollständige Offline-Abnahme. Playwright-WebKit ersetzt keine physische iPad-Prüfung.
- Lokale IndexedDB-Daten können verloren gehen; ohne Backup keine Freigabe für unersetzliche Unterrichtsdaten.
- Konflikterkennung über `updatedAt` schützt vor einfachen Mehrfenster-Überschreibungen, ist aber kein verteiltes Sperrprotokoll.
- Planduplikate übernehmen vorerst keine Originaldokument-Referenzen; deren sichere Kopie wird in der Import-/Anhangsstufe behandelt.
- GitHub Actions meldet eine nicht blockierende Node-Runtime-Warnung für Actions mit älterer Laufzeit.

## Nächster Schritt
Deployment auf `main` einschließlich Pages-Status verifizieren. Danach Stufe 2 auf dem realen 10–11-Zoll-iPad mit Safari/iPadOS 26 im Querformat, Hochformat und als installierte PWA prüfen. Erst dann die iPad-Abnahme abschließen.
