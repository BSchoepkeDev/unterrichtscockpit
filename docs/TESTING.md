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
