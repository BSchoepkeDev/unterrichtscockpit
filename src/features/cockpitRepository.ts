import {db, type Database} from '../database';
import type {LessonPlan, LessonSession} from '../models';

export function makeSession(plan:LessonPlan, now=Date.now()):LessonSession {
 const id=crypto.randomUUID(), snapshot=structuredClone(plan);
 return {id,planId:plan.id,snapshot,date:new Date(now).toISOString(),group:plan.group,startedAt:now,pauses:[],status:'active',changes:[],executions:snapshot.items.map(item=>({id:crypto.randomUUID(),sessionId:id,originalItemId:item.id,original:structuredClone(item),adjusted:structuredClone(item),order:item.order,intervals:[],status:'pending',changes:[]}))};
}
export async function openSession(planId:string,database:Database=db){
 return database.transaction('rw',database.plans,database.sessions,async()=>{
 const existing=(await database.sessions.where('planId').equals(planId).toArray()).find(s=>s.status!=='ended');
 if(existing)return existing.id;
 const plan=await database.plans.get(planId);if(!plan)throw new Error('Unterrichtsplan nicht gefunden.');
 const session=makeSession(plan);await database.sessions.add(session);return session.id;
 });
}
export async function setDone(sessionId:string,executionId:string,done:boolean,database:Database=db){
 await database.transaction('rw',database.sessions,async()=>{
 const session=await database.sessions.get(sessionId);
 if(!session||session.status==='ended')throw new Error('Durchführung nicht bearbeitbar.');
 const item=session.executions.find(x=>x.id===executionId);
 if(!item||!['pending','done'].includes(item.status))throw new Error('Unterrichtspunkt nicht bearbeitbar.');
 const status=done?'done':'pending';
 if(item.status===status)return;
 item.changes.push({at:Date.now(),field:'status',before:item.status,after:status});item.status=status;
 await database.sessions.put(session);
 });
}
export function progress(session:LessonSession){const total=session.executions.length,done=session.executions.filter(x=>x.status==='done').length;return {total,done,percent:total?Math.round(done/total*100):0};}
export function density(width:number,height:number,count:number,longest:number){const columns=Math.max(1,Math.floor(width/260));const rows=Math.ceil(count/columns);return rows*180<=height&&longest<=180?'generous':rows*125<=height?'compact':'reduced';}
