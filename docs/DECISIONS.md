# Entscheidungen

- GitHub Pages als statischer Host, keine Backend-Abhängigkeit.
- Ubuntu 24.04 für reproduzierbare Browser-CI.
- Abhängigkeiten nach Audit aktualisieren; keine unkontrollierten Major-Upgrades. Zod 4 ist eine gezielte Ausnahme mit erneuter Validierung.
- Keine produktiven Daten vor getesteter Sicherung/Wiederherstellung.
