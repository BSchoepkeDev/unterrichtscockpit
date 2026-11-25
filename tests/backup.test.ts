import 'fake-indexeddb/auto';
import { expect, test } from 'vitest';
import { Database, initialize } from '../src/database';
import { examples, exampleSessions } from '../src/fixtures';
import { createBackup, parseBackup, previewRestore, restoreBackup, type BackupFile } from '../src/features/backupService';

async function withDb(run: (db: Database) => Promise<void>) { const database = new Database(crypto.randomUUID()); try { await initialize(database); await run(database); } finally { database.close(); await database.delete(); } }
function fileOf(backup: BackupFile) { return new File([JSON.stringify(backup)], 'backup.ucbackup', { type: 'application/json' }); }

test('vollständiger Roundtrip erhält Pläne, Snapshot, Notizen, Einstellungen, Originaldatei und Audio', async () => withDb(async source => {
  const plan = examples()[0]; const attachment = { id: crypto.randomUUID(), name: 'Plan.pdf', mimeType: 'application/pdf', data: new TextEncoder().encode('PDF bytes').buffer as ArrayBuffer };
  plan.attachmentIds = [attachment.id]; await source.plans.add(plan); await source.attachments.add(attachment);
  const session = exampleSessions([plan])[0]; await source.sessions.add(session);
  await source.notes.add({ id: crypto.randomUUID(), ownerType: 'session', ownerId: session.id, itemId: session.executions[0].id, text: 'Nachbereitung', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), mode: 'manual' });
  await source.audio.add({ id: crypto.randomUUID(), sessionId: session.id, attachmentId: attachment.id, title: 'Aufnahme', createdAt: new Date().toISOString(), durationSeconds: 4, mimeType: 'audio/webm' });
  const built = await createBackup(source); const parsed = await parseBackup(fileOf(built.backup));
  await withDb(async target => { await restoreBackup(parsed, 'replace', 'keep-existing', target); expect(await target.plans.toArray()).toEqual([plan]); expect(await target.sessions.toArray()).toEqual([session]); expect((await target.attachments.get(attachment.id))?.data).toEqual(attachment.data); expect(await target.notes.count()).toBe(1); expect(await target.audio.count()).toBe(1); expect((await target.settings.get('settings'))?.redSeconds).toBe(180); const duplicatePreview = await previewRestore(parsed, 'merge', target); expect(duplicatePreview.conflicts).toBe(0); expect(duplicatePreview.additions).toBe(0); expect(duplicatePreview.duplicates).toBe(6); });
}));

test('Prüfsummenfehler und unbekannte Formatversionen werden vor der Wiederherstellung erkannt', async () => withDb(async database => {
  const { backup } = await createBackup(database); const corrupt = structuredClone(backup); corrupt.data.plans.push(examples()[0]);
  await expect(parseBackup(fileOf(corrupt))).rejects.toThrow('Prüfsumme');
  const incompatible = structuredClone(backup); incompatible.version = 999; await expect(parseBackup(fileOf(incompatible))).rejects.toThrow('nicht unterstützt');
}));

test('Zusammenführen erkennt identische Duplikate und Konflikte; die gewählte Version gilt', async () => withDb(async database => {
  const plan = examples()[0]; await database.plans.add(plan); const { backup } = await createBackup(database);
  const first = structuredClone(backup); first.data.plans[0].title = 'Geänderte Sicherung'; first.checksum = await digestBackup(first);
  expect((await previewRestore(first, 'merge', database)).conflicts).toBe(1);
  await restoreBackup(first, 'merge', 'keep-existing', database); expect((await database.plans.get(plan.id))?.title).toBe(plan.title);
  await restoreBackup(first, 'merge', 'use-backup', database); expect((await database.plans.get(plan.id))?.title).toBe('Geänderte Sicherung');
}));

test('aktive Durchführung sperrt Wiederherstellung ohne bestehende Daten zu verändern', async () => withDb(async database => {
  const plan = examples()[0]; await database.plans.add(plan); const session = exampleSessions([plan])[0]; session.status = 'active'; await database.sessions.add(session);
  const { backup } = await createBackup(database); const before = await database.plans.toArray(); await expect(restoreBackup(backup, 'replace', 'keep-existing', database)).rejects.toThrow('laufenden'); expect(await database.plans.toArray()).toEqual(before);
}));

test('geänderte Daten seit der Vorschau verhindern veraltetes Replace', async () => withDb(async database => {
  const { backup } = await createBackup(database); const preview = await previewRestore(backup, 'replace', database); const plan = examples()[0]; await database.plans.add(plan);
  await expect(restoreBackup(backup, 'replace', 'keep-existing', database, preview)).rejects.toThrow('seit der Vorschau geändert'); expect(await database.plans.get(plan.id)).toEqual(plan);
}));

async function digestBackup(backup: BackupFile) { const json = JSON.stringify(backup.data); const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(json)); return [...new Uint8Array(hash)].map(x => x.toString(16).padStart(2, '0')).join(''); }
