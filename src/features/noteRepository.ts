import {db,type Database} from '../database';
import type {LessonNote} from '../models';

export type NoteOwner={ownerType:'plan'|'session';ownerId:string;itemId?:string};

export async function saveNote(owner:NoteOwner,text:string,mode:'manual'|'dictated'='manual',noteId?:string,database:Database=db,now=new Date().toISOString()):Promise<LessonNote>{
 const trimmed=text.trim();
 if(!trimmed)throw new Error('Eine leere Notiz kann nicht gespeichert werden.');
 return database.transaction('rw',database.plans,database.sessions,database.notes,async()=>{
  if(owner.ownerType==='plan'){
   const plan=await database.plans.get(owner.ownerId);
   if(!plan)throw new Error('Der Unterrichtsplan wurde nicht gefunden.');
   if(owner.itemId&&!plan.items.some(item=>item.id===owner.itemId))throw new Error('Der Unterrichtspunkt gehört nicht zu diesem Unterrichtsplan.');
  }
  if(owner.ownerType==='session'){
   const session=await database.sessions.get(owner.ownerId);
   if(!session||session.status==='ended')throw new Error('Diese Durchführung ist schreibgeschützt.');
   if(owner.itemId&&!session.executions.some(item=>item.id===owner.itemId))throw new Error('Der Unterrichtspunkt gehört nicht zu dieser Durchführung.');
  }
  const existing=noteId?await database.notes.get(noteId):undefined;
  if(noteId&&(!existing||existing.ownerType!==owner.ownerType||existing.ownerId!==owner.ownerId||existing.itemId!==owner.itemId))throw new Error('Die Notiz gehört nicht zu diesem Bereich.');
  const note:LessonNote={id:existing?.id??crypto.randomUUID(),...owner,text:trimmed,createdAt:existing?.createdAt??now,updatedAt:now,mode};
  await database.notes.put(note);return note;
 });
}

export async function deleteNote(noteId:string,owner:NoteOwner,database:Database=db){
 return database.transaction('rw',database.sessions,database.notes,async()=>{
  const note=await database.notes.get(noteId);
  if(!note||note.ownerType!==owner.ownerType||note.ownerId!==owner.ownerId||note.itemId!==owner.itemId)throw new Error('Die Notiz gehört nicht zu diesem Bereich.');
  if(owner.ownerType==='session'&&(await database.sessions.get(owner.ownerId))?.status==='ended')throw new Error('Diese Durchführung ist schreibgeschützt.');
  await database.notes.delete(noteId);
 });
}
