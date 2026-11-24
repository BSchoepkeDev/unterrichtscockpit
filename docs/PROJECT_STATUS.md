# Projektstatus – Stufe 4 abgeschlossen / Version 0.4.0 veröffentlicht
Stand: 24.11.2026. Repository: https://github.com/BSchoepkeDev/unterrichtscockpit/
Produktiv: Version 0.4.0, https://bschoepkedev.github.io/unterrichtscockpit/ – Deployment [45466009831](https://github.com/BSchoepkeDev/unterrichtscockpit/actions/runs/45466009831) erfolgreich.

## Abgeschlossene Stufen
- Stufe 1 – PWA-Grundlage, GitHub Pages, React/TypeScript/Dexie, Beispielpläne und Tests.
- Stufe 2 – Unterrichtsbibliothek und Editor, CRUD, Suche/Sortierung, sichere Planungs-Snapshots und Tests. Veröffentlichung nach PR #1.
- Stufe 3 – Adaptives Cockpit, Detailfenster, persistente Checkboxen und Fortschritt. PR #2 gemergt in `d1fc721238f8168135b94bc0357cad56179e2991`; GitHub-Pages-Deployment [45461157246](https://github.com/BSchoepkeDev/unterrichtscockpit/actions/runs/45461157246) erfolgreich. Nutzer bestätigte die Grundfunktionen auf dem iPad.

## Stufe 4 – Pull Request #3, in `main` übernommen (`50b18e2ec75812649dda0533f0c7f1327930828f`)
- Gesamtunterrichtstimer mit ausdrücklich gesteuertem Start, Pause/Fortsetzen, bestätigtem Ende und Reset.
- Unabhängige Phasenintervalle, Countdown/Überziehung, Stoppuhr ohne geplante Dauer, Ampelschwellen, manueller/automatischer Wechsel.
- Zeitprognose, kumulative Abweichung, Pausenverrechnung, Screen Wake Lock und Wiederherstellung über gespeicherte Zeitstempel.
- Warnschwellen, automatischer Wechsel und Wake Lock in den Einstellungen.
- Keine IndexedDB-Migration, keine Änderungen an ursprünglichen Unterrichtsplänen.

CI vor Merge: [45465587436](https://github.com/BSchoepkeDev/unterrichtscockpit/actions/runs/45465587436) – alle Prüfungen erfolgreich. Produktiver Build und Pages-Deployment: [45466009831](https://github.com/BSchoepkeDev/unterrichtscockpit/actions/runs/45466009831) – npm ci, zwei Sicherheitsprüfungen (je 0 Schwachstellen), TypeScript, Produktions-Build, **26/26 Unit-Tests und 22/22 Chromium/WebKit-Browser-Tests** erfolgreich; Deployjob meldet `Reported success!`. Der frühere Run [45464037384](https://github.com/BSchoepkeDev/unterrichtscockpit/actions/runs/45464037384) war ebenfalls erfolgreich (22 Unit-/14 Browser-Tests).

## Bekannte Grenzen und offene Abnahme
- Reale Timer-Abnahme auf 10–11-Zoll-iPad/iPadOS 26 in Safari und installierter PWA ausstehend, besonders Gerätesperre, App-Wechsel, Hintergrund-Suspendierung, Screen Wake Lock und Zeitampel.
- Systemuhrmanipulationen über Neustarts können ohne vertrauenswürdige Zeitquelle nicht vollständig kompensiert werden. Browserdatenverlust kann lokale Timer und Planung löschen; bis zur vollständigen Sicherung (Stufe 9) keine unersetzlichen Daten verwenden.
- Bei unsicheren/gefehlten Phasendauern sind Zeitprognosen markiert, aber nicht vollständig.
- Abschluss speichert Sitzungen dauerhaft; die eigenständige Historien-/Nachbereitungsoberfläche folgt in Stufe 5.
- Vollständige Offline-Funktion und Update-Strategie folgen in Stufe 10. Nicht blockierende npm/Actions-Node-Abkündigungswarnungen möglich.

## Entwicklungsfahrplan
Als Nächstes: Stufe 4 mit echtem iPad (Safari, Standalone-PWA, Portrait/Querformat, Hintergrund/Sperre, Wake Lock, Pausen und Reload) praktisch abnehmen. Anschließend Stufe 5: unabhängige Sitzungen, Historie und spontane Änderungen; danach Stufen 6–12 gemäß Master-Prompt.
