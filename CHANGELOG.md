# Changelog

## 0.5.0 – Entwicklungsstufe 5 (in Prüfung)
- Jede beendete Durchführung bleibt eigenständig erhalten; derselbe Plan erzeugt beim nächsten Start einen neuen Datensatz.
- Globale transaktionale Prüfung verhindert zwei gleichzeitig laufende Durchführungen, auch bei konkurrierenden Tabs.
- Sitzungen nach Neustart wieder aufnehmen; pausierte und laufende Timerintervalle bleiben erhalten.
- Unterrichtspunkte überspringen, erneut aufnehmen, umsortieren, ergänzen und sitzungsspezifisch bearbeiten; bisherige Ist-Zeit bleibt erhalten.
- Angepasste Gesamt- und Phasensollzeiten, Inhalte und Reihenfolge werden neben dem unveränderten Plansnapshot gespeichert.
- Historie und Nachbereitung mit Soll-/Istwerten, Punktstatus und Änderungen; bestätigtes Löschen sowie explizite Auswahl zur Planübernahme.
- Reset einer laufenden Durchführung entfernt keine Historie mehr; zum Neustart wird die aktuelle Durchführung beendet und der Plan erneut gestartet.
- 31 Unit-Tests und 26/26 Chromium/WebKit-Tests durch PR-CI Run 45475637496 bestätigt; lokaler Browserdownload in der Umgebung mit HTTP 403 blockiert.

## 0.4.0 – Entwicklungsstufe 4 (veröffentlicht)
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
