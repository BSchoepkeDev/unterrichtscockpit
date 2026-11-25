import {PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage} from 'pdf-lib';
import type {LessonNote, LessonPlan, LessonSession} from '../models';

export type ExportMode='compact'|'complete';
type Line={text:string;size:number;bold?:boolean;gap?:number;indent?:number};

const dateTime=(value:number|string)=>new Date(value).toLocaleString('de-DE',{dateStyle:'medium',timeStyle:'short'});
const duration=(seconds:number|undefined)=>seconds===undefined?'offen':`${Math.round(seconds/60)} Min.`;
const elapsedDuration=(seconds:number|undefined)=>seconds===undefined?'offen':`${Math.floor(seconds/60)} Min. ${Math.floor(seconds%60)} Sek.`;
const status=(value:string)=>({pending:'offen',active:'aktiv',paused:'pausiert',done:'erledigt',skipped:'übersprungen',ended:'beendet'}[value]??value);
const field=(label:string,value:string|undefined)=>value?.trim()?`${label}: ${value.trim()}`:'';

function wrap(text:string,font:PDFFont,size:number,width:number):string[]{
 text=text.replaceAll('→','->').replaceAll('←','<-').replace(/[^\u0020-\u007e\u00a0-\u00ff\u20ac\u2013\u2014\u2018\u2019\u201c\u201d\u2022]/g,'?');
 const words=text.split(/\s+/).filter(Boolean),lines:string[]=[];let line='';
 for(const word of words){const candidate=line?`${line} ${word}`:word;if(font.widthOfTextAtSize(candidate,size)<=width){line=candidate;continue;}
  if(line)lines.push(line);line='';
  if(font.widthOfTextAtSize(word,size)<=width){line=word;continue;}
  let part='';for(const char of word){if(part&&font.widthOfTextAtSize(part+char,size)>width){lines.push(part);part=char;}else part+=char;}line=part;
 }
 if(line)lines.push(line);return lines;
}

export async function createLessonPdf(plan:LessonPlan,options:{mode:ExportMode;notes:LessonNote[];includeNotes?:boolean;session?:LessonSession;exportedAt?:Date}):Promise<Uint8Array>{
 const {mode,session,notes}=options,compact=mode==='compact',includeNotes=options.includeNotes??true,exportedAt=options.exportedAt??new Date();
 const document=await PDFDocument.create();document.setTitle(`${plan.title} – Unterrichtscockpit`);document.setSubject(session?'Unterrichtsdurchführung':'Unterrichtsplanung');document.setCreator('Unterrichtscockpit');
 const regular=await document.embedFont(StandardFonts.Helvetica),bold=await document.embedFont(StandardFonts.HelveticaBold);
 const pageSize={width:595.28,height:841.89},margin=46,contentWidth=pageSize.width-margin*2,footer=38,top=pageSize.height-54;
 let page:PDFPage, y=0;
 const newPage=()=>{page=document.addPage([pageSize.width,pageSize.height]);y=top;};
 newPage();
 const ensure=(height:number)=>{if(y-height<footer+10)newPage();};
 const write=(text:string,size=10,options:{bold?:boolean;gap?:number;indent?:number}={})=>{
  const font=options.bold?bold:regular,indent=options.indent??0,lines=wrap(text,font,size,contentWidth-indent);
  ensure(lines.length*(size+4)+(options.gap??3));
  for(const row of lines){page.drawText(row,{x:margin+indent,y,size,font,color:rgb(0.14,0.17,0.2)});y-=size+4;}
  y-=options.gap??3;
 };
 const heading=(text:string)=>{ensure(24);y-=3;write(text,13,{bold:true,gap:6});};
 const noteList=(list:LessonNote[],ownerId:string,itemId?:string)=>list.filter(n=>n.ownerId===ownerId&&(!itemId?n.itemId===undefined:n.itemId===itemId));
 const writeNote=(note:LessonNote)=>write(`Notiz${note.mode==='dictated'?' (Diktat)':''} · ${dateTime(note.updatedAt)}: ${note.text}`,9,{indent:10,gap:4});

 write(plan.title,22,{bold:true,gap:4});
 write(session?`Durchführung · begonnen ${dateTime(session.startedAt)}${session.endedAt?` · beendet ${dateTime(session.endedAt)}`:''}`:'Unterrichtsplanung',10,{gap:8});
 const metadata=[field('Fach',plan.subject),field('Thema',plan.topic),field('Gruppe',session?.group??plan.group),field('Klasse/Jahrgang',plan.grade),field('Datum',plan.date),field('Geplante Dauer',duration(plan.durationSeconds)),field('Schlagwörter',plan.tags.join(', '))].filter(Boolean);
 for(const entry of metadata)write(entry,9,{gap:1});
 if(plan.goals?.trim())write(`Lernziele: ${plan.goals}`,10,{gap:3});
 if(!compact&&plan.competencies?.trim())write(`Kompetenzen: ${plan.competencies}`,10,{gap:3});
 if(includeNotes&&plan.notes?.trim()&&(!compact||notes.some(n=>n.ownerType==='plan'&&n.ownerId===plan.id)))write(`Plannotizen: ${plan.notes}`,9,{gap:4});
 const planNotes=notes.filter(n=>n.ownerType==='plan'&&n.ownerId===plan.id);
 if(compact){const selected=planNotes.filter(n=>!n.itemId);for(const n of selected)writeNote(n);}
 else if(session){const selected=planNotes.filter(n=>!n.itemId);if(selected.length){heading('Notizen zum ursprünglichen Plan');selected.forEach(writeNote);}}
 if(session&&!compact){heading('Plan-Snapshot bei Beginn');for(const item of session.snapshot.items){write(`${item.order+1}. ${item.title}`,10,{bold:true,gap:2});for(const [label,value] of [['Kurzbeschreibung',item.summary],['Beschreibung',item.description],['Arbeitsauftrag',item.assignment],['Materialien',item.materials],['Lehreraktivität',item.teacherActivity],['Schüleraktivität',item.studentActivity],['Lehrerhinweise',item.teacherNotes]] as const){const row=field(label,value);if(row)write(row,8,{indent:10,gap:2});}}}
 const items=session?[...session.executions].sort((a,b)=>a.order-b.order).map(execution=>({item:execution.adjusted,execution,original:execution.original})):plan.items.map(item=>({item,execution:undefined as undefined,original:undefined as undefined}));
 heading(session?'Durchführung · aktueller Stand':'Unterrichtspunkte');
 if(!items.length)write('Keine Unterrichtspunkte vorhanden.',10);
 for(const {item,execution,original} of items){
  const actual=execution?execution.intervals.reduce((sum,v)=>sum+Math.max(0,(v.end??session?.endedAt??exportedAt.getTime())-v.start),0)/1000:undefined;
  const summary=[item.phase||'Phase offen',duration(item.durationSeconds),execution?status(execution.status):''].filter(Boolean).join(' · ');
  write(`${(execution?.order??item.order)+1}. ${item.title}`,compact?11:12,{bold:true,gap:2});write(summary,9,{indent:10,gap:3});
  if(session&&execution){write(`Soll ${duration(original?.durationSeconds)} · angepasst ${duration(item.durationSeconds)} · Ist ${elapsedDuration(actual)}`,9,{indent:10,gap:3});}
  if(session&&original&&!compact){for(const [label,value] of [['Ursprünglicher Arbeitsauftrag',original.assignment],['Ursprüngliche Lehrerhinweise',original.teacherNotes]] as const){if(value?.trim()&&value!==item[label==='Ursprünglicher Arbeitsauftrag'?'assignment':'teacherNotes'])write(`${label}: ${value}`,8,{indent:10,gap:2});}}
  if(item.summary)write(item.summary,9,{indent:10,gap:3});
  if(!compact){for(const [label,value] of [['Beschreibung',item.description],['Arbeitsauftrag',item.assignment],['Materialien',item.materials],['Lehreraktivität',item.teacherActivity],['Schüleraktivität',item.studentActivity],['Lehrerhinweise',item.teacherNotes],['Sozialform',item.socialForm],['Methode',item.method],...(includeNotes?[['Punktnotizen',item.notes] as const]:[]),['Sonstige Informationen',item.other],['Originaltext',item.sourceText]] as const){const row=field(label,value);if(row)write(row,9,{indent:10,gap:3});}}
  const pointNotes=includeNotes?(session?[...planNotes.filter(n=>n.itemId===execution?.originalItemId),...notes.filter(n=>n.ownerType==='session'&&n.ownerId===session.id&&n.itemId===execution?.id)]:noteList(planNotes,plan.id,item.id)):[];
  for(const note of pointNotes)writeNote(note);
  if(session&&execution&&execution.changes.length){write('Spontane Anpassungen:',9,{bold:true,indent:10,gap:2});for(const change of execution.changes){const before=typeof change.before==='string'?change.before:JSON.stringify(change.before),after=typeof change.after==='string'?change.after:JSON.stringify(change.after);write(`${dateTime(change.at)} · ${change.field}: ${before??'—'} → ${after??'—'}`,8,{indent:20,gap:2});}}
  if(!compact)y-=4;
 }
 if(session){
  if(session.changes.length){heading('Änderungen an der Durchführung');for(const change of session.changes){const before=typeof change.before==='string'?change.before:JSON.stringify(change.before),after=typeof change.after==='string'?change.after:JSON.stringify(change.after);write(`${dateTime(change.at)} · ${change.field}: ${before??'—'} → ${after??'—'}`,9,{indent:8});}}
  const sessionNotes=includeNotes?notes.filter(n=>n.ownerType==='session'&&n.ownerId===session.id&&!n.itemId):[];if(sessionNotes.length){heading('Notizen zur Durchführung');sessionNotes.forEach(writeNote);}
  const elapsed=session.executions.flatMap(e=>e.intervals).reduce((sum,v)=>sum+Math.max(0,(v.end??session.endedAt??exportedAt.getTime())-v.start),0)/1000;
  const pauseSeconds=session.pauses.reduce((sum,v)=>sum+Math.max(0,(v.end??session.endedAt??exportedAt.getTime())-v.start),0)/1000;
  heading('Zeitübersicht');write(`Status: ${status(session.status)} · Gesamt-Soll: ${duration(session.durationAdjusted?session.adjustedDurationSeconds:session.snapshot.durationSeconds)} · Gesamt-Ist: ${elapsedDuration(elapsed)} · Pausen: ${elapsedDuration(pauseSeconds)}`,9);
 }
 for(let index=0;index<document.getPageCount();index++){
  const current=document.getPage(index);current.drawLine({start:{x:margin,y:footer+19},end:{x:pageSize.width-margin,y:footer+19},thickness:0.5,color:rgb(0.75,0.78,0.81)});
  current.drawText(wrap(`${plan.title} · Exportiert ${dateTime(exportedAt.getTime())}`,regular,7,contentWidth-80)[0]??plan.title,{x:margin,y:footer+7,size:7,font:regular,color:rgb(0.35,0.38,0.41)});
  current.drawText(`Seite ${index+1} von ${document.getPageCount()}`,{x:pageSize.width-margin-74,y:footer+7,size:7,font:regular,color:rgb(0.35,0.38,0.41)});
 }
 return document.save();
}
