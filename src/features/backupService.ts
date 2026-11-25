import type { Database } from '../database';
import { db } from '../database';
import { defaults, itemSchema, planSchema, type Attachment, type AudioRecording, type LessonNote, type LessonPlan, type LessonSession, type Settings } from '../models';

export const BACKUP_FORMAT = 'unterrichtscockpit-backup';
export const BACKUP_VERSION = 1;
export const MAX_BACKUP_BYTES = 100 * 1024 * 1024;
type BackupData = { plans: LessonPlan[]; sessions: LessonSession[]; notes: LessonNote[]; attachments: Array<Omit<Attachment, 'data'> & { data: string }>; audio: AudioRecording[]; settings: Settings[] };
export type BackupFile = { format: typeof BACKUP_FORMAT; version: number; createdAt: string; appVersion: string; counts: Record<keyof BackupData, number>; checksum: string; data: BackupData };
export type RestoreMode = 'merge' | 'replace';
export type ConflictPolicy = 'keep-existing' | 'use-backup';
export type RestorePreview = { mode: RestoreMode; additions: number; duplicates: number; conflicts: number; removals: number; activeSessions: number };
const stores = ['plans', 'sessions', 'notes', 'attachments', 'audio', 'settings'] as const;
const recordId = (value: unknown): string => { const id = value && typeof value === 'object' ? (value as { id?: unknown }).id : undefined; if (typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) throw new Error('Ein Datensatz hat keine gültige UUID.'); return id; };
const canonical = (value: unknown) => JSON.stringify(value);
function sameRecord(key: keyof BackupData, left: unknown, right: unknown) {
  if (key === 'attachments') {
    const normalize = (value: unknown) => { const row = value as Record<string, unknown>; const data = row.data; return { ...row, data: typeof data === 'string' ? data : toBase64(data as ArrayBuffer) }; };
    return canonical(normalize(left)) === canonical(normalize(right));
  }
  if (key !== 'settings') return canonical(left) === canonical(right);
  const withoutBackupDate = (value: unknown) => { const copy = { ...(value as Record<string, unknown>) }; delete copy.lastBackup; return copy; };
  return canonical(withoutBackupDate(left)) === canonical(withoutBackupDate(right));
}
function toBase64(buffer: ArrayBuffer): string { const bytes = new Uint8Array(buffer); let binary = ''; for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000)); return btoa(binary); }
function fromBase64(value: string): ArrayBuffer { if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)) throw new Error('Eine Datei im Backup ist ungültig codiert.'); const binary = atob(value); const bytes = new Uint8Array(binary.length); for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i); return bytes.buffer; }
async function digest(value: string) { const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)); return [...new Uint8Array(hash)].map(x => x.toString(16).padStart(2, '0')).join(''); }
function validate(data: BackupData) {
  if (!data || typeof data !== 'object' || stores.some(k => !Array.isArray(data[k]))) throw new Error('Das Backup enthält nicht alle erwarteten Datentabellen.');
  for (const key of stores) { const ids = new Set<string>(); for (const row of data[key]) { const id = key === 'settings' && (row as Settings).id === 'settings' ? 'settings' : recordId(row); if (ids.has(id)) throw new Error(`Doppelte ID in ${key}: ${id}`); ids.add(id); } }
  data.plans = data.plans.map(p => planSchema.parse(p));
  const attachments = new Map(data.attachments.map(a => [recordId(a), a])); const sessions = new Map(data.sessions.map(s => [recordId(s), s]));
  for (const plan of data.plans) for (const id of plan.attachmentIds) if (!attachments.has(id)) throw new Error(`Unterrichtsplan „${plan.title}“ verweist auf eine fehlende Originaldatei.`);
  for (const note of data.notes) { if (!['plan', 'session'].includes(note.ownerType) || typeof note.text !== 'string' || !['manual', 'dictated'].includes(note.mode) || !Number.isFinite(Date.parse(note.createdAt)) || !Number.isFinite(Date.parse(note.updatedAt))) throw new Error('Eine Notiz ist ungültig.'); if (note.itemId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(note.itemId)) throw new Error('Eine Notiz enthält eine ungültige Unterrichtspunkt-ID.'); if (note.ownerType === 'plan') { const plan = data.plans.find(p => p.id === note.ownerId); if (!plan) throw new Error('Eine Plannotiz verweist auf einen fehlenden Plan.'); if (note.itemId && !plan.items.some(item => item.id === note.itemId)) throw new Error('Eine Plannotiz verweist auf einen fehlenden Unterrichtspunkt.'); } if (note.ownerType === 'session') { const session = sessions.get(note.ownerId); if (!session) throw new Error('Eine Sitzungsnotiz verweist auf eine fehlende Durchführung.'); if (note.itemId && !session.executions.some(item => item.id === note.itemId)) throw new Error('Eine Sitzungsnotiz verweist auf einen fehlenden Durchführungspunkt.'); } }
  for (const row of data.attachments) { if (typeof row.name !== 'string' || typeof row.mimeType !== 'string' || typeof row.data !== 'string') throw new Error('Eine Originaldatei ist ungültig.'); fromBase64(row.data); }
  for (const item of data.audio) if (!sessions.has(item.sessionId) || !attachments.has(item.attachmentId) || typeof item.title !== 'string' || typeof item.mimeType !== 'string' || !Number.isFinite(item.durationSeconds) || item.durationSeconds < 0 || !Number.isFinite(Date.parse(item.createdAt)) || (item.transcript !== undefined && typeof item.transcript !== 'string')) throw new Error('Eine Audioaufnahme verweist auf eine fehlende Sitzung oder Datei oder enthält ungültige Metadaten.');
  for (const session of data.sessions) { if (!session || !Array.isArray(session.executions) || !Array.isArray(session.pauses) || !['active', 'paused', 'ended'].includes(session.status) || !Number.isFinite(session.startedAt) || !Number.isFinite(Date.parse(session.date))) throw new Error('Eine Unterrichtsdurchführung ist ungültig.'); session.snapshot = planSchema.parse(session.snapshot); if (session.planId && session.planId !== session.snapshot.id) throw new Error('Eine Durchführung verweist auf einen widersprüchlichen Plansnapshot.'); const snapshotItems = new Set(session.snapshot.items.map(item => item.id)); const executionIds = new Set<string>(); for (const execution of session.executions) { if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(execution.id) || execution.sessionId !== session.id || executionIds.has(execution.id) || (execution.originalItemId && !snapshotItems.has(execution.originalItemId)) || !['pending', 'active', 'paused', 'done', 'skipped'].includes(execution.status) || !Array.isArray(execution.intervals) || !Array.isArray(execution.changes)) throw new Error('Ein Durchführungspunkt ist ungültig.'); execution.adjusted = itemSchema.parse(execution.adjusted); if (execution.adjusted.planId !== session.snapshot.id) throw new Error('Ein Durchführungspunkt verweist auf einen anderen Unterrichtsplan.'); if (execution.original) execution.original = itemSchema.parse(execution.original); executionIds.add(execution.id); } }
  for (const setting of data.settings) if (setting.id !== 'settings' || !['system', 'light', 'dark'].includes(setting.theme) || !Array.isArray(setting.phases) || setting.phases.some(phase => typeof phase !== 'string') || typeof setting.wakeLock !== 'boolean' || typeof setting.sound !== 'boolean' || typeof setting.autoAdvance !== 'boolean' || !Number.isInteger(setting.yellowSeconds) || !Number.isInteger(setting.redSeconds) || setting.yellowSeconds < 0 || setting.yellowSeconds >= setting.redSeconds || setting.redSeconds > 3600 || (setting.lastBackup !== undefined && !Number.isFinite(Date.parse(setting.lastBackup)))) throw new Error('Die Einstellungen im Backup sind ungültig.');
}
export async function createBackup(database: Database = db) {
  const [plans, sessions, notes, attachments, audio, settings] = await database.transaction('r', [database.plans, database.sessions, database.notes, database.attachments, database.audio, database.settings], () => Promise.all([database.plans.toArray(), database.sessions.toArray(), database.notes.toArray(), database.attachments.toArray(), database.audio.toArray(), database.settings.toArray()]));
  const createdAt = new Date().toISOString(); const settingsSnapshot = settings.length ? settings.map(row => ({ ...row, lastBackup: createdAt })) : [{ ...defaults, lastBackup: createdAt }];
  const data: BackupData = { plans, sessions, notes, attachments: attachments.map(a => ({ ...a, data: toBase64(a.data) })), audio, settings: settingsSnapshot };
  const payload = canonical(data); const backup: BackupFile = { format: BACKUP_FORMAT, version: BACKUP_VERSION, createdAt, appVersion: __APP_VERSION__, counts: Object.fromEntries(stores.map(k => [k, data[k].length])) as BackupFile['counts'], checksum: await digest(payload), data };
  const blob = new Blob([JSON.stringify(backup)], { type: 'application/json' }); if (blob.size > MAX_BACKUP_BYTES) throw new Error('Die Sicherung überschreitet die zulässige Größe von 100 MB.');
  return { backup, blob };
}
export async function parseBackup(file: File): Promise<BackupFile> {
  if (file.size > MAX_BACKUP_BYTES) throw new Error('Die Datei überschreitet die zulässige Größe von 100 MB.');
  let backup: BackupFile; try { backup = JSON.parse(await file.text()) as BackupFile; } catch { throw new Error('Die Sicherungsdatei ist keine gültige JSON-Datei.'); }
  if (backup.format !== BACKUP_FORMAT) throw new Error('Diese Datei ist keine Unterrichtscockpit-Sicherung.');
  if (backup.version !== BACKUP_VERSION) throw new Error(`Das Sicherungsformat Version ${backup.version} wird nicht unterstützt.`);
  if (!backup.data || !Number.isFinite(Date.parse(backup.createdAt)) || typeof backup.appVersion !== 'string' || typeof backup.checksum !== 'string' || !/^[a-f0-9]{64}$/.test(backup.checksum)) throw new Error('Manifest oder Prüfsumme fehlen.');
  if (await digest(canonical(backup.data)) !== backup.checksum) throw new Error('Die Prüfsumme stimmt nicht. Die Sicherungsdatei wurde verändert oder beschädigt.');
  validate(backup.data);
  for (const key of stores) if (backup.counts?.[key] !== backup.data[key].length) throw new Error('Die Angaben im Sicherungsmanifest stimmen nicht mit den enthaltenen Daten überein.');
  return backup;
}
export async function previewRestore(backup: BackupFile, mode: RestoreMode, database: Database = db): Promise<RestorePreview> {
  const counts = { additions: 0, duplicates: 0, conflicts: 0, removals: 0 };
  for (const key of stores) { const existing = await database.table(key).toArray() as Array<{ id: string }>; const incoming = backup.data[key] as Array<{ id: string }>; const byId = new Map(existing.map(row => [row.id, row]));
    for (const row of incoming) { const old = byId.get(row.id); if (!old) counts.additions++; else if (sameRecord(key, old, row)) counts.duplicates++; else counts.conflicts++; }
    if (mode === 'replace') counts.removals += existing.filter(row => !incoming.some(next => next.id === row.id)).length;
  }
  return { mode, ...counts, activeSessions: await database.sessions.where('status').anyOf('active', 'paused').count() };
}
export async function restoreBackup(backup: BackupFile, mode: RestoreMode, policy: ConflictPolicy, database: Database = db, expectedPreview?: RestorePreview) {
  validate(backup.data); const preview = await previewRestore(backup, mode, database);
  if (preview.activeSessions) throw new Error('Wiederherstellung ist während einer laufenden oder pausierten Durchführung gesperrt.');
  if (mode === 'merge' && preview.conflicts && !policy) throw new Error('Für ID-Konflikte muss eine Behandlung gewählt werden.');
  await database.transaction('rw', [database.plans, database.sessions, database.notes, database.attachments, database.audio, database.settings, database.locks], async () => {
    if (await database.sessions.where('status').anyOf('active', 'paused').count()) throw new Error('Wiederherstellung ist während einer laufenden oder pausierten Durchführung gesperrt.');
    const currentPreview: RestorePreview = { mode, additions: 0, duplicates: 0, conflicts: 0, removals: 0, activeSessions: 0 };
    for (const key of stores) {
      const existing = await database.table(key).toArray() as Array<{ id: string }>;
      const incoming = backup.data[key] as Array<{ id: string }>;
      const byId = new Map(existing.map(row => [row.id, row])); const incomingIds = new Set(incoming.map(row => row.id));
      for (const row of incoming) { const old = byId.get(row.id); if (!old) currentPreview.additions++; else if (sameRecord(key, old, row)) currentPreview.duplicates++; else currentPreview.conflicts++; }
      if (mode === 'replace') currentPreview.removals += existing.filter(row => !incomingIds.has(row.id)).length;
    }
    if (expectedPreview && ['additions', 'duplicates', 'conflicts', 'removals'].some(key => currentPreview[key as keyof RestorePreview] !== expectedPreview[key as keyof RestorePreview])) throw new Error('Der Datenbestand hat sich seit der Vorschau geändert. Lade die Sicherungsdatei erneut, um eine aktuelle Vorschau zu erhalten.');
    for (const key of stores) {
      const table = database.table(key); const incoming = backup.data[key] as Array<Record<string, unknown>>;
      if (mode === 'replace') await table.clear();
      const current = mode === 'merge' ? new Map((await table.toArray() as Array<{ id: string }>).map(row => [row.id, row])) : new Map();
      const rows = incoming.filter(row => { const existing = current.get(String(row.id)); return !existing || (!sameRecord(key, existing, row) && policy === 'use-backup'); }).map(row => key === 'attachments' ? { ...row, data: fromBase64(row.data as string) } : row);
      if (rows.length) await table.bulkPut(rows);
    }
    await database.locks.clear();
  });
}
