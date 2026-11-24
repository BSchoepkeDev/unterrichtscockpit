# Entscheidungen – 24.11.2026
1. Keine IndexedDB-Migration: Das bestehende `LessonPlan`-Modell deckt Stufe 2 ab.
2. CRUD verändert die Tabelle `plans`, bei Planlöschung außerdem zugehörige Plan-Notizen; niemals `sessions`.
3. Duplikate erhalten neue UUIDs für Plan und Punkte; keine unkontrollierte Übernahme binärer Anhänge.
4. Der Editor führt Änderungen als lokalen Entwurf. Schreibkonflikte durch abweichende `updatedAt`-Zeitstempel werden abgelehnt.
5. Punkte werden über Touch-Schaltflächen verschoben; ausschließliches Drag-and-drop wäre auf Safari weniger zuverlässig.
6. Pflichtfeld ist nur der jeweilige Titel. Gesamtdauer, Phase und Metadaten bleiben optional.

## Stufe 3
7. Für Live-Cockpit-Checkboxen kein Mutieren von `LessonPlan`: Alle Statusupdates gelten ausschließlich für unabhängige `LessonSession.executions` in IndexedDB.
8. Wiederöffnung eines noch nicht beendeten Unterrichts verwendet dieselbe Sitzung; der Abschluss- und Historienworkflow folgt Stufe 5.
9. Persistenter Zustand wird mit sofortiger optimistischer UI-Rückmeldung angezeigt; bei IndexedDB-Fehler erfolgt ein Rücksetzen mit sichtbarem Hinweis.
10. Große Details werden als natives modales Dialogelement dargestellt; Checkbox und Detailöffnung sind separate Interaktionsflächen.
11. Drei Dichteprofile nutzen viewport-/ResizeObserver-Messung und Anzahl sowie Textlängen der Karten, ohne Pflichtangaben abzuschneiden. Timer folgen Stufe 4.

## Stufe 4
12. Timerwerte sind zeitstempelbasiert und über Browser-Suspendierung hinweg rekonstruierbar; Interval-Callbacks verändern keine Zeitkonten.
13. Unterricht muss ausdrücklich gestartet und beendet werden; beim Start wird der erste noch offene Punkt automatisch aktiv.
14. Eine zentrale Pause stoppt die Aktivitätsintervalle von Gesamtunterricht und aktiver Phase; das geplante Ende verschiebt sich um Pausenzeit.
15. Standardampel Gelb ab +00:01, Rot ab +03:00; Schwellen und automatischer Phasenwechsel sind als lokale Einstellungen änderbar.
16. Abschluss der aktiven Phase erzeugt einen transaktionalen Wechsel, das Abhaken einer nicht aktiven Phase unterbricht die laufende Zeitmessung nicht; reine Überziehung löst keine Umschaltung aus.
17. Screen Wake Lock ist optional, zeigt seinen tatsächlichen Zustand und benutzt keine Browser-Umgehung für nicht unterstützte Geräte.
18. In Stufe 4 war Reset ausdrücklich bestätigt. In Stufe 5 wurde er entfernt, weil ein Reset die historische Durchführung verfälschen könnte.
19. Die bestehende IndexedDB-Schema-Version v1 bleibt erhalten; optionale Session-Zeitstempel sind abwärtskompatibel.

## Stufe 5
20. Ein abgeschlossener Session-Snapshot wird unveränderlich als Historie erhalten; derselbe Planstart nach Ende erzeugt neue UUIDs und einen neuen Snapshot.
21. Höchstens eine laufende (nicht pausierte) Session ist global zulässig. Prüfung und Persistierung liegen in einer Dexie-Transaktion, damit konkurrierende Tabs nicht gleichzeitig starten.
22. Pausierte Sitzungen dürfen für einen anderen Unterricht unterbrochen bleiben. Fortsetzen wird abgewiesen, solange eine andere Sitzung läuft.
23. Planänderungen während der Durchführung wirken nur auf `adjusted`; `original` und `snapshot` bleiben Vergleichsgrundlage. Ist-Intervalle werden nicht zurückgesetzt.
24. Überspringen ist ein eigener Status und zählt nicht als erledigt. Reaktivierung und erneute Aktivierung öffnen ein zusätzliches Intervall.
25. Ein Reset des aktuellen Timers ist nicht zulässig. Beenden erhält die Historie; eine neue Durchführung wird ausdrücklich über erneutes Starten erzeugt.
26. Historische Sitzungen können nur nach Bestätigung gelöscht werden. Übernahme in die Bibliothek ist eine explizite Auswahl und verwendet den bestehenden Schreibkonfliktschutz.

## Stufe 6
27. Import bleibt lokal und ohne externe API. PDF.js, Tesseract.js und die deutsche Sprachdatei werden aus der eigenen Bereitstellung geladen.
28. Der Import nimmt PDF, TXT, Markdown, CSV und eingefügten Text an. Die native Planeditor-Eingabe bleibt der Weg für manuelle Pläne.
29. Dateien über 30 MB und PDFs über 120 Seiten werden abgewiesen, bevor ein Plan angelegt wird. Die Begrenzung schützt den Arbeitsspeicher mobiler Geräte; sie kann bei Bedarf anhand echter iPad-Erfahrung angepasst werden.
30. OCR wird seitenweise bei weniger als 80 nicht-leeren Textzeichen ausgelöst. Ergebnisse aus OCR und mehrspaltigen Seiten tragen einen Prüfhinweis und ersetzen nicht die Bestätigung der Lehrkraft.
31. Importplan und Original-Blob werden in einer IndexedDB-Transaktion geschrieben. Abbruch oder Extraktionsfehler schreiben keine Teildaten.
32. Anhänge bleiben nach Planlöschung erhalten, damit Session-Snapshots nicht auf nicht mehr vorhandene Dateien zeigen. Anhänge werden beim Duplizieren eines Plans nicht automatisch kopiert.

33. Der Audit-Fund `GHSA-hq66-cqwq-w95j` in PDF.js 5.x wird durch Upgrade auf 6.2.108 behoben; der abschließende lokale Audit meldet 0 Schwachstellen.
