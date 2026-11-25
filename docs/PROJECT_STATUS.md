# Projektstatus – Entwicklungsstufe 8 / Version 0.8.1

Stand: 25.11.2026. Entwicklungsstufe 8 ist in Version 0.8.0 veröffentlicht; die Korrektur der Plannotiz-Zuordnung ist als Version 0.8.1 ebenfalls gemergt und veröffentlicht. Produktiv: https://bschoepkedev.github.io/unterrichtscockpit/. Verifizierter Code-Release-Commit: `e35aa5bd640246225d38114fbe3d479d93f50eed`.

## Stufe 8 umgesetzt

- PDF-Export für Plan und konkrete Durchführung, jeweils kompakt oder vollständig, aus Bibliothek, Cockpit und Historie.
- Lokale Erzeugung mit `pdf-lib`; die Bibliothek wird erst beim Öffnen der Exportfunktion dynamisch geladen.
- Berücksichtigt Planmetadaten, Ziele, geordnete Punkte, vollständige Punktfelder, Snapshot und Anpassungen, Status, Soll-/Ist-Zeiten, Pausen, Änderungsverlauf sowie optionale Plan-/Punkt-/Sitzungsnotizen.
- Umbruch langer Inhalte, Seitennummerierung, Exportzeit und Titel in Fußzeilen. Keine Schreibzugriffe auf Plan, Sitzung oder IndexedDB.
- Download; PDF lokal im Browser öffnen und über die Druckfunktion des Browsers drucken; optionales Teilen über Web Share API mit Capability-Prüfung und verständlichem Fallback.
- Tests: PDF-Varianten, Mehrseitigkeit, Umlaute, leerer Plan und Unverändertheit der Eingabedaten.

## Qualitätssicherung und Veröffentlichung Stufe 8

- Lokal: TypeScript erfolgreich, 56/56 Unit-Tests, Produktionsbuild und Audit (0 Schwachstellen) erfolgreich. PDF-Export liegt in einem dynamischen Chunk (437 kB unkomprimiert / 181 kB gzip); der initiale Anwendungschunk umfasst 464 kB / 144 kB gzip.
- PR-CI [Run 45585317152](https://github.com/BSchoepkeDev/unterrichtscockpit/actions/runs/45585317152) auf `49eb4cb73fc4d85c07063d36ef7358e5a0b94068`: Audit, TypeScript, Build, 56/56 Unit-Tests und 48/48 Chromium-/WebKit-E2E-Tests erfolgreich.
- PR #12 wurde am 25.11.2026 gemergt. Main-/Pages-Lauf [45585798727](https://github.com/BSchoepkeDev/unterrichtscockpit/actions/runs/45585798727) auf `e35aa5bd640246225d38114fbe3d479d93f50eed`: vollständige CI und Pages-Deployment erfolgreich.
- Die Live-Seite lieferte nach dem Deployment Version `0.8.0` und Build-ID `e35aa5b` aus.
- Playwright lokal nicht ausführbar, da Chromium-/WebKit-Binärdateien fehlen; die 48 Browserfälle liefen erfolgreich in GitHub Actions.

## Nachkorrektur 0.8.1

Plannotizen können gezielt einem Punkt des aktuellen, wiederverwendbaren Plans zugeordnet werden. Auswahl und Anzeige nutzen dessen Planpunkt-ID; Sitzungsnotizen bleiben an Durchführungspunkt-IDs gebunden. PR #14 wurde gemergt.

- PR-CI [Run 45589186762](https://github.com/BSchoepkeDev/unterrichtscockpit/actions/runs/45589186762): Audit, TypeScript, Build, 56/56 Unit-Tests und 48/48 Chromium-/WebKit-E2E-Tests erfolgreich.
- Main-/Pages-Lauf [45589622301](https://github.com/BSchoepkeDev/unterrichtscockpit/actions/runs/45589622301): vollständige CI und Deployment von Version 0.8.1 erfolgreich.
- Die Live-Seite lieferte zum Code-Release Version `0.8.1` und Build-ID `2946c96` aus.
- Der E2E-Test speichert eine Notiz für „Einstieg“ und prüft Zuordnung sowie Erhalt nach Reload.

## Noch offen für Stufe 8

- Echter iPad-Safari-/PWA-Test: kompakter/vollständiger Plan- und Durchführungsexport, Öffnen, Drucken/Teilen, lange Inhalte, Umlaute, Light-/Dark-Mode und unveränderte lokale Daten. Automatisierte WebKit-Tests ersetzen diese Geräteabnahme nicht.

## Roadmap

| Stufe | Umfang | Status |
|---|---|---|
| 1–7 | PWA, Bibliothek, Cockpit, Timer, Sitzungen, Import, Notizen | abgeschlossen |
| 8 | PDF-Export | veröffentlicht; iPad-Abnahme offen |
| 9 | Datensicherung und Wiederherstellung | offen |
| 10 | Offline-Validierung und Bereitstellung / MVP-Abschluss | offen |
| 11 | Längere Audioaufnahmen | offen |
| 12 | Abschließende Qualitätssicherung | offen |

---

## Vorheriger Stand: Entwicklungsstufe 7 / Version 0.7.0

Stand: 25.11.2026. Ausgangspunkt `95b4dc325becbb613a2b77a730c329c69261849e` (Version 0.6.2); die CI und das Pages-Deployment dieses Ausgangsstands waren erfolgreich. Produktiv: https://bschoepkedev.github.io/unterrichtscockpit/.

## Stufe 7 umgesetzt

- Planbezogene Notizen sowie getrennte Notizen für jede Unterrichtsdurchführung.
- Optionale Zuordnung von Notizen zu einem Punkt im Plan oder in der konkreten Durchführung.
- Notizen erstellen, bearbeiten und löschen; sichtbare Speicher-/Fehlermeldungen.
- Sitzungseinträge werden in der bestehenden IndexedDB-Tabelle `notes` gespeichert. Schema v1 und das bereits vorhandene `LessonNote`-Modell bleiben erhalten.
- Sitzungsnotizen verändern weder den Plan-Snapshot noch Timerintervalle. Abgeschlossene Durchführungen sind schreibgeschützt. Planlöschung und Sitzungsbereinigung entfernen ihre eigenen Notizen.
- Großes, normales Textfeld mit Touch-Zielgrößen für Bildschirmtastatur und iPadOS-Diktat.
- Optionale Browser-Spracherkennung nur bei verfügbarer API. Start, Stop, Zwischen-/Endergebnisse, Berechtigungsablehnung, fehlender Dienst, kein Sprachsignal, Abbruch und Laufzeitfehler haben verständliche Zustände. Kein `getUserMedia`, kein Audio-Recorder und kein eigener externer Speech-Dienst.
- Die Erkennung weist darauf hin, dass Browser-Spracherkennung je nach Implementierung einen Online-Dienst verwenden kann. Eine lokale Verarbeitung wird nicht behauptet.

## Versionshistorie und Gerätestand

- 0.6.1 führte OCR für Seiten mit PDF-Textebene plus eingebettetem Bildtext und die Download-Importvorlage ein.
- 0.6.2 ersetzte den PDF.js-AsyncIterator durch `getReader()`. Der Nutzer bestätigte anschließend, dass der Import auf dem iPad funktioniert.
- Diese iPad-Abnahme betraf den PDF-Import aus 0.6.2, nicht die neuen Stufe-7-Notiz-/Sprachfunktionen.

## Qualitätssicherung Stufe 7

- Lokal: TypeScript, 50/50 Unit-Tests, Produktionsbuild und Audit ohne Befund bestanden.
- PR-CI [Run 45571615271](https://github.com/BSchoepkeDev/unterrichtscockpit/actions/runs/45571615271) auf `54f9b756fbb76e5628af5257c523c39e49d1f93e`: Audit, TypeScript, Produktionsbuild, 50/50 Unit-Tests und 44/44 Chromium-/WebKit-E2E-Tests erfolgreich.
- Main-/Pages-CI [Run 45572532166](https://github.com/BSchoepkeDev/unterrichtscockpit/actions/runs/45572532166) auf `4e6c50a32625f3d4939526e993a2c77cbe3ce78c`: dieselben Prüfungen bestanden; Pages-Deployment meldete Erfolg.
- Produktionsseite am 25.11.2026 abgerufen: Build-Bundle enthält Version `0.7.0` und Build-ID `4e6c50a`.
- E2E umfasst Notizzuordnung und Reload, simulierte finale Spracherkennung, verweigerte Berechtigung und funktionsfähigen Textfeld-Fallback.
- Lokale Browserinstallation wurde mit HTTP 403 blockiert; die CI-Browserläufe konnten erfolgreich ausgeführt werden.
- Der abschließende Test auf echtem iPadOS-Safari ist noch offen.

## Bekannte Grenzen

- Browser-Spracherkennung ist optional, browserabhängig und möglicherweise onlinebasiert. Tastaturdiktat bleibt der datenschutzärmere und kompatible Fallback, unterliegt aber den Einstellungen des Betriebssystems.
- IndexedDB ist kein vollständiges Backup. Datensicherung und Wiederherstellung folgen in Stufe 9.
- Eine stabile Offline-Bereitschaft für Spracheingabe wird nicht zugesichert; Offline-Abnahme folgt in Stufe 10.
- Automatisierte WebKit-Tests ersetzen den realen iPad-Test nicht.

## Nächste Schritte

1. Auf dem 10–11-Zoll-iPad Textfeld, Tastaturdiktat, Notizzuordnungen, Reload während des Timers sowie Verhalten ohne verfügbare direkte Spracherkennung abnehmen.
2. Nach der iPad-Abnahme von Stufe 8 Stufe 9 (Datensicherung und Wiederherstellung) beginnen.
