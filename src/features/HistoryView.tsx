import {useLiveQuery} from 'dexie-react-hooks';
import {useState} from 'react';
import {db} from '../database';
import type {LessonItem} from '../models';
import {historySummary} from './cockpitRepository';
import {updateLessonPlan} from './lessonRepository';

function itemChanged(original:LessonItem|undefined,adjusted:LessonItem){if(!original)return true;const keys=new Set([...Object.keys(original),...Object.keys(adjusted)] as (keyof LessonItem)[]);return [...keys].some(key=>original[key]!==adjusted[key]||Object.hasOwn(original,key)!==Object.hasOwn(adjusted,key));}

export function HistoryView({onOpen}:{onOpen:(id:string)=>void}){
 const sessions=useLiveQuery(()=>db.sessions.orderBy('startedAt').reverse().toArray(),[]);
 const plans=useLiveQuery(()=>db.plans.toArray(),[]);
 const recordings=useLiveQuery(()=>db.audio.toArray(),[]);
 const notes=useLiveQuery(()=>db.notes.toArray(),[]);
 const [expanded,setExpanded]=useState<string|null>(null);
 const [selected,setSelected]=useState<Record<string,string[]>>({});
 const [message,setMessage]=useState('');
 async function remove(id:string,title:string){
  if(sessions?.find(session=>session.id===id)?.status!=='ended'){setMessage('Eine laufende Durchführung muss zuerst beendet werden.');return;}
  if(!window.confirm(`Durchführung „${title}“ dauerhaft aus der Historie löschen?`))return;
  try{
   const attachmentIds=await db.transaction('rw',db.sessions,db.notes,db.audio,async()=>{const session=await db.sessions.get(id);if(!session||session.status!=='ended')throw new Error('Nur beendete Durchführungen können gelöscht werden.');const audio=await db.audio.where('sessionId').equals(id).toArray();await db.sessions.delete(id);await db.notes.where('ownerId').equals(id).filter(note=>note.ownerType==='session').delete();await db.audio.where('sessionId').equals(id).delete();return audio.map(recording=>recording.attachmentId);});
   await db.transaction('rw',db.audio,db.attachments,db.plans,async()=>{for(const attachmentId of attachmentIds){const referenced=await db.audio.filter(recording=>recording.attachmentId===attachmentId).count(),planReferenced=await db.plans.filter(plan=>plan.attachmentIds.includes(attachmentId)).count();if(!referenced&&!planReferenced)await db.attachments.delete(attachmentId);}});
   setExpanded(null);
  }catch(e){setMessage(e instanceof Error?e.message:'Durchführung konnte nicht gelöscht werden.');}
 }
 async function adopt(id:string){
  const session=sessions?.find(s=>s.id===id);
  const plan=session?.planId?plans?.find(p=>p.id===session.planId):undefined;
  const selectedIds=selected[id]??[];
  if(!session||!plan||!selectedIds.length)return;
  try{
   let items=structuredClone(plan.items),durationSeconds=plan.durationSeconds;
   const chosen=session.executions.filter(x=>selectedIds.includes(x.id));
   for(const execution of chosen){
    if(execution.id==='__total_duration__'){durationSeconds=session.durationAdjusted?session.adjustedDurationSeconds:session.snapshot.durationSeconds;continue;}
    if(execution.originalItemId){
     const index=items.findIndex(x=>x.id===execution.originalItemId);
     if(index>=0)items[index]={...execution.adjusted,id:items[index].id,planId:plan.id,order:items[index].order};
    }else{
     const index=Math.min(execution.order,items.length);
     items.splice(index,0,{...execution.adjusted,id:crypto.randomUUID(),planId:plan.id,order:index});
    }
   }
   const moved=chosen.filter(x=>x.originalItemId&&x.original&&x.order!==x.original.order).sort((a,b)=>a.order-b.order);
   for(const execution of moved){const from=items.findIndex(x=>x.id===execution.originalItemId);if(from<0)continue;const [item]=items.splice(from,1);items.splice(Math.min(execution.order,items.length),0,item);}
   items=items.map((item,order)=>({...item,order}));
   await updateLessonPlan({...plan,items,durationSeconds},plan.updatedAt);
   setMessage('Die ausgewählten Änderungen wurden in den ursprünglichen Plan übernommen.');
  }catch(e){setMessage(e instanceof Error?e.message:'Übernahme fehlgeschlagen. Bitte Plan und Historie erneut prüfen.');}
 }
 function choice(id:string,value:string,checked:boolean){setSelected(current=>({...current,[id]:checked?[...(current[id]??[]),value]:(current[id]??[]).filter(x=>x!==value)}));}
 return <section aria-label="Unterrichtshistorie">
  {message&&<p role="status">{message}</p>}
  {!sessions?.length&&<p>Noch keine Unterrichtsdurchführungen vorhanden.</p>}
  {sessions?.map(s=>{
   const summary=historySummary(s),open=expanded===s.id;
   const plan=s.planId?plans?.find(p=>p.id===s.planId):undefined;
   const candidates=s.executions.filter(i=>!i.originalItemId||itemChanged(i.original,i.adjusted)||Boolean(i.original&&i.order!==i.original.order));
   return <article key={s.id} className="history-card">
    <div className="dialog-heading"><div><h3>{s.snapshot.title}</h3><p>{new Date(s.startedAt).toLocaleString('de-DE')} · {s.group||'Lerngruppe offen'} · {s.status==='ended'?'Beendet':s.timerStartedAt===undefined?'Noch nicht gestartet':s.status==='paused'?'Pausiert':'Läuft'}</p></div><button onClick={()=>setExpanded(open?null:s.id)} aria-expanded={open}>{open?'Schließen':'Nachbereitung öffnen'}</button></div>
    <p>Ursprüngliche Sollzeit {summary.planned===undefined?'offen':`${summary.planned/60} Min.`} · angepasst {summary.adjusted===undefined?'offen':`${summary.adjusted/60} Min.`} · Ist {Math.floor(summary.actual/60)} Min. · Abweichung {summary.delta===undefined?'offen':`${summary.delta>=0?'+':''}${Math.floor(summary.delta/60)} Min.`} · Pausen {Math.floor(summary.pauseSeconds/60)} Min. · {summary.done} erledigt · {summary.skipped} übersprungen · {summary.notDone} nicht durchgeführt · {summary.changeCount} spontane Änderungen</p>
    {open&&<>
     {notes?.some(note=>note.ownerId===s.id)&&<><h4>Gespeicherte Notizen</h4>{notes.filter(note=>note.ownerId===s.id).map(note=><p key={note.id}>{note.itemId&&s.executions.find(item=>item.id===note.itemId)?.adjusted.title+': '}{note.text}</p>)}</>}
     {recordings?.some(recording=>recording.sessionId===s.id)&&<><h4>Audioaufnahmen</h4><ul>{recordings.filter(recording=>recording.sessionId===s.id).map(recording=><li key={recording.id}>{recording.title} · {Math.round(recording.durationSeconds)} Sek.{recording.transcript&&<p>{recording.transcript}</p>}</li>)}</ul><p>Wiedergabe und Export werden in einer späteren Entwicklungsstufe ergänzt.</p></>}
     <h4>Durchführungspunkte</h4><ol>{[...s.executions].sort((a,b)=>a.order-b.order).map(i=>{const actual=Math.floor(i.intervals.reduce((n,v)=>n+Math.max(0,(v.end??s.endedAt??Date.now())-v.start),0)/60000);return <li key={i.id}><strong>{i.adjusted.title}</strong> — {i.status==='done'?'erledigt':i.status==='skipped'?'übersprungen':i.status==='active'||i.status==='paused'?'nicht abgeschlossen':'nicht durchgeführt'}; ursprüngliche Sollzeit {i.original?.durationSeconds===undefined?'offen':`${i.original.durationSeconds/60} Min.`}; angepasste Sollzeit {i.adjusted.durationSeconds===undefined?'offen':`${i.adjusted.durationSeconds/60} Min.`}; Ist {actual} Min.; Abweichung {i.adjusted.durationSeconds===undefined?'offen':`${actual-i.adjusted.durationSeconds/60>=0?'+':''}${actual-i.adjusted.durationSeconds/60} Min.`}{(i.adjusted.notes||i.adjusted.teacherNotes||i.adjusted.assignment)&&<details><summary>Notizen und Arbeitsauftrag</summary><p>{i.adjusted.assignment}</p><p>{i.adjusted.teacherNotes}</p><p>{i.adjusted.notes}</p></details>}{i.changes.length>0&&<details><summary>{i.changes.length} Änderung(en)</summary><ul>{i.changes.map((c,n)=><li key={n}>{new Date(c.at).toLocaleTimeString('de-DE')} · {c.field}</li>)}</ul></details>}</li>;})}</ol>
     <h4>Änderungen gezielt übernehmen</h4>
     {!plan?<p>Der ursprüngliche Plan wurde gelöscht. Die Historie bleibt erhalten; eine Planübernahme ist nicht möglich.</p>:<>
      <p>Nur markierte Inhalte und Reihenfolgeänderungen werden übernommen. Neue Sitzungspunkte werden einzeln zur Auswahl angeboten.</p>
      {candidates.map(i=><label key={i.id} className="history-choice"><input type="checkbox" checked={(selected[s.id]??[]).includes(i.id)} onChange={e=>choice(s.id,i.id,e.target.checked)}/>{i.original?.title??i.adjusted.title}{i.originalItemId&&i.original&&i.order!==i.original.order?' · Reihenfolge geändert':' · angepasst'}{i.changes.length?` · ${i.changes.length} Änderung(en)`:''}</label>)}
      {s.durationAdjusted&&s.adjustedDurationSeconds!==s.snapshot.durationSeconds&&<label className="history-choice"><input type="checkbox" checked={(selected[s.id]??[]).includes('__total_duration__')} onChange={e=>choice(s.id,'__total_duration__',e.target.checked)}/>Angepasste Gesamtdauer übernehmen</label>}
      <button disabled={!selected[s.id]?.length} onClick={()=>void adopt(s.id)}>Ausgewählte Änderungen in Plan übernehmen</button>
     </>}
     <div className="card-actions"><button onClick={()=>onOpen(s.id)}>Im Cockpit öffnen</button><button className="danger" disabled={s.status!=='ended'} onClick={()=>void remove(s.id,s.snapshot.title)}>Durchführung löschen …</button></div>
    </>}
   </article>;
  })}
 </section>;
}
