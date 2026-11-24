import 'fake-indexeddb/auto';
import {test,expect} from 'vitest';
import {examples} from '../src/fixtures';
import {makeSession} from '../src/features/cockpitRepository';
import {transition,clockView,phaseView,dispatch} from '../src/features/TimerService';
import {Database} from '../src/database';
const initial=()=>makeSession(examples()[0],1000);
test('explicit start and exact warning boundaries',()=>{let s=initial();expect(clockView(s,50000).total).toBe(0);s=transition(s,{type:'start'},1000);const i=s.executions[0];expect(i.status).toBe('active');expect(phaseView(i,901000).color).toBe('green');expect(phaseView(i,902000).color).toBe('yellow');expect(phaseView(i,1080000).color).toBe('yellow');expect(phaseView(i,1081000).color).toBe('red');});
test('pause freezes both clocks and resume excludes pause',()=>{let s=transition(initial(),{type:'start'},1000);s=transition(s,{type:'pause'},11000);expect(clockView(s,71000).total).toBe(10);expect(phaseView(s.executions[0],71000).actual).toBe(10);s=transition(s,{type:'resume'},71000);expect(clockView(s,81000).total).toBe(20);expect(phaseView(s.executions[0],81000).actual).toBe(20);});
test('nonactive check does not interrupt active phase; active check skips completed',()=>{let s=transition(initial(),{type:'start'},1000);s=transition(s,{type:'check',id:s.executions[1].id,done:true},2000);expect(s.executions[0].status).toBe('active');s=transition(s,{type:'check',id:s.executions[0].id,done:true},3000);expect(s.executions[2].status).toBe('active');expect(s.executions[0].intervals[0].end).toBe(3000);});
test('unknown duration is stopwatch and uncertain forecast',()=>{let s=initial();s.executions[0].adjusted.durationSeconds=undefined;s=transition(s,{type:'start'},1000);expect(phaseView(s.executions[0],9999999).over).toBeUndefined();expect(clockView(s,2000).uncertain).toBe(true);});
test('timer persists across database reopening',async()=>{const db=new Database(crypto.randomUUID());try{const s=initial();await db.sessions.add(s);await dispatch(s.id,{type:'start'},db,1000);db.close();const restored=new Database(db.name);expect(clockView((await restored.sessions.get(s.id))!,61000).total).toBe(60);restored.close();}finally{await db.delete();}});
test('manual switch and end retain the historical execution',()=>{let s=transition(initial(),{type:'start'},1000);s=transition(s,{type:'activate',id:s.executions[1].id},3000);expect(s.executions[0].status).toBe('pending');expect(s.executions[1].status).toBe('active');expect(()=>transition(s,{type:'reset'},4000)).toThrow('nicht zurückgesetzt');const ended=transition(s,{type:'end'},5000);expect(clockView(ended,9000).total).toBe(4);expect(ended.executions[1].intervals[0].end).toBe(5000);});

test('Pausen verschieben das geplante Unterrichtsende, ohne Unterrichtszeit mitzuzählen',()=>{
 let s=transition(initial(),{type:'start'},1000);
 s=transition(s,{type:'pause'},11000);
 const v=clockView(s,71000);
 expect(v.total).toBe(10);
 expect(v.plannedEnd).toBe(1000+2700000+60000);
 expect(v.forecast).toBe(71000+2690000);
 s=transition(s,{type:'resume'},71000);
 expect(clockView(s,81000).total).toBe(20);
 expect(clockView(s,81000).plannedEnd).toBe(1000+2700000+60000);
});
test('Abhaken während Pause übernimmt den nächsten Punkt erst beim Fortsetzen',()=>{
 let s=transition(initial(),{type:'start'},1000);
 s=transition(s,{type:'pause'},4000);
 s=transition(s,{type:'check',id:s.executions[0].id,done:true},6000);
 expect(s.executions[1].status).toBe('paused');
 expect(s.executions[1].intervals).toHaveLength(0);
 s=transition(s,{type:'resume'},8000);
 expect(s.executions[1].status).toBe('active');
 expect(s.executions[1].intervals[0].start).toBe(8000);
 expect(clockView(s,10000).total).toBe(5);
});
test('Zeitüberschreitung schaltet selbst nach Stunden nicht automatisch zur nächsten Phase',()=>{
 const s=transition(initial(),{type:'start'},1000);
 expect(phaseView(s.executions[0],1000+900000+3600000).color).toBe('red');
 expect(s.executions[0].status).toBe('active');
 expect(s.executions[1].status).toBe('pending');
});
test('Abschaltbare automatische Weiterschaltung stoppt am abgeschlossenen Punkt',()=>{
 let s=transition(initial(),{type:'start'},1000);
 s=transition(s,{type:'check',id:s.executions[0].id,done:true},3000,{id:'settings',theme:'system',yellowSeconds:0,redSeconds:180,wakeLock:true,sound:false,autoAdvance:false,phases:[]});
 expect(s.executions[0].status).toBe('done');
 expect(s.executions[1].status).toBe('pending');
 expect(s.executions.some(x=>x.status==='active')).toBe(false);
});
test('Überspringen ist kein Abschluss und erneute Aufnahme behält alle Ist-Intervalle',()=>{
 let s=transition(initial(),{type:'start'},1000);const first=s.executions[0];
 s=transition(s,{type:'skip',id:first.id},11000);expect(s.executions[0].status).toBe('skipped');expect(s.executions[1].status).toBe('active');
 s=transition(s,{type:'reactivate',id:first.id},12000);expect(s.executions[0].status).toBe('pending');
 s=transition(s,{type:'activate',id:first.id},13000);s=transition(s,{type:'check',id:first.id,done:true},18000);
 expect(s.executions[0].intervals).toEqual([{start:1000,end:11000},{start:13000,end:18000}]);expect(phaseView(s.executions[0],18000).actual).toBe(15);
});
test('Sollzeitänderung verändert weder Ist-Intervalle noch die Originalplanung',()=>{
 let s=transition(initial(),{type:'start'},1000);s=transition(s,{type:'duration',seconds:5400},4000);
 expect(s.adjustedDurationSeconds).toBe(5400);expect(s.durationAdjusted).toBe(true);expect(s.snapshot.durationSeconds).toBe(2700);expect(s.executions[0].intervals[0].start).toBe(1000);s=transition(s,{type:'duration',seconds:undefined},5000);expect(clockView(s,5000).planned).toBeUndefined();expect(s.snapshot.durationSeconds).toBe(2700);
});
test('globale Exklusivität verhindert gleichzeitig gestartete Durchführungen',async()=>{
 const db=new Database(crypto.randomUUID());try{const {examples}=await import('../src/fixtures');const {openSession}=await import('../src/features/cockpitRepository');const plans=examples().slice(0,2);await db.plans.bulkAdd(plans);const a=await openSession(plans[0].id,db),b=await openSession(plans[1].id,db);const outcomes=await Promise.allSettled([dispatch(a,{type:'start'},db,1000),dispatch(b,{type:'start'},db,1000)]);expect(outcomes.filter(x=>x.status==='fulfilled')).toHaveLength(1);expect(outcomes.filter(x=>x.status==='rejected')).toHaveLength(1);}finally{db.close();await db.delete();}
});
