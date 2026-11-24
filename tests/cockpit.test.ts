import 'fake-indexeddb/auto';
import {test,expect} from 'vitest';
import {Database} from '../src/database';
import {examples} from '../src/fixtures';
import {density,makeSession,openSession,progress,setDone} from '../src/features/cockpitRepository';
import {dispatch} from '../src/features/TimerService';

async function withDb(run:(db:Database)=>Promise<void>){
 const db=new Database(crypto.randomUUID());
 try{await run(db);}finally{db.close();await db.delete();}
}
test('Neue Durchführung ist unabhängig vom Plan und beginnt mit offenen Punkten',()=>{
 const plan=examples()[0],session=makeSession(plan,12345);
 expect(session.snapshot).toEqual(plan);
 expect(session.snapshot).not.toBe(plan);
 expect(session.executions).toHaveLength(plan.items.length);
 expect(session.executions.every(item=>item.status==='pending'&&item.sessionId===session.id)).toBe(true);
 expect(new Set(session.executions.map(item=>item.id)).size).toBe(plan.items.length);
 plan.items[0].title='Planänderung';
 expect(session.snapshot.items[0].title).not.toBe('Planänderung');
 expect(session.executions[0].adjusted.title).not.toBe('Planänderung');
});
test('Checkboxzustand wird gespeichert und beeinflusst nicht die Unterrichtsplanung',async()=>withDb(async db=>{
 const plan=examples()[0];await db.plans.add(plan);
 const sessionId=await openSession(plan.id,db),again=await openSession(plan.id,db);
 expect(again).toBe(sessionId);
 const initial=(await db.sessions.get(sessionId))!;
 const executionId=initial.executions[0].id;
 await setDone(sessionId,executionId,true,db);
 let result=(await db.sessions.get(sessionId))!;
 expect(progress(result)).toEqual({done:1,total:3,percent:33});
 expect(result.executions[0].status).toBe('done');
 expect((await db.plans.get(plan.id))!.items[0]).toEqual(plan.items[0]);
 db.close();
 const reopened=new Database(db.name);
 expect((await reopened.sessions.get(sessionId))!.executions[0].status).toBe('done');
 await setDone(sessionId,executionId,false,reopened);
 result=(await reopened.sessions.get(sessionId))!;
 expect(progress(result).done).toBe(0);
 reopened.close();
}));
test('Historische Sitzung bleibt auch nach Löschen des Plans verständlich',async()=>withDb(async db=>{
 const plan=examples()[0];await db.plans.add(plan);
 const sessionId=await openSession(plan.id,db);
 await db.plans.delete(plan.id);
 expect(await openSession(plan.id,db)).toBe(sessionId);
 expect((await db.sessions.get(sessionId))!.snapshot.title).toBe(plan.title);
}));
test('Fehlerhafte Checkbox-Aktion verändert keine gespeicherten Daten',async()=>withDb(async db=>{
 const plan=examples()[0];await db.plans.add(plan);
 const id=await openSession(plan.id,db);
 await expect(setDone(id,crypto.randomUUID(),true,db)).rejects.toThrow('nicht bearbeitbar');
 expect(progress((await db.sessions.get(id))!).done).toBe(0);
}));
test('Derselbe Plan kann nach Abschluss als neue unabhängige Durchführung gestartet werden',async()=>withDb(async db=>{
 const plan=examples()[0];await db.plans.add(plan);const first=await openSession(plan.id,db);await dispatch(first,{type:'start'},db,1000);await dispatch(first,{type:'end'},db,2000);const second=await openSession(plan.id,db);expect(second).not.toBe(first);expect((await db.sessions.get(first))?.status).toBe('ended');expect((await db.sessions.get(second))?.timerStartedAt).toBeUndefined();
}));
test('Dichteauswahl bevorzugt bei Platzmangel optionale Inhalte zu reduzieren',()=>{
 expect(density(1000,1000,3,20)).toBe('generous');
 expect(density(550,600,8,30)).toBe('compact');
 expect(density(250,320,14,500)).toBe('reduced');
});
