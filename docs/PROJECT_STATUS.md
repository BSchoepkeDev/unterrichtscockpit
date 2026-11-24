# Projektstatus – Entwicklungsstufe 2
Stand: 24.11.2026. Entwicklung auf Branch `feature/stufe-2-bibliothek-editor`. Deployment auf `main` erst nach erfolgreichen Prüfungen.

## Umgesetzt
- Unterrichtspläne erstellen, bearbeiten, umbenennen, duplizieren und bestätigt löschen.
- Suche in Titel, Thema, Fach, Gruppe, Schlagwörtern, Unterrichtspunkt-Titeln; Fachfilter und Sortierungen.
- Editor für optionale Metadaten, Unterrichtspunkte, Phasen, Dauer, Materialien, Arbeitsaufträge und Hinweise.
- Punkte hinzufügen, duplizieren, ändern, nach oben/unten verschieben und bestätigt löschen.
- Dauerhinweise, Validierung, Abbruchbestätigung, Optimistic Concurrency anhand `updatedAt`.
- Bestehende Dexie-Datenbank v1 unverändert; Durchführungs-Snapshots werden nicht gelöscht oder überschrieben.

## Noch offen
- Import, Live-Cockpit, Timer, echte Unterrichtsdurchführungen, Notizen, PDF-Export und Backup sind spätere Stufen.
- Physischer iPad-Safari-Test und Offline-Abnahme fehlen. Keine Freigabe für unersetzliche Daten.
- Konkurrierende Schreibvorgänge sind über Zeitstempel erkennbar, aber `updatedAt` ist kein geräteübergreifender Lock.
- Duplikate übernehmen bewusst keine Originaldokument-Referenzen, solange noch keine sichere Anhangskopie existiert.

## Tests
Zusätzliche Unit- und Playwright-Tests im Repository. Belastbare aktuelle Testergebnisse sind im Pull-Request-CI zu verifizieren. Stufe-1-Deployment war Run 45445650640.

## Nächster Schritt
Branch-CI und Pull Request auswerten, Fehler korrigieren, dann geprüfte Änderung nach `main` übernehmen und reale iPad-Abnahme durchführen.
