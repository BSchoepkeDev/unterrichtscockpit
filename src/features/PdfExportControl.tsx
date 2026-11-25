import {useLiveQuery} from 'dexie-react-hooks';
import {useState} from 'react';
import {db} from '../database';
import type {LessonPlan,LessonSession} from '../models';
type ExportMode='compact'|'complete';
const safeName=(value:string)=>value.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^\w.-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80)||'unterricht';
type Props={plan:LessonPlan;session?:LessonSession;label?:string};

export function PdfExportControl(props:Props){
 const [open,setOpen]=useState(false);
 return <><button type="button" onClick={()=>setOpen(true)}>{props.label??'PDF exportieren'}</button>{open&&<PdfExportDialog {...props} onClose={()=>setOpen(false)}/>}</>;
}

function PdfExportDialog({plan,session,onClose}:Props&{onClose:()=>void}){
 const loadedNotes=useLiveQuery(async()=>{
  const planNotes=plan.id?await db.notes.where('ownerId').equals(plan.id).toArray():[];
  if(!session)return planNotes.filter(note=>note.ownerType==='plan');
  const sessionNotes=await db.notes.where('ownerId').equals(session.id).toArray();
  return [...planNotes.filter(note=>note.ownerType==='plan'),...sessionNotes.filter(note=>note.ownerType==='session')];
 },[plan.id,session?.id]);const notes=loadedNotes??[];
 const [mode,setMode]=useState<ExportMode>('complete'),[includeNotes,setIncludeNotes]=useState(true),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 async function makePdf(){
  setBusy(true);setMessage('');
  try{const {createLessonPdf}=await import('./pdfExport'),bytes=await createLessonPdf(session?.snapshot??plan,{mode,notes,includeNotes,session});return new Blob([bytes as BlobPart],{type:'application/pdf'});}
  catch(error){setMessage(error instanceof Error?`PDF konnte nicht erstellt werden: ${error.message}`:'PDF-Erzeugung fehlgeschlagen.');return undefined;}
  finally{setBusy(false);}
 }
 async function download(){const blob=await makePdf();if(!blob)return;const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`${safeName(plan.title)}${session?'-durchfuehrung':''}.pdf`;a.click();window.setTimeout(()=>URL.revokeObjectURL(url),60_000);setMessage('PDF wurde heruntergeladen.');}
 async function print(){const blob=await makePdf();if(!blob)return;const url=URL.createObjectURL(blob),tab=window.open('','_blank');if(!tab){URL.revokeObjectURL(url);setMessage('Browserdruck nicht verfügbar. Bitte Pop-ups erlauben oder PDF herunterladen.');return;}try{tab.document.title=plan.title;const frame=tab.document.createElement('iframe');frame.title='Unterrichtsplan als PDF';frame.src=url;frame.style.cssText='position:fixed;inset:0;width:100%;height:100%;border:0';frame.onload=()=>{if(typeof tab.print==='function'){tab.focus();tab.print();}else setMessage('PDF geöffnet. Der Druckdialog ist in diesem Browser nicht verfügbar; PDF herunterladen oder im Browser drucken.');};tab.document.body.style.margin='0';tab.document.body.append(frame);setMessage('PDF wird für den Browserdruck geöffnet.');window.setTimeout(()=>URL.revokeObjectURL(url),120_000);}catch(error){tab.close();URL.revokeObjectURL(url);setMessage(`Browserdruck nicht verfügbar: ${error instanceof Error?error.message:'PDF konnte nicht geöffnet werden'}`);}}
 async function share(){const blob=await makePdf();if(!blob)return;try{const file=new File([blob],`${safeName(plan.title)}.pdf`,{type:'application/pdf'}),shareNav=navigator as Navigator&{canShare?:(data:ShareData)=>boolean};if(!navigator.share||!shareNav.canShare?.({files:[file]})){setMessage('Teilen wird von diesem Browser nicht unterstützt. Du kannst das PDF herunterladen.');return;}await navigator.share({files:[file],title:plan.title});setMessage('PDF wurde geteilt.');}catch(error){setMessage(error instanceof DOMException&&error.name==='AbortError'?'Teilen abgebrochen.':`Teilen fehlgeschlagen: ${error instanceof Error?error.message:'unbekannter Fehler'}`);}}
 return <div className="export-backdrop" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget&&!busy)onClose();}}><section className="export-dialog" role="dialog" aria-modal="true" aria-labelledby="export-title"><div className="dialog-heading"><h3 id="export-title">PDF exportieren</h3><button type="button" onClick={onClose} disabled={busy}>Schließen</button></div><p><strong>{session?'Durchführung: ': 'Plan: '}</strong>{session?.snapshot.title??plan.title}</p><label>Umfang<select value={mode} onChange={event=>setMode(event.target.value as ExportMode)}><option value="compact">Kompakte Übersicht</option><option value="complete">Vollständige Planung</option></select></label><label className="export-checkbox"><input type="checkbox" checked={includeNotes} onChange={event=>setIncludeNotes(event.target.checked)}/>Notizen und Hinweise einschließen</label><p className="export-privacy">Das PDF wird lokal in diesem Browser aus den gespeicherten Daten erzeugt.</p>{message&&<p role="status">{message}</p>}<div className="card-actions"><button type="button" className="primary" disabled={busy||loadedNotes===undefined} onClick={()=>void download()}>{busy?'PDF wird erstellt …':'Herunterladen'}</button><button type="button" disabled={busy||loadedNotes===undefined} onClick={()=>void print()}>PDF öffnen / drucken</button><button type="button" disabled={busy||loadedNotes===undefined} onClick={()=>void share()}>Teilen …</button></div></section></div>;
}
