import {test,expect,type Page} from '@playwright/test';
import {PDFDocument,StandardFonts} from 'pdf-lib';

async function mixedPdf(page:Page):Promise<Buffer>{
 const png=await page.evaluate(()=>{const canvas=document.createElement('canvas');canvas.width=1500;canvas.height=500;const context=canvas.getContext('2d')!;context.fillStyle='white';context.fillRect(0,0,canvas.width,canvas.height);context.fillStyle='black';context.font='bold 78px Arial';context.fillText('2. Versuch: Gescannte Phase',100,150);context.font='bold 66px Arial';context.fillText('Arbeitsauftrag: Beobachtung notieren',100,280);context.fillText('Dauer: 10 Minuten',100,400);return canvas.toDataURL('image/png');});
 const pdf=await PDFDocument.create();const font=await pdf.embedFont(StandardFonts.Helvetica);const first=pdf.addPage([595,842]);first.drawText('# Synthetischer Importtest',{x:55,y:780,size:18,font});first.drawText('Phase 1: Einstieg 5 Min.',{x:55,y:735,size:13,font});first.drawText('Arbeitsauftrag: Nenne ein erstes Beispiel.',{x:55,y:705,size:13,font});first.drawText('Ziel: Die Lernenden vergleichen verschiedene Beobachtungen',{x:55,y:675,size:11,font});first.drawText('und beschreiben das Ergebnis anschliessend mit eigenen Worten.',{x:55,y:655,size:11,font});first.drawImage(await pdf.embedPng(png),{x:55,y:420,width:485,height:162});
 const scan=pdf.addPage([595,842]);const image=await pdf.embedPng(png);scan.drawImage(image,{x:45,y:560,width:505,height:168});
 const last=pdf.addPage([595,842]);last.drawText('3. Sicherung 08:15-08:25',{x:55,y:780,size:16,font});last.drawText('Materialien: Karten und Tafel',{x:55,y:745,size:12,font});last.drawText('Die Lerngruppe erklaert die beobachtete Veraenderung und nennt offene Fragen.',{x:55,y:715,size:12,font});return Buffer.from(await pdf.save());
}


test('Textdatei wird geprüft, atomar gespeichert und Original bleibt nach Reload verfügbar',async({page})=>{
 await page.goto('./');await expect(page.getByText(/^Version 0\.7\.0 · Build /)).toBeVisible();await page.getByRole('link',{name:'Import',exact:true}).click();
 await page.locator('input[type=file]').setInputFiles({name:'Naturstunde.txt',mimeType:'text/plain',buffer:Buffer.from('# Naturstunde\nPhase 1: Einstieg · 5 Min.\nArbeitsauftrag: Beobachte den Becher.\nMaterialien: Glas, Wasser\n')});
 await expect(page.getByRole('heading',{name:'Vorschau bearbeiten'})).toBeVisible();await expect(page.getByLabel('Unterrichtstitel')).toHaveValue('Naturstunde');
 const first=page.locator('.import-item').first();await first.getByLabel('Inhalt').fill('Beobachte den Becher. || Notiere die Veränderung.');await first.getByRole('button',{name:'Punkt teilen'}).click();await first.getByLabel(/Teilungsstelle/).fill('Beobachte den Becher. || Notiere die Veränderung.');await first.getByRole('button',{name:'An dieser Stelle teilen'}).click();await expect(page.locator('.import-item')).toHaveCount(2);await page.locator('.import-item').nth(1).locator('summary').click();await page.locator('.import-item').nth(1).getByLabel('Titel').fill('Notiz');
 await page.locator('.import-item').nth(1).getByRole('button',{name:'Nach oben'}).click();await page.locator('.import-item').first().getByRole('button',{name:'Mit nächstem zusammenführen'}).click();await expect(page.locator('.import-item')).toHaveCount(1);
 await page.getByRole('button',{name:'Im Planeditor weiterbearbeiten'}).click();await expect(page.getByRole('dialog')).toBeVisible();await page.getByRole('button',{name:'Unterrichtsplan speichern'}).click();
 const card=page.locator('article').filter({has:page.getByRole('heading',{name:'Naturstunde'})});await expect(card.getByRole('link',{name:'Originaldatei: Naturstunde.txt'})).toBeVisible();await expect(card.getByText('1 Unterrichtspunkte')).toBeVisible();
 await page.reload();const reloaded=page.locator('article').filter({has:page.getByRole('heading',{name:'Naturstunde'})});const original=reloaded.getByRole('link',{name:'Originaldatei: Naturstunde.txt'});await expect(original).toBeVisible();await expect(original).toHaveAttribute('download','Naturstunde.txt');
 await reloaded.getByRole('button',{name:'Cockpit öffnen'}).click();await expect(page.getByRole('heading',{level:2,name:'Unterrichtscockpit'})).toBeVisible();await expect(page.getByText(/1 · Einstieg/)).toBeVisible();
});

test('mehrseitiges gemischtes PDF extrahiert Textebene und scannt die Bildseite lokal',async({page})=>{
 test.setTimeout(180_000);await page.goto('./');await page.getByRole('link',{name:'Import',exact:true}).click();
 await page.locator('input[type=file]').setInputFiles({name:'stage6-mixed.pdf',mimeType:'application/pdf',buffer:await mixedPdf(page)});
 const outcome=await Promise.race([page.getByRole('heading',{name:'Vorschau bearbeiten'}).waitFor({state:'visible',timeout:150_000}).then(()=> 'preview'),page.getByRole('alert').waitFor({state:'visible',timeout:150_000}).then(()=> 'error')]);if(outcome==='error')throw new Error((await page.getByRole('alert').textContent())??'PDF import failed');expect(outcome).toBe('preview');
 await expect(page.getByText(/3 Seite\(n\)/)).toBeVisible();await expect(page.getByText(/1 per OCR gelesen/)).toBeVisible();
 await page.getByText('Vollständiger erkannter Quelltext').click();await expect(page.getByRole('heading',{name:'Seite 2 · OCR'})).toBeVisible();
 await expect(page.locator('.import-source')).toContainText('Gescannte Phase');
 await expect(page.locator('.import-source section').first()).not.toContainText('Gescannte Phase');
 await expect(page.getByText(/OCR wurde auf Seite 2 lokal ausgeführt/)).toBeVisible();
});

test('Vollseiten-OCR liest auch Bildtext auf einer Seite mit auswählbarem Text',async({page})=>{
 test.setTimeout(180_000);await page.goto('./');await page.getByRole('link',{name:'Import',exact:true}).click();
 await expect(page.getByRole('link',{name:'Importvorlage für Unterrichtspläne herunterladen'})).toHaveAttribute('download');
 await page.getByLabel(/OCR auf allen PDF-Seiten ausführen/).check();
 await page.locator('input[type=file]').setInputFiles({name:'stage6-mixed-full-ocr.pdf',mimeType:'application/pdf',buffer:await mixedPdf(page)});
 const outcome=await Promise.race([page.getByRole('heading',{name:'Vorschau bearbeiten'}).waitFor({state:'visible',timeout:150_000}).then(()=> 'preview'),page.getByRole('alert').waitFor({state:'visible',timeout:150_000}).then(()=> 'error')]);if(outcome==='error')throw new Error((await page.getByRole('alert').textContent())??'PDF import failed');expect(outcome).toBe('preview');
 await expect(page.getByText(/3 Seite\(n\) · 3 per OCR gelesen/)).toBeVisible();
 await page.getByText('Vollständiger erkannter Quelltext').click();await expect(page.locator('.import-source section').first()).toContainText(/Gescannte Phase/i);
});

test('Abbruch und ungültige PDF-Datei speichern keinen Plan',async({page})=>{
 await page.goto('./');await page.getByRole('link',{name:'Import',exact:true}).click();
 await page.locator('input[type=file]').setInputFiles({name:'gross.pdf',mimeType:'application/pdf',buffer:await mixedPdf(page)});
 await page.getByRole('button',{name:'Import abbrechen'}).click();await expect(page.getByText('Import abgebrochen. Es wurde nichts gespeichert.')).toBeVisible();
 await page.getByRole('link',{name:'Bibliothek'}).click();await expect(page.locator('article')).toHaveCount(0);
 await page.getByRole('link',{name:'Import',exact:true}).click();await page.locator('input[type=file]').setInputFiles({name:'defekt.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-broken')});
 await expect(page.getByRole('alert')).toBeVisible();await page.getByRole('link',{name:'Bibliothek'}).click();await expect(page.locator('article')).toHaveCount(0);
 await page.getByRole('link',{name:'Import',exact:true}).click();await page.locator('input[type=file]').setInputFiles({name:'leer.txt',mimeType:'text/plain',buffer:Buffer.alloc(0)});await expect(page.getByRole('alert')).toContainText('Datei ist leer');
});

test('deutsche OCR-Ressourcen bleiben nach PWA-Einrichtung offline verfügbar',async({page})=>{
 test.setTimeout(90_000);await page.goto('./');await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await page.reload();await page.context().setOffline(true);
 const statuses=await page.evaluate(async()=>Promise.all(['./tessdata/deu.traineddata.gz','./ocr/tesseract-core-lstm.wasm','./ocr/tesseract-core-simd-lstm.wasm','./ocr/tesseract.worker.min.js'].map(async path=>(await fetch(path)).status)));
 expect(statuses).toEqual([200,200,200,200]);await page.reload();await expect(page.getByRole('heading',{name:'Bibliothek',level:2})).toBeVisible();
});
