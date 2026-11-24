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
