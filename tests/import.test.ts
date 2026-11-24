import 'fake-indexeddb/auto';
import {expect,test} from 'vitest';
import {Database} from '../src/database';
import {applyPageText,orderPdfTextItems,parseGermanDuration,parseLessonText} from '../src/features/importParser';
import {createImportedLessonPlan} from '../src/features/lessonRepository';

test('deutsche Zeitangaben werden minutengenau ausgewertet',()=>{
 expect(parseGermanDuration('5 Min.').seconds).toBe(300);
 expect(parseGermanDuration('ca. 15 Minuten').seconds).toBe(900);
 expect(parseGermanDuration('ca. 15 Minuten').warning).toContain('ungefähr');
 expect(parseGermanDuration('08:15–08:25')).toMatchObject({start:'08:15',end:'08:25',seconds:600});
 expect(parseGermanDuration('0–10 Min.').seconds).toBe(600);
 expect(parseGermanDuration('08:25–08:15').warning).toBeTruthy();
 expect(parseGermanDuration('5 Min. bis ca. 10 Minuten').warning).toContain('Mehrere Zahlen');
});
test('ungefähre Zeiten im Fließtext behalten den Prüfhinweis',()=>{
 const parsed=parseLessonText('1. Einstieg\nDauer: ca. 15 Minuten','Plan.txt');
 expect(parsed.plan.items[0].durationSeconds).toBe(900);expect(parsed.warnings.some(w=>w.message.includes('ungefähr'))).toBe(true);
});
test('Strukturfelder und Quelltext bleiben nachvollziehbar',()=>{
 const parsed=parseLessonText('# Sachunterricht: Wasser\nPhase 1: Einstieg · 5 Min.\nArbeitsauftrag: Beobachtet die Schale.\nMaterialien: Schale, Wasser\nUnbekanntes Merkmal: blaues Tuch','Plan.txt');
 expect(parsed.plan.title).toBe('Sachunterricht: Wasser');
 expect(parsed.plan.items).toHaveLength(1);
 expect(parsed.plan.items[0]).toMatchObject({title:'Einstieg',phase:'Einstieg',assignment:'Beobachtet die Schale.',materials:'Schale, Wasser',durationSeconds:300});
 expect(parsed.plan.items[0].sourceText).toContain('Unbekanntes Merkmal: blaues Tuch');
});
test('Tabellenköpfe ordnen Fachfelder ohne Titelannahme zu',()=>{
 const parsed=parseLessonText('Titel | Zeit | Phase | Arbeitsauftrag\nImpuls | 08:15–08:25 | Einstieg | Frage besprechen','Tabelle.txt');
 expect(parsed.plan.items).toHaveLength(1);
 expect(parsed.plan.items[0]).toMatchObject({title:'Impuls',phase:'Einstieg',assignment:'Frage besprechen',plannedStart:'08:15',plannedEnd:'08:25',durationSeconds:600});
});
test('Plan-Metadaten werden zugeordnet und Unterrichtsziele bleiben erhalten',()=>{
 const parsed=parseLessonText('Fach: Sachunterricht\nKlasse: 5b\nUnterrichtsziele: Die Lernenden beschreiben Verdunstung.\n1. Einstieg\nImpulsfragen stellen.','Plan.txt');
 expect(parsed.plan).toMatchObject({subject:'Sachunterricht',group:'5b',goals:'Die Lernenden beschreiben Verdunstung.'});
 expect(parsed.plan.items[0].description).toContain('Impulsfragen stellen.');
});
test('unstrukturierter und mehrdeutiger Inhalt wird erhalten und markiert',()=>{
 const parsed=parseLessonText('Kopfzeile unbekannt\n12-7 min vielleicht','Plan.txt');
 expect(parsed.plan.items[0].description).toContain('12-7 min vielleicht');
 expect(parsed.plan.notes).toContain('Kopfzeile unbekannt');
 expect(parsed.warnings.some(w=>w.message.length>0)).toBe(true);
});
test('OCR-Seitenhinweis wird in der Vorschau angezeigt',()=>{
 const parsed=applyPageText([{page:1,text:'Erste Seite',ocr:false},{page:2,text:'OCR Text',ocr:true}],'Mischdokument.pdf');
 expect(parsed.pages).toHaveLength(2);
 expect(parsed.warnings.some(w=>w.message.includes('OCR'))).toBe(true);
});
test('erkannte Punkte behalten die Seitenreferenz des Originaltexts',()=>{
 const parsed=applyPageText([{page:1,text:'1. Einstieg\nBegrüßung der Lerngruppe.',ocr:false},{page:2,text:'2. Sicherung\nErgebnisse gemeinsam ordnen.',ocr:false}],'Mehrseitig.pdf');
 expect(parsed.plan.items).toHaveLength(2);expect(parsed.plan.items[0].sourcePages).toEqual([1]);expect(parsed.plan.items[1].sourcePages).toEqual([2]);
});
test('Mehrspaltige PDF-Texte werden spaltenweise und nicht zeilenweise verflochten',()=>{
 const layout=orderPdfTextItems([{text:'Links oben',x:50,y:700,width:80},{text:'Rechts oben',x:330,y:700,width:90},{text:'Links unten',x:50,y:680,width:85},{text:'Rechts unten',x:330,y:680,width:95}],595);
 expect(layout.layout).toBe('columns');expect(layout.text.indexOf('Links unten')).toBeLessThan(layout.text.indexOf('Rechts oben'));
});
test('Plan und Originalanhang werden gemeinsam und atomar gespeichert',async()=>{
 const name=crypto.randomUUID(),database=new Database(name);const parsed=parseLessonText('1. Einstieg · 5 Min.\nAufgabe: Lesen','Plan.txt');const attachment={id:crypto.randomUUID(),name:'Plan.txt',mimeType:'text/plain',data:new TextEncoder().encode('originaler Text').buffer as ArrayBuffer};parsed.plan.attachmentIds=[attachment.id];
 try{await createImportedLessonPlan(parsed.plan,attachment,database);expect(await database.attachments.get(attachment.id)).toMatchObject({name:'Plan.txt'});expect(await database.plans.get(parsed.plan.id)).toMatchObject({attachmentIds:[attachment.id]});
  const other={...attachment,id:crypto.randomUUID(),name:'nicht-angelegt.txt'};await expect(createImportedLessonPlan(parsed.plan,other,database)).rejects.toThrow('existiert bereits');expect(await database.attachments.get(other.id)).toBeUndefined();
 }finally{database.close();await database.delete();}
});
