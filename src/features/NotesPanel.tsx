import {useEffect,useRef,useState,type FormEvent} from 'react';
import {useLiveQuery} from 'dexie-react-hooks';
import {db} from '../database';
import type {LessonItemExecution,LessonNote} from '../models';
import {deleteNote,saveNote,type NoteOwner} from './noteRepository';

type RecognitionResult={isFinal:boolean;[index:number]:{transcript:string}};
type RecognitionEvent={resultIndex:number;results:ArrayLike<RecognitionResult>};
type RecognitionError={error:string};
type Recognition={lang:string;continuous:boolean;interimResults:boolean;onresult:((event:RecognitionEvent)=>void)|null;onerror:((event:RecognitionError)=>void)|null;onend:(()=>void)|null;start:()=>void;stop:()=>void;abort:()=>void};
type SpeechWindow=Window&{SpeechRecognition?:new()=>Recognition;webkitSpeechRecognition?:new()=>Recognition};

export function NotesPanel({ownerType,ownerId,executions=[],locked=false,title}:{ownerType:'plan'|'session';ownerId:string;executions?:LessonItemExecution[];locked?:boolean;title:string}){
 const notes=useLiveQuery(()=>db.notes.where('ownerId').equals(ownerId).toArray(),[ownerId]);
 const [scope,setScope]=useState(''),[draft,setDraft]=useState(''),[mode,setMode]=useState<'manual'|'dictated'>('manual'),[editing,setEditing]=useState<string>(),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[listening,setListening]=useState(false);
 const recognition=useRef<Recognition|null>(null);
 const available=typeof window!=='undefined'&&Boolean((window as SpeechWindow).SpeechRecognition||(window as SpeechWindow).webkitSpeechRecognition);
 const owner:NoteOwner={ownerType,ownerId,...(scope?{itemId:scope}: {})};
 const relevant=(notes??[]).filter(n=>n.ownerType===ownerType);
 useEffect(()=>()=>{recognition.current?.abort();},[]);
 function stopRecognition(abort=false){const current=recognition.current;if(!current)return;recognition.current=null;abort?current.abort():current.stop();setListening(false);}
 function startRecognition(){
  const Ctor=(window as SpeechWindow).SpeechRecognition||(window as SpeechWindow).webkitSpeechRecognition;
  if(!Ctor){setMessage('Direkte Spracherkennung wird von diesem Browser nicht angeboten. Nutze das Diktat der Bildschirmtastatur.');return;}
  try{const api=new Ctor();recognition.current=api;api.lang='de-DE';api.continuous=true;api.interimResults=true;api.onresult=event=>{let final='',interim='';for(let i=event.resultIndex;i<event.results.length;i++){const result=event.results[i];if(result.isFinal)final+=result[0].transcript;else interim+=result[0].transcript;}if(final){setDraft(value=>(value+(value&&!value.endsWith(' ')?' ':'')+final).trimStart());setMode('dictated');}if(interim)setMessage('Erkannt: '+interim);else setMessage('');};api.onerror=event=>{const details:Record<string,string>={'not-allowed':'Mikrofon- oder Spracherkennungszugriff wurde verweigert.','service-not-allowed':'Der Spracherkennungsdienst ist nicht freigegeben.',network:'Der Spracherkennungsdienst ist nicht erreichbar.','no-speech':'Es wurde keine Sprache erkannt.','audio-capture':'Kein Mikrofon verfügbar.',aborted:'Spracherkennung abgebrochen.'};setMessage(details[event.error]??'Spracherkennung fehlgeschlagen. Du kannst die Notiz weiterhin eintippen oder Tastaturdiktat verwenden.');};api.onend=()=>{recognition.current=null;setListening(false);};api.start();setListening(true);setMessage('Sprich jetzt. Die Erkennung kann je nach Browser einen Online-Dienst verwenden.');}catch{recognition.current=null;setListening(false);setMessage('Spracherkennung konnte nicht gestartet werden. Nutze das Diktat der Bildschirmtastatur.');}
 }
 function resetForm(){setDraft('');setEditing(undefined);setMode('manual');}
 async function submit(event:FormEvent){event.preventDefault();if(locked)return;setBusy(true);setMessage('');try{await saveNote(owner,draft,mode,editing);resetForm();setMessage('Notiz gespeichert.');}catch(e){setMessage(e instanceof Error?e.message:'Notiz konnte nicht gespeichert werden.');}finally{setBusy(false);}}
 async function remove(note:LessonNote){if(locked)return;setBusy(true);setMessage('');try{await deleteNote(note.id,{ownerType:note.ownerType,ownerId:note.ownerId,...(note.itemId?{itemId:note.itemId}:{})});if(editing===note.id)resetForm();setMessage('Notiz gelöscht.');}catch(e){setMessage(e instanceof Error?e.message:'Notiz konnte nicht gelöscht werden.');}finally{setBusy(false);}}
 const inputId=`note-entry-${ownerType}-${ownerId}`;
 function edit(note:LessonNote){setScope(note.itemId??'');setDraft(note.text);setMode(note.mode);setEditing(note.id);setMessage('');document.getElementById(inputId)?.focus();}
 return <details className="notes-panel"><summary>{title} · {relevant.length}</summary><p>Notizen werden lokal in diesem Browser gespeichert. Das Diktat der iPad-Tastatur funktioniert im Textfeld. Direkte Browser-Spracherkennung ist optional und kann Audio an einen browserabhängigen Dienst übertragen.</p>
  <form onSubmit={event=>void submit(event)}><label>Zuordnung<select disabled={locked||busy} value={scope} onChange={event=>setScope(event.target.value)}><option value="">{ownerType==='plan'?'Zum Unterrichtsplan':'Zur Durchführung'}</option>{executions.map(item=><option key={item.id} value={item.id}>Punkt: {item.adjusted.title}</option>)}</select></label>
   <label htmlFor={inputId}>{editing?'Notiz bearbeiten':'Neue Notiz'}</label><textarea id={inputId} value={draft} onChange={event=>{setDraft(event.target.value);setMode('manual');}} placeholder="Notiz eingeben oder Tastaturdiktat verwenden …" autoComplete="off" enterKeyHint="done" disabled={locked||busy}/>
   <div className="note-controls"><button type="submit" className="primary" disabled={locked||busy||!draft.trim()}>{busy?'Speichern …':editing?'Änderung speichern':'Notiz speichern'}</button>{editing&&<button type="button" disabled={busy} onClick={resetForm}>Abbrechen</button>}{available&&<button type="button" disabled={locked||busy} onClick={()=>listening?stopRecognition():startRecognition()}>{listening?'Diktat beenden':'Direkt diktieren'}</button>}</div>
  </form>{message&&<p role="status" className={message.includes('fehl')||message.includes('verweigert')||message.includes('nicht gefunden')?'error':''}>{message}</p>}
  {!available&&!locked&&<p>Direkte Browser-Spracherkennung ist nicht verfügbar. Für Spracheingabe kannst du das Diktat der Bildschirmtastatur nutzen.</p>}
  {relevant.filter(note=>note.itemId===undefined||executions.some(item=>item.id===note.itemId)||ownerType==='plan').length>0?<ul className="note-list">{relevant.filter(note=>note.itemId===undefined||executions.some(item=>item.id===note.itemId)||ownerType==='plan').sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)).map(note=>{const point=executions.find(item=>item.id===note.itemId);return <li key={note.id}><div><small>{point?`Punkt: ${point.adjusted.title}`:ownerType==='plan'?'Unterrichtsplan':'Durchführung'} · {new Date(note.updatedAt).toLocaleString('de-DE')} · {note.mode==='dictated'?'Browser-Diktat':'Textfeld'}</small><p>{note.text}</p></div><div className="note-controls"><button type="button" disabled={locked||busy} onClick={()=>edit(note)}>Bearbeiten</button><button type="button" className="danger" disabled={locked||busy} onClick={()=>void remove(note)}>Löschen</button></div></li>;})}</ul>:<p>Noch keine Notizen gespeichert.</p>}
 </details>;
}
