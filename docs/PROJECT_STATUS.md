# Projektstatus – Stufe 5 / Version 0.5.0 in Prüfung
Stand: 24.11.2026. Live-Ausgangspunkt: `main` bei `64a7fc0b277d794201a79b8f86254b75bbb5b363`. PR #4, Branch `feature/stage-5-sessions`, aktueller geprüfter Commit `f1d8badce9ea9fda97e8651d7fa478724255e6b2`.

## Stufe 5 implementiert
- Eigenständige Durchführungen: beendete Sitzungen werden nicht wiederverwendet; erneutes Starten erzeugt einen neuen Snapshot mit eigenen Execution-IDs und Zeiten. Noch offene Sitzungen werden nach Reload wieder angezeigt.
- Transaktionale globale Prüfung vor Start/Fortsetzen verhindert parallele laufende Durchführungen; vorhandene Sitzungsdatensätze bleiben erhalten. IndexedDB-Schema bleibt v1, da neue Felder optional sind und keine Datenmigration notwendig ist.
- Überspringen zählt nicht als erledigt. Reaktivieren und erneutes Aktivieren ergänzen ein neues Zeitintervall, ohne vorhandene Ist-Zeit zu löschen.
- Durchführungspunkte und Gesamtdauer können während der Sitzung bearbeitet werden; Änderungen bleiben im Session-Snapshot protokolliert und verändern den Bibliotheksplan nicht automatisch. Neue Punkte, Verschieben sowie zentrale Inhalte (Titel, Dauer, Kurzbeschreibung, Arbeitsauftrag, Lehrerhinweise) sind unterstützt.
- Historie/Nachbereitung zeigt Durchführungen, Datum, Lerngruppe, Plan- und angepasste Gesamtdauer, Ist-Zeit, Statussummen sowie Soll-/Istzeit pro Punkt. Sitzungen können nach Bestätigung gelöscht werden. Selektive Übernahme geänderter Inhalte, Reihenfolge, neuer Punkte und angepasster Gesamtdauer ist ausdrücklich gesteuert. Gelöschte Originalpläne beeinträchtigen den Session-Snapshot nicht.
- Reset einer laufenden Sitzung wurde aus der Oberfläche entfernt und kann die Historie nicht mehr löschen. Neustart: beenden, danach denselben Plan neu starten.

## Verifikation
- `npm run typecheck`: erfolgreich.
- `npm test`: 31/31 Unit-Tests erfolgreich.
- `npm run build`: erfolgreich (Vite PWA); Drittanbieter-Kommentare von Zod werden durch Rollup-Warnung entfernt.
- `npm run test:e2e`: lokal nicht ausführbar, weil die Browser-CDN-Downloads mit HTTP 403 blockiert wurden.
- PR-CI [Run 45475637496](https://github.com/BSchoepkeDev/unterrichtscockpit/actions/runs/45475637496) auf Commit `f1d8badce9ea9fda97e8651d7fa478724255e6b2`: Audit ohne Schwachstellen, TypeScript, Produktions-Build, 31/31 Unit-Tests und 26/26 Playwright-Tests in Chromium/WebKit erfolgreich. Die PR-Deployment-Stufe wurde erwartungsgemäß übersprungen. Frühere CI-Läufe deckten einen fehlenden `startedAt`-Index auf; die Historie liest/sortiert nun ohne Schemaänderung.
- PR #4 ist bereit zum Merge. Main-Deploy und anschließende Geräteabnahme sind noch offen.

## Offen / Risiken
- Merge von PR #4 durchführen, Main-CI und Pages-Deployment verifizieren.
- Manuelle iPad-Abnahme getrennt anfragen und protokollieren.
- Altbestand mit mehreren gleichzeitig aktiven Sitzungen bleibt unverändert; neue Starts werden blockiert und zeigen Titel der konfliktierenden Sitzung. Die Lehrkraft kann sie im Cockpit auswählen und beenden.
- Pause erlaubt, eine andere Durchführung zu starten; Fortsetzen der alten Sitzung ist gesperrt, solange eine andere Sitzung läuft.
- Browserdaten sind noch nicht extern gesichert. Vollständiges Backup folgt in Stufe 9.

## Nächster Schritt
PR #4 nach grüner CI mergen, Main-CI und Pages-Deployment verifizieren; anschließend den iPad-Praxistest durchführen.

## Fahrplan
1–4 veröffentlicht. 5 implementiert; PR-CI bestanden, Merge/Deploy ausstehend. Danach: 6 Import, 7 Notizen/Spracheingabe, 8 PDF-Export, 9 Datensicherung, 10 Offline-Validierung/Bereitstellung, 11 längere Audioaufnahmen, 12 abschließende Qualitätssicherung.
