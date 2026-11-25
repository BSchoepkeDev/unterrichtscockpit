# Datensicherung und Wiederherstellung

Stand: Formatversion 1 · eingeführt mit Unterrichtscockpit 0.9.0.

## Datei und Inhalt

Der Export erzeugt lokal eine JSON-Datei mit der Endung `.ucbackup` und dem Namen `Unterrichtscockpit-Sicherung-<UTC-Zeitstempel>.ucbackup`. Es wird kein Server verwendet. Die Datei enthält ein Manifest (Formatkennung, Formatversion, Exportzeitpunkt, App-Version, Datensatzanzahlen und SHA-256-Prüfsumme) sowie die Nutzdaten. Der SHA-256-Wert wird über die JSON-serialisierten Nutzdaten gebildet. Er erkennt versehentliche Beschädigung und nachträgliche Änderung; er ist keine digitale Signatur und schützt nicht vor gezielter Manipulation.

Vollständig enthalten sind die dauerhaften IndexedDB-Tabellen `plans`, `sessions`, `notes`, `attachments`, `audio` und `settings`. Dateien in `attachments` werden für JSON als Base64 kodiert und beim Restore wieder in `ArrayBuffer` gewandelt. Audioaufnahmen liegen als Anhänge vor; Audio-Metadaten verweisen auf Sitzung und Anhang. Die flüchtige Tabelle `locks` wird nicht exportiert und nach Restore geleert. Das Datenbankschema bleibt auf v1; ein Restore importiert keine Datenbankdatei.

Eine Sicherung ist auf 100 MB begrenzt. Der Import weist größere Dateien ab, prüft Dateikennung, Formatversion, Manifest, Prüfsumme, IDs, Plan-Schema, Dateien, Audio-/Notizreferenzen und Durchführungen, bevor er IndexedDB verändert. Dieses JSON-Format enthält keine Dateipfade oder entpackbaren Archive; ZIP-Pfad-Traversal ist damit nicht anwendbar. Die Größenbegrenzung reduziert unverhältnismäßigen Speicher- und Parsing-Aufwand.

## Zusammenführen und Ersetzen

Vor dem Schreiben erscheint eine Vorschau mit Anzahl neuer Einträge, identischer Duplikate, ID-Konflikte sowie beim Ersetzen der entfallenden Einträge. Der Nutzer bestätigt den Schreibvorgang ausdrücklich.

- **Zusammenführen:** Neue IDs werden ergänzt, inhaltlich identische IDs übersprungen. Bei einer gleichen ID mit abweichendem Datensatz entscheidet der Nutzer global, ob die vorhandene Version erhalten bleibt oder die Backup-Version übernommen wird.
- **Ersetzen:** Alle gesicherten Tabellen werden innerhalb einer Dexie-Transaktion geleert und aus der validierten Sicherung neu aufgebaut. Die Option erfordert eine ausdrückliche Ersetzungsbestätigung.
- **Aktive Durchführung:** Restore ist gesperrt, wenn eine Durchführung aktiv oder pausiert ist. Die Bedingung wird auch innerhalb der Schreibtransaktion geprüft.
- **Fehler oder Abbruch:** Datei- und Referenzvalidierung findet vor der Transaktion statt. Alle Tabellenänderungen einschließlich Anhängen und Einstellungen erfolgen atomar. Bei einem Fehler wird die Transaktion zurückgerollt; bestehende Datensätze bleiben erhalten.

Zusammenführen kann durch das globale Konfliktverhalten bewusst unterschiedliche Datenstände verwerfen. Prüfe die Vorschau und sichere den aktuellen Stand vor dem Ersetzen separat. Das Format unterstützt derzeit keine selektive Konfliktbehandlung je Eintrag.

## iPad und Aufbewahrung

Der Export verwendet den Browserdownload, damit Safari beziehungsweise die installierte PWA den Dateiablauf des Systems nutzen kann. Auf iPadOS ist die Datei anschließend in „Dateien“ zu kontrollieren. Der Browser kann den tatsächlichen Abschluss oder dauerhaften Speicherort des Downloads nicht bestätigen. Deshalb zeigt die App den Zeitpunkt des angeforderten Exports, nicht einen verifizierten Speicherstatus. Dateiname und UTC-Zeitstempel helfen, Sicherungen zu unterscheiden.

Ein Hinweis erscheint in der Datensicherungsansicht, wenn noch kein Export vermerkt oder der letzte Export älter als sieben Tage ist. Er wird nicht als Unterbrechung in eine laufende Durchführung eingeblendet. Der Speicherverbrauch wird angezeigt, wenn die Storage API des Browsers Werte bereitstellt; diese Schätzung ist keine Datensicherung und die Browserquote garantiert keine Aufbewahrung.

Sicherungen können Unterrichtsdaten und vertrauliche Inhalte enthalten. Bewahre sie an einem geschützten Ort und möglichst getrennt vom Gerät auf. Der Download ist nicht automatisch verschlüsselt.
