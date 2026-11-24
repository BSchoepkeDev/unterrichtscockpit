# Projektstatus – Stufe 4 / Version 0.4.0 (Prüfung)
Stand: 24.11.2026. Repository: https://github.com/BSchoepkeDev/unterrichtscockpit/
Produktiv vor Freigabe von Stufe 4: Version 0.3.0, https://bschoepkedev.github.io/unterrichtscockpit/

## Abgeschlossene Stufen
- Stufe 1 – PWA-Grundlage, GitHub Pages, React/TypeScript/Dexie, Beispielpläne und Tests.
- Stufe 2 – Unterrichtsbibliothek und Editor, CRUD, Suche/Sortierung, sichere Planungs-Snapshots und Tests. Veröffentlichung nach PR #1.
- Stufe 3 – Adaptives Cockpit, Detailfenster, persistente Checkboxen und Fortschritt. PR #2 gemergt in `d1fc721238f8168135b94bc0357cad56179e2991`; GitHub-Pages-Deployment [45461157246](https://github.com/BSchoepkeDev/unterrichtscockpit/actions/runs/45461157246) erfolgreich. Nutzer bestätigte die Grundfunktionen auf dem iPad.

## Stufe 4 – Branch `feature/stufe-4-timer`, Pull Request #3
- Gesamtunterrichtstimer mit ausdrücklich gesteuertem Start, Pause/Fortsetzen, bestätigtem Ende und Reset.
- Unabhängige Phasenintervalle, Countdown/Überziehung, Stoppuhr ohne geplante Dauer, Ampelschwellen, manueller/automatischer Wechsel.
- Zeitprognose, kumulative Abweichung, Pausenverrechnung, Screen Wake Lock und Wiederherstellung über gespeicherte Zeitstempel.
- Warnschwellen, automatischer Wechsel und Wake Lock in den Einstellungen.
- Keine IndexedDB-Migration, keine Änderungen an ursprünglichen Unterrichtsplänen.

Erste vollständig verifizierte CI: [45464037384](https://github.com/BSchoepkeDev/unterrichtscockpit/actions/runs/45464037384) – npm ci, zwei Sicherheitsprüfungen (je 0 Schwachstellen), TypeScript, Build, 22/22 Unit-Tests, 14/14 Playwright-Tests erfolgreich. Zusätzlich erweiterte Tests und UI-Optionen sind auf dem Branch; abschließende CI, Merge und Deployment müssen gesondert protokolliert werden.

## Bekannte Grenzen und offene Abnahme
- Reale Timer-Abnahme auf 10–11-Zoll-iPad/iPadOS 26 in Safari und installierter PWA ausstehend, besonders Gerätesperre, App-Wechsel, Hintergrund-Suspendierung, Screen Wake Lock und Zeitampel.
- Systemuhrmanipulationen über Neustarts können ohne vertrauenswürdige Zeitquelle nicht vollständig kompensiert werden. Browserdatenverlust kann lokale Timer und Planung löschen; bis zur vollständigen Sicherung (Stufe 9) keine unersetzlichen Daten verwenden.
- Bei unsicheren/gefehlten Phasendauern sind Zeitprognosen markiert, aber nicht vollständig.
- Abschluss speichert Sitzungen dauerhaft; die eigenständige Historien-/Nachbereitungsoberfläche folgt in Stufe 5.
- Vollständige Offline-Funktion und Update-Strategie folgen in Stufe 10. Nicht blockierende npm/Actions-Node-Abkündigungswarnungen möglich.

## Entwicklungsfahrplan
Als Nächstes: abschließenden PR-CI-Lauf prüfen, Fehler korrigieren, PR #3 mergen und Hauptbranch-Deployment verifizieren. Danach reale iPad-Abnahme der Timerfunktionen. Stufe 5: Sitzungen, Historie und spontane Änderungen; danach Stufen 6–12 laut Master-Prompt.
