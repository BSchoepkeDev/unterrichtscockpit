# Projektstatus – Entwicklungsstufe 7 / Version 0.7.0

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
- E2E umfasst Notizzuordnung und Reload, simulierte finale Spracherkennung, verweigerte Berechtigung und funktionsfähigen Textfeld-Fallback.
- Lokale Browserinstallation wurde mit HTTP 403 blockiert; die CI-Browserläufe konnten erfolgreich ausgeführt werden.
- Der abschließende Test auf echtem iPadOS-Safari ist noch offen.

## Bekannte Grenzen

- Browser-Spracherkennung ist optional, browserabhängig und möglicherweise onlinebasiert. Tastaturdiktat bleibt der datenschutzärmere und kompatible Fallback, unterliegt aber den Einstellungen des Betriebssystems.
- IndexedDB ist kein vollständiges Backup. Datensicherung und Wiederherstellung folgen in Stufe 9.
- Eine stabile Offline-Bereitschaft für Spracheingabe wird nicht zugesichert; Offline-Abnahme folgt in Stufe 10.
- Automatisierte WebKit-Tests ersetzen den realen iPad-Test nicht.

## Nächste Schritte

1. PR #10 nach erfolgreicher CI mergen und den Main-/Pages-Deploy verifizieren.
2. Auf dem 10–11-Zoll-iPad Textfeld, Tastaturdiktat, Notizzuordnungen, Reload während des Timers sowie Verhalten ohne verfügbare direkte Spracherkennung abnehmen.
3. Nach der Geräteabnahme Stufe 8 (PDF-Export) beginnen.
