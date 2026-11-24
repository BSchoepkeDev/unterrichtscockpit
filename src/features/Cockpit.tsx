import {useEffect,useRef,useState} from 'react';
import {useLiveQuery} from 'dexie-react-hooks';
import {db} from '../database';
import {defaults,type LessonItem,type LessonItemExecution} from '../models';
import {dispatch,type Action} from './TimerService';
import {TimerPanel,PhaseClock,useClock} from './TimerPanel';
import {density,openSession,progress} from './cockpitRepository';

const duration=(x:LessonItem)=>[x.durationSeconds===undefined?'':(x.durationSeconds/60)+' Min.',[x.plannedStart,x.plannedEnd].filter(Boolean).join(' – ')].filter(Boolean).join(' · ')||'Zeit offen';
const fields=(x:LessonItem):[string,string|undefined][]=>[['Kurzbeschreibung',x.summary],['Beschreibung',x.description],['Arbeitsauftrag',x.assignment],['Materialien',x.materials],['Lehreraktivität',x.teacherActivity],['Schüleraktivität',x.studentActivity],['Lehrerhinweise',x.teacherNotes],['Sozialform',x.socialForm],['Methode',x.method],['Notizen',x.notes],['Sonstige Informationen',x.other],['Originaltext',x.sourceText]];
const statuses={pending:'Offen',done:'Erledigt',active:'Aktiv',paused:'Pausiert',skipped:'Übersprungen'};
function Details({item,onClose}:{item:LessonItemExecution;onClose:()=>void}){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const dialog=ref.current;const previous=document.activeElement as HTMLElement|null;dialog?.showModal();return()=>{dialog?.close();previous?.focus();};},[]);
 const x=item.adjusted;
 return <dialog ref={ref} className="cockpit-detail" aria-labelledby="detail-title" onCancel={e=>{e.preventDefault();onClose();}}><div className="dialog-heading"><h2 id="detail-title">{x.title}</h2><button autoFocus onClick={onClose}>Schließen</button></div><p>{item.order+1} · {x.phase||'Phase offen'} · {duration(x)} · {statuses[item.status]}</p><dl>{fields(x).filter(([,v])=>v?.trim()).map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></dialog>;
}
export function Cockpit({requestedPlan}:{requestedPlan:string|null}){
 const now=useClock();const settings=useLiveQuery(()=>db.settings.get('settings'),[])??defaults;
 const plans=useLiveQuery(()=>db.plans.toArray(),[]);
 const sessions=useLiveQuery(()=>db.sessions.toArray(),[]);
 const [selected,setSelected]=useState(()=>localStorage.getItem('cockpit-session')||'');
 const [detail,setDetail]=useState<string|null>(null);
 const [error,setError]=useState(''),[busy,setBusy]=useState(false);
 const [pendingChecks,setPendingChecks]=useState<Record<string,boolean>>({});
 const [size,setSize]=useState({width:800,height:500});
 const grid=useRef<HTMLDivElement>(null);
 const session=sessions?.find(s=>s.id===selected&&s.status!=='ended');
 async function choose(id:string){setPendingChecks({});setBusy(true);setError('');try{const next=await openSession(id);setSelected(next);localStorage.setItem('cockpit-session',next);setDetail(null);}catch(e){setError(e instanceof Error?e.message:'Öffnen fehlgeschlagen.');}finally{setBusy(false);}}
 useEffect(()=>{if(requestedPlan)void choose(requestedPlan);},[requestedPlan]);
 useEffect(()=>{const el=grid.current;if(!el)return;const measure=()=>{const r=el.getBoundingClientRect();setSize({width:r.width,height:Math.max(0,window.innerHeight-r.top)});};measure();const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(measure):null;observer?.observe(el);window.addEventListener('resize',measure);return()=>{observer?.disconnect();window.removeEventListener('resize',measure);};},[session?.id]);
 useEffect(()=>{if(!session)return;setPendingChecks(previous=>{let changed=false;const next={...previous};for(const [id,done] of Object.entries(next)){const execution=session.executions.find(e=>e.id===id);if(!execution||execution.status==='done'===done){delete next[id];changed=true;}}return changed?next:previous;});},[session]);
 async function action(a:Action){if(!session)return;setBusy(true);setError('');try{await dispatch(session.id,a,db,now);}catch(e){setError(e instanceof Error?e.message:'Timerfehler');}finally{setBusy(false);}}
 async function toggle(id:string,done:boolean){if(!session)return;const sessionId=session.id;setPendingChecks(previous=>({...previous,[id]:done}));setError('');try{await dispatch(sessionId,{type:'check',id,done},db,now);}catch(e){setPendingChecks(previous=>{const next={...previous};delete next[id];return next;});setError(e instanceof Error?e.message:'Speichern fehlgeschlagen.');}}
 const p=session?progress(session):null;
 const items=session?[...session.executions].sort((a,b)=>a.order-b.order):[];
 const mode=density(size.width,size.height,items.length,Math.max(0,...items.map(x=>x.adjusted.title.length+x.adjusted.summary.length)));
 const opened=items.find(x=>x.id===detail);
 return <section aria-label="Unterrichtsübersicht">{error&&<p role="alert" className="error">{error}</p>}<div className="toolbar"><label>Unterrichtsplan<select disabled={busy} value={session?.planId??''} onChange={e=>{if(e.target.value)void choose(e.target.value);}}><option value="">Plan auswählen</option>{plans?.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}{session?.planId&&!plans?.some(p=>p.id===session.planId)&&<option value={session.planId}>{session.snapshot.title} (Plan gelöscht)</option>}</select></label><label>Offene Durchführung<select value={session?.id??''} disabled={busy} onChange={e=>{setSelected(e.target.value);localStorage.setItem('cockpit-session',e.target.value);setDetail(null);}}><option value="">Durchführung auswählen</option>{sessions?.filter(s=>s.status!=='ended').map(s=><option key={s.id} value={s.id}>{s.snapshot.title}</option>)}</select></label></div>{session&&p?<><h3>{session.snapshot.title}</h3><p>{session.group||'Lerngruppe offen'} · {session.snapshot.durationSeconds===undefined?'Gesamtdauer offen':session.snapshot.durationSeconds/60+' Min.'}</p><TimerPanel session={session} now={now} settings={settings} busy={busy} onAction={a=>void action(a)}/><div className="cockpit-progress"><progress aria-label="Unterrichtsfortschritt" max={p.total||1} value={p.done}/><span aria-live="polite">{p.done} von {p.total} erledigt ({p.percent} %)</span></div><div ref={grid} className={'cockpit-grid '+mode}>{items.map(item=><article className={'cockpit-card '+(item.status==='done'?'completed':item.status==='active'?'active-phase':'')} key={item.id}><button className="cockpit-open" onClick={()=>setDetail(item.id)} aria-label={'Details: '+item.adjusted.title+' ('+(item.order+1)+')'}><small>{item.order+1} · {item.adjusted.phase||'Phase offen'}</small><strong>{item.adjusted.title}</strong><span>{duration(item.adjusted)}</span>{mode!=='reduced'&&item.adjusted.summary&&<span className="cockpit-summary">{item.adjusted.summary}</span>}{mode==='generous'&&<small>{[item.adjusted.materials?'Material vorhanden':'',item.adjusted.notes||item.adjusted.teacherNotes?'Hinweise vorhanden':''].filter(Boolean).join(' · ')}</small>}</button><PhaseClock item={item} session={session} now={now} settings={settings} busy={busy} onAction={a=>void action(a)}/><label className="cockpit-check"><input type="checkbox" checked={pendingChecks[item.id]??(item.status==='done')} disabled={busy||item.status==='skipped'} onChange={e=>void toggle(item.id,e.target.checked)} aria-label={'Erledigt: '+item.adjusted.title+' ('+(item.order+1)+')'}/>{statuses[item.status]}</label></article>)}</div>{!items.length&&<p>Dieser Plan enthält keine Unterrichtspunkte.</p>}{opened&&<Details key={opened.id} item={opened} onClose={()=>setDetail(null)}/>}</>:<p>Wähle einen Unterrichtsplan, um die Übersicht zu öffnen.</p>}</section>;
}
