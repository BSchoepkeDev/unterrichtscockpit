# Projektstatus – Version 1.0.1

Unterrichtscockpit ist als lokal gespeicherte, installierbare PWA für die private Unterrichtsplanung und -durchführung umgesetzt. Die Anwendung wird über GitHub Pages veröffentlicht:

https://bschoepkedev.github.io/unterrichtscockpit/

## Version 1.0.1

Die Dateiauswahl der Sicherungswiederherstellung filtert Dateien nicht mehr nach Endung oder MIME-Typ. Die ausgewählte Datei wird weiterhin streng validiert, bevor eine Vorschau oder Wiederherstellung möglich ist.

## Version 1.0

- Eigene Pläne erstellen, bearbeiten, suchen, sortieren, duplizieren und löschen; keine Beispieldaten in der Bibliothek.
- Unterricht mit unabhängigen Durchführungen, Timer, Phasenstatus, spontanen Anpassungen, Notizen, Historie und Nachbereitung.
- PDF-/Textimport mit lokaler PDF-Verarbeitung und deutscher OCR; lokaler PDF-Export.
- Offlinebetrieb für bereits eingerichtete App-Dateien und lokal gespeicherte Daten.
- Sicherung und Wiederherstellung als lokale .ucbackup-Datei.
- Reset löscht den vollständigen lokalen App-Datenbestand und setzt Einstellungen zurück. Offline-App-Dateien bleiben installiert.
- Aktive Phase ist abhängig von der Dauer dezent grün, gelb oder rot hinterlegt.

## Daten und Grenzen

- Pläne, Durchführungen, Einstellungen, Notizen und Anhänge liegen im IndexedDB-Datenspeicher dieses Browsers. Es gibt keine Cloud-Synchronisierung.
- Der Reset ist unwiderruflich. Vorher eine Sicherung exportieren, wenn Daten erhalten bleiben sollen.
- Browser können lokale Daten entfernen; eine Sicherungsdatei sollte separat abgelegt werden.
- Browser-Spracherkennung ist abhängig von Gerät und Browser und kann online verarbeitet werden.

## Weiterentwicklung

Der aktuelle Release ist Version 1.0.1. Neue Funktionen folgen bei Bedarf über den Ablauf im [Abschlussprotokoll](FINAL_HANDOFF_VERSION_1.0.md).
