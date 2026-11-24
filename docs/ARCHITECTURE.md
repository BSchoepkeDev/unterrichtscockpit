# Architektur
React 19, TypeScript strict, Vite, Dexie/IndexedDB und Zod. `src/models.ts` beschreibt wiederverwendbare Pläne und eigenständige Durchführungen. `src/database.ts` behält das bestehende Schema v1 ohne Datenmigration. `src/features/lessonRepository.ts` kapselt Bibliothekslogik, Validierung und transaktionale Änderungen; `src/features/PlanEditor.tsx` hält einen isolierten Entwurf, bis ausdrücklich gespeichert wird. `src/main.tsx` bietet Navigation und die `useLiveQuery`-gestützte Kartenbibliothek.

Die Löschung eines Plans verändert niemals historische Session-Snapshots. Neue Pläne und sämtliche duplizierten Unterrichtspunkte erhalten eigenständige UUIDs. Persistenz erfolgt lokal in IndexedDB, nicht in `localStorage`. Eine lokale Datenbank ist keine Datensicherung.
