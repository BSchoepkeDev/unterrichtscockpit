# Changelog

## 0.9.1 – Offline-Update-Prüfung
- Versions- und Buildkennung angehoben, damit installierte PWA-Clients eine neue Fassung erkennen und den Update-Hinweis anzeigen.
- Keine Änderung am Datenbankschema oder an gespeicherten Daten; diese Version dient der praktischen Prüfung des Updateablaufs auf dem iPad.

## Unveröffentlicht – Stufe 10 begonnen
- Offline-Status prüft App-Shell, aktuelle Einstiegsskripte/-Styles und lokale OCR-Ressourcen im Workbox-Precache. Der Status unterscheidet Prüfung, bestätigte Offline-Grundfunktionen und unvollständige Vorbereitung sowie den Browser-Netzstatus.
- Ergänzt Hinweise zur Offline-Einrichtung und Installation auf iPad/Desktop sowie zur Verfügbarkeit lokaler Daten und netzabhängiger Funktionen.
- Update-Hinweis verlangt eine ausdrückliche Aktion und erläutert das Wiederaufnehmen lokaler Durchführungen nach dem Neuladen.
- Offline-E2E-Prüfung um Status nach Reload, Netzverlust und Neustart, Offline-Planbearbeitung, Notiz-/Timerpersistenz sowie Erstaufruf ohne Cache erweitert. PR-CI [Run 45634413776](https://github.com/BSchoepkeDev/unterrichtscockpit/actions/runs/45634413776) bestand mit 62/62 Unit- und 56/56 Chromium-/WebKit-E2E-Tests, Audit, Typprüfung und Build. Update-/Cache-Wechsel- und Geräteabnahme stehen aus.

## 0.9.0 – Entwicklungsstufe 9 (Datensicherung und Wiederherstellung)
- Vollständiger lokaler Sicherungsexport als versionierte JSON-Datei `.ucbackup`, mit Manifest und SHA-256-Prüfsumme. Enthalten sind Pläne, Sitzungen und Snapshots, Notizen, Einstellungen, Originaldateien sowie Audio-Metadaten und Audiodateien.
- Wiederherstellung prüft Dateigröße, Kennung, Formatversion, Manifest, Prüfsumme, Datensatz-IDs und Referenzen vor dem Schreiben.
- Vorschau zeigt neue Einträge, identische Duplikate, ID-Konflikte und beim Ersetzen entfallende Datensätze. Zusammenführen unterstützt eine gewählte Konfliktregel; Ersetzen und Zusammenführen brauchen ausdrückliche Bestätigung.
- Änderungen werden atomar transaktional geschrieben. Aktive oder pausierte Durchführungen sperren Restore; Abbruch und Fehler erhalten den bisherigen Datenbestand.
- Exportdatum, Sieben-Tage-Hinweis und Browser-Speicherquote (sofern verfügbar) werden in der Datensicherungsansicht angezeigt. Der Download kann auf iPadOS in „Dateien“ geprüft und dort abgelegt werden.
- Dokumentation des Formats und seiner Grenzen ergänzt. iPadOS-Dateiauswahl, Download und Dateien-App müssen noch auf einem echten iPad abgenommen werden.
- PR #16 gemergt. PR-CI [Run 45596595161](https://github.com/BSchoepkeDev/unterrichtscockpit/actions/runs/45596595161): Audit, TypeScript, 61/61 Unit-Tests, Build sowie Chromium-/WebKit-E2E erfolgreich. Main-/Pages-Lauf [45597064513](https://github.com/BSchoepkeDev/unterrichtscockpit/actions/runs/45597064513) veröffentlichte Version 0.9.0; die Live-Seite zeigte Build `c00f49f`.

## 0.8.1 – Zuordnung von Plannotizen
- Korrigiert die Zuordnung von Plannotizen zu Unterrichtspunkten: Auswahl und Validierung verwenden jetzt die Punkt-ID des wiederverwendbaren Plans, nicht die separate ID der Durchführung.
- Planpunktbezogene Notizen werden mit ihrem Punktnamen angezeigt und bleiben von sitzungsbezogenen Notizen getrennt.
- Browser-End-to-End-Test ergänzt, der eine Notiz zum Planpunkt „Einstieg“ speichert und nach dem Neuladen prüft.
- PR #14 gemergt. PR-CI [Run 45589186762](https://github.com/BSchoepkeDev/unterrichtscockpit/actions/runs/45589186762) bestand mit 56/56 Unit- und 48/48 Chromium-/WebKit-E2E-Tests, Audit, TypeScript und Build. Main-/Pages-Run [45589622301](https://github.com/BSchoepkeDev/unterrichtscockpit/actions/runs/45589622301) veröffentlichte Version 0.8.1.

## 0.8.0 – Entwicklungsstufe 8 (PDF-Export)
- Unterrichtspläne aus Bibliothek und Cockpit lokal als PDF exportieren: kompakte Übersicht oder vollständige Planung.
- Konkrete Durchführungen aus Cockpit und Historie exportieren. Der Export unterscheidet den ursprünglichen Plansnapshot vom aktuellen Sitzungsstand und führt Punktstatus, spontane Änderungen, Soll-/Ist-Zeiten, Pausen und sitzungsbezogene Notizen auf.
- Plan- und Punktnotizen können ein- oder ausgeschlossen werden. PDF-Seiten erhalten Exportzeit, Titel und Seitennummerierung; lange Inhalte werden umbrochen.
- Herunterladen funktioniert ohne externe Dienste; Drucken öffnet die PDF lokal im Browser. Teilen wird optional über die Web Share API mit Feature Detection angeboten.
- `pdf-lib` ist Laufzeitabhängigkeit, wird aber erst beim Öffnen der Exportaktion dynamisch geladen. IndexedDB-Daten werden beim Export nur gelesen.
- Automatisierte Prüfungen decken Plan-/Durchführungsvarianten, Umlaute, lange Texte, Mehrseitigkeit und unveränderte Eingabedaten ab.
- PR #12 gemergt. PR-CI [Run 45585317152](https://github.com/BSchoepkeDev/unterrichtscockpit/actions/runs/45585317152): 56/56 Unit- und 48/48 Chromium-/WebKit-E2E-Tests, Audit, TypeScript und Build erfolgreich. Main-/Pages-Run [45585798727](https://github.com/BSchoepkeDev/unterrichtscockpit/actions/runs/45585798727) veröffentlichte Version 0.8.0 erfolgreich.
- Echter iPad-Safari-/PWA-Praxistest steht noch aus.

## 0.7.0 – Entwicklungsstufe 7
- Schriftliche Notizen erfassen, bearbeiten und löschen; Zuordnung zum wiederverwendbaren Plan, zur unabhängigen Durchführung oder optional zu einem Durchführungspunkt.
- Speicherung über das vorhandene `LessonNote`-Modell in IndexedDB; Schema v1 bleibt erhalten. Sitzungsnotizen verändern weder Plansnapshot noch abgeschlossene Historie.
- Diktierfreundliche Textfelder unterstützen iPadOS-Tastaturdiktat ohne Browser-Spracherkennungs-API.
- Optionale Browser-Spracherkennung erscheint nur bei erkannter API und startet erst nach aktivem Druck. Start/Stop, Zwischen- und Endergebnisse, verweigerte Berechtigungen, fehlende Dienste und Abbruch werden behandelt.
- Datenschutztext weist darauf hin, dass Spracherkennung browserabhängig online verarbeitet werden kann. Es wird keine lokale Audioverarbeitung behauptet.
- Tests für Zuordnung, Reload-Persistenz, Plan-/Sitzungstrennung, Timerunabhängigkeit, schreibgeschützte Historie und Browser-End-to-End-Ablauf ergänzt.
- PR-CI [Run 45571615271](https://github.com/BSchoepkeDev/unterrichtscockpit/actions/runs/45571615271): 50/50 Unit- und 44/44 Chromium-/WebKit-E2E-Tests sowie Audit (0 Befunde), TypeScript und Build erfolgreich.
- Main-/Pages-CI [Run 45572532166](https://github.com/BSchoepkeDev/unterrichtscockpit/actions/runs/45572532166): dieselben Prüfungen bestanden und GitHub-Pages-Deployment erfolgreich. Produktiv ausgeliefert als Version 0.7.0 · Build `4e6c50a`.

## 0.6.2 – Safari-Folgekorrektur
- PDF.js-Textstreams für iPadOS Safari mit `getReader()` statt AsyncIterator auslesen.
- Nutzer bestätigte den PDF-Import anschließend auf dem iPad als funktionierend.

## 0.6.1 – OCR-Folgekorrektur
- OCR optional auch auf Seiten mit vorhandener PDF-Textebene ausführen, damit Text in eingebetteten Bildern erkannt wird.
- Downloadbare Importvorlage mit erwarteten Feldnamen ergänzt.


## 0.6.0 – Entwicklungsstufe 6 (veröffentlicht)
- Lokaler Import aus PDF, TXT, Markdown, CSV oder eingefügtem Text; PDF.js und deutsche Tesseract-OCR werden selbst gehostet.
- PDF-Seiten mit Textebene, Scans und gemischte PDFs werden seitenweise verarbeitet; Fortschritt und Abbruch sind verfügbar.
- Regelbasierte Erkennung von Zeiten, Phasen, Planmetadaten und Unterrichtsfeldern mit editierbarer Vorschau und Prüfhinweisen.
- Importinhalte können vor dem Speichern geteilt, zusammengeführt, umsortiert und korrigiert werden.
- Originaldateien werden zusammen mit dem bestätigten Plan lokal gespeichert und über die Bibliothek zugänglich.
- Maximale Eingabegröße 30 MB, maximal 120 PDF-Seiten; Schema v1 bleibt ohne Migration erhalten.
- PR-CI Run 45503729937: 41/41 Unit-Tests, 34/34 Chromium-/WebKit-E2E-Tests, TypeScript, Produktions-Build und npm-Audit (0 Befunde) erfolgreich.
- Folgekorrektur PR #6 behebt konkurrierende Einstellungsänderungen durch transaktionale Zusammenführung; PR-CI Run 45505311877 erfolgreich.
- Main-CI/Pages Run 45505615271 auf `1f7de48126058492b640df717510bcec9ba5fe04`: 41/41 Unit-Tests, 34/34 Browser-E2E-Tests, Audit (0 Befunde), TypeScript und Produktions-Build erfolgreich; GitHub-Pages-Deployment bestätigt.
- Live: https://bschoepkedev.github.io/unterrichtscockpit/. Echter iPad-Praxistest steht aus.

## 0.5.0 – Entwicklungsstufe 5 (veröffentlicht)
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
