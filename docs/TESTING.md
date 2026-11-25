# Teststrategie und tatsächliche Ergebnisse

## Automatisierte Prüfung
`npm ci`, `npm audit --audit-level=moderate`, `npm run typecheck`, `npm run test`, `npm run build`, `npx playwright install --with-deps chromium webkit`, `npm run test:e2e`.

## Verifizierter Stufe-2-Lauf
[GitHub Actions Run 45454402849](https://github.com/BSchoepkeDev/unterrichtscockpit/actions/runs/45454402849) auf Commit `0ae987bee26eded1a550ab5449a5c7eea5b0131a`: npm ci, Audit (0 Schwachstellen), TypeScript, Vite-Build und Pages-Artefakt erfolgreich. Vitest: 11 von 11 Tests bestanden (4 bestehende, 7 neue). Playwright: 12 von 12 Tests bestanden (6 Szenarien in Chromium und WebKit).

Unit-Tests prüfen Validierung, Speichern und Wiederöffnen, unabhängige Duplikate, historische Snapshots nach Löschung, Schreibkonflikte, Suche/Filter/Sortierung und Unterrichtspunkt-Reihenfolge.

Browser-Tests prüfen Beispielpläne nach Reload, Navigation/Theme, Plan-CRUD mit Suche und Reload, Löschbestätigung, Abbruchbestätigung, Touch-Reihenfolge und unabhängige Punkt-Duplikation.

Ein vorheriger Browser-Test meldete in Run 45453768870 einen mehrdeutigen Selektor für „Duplizieren“; die Selektoren wurden auf die Bibliothek begrenzt und die Editor-Schließung abgewartet. Der Folgelauf bestätigte den Fix.

## Stufe 3 – Verifizierte Prüfungen
- [Run 45459533810](https://github.com/BSchoepkeDev/unterrichtscockpit/actions/runs/45459533810): 12/14 E2E erfolgreich, zwei Fehler für asynchron zurückspringenden Checkboxstatus; TypeScript, Unit-Tests und Build bestanden.
- [Run 45460218272](https://github.com/BSchoepkeDev/unterrichtscockpit/actions/runs/45460218272), Commit `626dbedef6d6c9293ab6fee531675f8d1bc732ce`: npm ci, zwei Audits (je 0 Schwachstellen), Typprüfung und Produktions-Build erfolgreich; 16/16 Unit-Tests, 14/14 Playwright-Tests in Chromium und WebKit erfolgreich. Neu: Sitzungssnapshot, DB-Persistenz, Planunabhängigkeit, Fehlhandlung, Dichteauswahl und Checkbox-Detailfenster-Neuladen.
- Die nachfolgenden Versionierungs-/Dokumentationscommits und der Deployment-Lauf werden gesondert geprüft. Keine Behauptung einer iPad-Geräteabnahme.

## Stufe 4 – Automatisierte Prüfungen
- [Run 45464037384](https://github.com/BSchoepkeDev/unterrichtscockpit/actions/runs/45464037384) auf Commit `43b9829af333adda21e9d013bb736d7ec2d27e0c`: npm ci, Audit (0 gemeldete Schwachstellen), TypeScript, Vite-Build erfolgreich; 22/22 Unit-Tests und 14/14 Chromium/WebKit-Browser-Tests erfolgreich. PR-Deployment erwartungsgemäß übersprungen.
- Die Erweiterungen (konfigurierbare Warnschwellen, Pausen-Endzeitprognose, Wake-Lock-Neuversuch, vier weitere Unit-Tests und vier E2E-Szenarien pro Browser) sind durch [PR-Run 45465587436](https://github.com/BSchoepkeDev/unterrichtscockpit/actions/runs/45465587436) bestätigt: 26/26 Unit-Tests und 22/22 Browser-Tests bestanden.
- Nach Squash-Merge auf `main` bestätigt [Run 45466009831](https://github.com/BSchoepkeDev/unterrichtscockpit/actions/runs/45466009831): npm ci, 0 Audit-Befunde, TypeScript, Build, 26/26 Unit-Tests, 22/22 Chromium/WebKit-Tests und Pages-Deployment erfolgreich. Deployment-Log: `Reported success!`, URL https://bschoepkedev.github.io/unterrichtscockpit/.
- Echte iPad-Safari-Tests für Timer, Sperrbildschirm, Standalone-PWA, App-Wechsel und lange Pausen stehen aus.

## Offene Geräteabnahme
Auf einem echten 10–11-Zoll-iPad mit iPadOS 26: Safari/Standalone, Querformat/Hochformat, Bildschirmtastatur, Touch, VoiceOver, Dark/Light Mode, Neuladen und PWA-Neustart. Browser-Persistenz ist keine garantierte Datensicherung. Vollständige Offline- und Backup-Abnahme erst in den entsprechenden späteren Entwicklungsstufen.

## Stufe 5 – lokale und PR-Prüfung
- TypeScript: erfolgreich (`npm run typecheck`).
- Vitest: 31/31 Tests in 4 Dateien bestanden (`npm test`), einschließlich zweitem unabhängigen Durchlauf, globalem Startkonflikt, Überspringen/Reaktivieren mit additiven Intervallen und Sollzeitänderung ohne Ist-Verlust.
- Produktions-Build: erfolgreich (`npm run build`). Vite meldet nur Drittanbieter-Kommentare in Zod, die Rollup entfernt.
- Playwright lokal: nicht ausführbar, da Browser nicht vorinstalliert waren und der CDN-Download mit HTTP 403 scheiterte.
- [PR-Run 45475637496](https://github.com/BSchoepkeDev/unterrichtscockpit/actions/runs/45475637496), Commit `f1d8badce9ea9fda97e8651d7fa478724255e6b2`: npm ci, Audit ohne gemeldete Schwachstellen, TypeScript, Produktions-Build, 31/31 Unit-Tests und 26/26 E2E-Tests in Chromium/WebKit bestanden. PR-Deployment übersprungen.
- Vorherige fehlgeschlagene Läufe: [45474210887](https://github.com/BSchoepkeDev/unterrichtscockpit/actions/runs/45474210887) fand Selektorprobleme und [45475070121](https://github.com/BSchoepkeDev/unterrichtscockpit/actions/runs/45475070121) den Zugriff auf einen nicht vorhandenen Index. Beide Fehler wurden korrigiert und der spätere erfolgreiche PR-Lauf bestätigt den Stand.


## Stufe 5 – Veröffentlichung
- PR-CI [Run 45475637496](https://github.com/BSchoepkeDev/unterrichtscockpit/actions/runs/45475637496): npm ci, Audit ohne gemeldete Schwachstellen, TypeScript, Produktions-Build, 31/31 Unit-Tests und 26/26 E2E-Tests in Chromium/WebKit bestanden.
- Main-CI und Pages [Run 45476621002](https://github.com/BSchoepkeDev/unterrichtscockpit/actions/runs/45476621002) auf `cc8668ae842d3745ea83790e565caac0a56c6760`: dieselben Prüfungen bestanden; Pages-Deploy meldet `Reported success!`.
- Frühere PR-Läufe deckten fehlende Browser-Selektoren und den nicht vorhandenen `startedAt`-Index auf. Korrektur: History scannt Sitzungen und sortiert im Speicher; kein DB-Schema-Update nötig.
- Der lokale Browserdownload wurde in dieser Umgebung mit HTTP 403 blockiert; die Browserläufe wurden daher in Actions ausgeführt.
- Stufe 5 wurde nicht auf einem echten iPad abgenommen.

## Stufe 6 – Import

- Unit-Tests prüfen deutsche Zeitformate und Mehrdeutigkeit, tabellarische Zeilen, Planmetadaten, unbekannte Inhalte, OCR-Hinweise, Seitenbezug, spaltenweise PDF-Textreihenfolge und atomare Plan-/Anhangspeicherung.
- Browserprüfungen erzeugen zur Laufzeit ein synthetisches dreiseitiges PDF mit PDF-Textebene, gerenderter Rasterseite und weiterer Textebene. Sie kontrollieren seitenweise Extraktion, OCR, Korrektur, Teilen, Zusammenführen, Umordnen, Persistenz des Originalanhangs, Reload, Abbruch, leere/beschädigte PDFs und den Offline-Cache von Sprachdaten/WASM.
- Lokal: TypeScript erfolgreich; Unit-Suite: 41/41 bestanden; TypeScript und Produktions-Build erfolgreich. Nach PDF.js-Upgrade auf 6.2.108 meldete `npm audit --audit-level=moderate` 0 Schwachstellen.
- Der lokale Chromium-Download wurde mit HTTP 403 abgewiesen. Das systemweite Chromium startete im verwalteten Laufzeitcontainer wegen `socket() failed: Operation not permitted` nicht. Der End-to-End-Lauf ist daher lokal nicht als bestanden gewertet; der verbindliche Chromium-/WebKit-Lauf erfolgt in GitHub Actions.
- [PR-Run 45503729937](https://github.com/BSchoepkeDev/unterrichtscockpit/actions/runs/45503729937), Commit `f7bfe09417cbdff95b6cadd1b8407f6a0800d470`: Audit ohne Befunde, TypeScript und Build erfolgreich; 41/41 Unit-Tests sowie 34/34 Chromium-/WebKit-E2E-Tests bestanden. Die E2E-Prüfung umfasst Textimport, PDF-Textebene plus OCR-Rasterseite, Offline-Ressourcen, Abbruch, Safari-kompatible Binäranhänge, Reload und Cockpit.
- [Main-/Pages-Run 45504167366](https://github.com/BSchoepkeDev/unterrichtscockpit/actions/runs/45504167366), Commit `717da34be78d81a6a059c932be8b8eed03ad703d`: vollständige CI erfolgreich; GitHub Pages meldet erfolgreiches Deployment nach `https://bschoepkedev.github.io/unterrichtscockpit/`.
- [Settings-Folgekorrektur PR-Run 45505311877](https://github.com/BSchoepkeDev/unterrichtscockpit/actions/runs/45505311877): TypeScript, Audit, Unit-Tests, Build sowie 34/34 Chromium-/WebKit-E2E-Tests erfolgreich. Schnelle Änderungen werden gegen den zuletzt gespeicherten IndexedDB-Stand transaktional zusammengeführt.
- [Main-/Pages-Run 45505615271](https://github.com/BSchoepkeDev/unterrichtscockpit/actions/runs/45505615271), Commit `1f7de48126058492b640df717510bcec9ba5fe04`: 41/41 Unit-Tests, 34/34 Browser-E2E-Tests, Audit ohne Befunde, TypeScript, Build und Pages-Deployment erfolgreich.
- Die synthetischen Browserfälle ersetzen keine echte iPad-Abnahme und decken keine realen Unterrichtsdokumente ab.

## Stufe 7 – Notizen und Spracheingabe

Hinzugefügt wurden Unit-Tests für Plan-/Punktzuordnung, Änderungszeitstempel, Persistenz nach erneutem Öffnen der Datenbank, Trennung unabhängiger Durchführungen, Timerunabhängigkeit, Ablehnung leerer/falsch zugeordneter Notizen, Schreibschutz abgeschlossener Sitzungen und eng begrenztes Löschen. Ein Playwright-Szenario erfasst getrennte Plan- und Sitzungsnotizen und prüft ihren Fortbestand nach Reload. Direkte Spracherkennung wird nur bei API-Verfügbarkeit angeboten; reale Berechtigungsdialoge und iPadOS-Tastaturdiktat müssen auf dem Gerät geprüft werden.

Der Ausgangsstand `95b4dc3` hatte am 25.11.2026 einen erfolgreichen Main-/Pages-Lauf (`45518326291`) sowie erfolgreiche PR-CI (`45517909734`). Ergebnisse der neuen Stufe-7-Prüfungen, des PR-Laufs und des Deployments folgen nach tatsächlicher Ausführung.
- Lokal am 25.11.2026: `npm ci`, TypeScript, 49/49 Unit-Tests, Produktionsbuild und `npm audit --audit-level=moderate` (0 Befunde) erfolgreich.
- Playwright lokal nicht ausführbar: Browser-Binärdateien fehlten; `npx playwright install chromium webkit` wurde von `cdn.playwright.dev` mit HTTP 403 abgewiesen. Der lokale E2E-Lauf ist nicht als bestanden zu werten. Chromium-/WebKit-Prüfung erfolgt in PR-CI.
