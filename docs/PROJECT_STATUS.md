# Projektstatus – Stufe 5 abgeschlossen / Version 0.5.0 veröffentlicht
Stand: 24.11.2026. Main: `cc8668ae842d3745ea83790e565caac0a56c6760`. Produktiv: https://bschoepkedev.github.io/unterrichtscockpit/.

## Stufe 5 abgeschlossen
- Jede gestartete Durchführung besitzt einen unabhängigen Session-Snapshot. Derselbe Plan ist wiederholt ausführbar; beendete Durchführungen bleiben in der Historie.
- Globale transaktionale Prüfung verhindert parallel laufende Durchführungen. Offene Timer werden nach Neuladen wiederhergestellt.
- Unterrichtspunkte überspringen, erneut aktivieren, umsortieren, ergänzen und in der Durchführung bearbeiten; Sollwerte und Ist-Intervalle werden getrennt protokolliert.
- Historie/Nachbereitung zeigt Dauerabweichungen, Pausen, Status und Zeiten je Punkt. Änderungen können einzeln in den ursprünglichen Plan übernommen werden; Planlöschung verändert Sessions nicht.
- Historische Einträge sind schreibgeschützt und nur nach Bestätigung löschbar. Eine neue Durchführung entsteht durch erneutes Starten, nicht durch Zurücksetzen einer alten.
- Schema bleibt IndexedDB v1; Migration nicht erforderlich.

## Verifizierte Ergebnisse
- PR #4: CI [Run 45475637496](https://github.com/BSchoepkeDev/unterrichtscockpit/actions/runs/45475637496) – 31/31 Unit-Tests und 26/26 Playwright-Tests in Chromium/WebKit bestanden, Audit ohne gemeldete Schwachstellen.
- Main und Pages: [Run 45476621002](https://github.com/BSchoepkeDev/unterrichtscockpit/actions/runs/45476621002) für Commit `cc8668ae842d3745ea83790e565caac0a56c6760` – Build, Audit und alle Tests erfolgreich; Deployjob meldet `Reported success!`.
- Lokaler Playwright-Browserdownload war in dieser Umgebung per HTTP 403 blockiert; die Browserläufe wurden in GitHub Actions ausgeführt.
- Kein neuer iPad-Praxistest für Stufe 5. Die bisherige iPad-Rückmeldung aus Stufe 3/4 belegt diese neuen Historien- und Änderungsfunktionen nicht.

## Offen / Grenzen
- Stufe 5 auf dem 10–11-Zoll-iPad mit iPadOS 26 praktisch prüfen: Durchführung starten, überspringen/reaktivieren, spontane Anpassung, beenden, Historie öffnen und erneute Plan-Ausführung.
- Altbestände mit mehreren aktiven Durchführungen werden nicht automatisch verändert. Neue Starts werden blockiert, der Konflikt wird angezeigt und kann manuell beendet werden.
- Pausierte Durchführung bleibt erhalten; eine andere darf laufen. Die pausierte kann erst fortgesetzt werden, wenn keine andere läuft.
- Vollständige Datensicherung folgt Stufe 9. IndexedDB ersetzt kein externes Backup.

## Nächste Stufen
Stufen 1–5 sind implementiert und Stufe 5 ist veröffentlicht. Als Nächstes Stufe 6: PDF-/Textimport, lokale OCR, Strukturierung und Importvorschau. Danach Stufen 7–12 gemäß Master-Prompt.
