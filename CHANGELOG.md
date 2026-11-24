# Changelog

## 0.4.0 – Entwicklungsstufe 4 (CI-Abnahme / Deployment ausstehend)
- Expliziter Unterrichtsstart, Pause, Fortsetzen, Beenden und bestätigtes Zurücksetzen.
- Zeitstempel- und intervallbasierte Gesamtunterrichts- und Phasentimer; Zustand in IndexedDB.
- Ampel: Grün bis einschließlich geplanter Dauer, Gelb danach und Rot ab +03:00; Warnschwellen konfigurierbar.
- Automatischer oder manueller Phasenwechsel, unabhängige Checkboxen und Zeitprognosen.
- Pausen verschieben das geplante Ende ohne aktive Unterrichtszeit hinzuzufügen.
- Screen Wake Lock mit Unterstützungsprüfung, Status und Wiederaufnahmeversuch.
- Erweiterte Unit- und Browser-Regressionstests.

## 0.3.0 – Entwicklungsstufe 3 (veröffentlicht)
- Adaptives Kartenraster mit drei Informationsdichtestufen und Detailfenstern.
- Persistente, unabhängige Durchführungszustände, Checkboxen und Fortschritt.
- Optimistische Checkbox-Aktualisierung mit Rücknahme bei Speicherfehlern.
- Fünf neue Unit-Tests und Browser-Tests in Chromium/WebKit.
- Keine Timerfunktionen; diese folgen in Stufe 4.

## 0.2.0 – Entwicklungsstufe 2 (veröffentlicht)
- Bibliothek: Erstellen, Bearbeiten, Umbenennen, Duplizieren, bestätigtes Löschen.
- Suchen, Fachfilter, Sortierungen und Leerzustände.
- Editor mit Planmetadaten, geordneten Unterrichtspunkten, Zeiten, Materialien und Hinweisen.
- Transaktionale Validierung, Kopier-UUIDs, Schutz historischer Snapshots und Konflikterkennung.
- Neue Unit- und End-to-End-Tests.

## 0.1.0 – Entwicklungsstufe 1
- React/TypeScript/PWA/IndexedDB-Grundstruktur, Beispielpläne und Durchführungs-Snapshots.
- Navigation, GitHub Actions und GitHub Pages.
