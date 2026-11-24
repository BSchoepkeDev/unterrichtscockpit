import {db,type Database} from '../database';
import {defaults,type Interval,type LessonSession,type LessonItemExecution,type Settings} from '../models';
export type Action={type:'start'|'pause'|'resume'|'end'|'reset'}|{type:'activate'|'skip'|'reactivate';id:string}|{type:'check';id:string;done:boolean}|{type:'duration';seconds:number|undefined};
export const elapsed=(intervals:Interval[],now:number)=>Math.floor(intervals.reduce((sum,i)=>sum+Math.max(0,(i.end??now)-i.start),0)/1000);
const close=(intervals:Interval[],now:number)=>{for(const i of intervals)if(i.end===undefined)i.end=Math.max(i.start,now);};
const active=(s:LessonSession)=>s.executions.find(i=>i.status==='active'||i.status==='paused');
const next=(s:LessonSession)=>[...s.executions].sort((a,b)=>a.order-b.order).find(i=>i.status==='pending');
function activate(s:LessonSession,i:LessonItemExecution,now:number){i.status=s.status==='paused'?'paused':'active';if(s.status==='active')i.intervals.push({start:now});}
export function transition(source:LessonSession,a:Action,clock:number,settings:Settings=defaults):LessonSession{
 const s=structuredClone(source),now=Math.max(clock,s.timerLastAt??0,s.timerStartedAt??0);
 if(s.status==='ended')throw new Error('Unterricht bereits beendet.');
 const current=active(s);
 switch(a.type){
 case 'start':if(s.timerStartedAt!==undefined)return s;s.timerStartedAt=now;s.startedAt=now;s.date=new Date(now).toISOString();s.status='active';{const i=next(s);if(i)activate(s,i,now);}break;
 case 'pause':if(s.timerStartedAt===undefined||s.status!=='active')return s;s.status='paused';s.pauses.push({start:now});if(current){close(current.intervals,now);current.status='paused';}break;
 case 'resume':if(s.status!=='paused')return s;close(s.pauses,now);s.status='active';if(current)activate(s,current,now);break;
 case 'end':if(s.timerStartedAt===undefined)return s;close(s.pauses,now);if(current){close(current.intervals,now);current.status='pending';}s.endedAt=now;s.status='ended';break;
 case 'reset':throw new Error('Eine laufende Durchführung kann nicht zurückgesetzt werden. Beende sie und starte den Plan erneut.');
 case 'duration':if(!Number.isInteger(a.seconds??0)||(a.seconds??0)<0)throw new Error('Ungültige Sollzeit.');{const before=s.durationAdjusted?s.adjustedDurationSeconds:s.snapshot.durationSeconds;s.adjustedDurationSeconds=a.seconds;s.durationAdjusted=true;s.changes.push({at:now,field:'duration',before,after:a.seconds});}break;
 case 'activate':{if(s.timerStartedAt===undefined)throw new Error('Unterricht zuerst starten.');const i=s.executions.find(x=>x.id===a.id);if(!i||i.status!=='pending')return s;if(current){close(current.intervals,now);current.status='pending';}activate(s,i,now);break;}
 case 'skip':{const i=s.executions.find(x=>x.id===a.id);if(!i||i.status==='done'||i.status==='skipped')return s;const before=i.status;close(i.intervals,now);i.status='skipped';i.changes.push({at:now,field:'status',before,after:'skipped'});if(i===current&&settings.autoAdvance){const n=next(s);if(n)activate(s,n,now);}break;}
 case 'reactivate':{const i=s.executions.find(x=>x.id===a.id);if(!i||!['done','skipped'].includes(i.status))return s;const before=i.status;i.status='pending';i.changes.push({at:now,field:'status',before,after:'pending'});break;}
 case 'check':{const i=s.executions.find(x=>x.id===a.id);if(!i||i.status==='skipped')throw new Error('Unterrichtspunkt nicht bearbeitbar.');if((i.status==='done')===a.done)return s;const wasActive=i===current;const before=i.status;close(i.intervals,now);i.status=a.done?'done':'pending';i.changes.push({at:now,field:'status',before,after:i.status});if(wasActive&&a.done&&settings.autoAdvance){const n=next(s);if(n)activate(s,n,now);}break;}
 }
 s.timerLastAt=now;s.changes.push({at:now,field:'timer',before:source.status,after:a.type});return s;
}
export async function dispatch(id:string,action:Action,database:Database=db,now=Date.now()){
 return database.transaction('rw',database.sessions,database.settings,database.locks,async()=>{const s=await database.sessions.get(id);if(!s)throw new Error('Durchführung fehlt.');if(action.type==='start'&&s.timerStartedAt===undefined||action.type==='resume'){const conflict=(await database.sessions.toArray()).find(other=>other.id!==id&&other.status!=='ended'&&other.timerStartedAt!==undefined&&other.status==='active');if(conflict)throw new Error(`Eine andere Durchführung läuft bereits: „${conflict.snapshot.title}“. Beende oder pausiere sie zuerst.`);}
 const result=transition(s,action,now,await database.settings.get('settings')??defaults);if(action.type==='start')await database.locks.put({id:'active-session',sessionId:id});if(action.type==='end'&&result.status==='ended'){const lock=await database.locks.get('active-session');if(lock?.sessionId===id)await database.locks.delete('active-session');}await database.sessions.put(result);return result;});
}
export function clockView(s:LessonSession,clock:number){
 const now=Math.max(clock,s.timerLastAt??0),end=s.endedAt??now;
 const total=s.timerStartedAt===undefined?0:Math.max(0,Math.floor((end-s.timerStartedAt)/1000)-elapsed(s.pauses,end));
 const planned=s.durationAdjusted?s.adjustedDurationSeconds:s.snapshot.durationSeconds;
 let remaining=0,uncertain=false,delta=0;const predictions:Record<string,number>={};
 for(const i of [...s.executions].sort((a,b)=>a.order-b.order)){
 const actual=elapsed(i.intervals,end),duration=i.adjusted.durationSeconds;
 if(i.status==='done'){if(duration!==undefined)delta+=actual-duration;continue;}
 if(i.status==='skipped')continue;
 predictions[i.id]=now+remaining*1000;
 if(duration===undefined)uncertain=true;else{remaining+=Math.max(0,duration-actual);if(i.status==='active'||i.status==='paused')delta+=Math.max(0,actual-duration);}
 }
 const plannedEnd=planned===undefined||s.timerStartedAt===undefined?undefined:s.timerStartedAt+planned*1000+elapsed(s.pauses,end)*1000;
 return {total,planned,remaining:planned===undefined?undefined:planned-total,plannedEnd,forecast:now+remaining*1000,uncertain,delta,predictions};
}
export function phaseView(i:LessonItemExecution,now:number,settings:Settings=defaults){
 const actual=elapsed(i.intervals,now),planned=i.adjusted.durationSeconds,over=planned===undefined?undefined:actual-planned;
 const color=i.status==='done'||i.status==='skipped'||i.status==='paused'?i.status:i.status!=='active'?'neutral':over===undefined||over<=settings.yellowSeconds?'green':over>=settings.redSeconds?'red':'yellow';
 return {actual,over,color};
}
export function formatSeconds(value:number){const n=Math.abs(Math.trunc(value));return (value<0?'-':'')+String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');}
