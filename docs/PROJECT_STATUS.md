# Projektstatus – Stufe 5 / Version 0.5.0 in Prüfung
Stand: 24.11.2026. Live-Ausgangspunkt: `main` bei `64a7fc0b277d794201a79b8f86254b75bbb5b363`. Änderungen auf Branch `feature/stage-5-sessions`.

## Stufe 5 implementiert
- Eigenständige Durchführungen: beendete Sitzungen werden nicht wiederverwendet; erneutes Starten erzeugt einen neuen Snapshot mit eigenen Execution-IDs und Zeiten. Noch offene Sitzungen werden nach Reload wieder angezeigt.
- Transaktionale globale Prüfung vor Start/Fortsetzen verhindert parallele laufende Durchführungen; vorhandene Sitzungsdatensätze bleiben erhalten. IndexedDB-Schema bleibt v1, da neue Felder optional sind und keine Datenmigration notwendig ist.
- Überspringen zählt nicht als erledigt. Reaktivieren und erneutes Aktivieren ergänzen ein neues Zeitintervall, ohne vorhandene Ist-Zeit zu löschen.
- Durchführungspunkte und Gesamtdauer können während der Sitzung bearbeitet werden; Änderungen bleiben im Session-Snapshot protokolliert und verändern den Bibliotheksplan nicht automatisch. Neue Punkte, Verschieben sowie zentrale Inhalte (Titel, Dauer, Kurzbeschreibung, Arbeitsauftrag, Lehrerhinweise) sind unterstützt.
- Historie/Nachbereitung zeigt Durchführungen, Datum, Lerngruppe, Plan- und angepasste Gesamtdauer, Ist-Zeit, Statussummen sowie Soll-/Istzeit pro Punkt. Sitzungen können nach Bestätigung gelöscht werden. Selektive Übernahme geänderter Inhalte, Reihenfolge, neuer Punkte und angepasster Gesamtdauer ist ausdrücklich gesteuert. Gelöschte Originalpläne beeinträchtigen den Session-Snapshot nicht.
- Reset einer laufenden Sitzung wurde aus der Oberfläche entfernt und kann die Historie nicht mehr löschen. Neustart: beenden, danach denselben Plan neu starten.

## Verifikation
- `npm run typecheck`: erfolgreich.
- `npm test`: 30/30 Unit-Tests erfolgreich.
- `npm run build`: erfolgreich (Vite PWA); Drittanbieter-Kommentare von Zod werden durch Rollup-Warnung entfernt.
- `npm run test:e2e`: in dieser Umgebung nicht ausführbar, weil Chromium/WebKit-Binärdateien fehlen. `npx playwright install chromium webkit` scheiterte beim Download mit HTTP 403. E2E-Prüfung muss durch CI/Playwright-Umgebung erfolgen.
- Keine Änderungen auf `main`, kein Merge/Deploy bis erfolgreiche PR-CI. iPad-Praxistest steht aus.

## Offen / Risiken
- CI und Browserläufe auf PR prüfen. Wenn Tests scheitern, Ursachen beheben und erneut prüfen.
- Manuelle iPad-Abnahme getrennt anfragen und protokollieren.
- Altbestand mit mehreren gleichzeitig aktiven Sitzungen bleibt unverändert; neue Starts werden blockiert und zeigen Titel der konfliktierenden Sitzung. Die Lehrkraft kann sie im Cockpit auswählen und beenden.
- Pause erlaubt, eine andere Durchführung zu starten; Fortsetzen der alten Sitzung ist gesperrt, solange eine andere Sitzung läuft.
- Browserdaten sind noch nicht extern gesichert. Vollständiges Backup folgt in Stufe 9.

## Nächster Schritt
Dokumentation und Browsertests abschließen, Branch pushen, PR erstellen, CI-Ergebnisse einschließlich Chromium/WebKit prüfen. Nur bei grüner CI ist der Stufe-5-Branch für den Merge bereit. Danach Merge, Main-Deploy verifizieren und iPad-Praxistest durchführen.

## Fahrplan
1–4 veröffentlicht. 5 implementiert und in Prüfung. Danach: 6 Import, 7 Notizen/Spracheingabe, 8 PDF-Export, 9 Datensicherung, 10 Offline-Validierung/Bereitstellung, 11 längere Audioaufnahmen, 12 abschließende Qualitätssicherung.
