import {expect,test} from 'vitest';
import {PDFDocument} from 'pdf-lib';
import {examples} from '../src/fixtures';
import type {LessonNote} from '../src/models';
import {makeSession} from '../src/features/cockpitRepository';
import {createLessonPdf} from '../src/features/pdfExport';

const exportAt=new Date('2026-11-25T11:00:00.000Z');
const note:LessonNote={id:crypto.randomUUID(),ownerType:'plan',ownerId:'plan',text:'Für die nächste Stunde: Grüße aus Köln, Größe, ÄÖÜ äöü ß €',createdAt:exportAt.toISOString(),updatedAt:exportAt.toISOString(),mode:'dictated'};

test.each([{mode:'compact' as const,session:false},{mode:'complete' as const,session:false},{mode:'compact' as const,session:true},{mode:'complete' as const,session:true}])('erzeugt ein lesbares PDF (%s, session: %s)',async({mode,session:withSession})=>{
 const plan=structuredClone(examples()[0]);note.ownerId=plan.id;
 const session=withSession?makeSession(plan,exportAt.getTime()):undefined;
 if(session){session.status='ended';session.endedAt=exportAt.getTime()+60_000;session.executions[0].status='done';session.executions[0].intervals=[{start:exportAt.getTime(),end:exportAt.getTime()+60_000}];session.executions[0].changes=[{at:exportAt.getTime()+10_000,field:'Arbeitsauftrag',before:'Lesen',after:'Markieren'}];}
 const before=JSON.stringify({plan,session});
 const bytes=await createLessonPdf(plan,{mode,notes:[note],session,exportedAt:exportAt});
 const loaded=await PDFDocument.load(bytes);
 expect(loaded.getPageCount()).toBeGreaterThanOrEqual(1);
 expect(JSON.stringify({plan,session})).toBe(before);
});

test('lange Texte umbrechen über Seiten und Umlaute verursachen keinen Kodierungsfehler',async()=>{
 const plan=structuredClone(examples()[0]);plan.title='Größe und Überarbeitung';
 plan.items[0].description=('Äußere Überlegungen und Grüße aus München; Schülerinnen üben gründlich. ').repeat(170);
 const bytes=await createLessonPdf(plan,{mode:'complete',notes:[],exportedAt:exportAt});
 expect((await PDFDocument.load(bytes)).getPageCount()).toBeGreaterThan(1);
});

test('leerer Plan erzeugt keine leeren Zusatzseiten',async()=>{
 const plan=structuredClone(examples()[0]);plan.items=[];
 const bytes=await createLessonPdf(plan,{mode:'complete',notes:[],exportedAt:exportAt});
 expect((await PDFDocument.load(bytes)).getPageCount()).toBe(1);
});
