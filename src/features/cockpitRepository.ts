import {db, type Database} from '../database';
import type {LessonPlan, LessonSession, LessonItemExecution} from '../models';

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
export async function addExecution(sessionId:string,database:Database=db){return database.transaction('rw',database.sessions,async()=>{const s=await database.sessions.get(sessionId);if(!s||s.status==='ended')throw new Error('Durchführung nicht bearbeitbar.');const id=crypto.randomUUID(),item={id,planId:s.snapshot.id,order:s.executions.length,title:'Neuer Unterrichtspunkt',phase:'',summary:'',description:'',assignment:'',materials:'',teacherActivity:'',studentActivity:'',teacherNotes:'',socialForm:'',method:'',notes:'',other:''};s.executions.push({id:crypto.randomUUID(),sessionId,adjusted:item,order:s.executions.length,intervals:[],status:'pending',changes:[{at:Date.now(),field:'created',before:null,after:structuredClone(item)}]});s.changes.push({at:Date.now(),field:'execution-added',before:null,after:id});await database.sessions.put(s);return s;});}
export async function updateExecution(sessionId:string,executionId:string,patch:Partial<LessonItemExecution['adjusted']>,database:Database=db){return database.transaction('rw',database.sessions,async()=>{const s=await database.sessions.get(sessionId),i=s?.executions.find(x=>x.id===executionId);if(!s||s.status==='ended'||!i)throw new Error('Unterrichtspunkt nicht bearbeitbar.');if(!Object.entries(patch).some(([key,value])=>i.adjusted[key as keyof typeof i.adjusted]!==value))return s;const before=structuredClone(i.adjusted);i.adjusted={...i.adjusted,...patch};i.changes.push({at:Date.now(),field:'content',before,after:structuredClone(i.adjusted)});s.changes.push({at:Date.now(),field:'execution-edited',before,after:structuredClone(i.adjusted)});await database.sessions.put(s);return s;});}
export async function reorderExecution(sessionId:string,executionId:string,direction:-1|1,database:Database=db){return database.transaction('rw',database.sessions,async()=>{const s=await database.sessions.get(sessionId);if(!s||s.status==='ended')throw new Error('Durchführung nicht bearbeitbar.');const sorted=[...s.executions].sort((a,b)=>a.order-b.order),from=sorted.findIndex(x=>x.id===executionId),to=from+direction;if(from<0||to<0||to>=sorted.length||sorted[from].status!=='pending'||sorted[to].status!=='pending')return s;[sorted[from],sorted[to]]=[sorted[to],sorted[from]];sorted.forEach((x,order)=>x.order=order);s.executions=sorted;s.changes.push({at:Date.now(),field:'order',before:from,after:to});await database.sessions.put(s);return s;});}
export function historySummary(s:LessonSession){const total=s.executions.length,done=s.executions.filter(x=>x.status==='done').length,skipped=s.executions.filter(x=>x.status==='skipped').length,notDone=total-done-skipped;const pauseSeconds=s.pauses.reduce((n,p)=>n+Math.max(0,((p.end??s.endedAt??Date.now())-p.start)/1000),0);const actual=s.timerStartedAt===undefined?0:Math.max(0,Math.floor(((s.endedAt??Date.now())-s.timerStartedAt)/1000)-pauseSeconds);const adjusted=s.durationAdjusted?s.adjustedDurationSeconds:s.snapshot.durationSeconds;return {total,done,skipped,notDone,actual,pauseSeconds:Math.floor(pauseSeconds),planned:s.snapshot.durationSeconds,adjusted,delta:adjusted===undefined?undefined:actual-adjusted,changeCount:s.changes.filter(c=>c.field!=='timer').length+s.executions.reduce((n,i)=>n+i.changes.length,0)};}
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
