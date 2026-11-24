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
18. Das Zurücksetzen ist ausdrücklich bestätigt, setzt Timer und Erledigungszustände zurück und ändert niemals den ursprünglichen Plan.
19. Die bestehende IndexedDB-Schema-Version v1 bleibt erhalten; optionale Session-Zeitstempel sind abwärtskompatibel.
