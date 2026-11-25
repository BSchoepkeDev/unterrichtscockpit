import 'fake-indexeddb/auto';
import {test,expect} from 'vitest';
import {Database} from '../src/database';
import {examples} from '../src/fixtures';
import {makeSession} from '../src/features/cockpitRepository';
import {deleteNote,saveNote} from '../src/features/noteRepository';
import {updateLessonPlan} from '../src/features/lessonRepository';
import {dispatch} from '../src/features/TimerService';

async function withDb(run:(db:Database)=>Promise<void>){const db=new Database(crypto.randomUUID());try{await run(db);}finally{db.close();await db.delete();}}

test('Plannotizen lassen sich erstellen, bearbeiten und nach erneutem Öffnen laden',async()=>withDb(async db=>{
 const plan=examples()[0];await db.plans.add(plan);const point=plan.items[0];
 const first=await saveNote({ownerType:'plan',ownerId:plan.id,itemId:point.id},'  Vor der Stunde prüfen  ','manual',undefined,db,'2026-11-25T10:00:00.000Z');
 const edited=await saveNote({ownerType:'plan',ownerId:plan.id,itemId:point.id},'Geprüft','dictated',first.id,db,'2026-11-25T10:01:00.000Z');
 expect(edited.id).toBe(first.id);expect(edited.createdAt).toBe(first.createdAt);expect(edited.updatedAt).not.toBe(first.updatedAt);expect(edited.mode).toBe('dictated');
 db.close();const reopened=new Database(db.name);expect(await reopened.notes.get(first.id)).toEqual(edited);expect((await reopened.plans.get(plan.id))!.items[0]).toEqual(point);reopened.close();
}));

test('Sitzungsnotizen sind getrennt von Plan und anderen Durchführungen',async()=>withDb(async db=>{
 const plan=examples()[0];await db.plans.add(plan);const a=makeSession(plan),b=makeSession(plan);await db.sessions.bulkAdd([a,b]);
 const note=await saveNote({ownerType:'session',ownerId:a.id,itemId:a.executions[0].id},'Beobachtung','manual',undefined,db);
 expect(await db.notes.where('ownerId').equals(plan.id).count()).toBe(0);
 expect(await db.notes.where('ownerId').equals(b.id).count()).toBe(0);
 expect(await db.notes.where('ownerId').equals(a.id).toArray()).toEqual([note]);
}));

test('Notiz kann die laufende Zeitmessung nicht verändern',async()=>withDb(async db=>{
 const plan=examples()[0];await db.plans.add(plan);const session=makeSession(plan,1000);await db.sessions.add(session);await dispatch(session.id,{type:'start'},db,5000);
 await saveNote({ownerType:'session',ownerId:session.id},'Kurze Notiz','manual',undefined,db);
 expect((await db.sessions.get(session.id))?.timerStartedAt).toBe(5000);
}));

test('Leere oder falsch zugeordnete Notizen werden abgewiesen',async()=>withDb(async db=>{
 const plan=examples()[0];await db.plans.add(plan);const session=makeSession(plan);await db.sessions.add(session);
 await expect(saveNote({ownerType:'session',ownerId:session.id},'  ',undefined,undefined,db)).rejects.toThrow('leere Notiz');
 await expect(saveNote({ownerType:'session',ownerId:session.id,itemId:crypto.randomUUID()},'Falsch zugeordnet','manual',undefined,db)).rejects.toThrow('gehört nicht');
 expect(await db.notes.count()).toBe(0);
}));

test('Entfernen eines Planpunkts erhält die Notiz als Plannotiz',async()=>withDb(async db=>{
 const plan=examples()[0];await db.plans.add(plan);const point=plan.items[0];
 const note=await saveNote({ownerType:'plan',ownerId:plan.id,itemId:point.id},'Nicht vergessen','manual',undefined,db);
 await updateLessonPlan({...plan,items:plan.items.slice(1)},plan.updatedAt,db);
 const preserved=await db.notes.get(note.id);expect(preserved?.text).toBe('Nicht vergessen');expect(preserved?.itemId).toBeUndefined();
}));

test('Beendete Sitzungen sind schreibgeschützt und löschen nur eigene Notizen',async()=>withDb(async db=>{
 const plan=examples()[0];await db.plans.add(plan);const a=makeSession(plan),b=makeSession(plan);await db.sessions.bulkAdd([a,b]);
 const note=await saveNote({ownerType:'session',ownerId:a.id},'Notiz','manual',undefined,db);await dispatch(a.id,{type:'start'},db,1000);await dispatch(a.id,{type:'end'},db,2000);
 await expect(saveNote({ownerType:'session',ownerId:a.id},'Neu','manual',undefined,db)).rejects.toThrow('schreibgeschützt');
 await expect(deleteNote(note.id,{ownerType:'session',ownerId:b.id},db)).rejects.toThrow('gehört nicht');
 expect(await db.notes.get(note.id)).toEqual(note);await expect(deleteNote(note.id,{ownerType:'session',ownerId:a.id},db)).rejects.toThrow('schreibgeschützt');expect(await db.notes.get(note.id)).toEqual(note);
}));
