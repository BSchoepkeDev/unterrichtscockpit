# Entscheidungen – 24.11.2026
1. Keine IndexedDB-Migration: Das bestehende `LessonPlan`-Modell deckt Stufe 2 ab.
2. CRUD verändert die Tabelle `plans`, bei Planlöschung außerdem zugehörige Plan-Notizen; niemals `sessions`.
3. Duplikate erhalten neue UUIDs für Plan und Punkte; keine unkontrollierte Übernahme binärer Anhänge.
4. Der Editor führt Änderungen als lokalen Entwurf. Schreibkonflikte durch abweichende `updatedAt`-Zeitstempel werden abgelehnt.
5. Punkte werden über Touch-Schaltflächen verschoben; ausschließliches Drag-and-drop wäre auf Safari weniger zuverlässig.
6. Pflichtfeld ist nur der jeweilige Titel. Gesamtdauer, Phase und Metadaten bleiben optional.
