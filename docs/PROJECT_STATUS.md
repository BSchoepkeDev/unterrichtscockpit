# Projektstatus – Entwicklungsstufe 3 (Version 0.3.0)

Entwicklungsbranch `feature/stufe-3-cockpit` / PR #2: adaptive Karte mit drei Darstellungsstufen, unabhängig öffnender Detaildialog, progressbasierte Anzeige, Checkboxen mit optimistischer Rückmeldung und persistenter Speicherung in eigenständigen Unterrichtsdurchführungen. Der ursprüngliche Plan bleibt unberührt. Bestehendes Schema v1 unverändert. Eine offene Sitzung pro Plan wird wiederverwendet. Die zuletzt gewählte Session-ID wird in localStorage gespeichert; Fachdaten bleiben in IndexedDB. Timer, Unterrichtsende und Historie folgen in Stufen 4/5.

Verifizierter CI-Lauf: [45460218272](https://github.com/BSchoepkeDev/unterrichtscockpit/actions/runs/45460218272), Commit `626dbedef6d6c9293ab6fee531675f8d1bc732ce`: Audit 0 Schwachstellen, TypeScript und Vite-Build, 16/16 Unit-Tests, 14/14 Chromium/WebKit-Browser-Tests erfolgreich. Ein älterer Lauf [45459533810](https://github.com/BSchoepkeDev/unterrichtscockpit/actions/runs/45459533810) scheiterte an asynchron zurückspringenden Checkboxen; die optimistische Zustandsdarstellung beseitigte diesen Fehler im Folgelauf. Reine Versions-/Dokumentationsänderungen werden anschließend geprüft. Produktiv-Deployment und reale iPad-Abnahme gesondert bestätigen. Keine vollständige Sicherung – keine unersetzlichen Daten speichern.

## Historie: Entwicklungsstufe 2

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

## Noch offen
- Stufe 3 auf `main` zusammenführen und den tatsächlichen GitHub-Pages-Deployment-Lauf prüfen.
- Reale iPad-Abnahme (10–11 Zoll, Safari/iPadOS 26, beide Ausrichtungen, PWA, Light/Dark, Tastatur, VoiceOver, Persistenz).
- Stufe 4: Live-Zeitmanagement. Stufe 5: vollständiger Durchführungslebenszyklus. Später: Import, Export, Backup und Offline-Vollabnahme.
