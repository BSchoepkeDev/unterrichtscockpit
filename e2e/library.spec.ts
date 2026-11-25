import {test,expect} from '@playwright/test';
import {createTestPlan,testPlanTitle} from './helpers';

test('Bibliothek startet ohne Beispieldaten und behält eigene Pläne nach Reload',async({page})=>{
 await page.goto('./');
 await expect(page.getByRole('region',{name:'Unterrichtspläne'}).locator('article')).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Beispieldaten laden'})).toHaveCount(0);
 await createTestPlan(page);
 await expect(page.getByRole('heading',{name:testPlanTitle})).toBeVisible();
 await page.reload();
 await expect(page.getByRole('heading',{name:testPlanTitle})).toBeVisible();
});

test('Navigation und Erscheinungsbild',async({page})=>{await page.goto('./');await page.getByRole('link',{name:'Einstellungen'}).click();await expect(page.getByRole('heading',{name:'Einstellungen'})).toBeVisible();await page.getByLabel('Erscheinungsbild').selectOption('dark');await expect(page.locator('html')).toHaveAttribute('data-theme','dark');await page.reload();await expect(page.locator('html')).toHaveAttribute('data-theme','dark');});
test('Plan erstellen, bearbeiten, duplizieren, suchen und nach Reload prüfen',async({page})=>{await page.goto('./');await page.getByRole('button',{name:'+ Unterrichtsplan erstellen'}).click();await page.getByLabel('Unterrichtstitel').fill('Teststunde Garten');await page.getByRole('button',{name:'+ Punkt hinzufügen'}).click();await page.getByLabel('Titel',{exact:true}).fill('Erste Aufgabe');await page.getByRole('button',{name:'Unterrichtsplan speichern'}).click();await expect(page.getByRole('heading',{name:'Teststunde Garten'})).toBeVisible();await page.getByRole('button',{name:'Bearbeiten'}).click();await page.getByLabel('Unterrichtstitel').fill('Teststunde Wiese');await page.getByRole('button',{name:'Unterrichtsplan speichern'}).click();await expect(page.getByRole('dialog')).toHaveCount(0);await page.getByRole('region',{name:'Unterrichtspläne'}).getByRole('button',{name:'Duplizieren'}).click();await expect(page.locator('article')).toHaveCount(2);await page.reload();await expect(page.locator('article')).toHaveCount(2);await page.getByLabel('Unterrichtspläne suchen').fill('Kopie');await expect(page.locator('article')).toHaveCount(1);});
test('Reset löscht die lokale Datenbank und stellt Standardeinstellungen wieder her',async({page})=>{
 await createTestPlan(page);
 await page.getByRole('link',{name:'Einstellungen'}).click();
 await page.getByLabel('Erscheinungsbild').selectOption('dark');
 page.once('dialog',dialog=>dialog.accept());
 await page.getByRole('button',{name:'Lokale Datenbank löschen und zurücksetzen'}).click();
 await expect(page.getByRole('heading',{name:'Bibliothek'})).toBeVisible();
 await expect(page.getByRole('region',{name:'Unterrichtspläne'}).locator('article')).toHaveCount(0);
 await page.getByRole('link',{name:'Einstellungen'}).click();
 await expect(page.getByLabel('Erscheinungsbild')).toHaveValue('system');
 const counts=await page.evaluate(async()=>{
  const request=indexedDB.open('unterrichtscockpit-v1');
  const database=await new Promise<IDBDatabase>((resolve,reject)=>{request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
  const counts=await Promise.all(Array.from(database.objectStoreNames,name=>new Promise<[string,number]>((resolve,reject)=>{
   const transaction=database.transaction(name,'readonly'),read=transaction.objectStore(name).count();
   read.onsuccess=()=>resolve([name,read.result]);read.onerror=()=>reject(read.error);
  })));
  database.close();return Object.fromEntries(counts);
 });
 expect(counts.plans).toBe(0);expect(counts.sessions).toBe(0);expect(counts.notes).toBe(0);expect(counts.attachments).toBe(0);expect(counts.audio).toBe(0);expect(counts.locks).toBe(0);expect(counts.settings).toBe(1);
});
test('Löschbestätigung schützt Unterrichtspläne',async({page})=>{await page.goto('./');await page.getByRole('button',{name:'+ Unterrichtsplan erstellen'}).click();await page.getByLabel('Unterrichtstitel').fill('Nicht löschen');await page.getByRole('button',{name:'Unterrichtsplan speichern'}).click();page.once('dialog',dialog=>dialog.dismiss());await page.getByRole('button',{name:'Löschen'}).click();await expect(page.getByRole('heading',{name:'Nicht löschen'})).toBeVisible();page.once('dialog',dialog=>dialog.accept());await page.getByRole('button',{name:'Löschen'}).click();await expect(page.locator('article')).toHaveCount(0);});
test('Abbrechen schützt vor versehentlichem Verwerfen',async({page})=>{await page.goto('./');await page.getByRole('button',{name:'+ Unterrichtsplan erstellen'}).click();await page.getByLabel('Unterrichtstitel').fill('Ungespeichert');page.once('dialog',dialog=>dialog.dismiss());await page.getByRole('button',{name:'Abbrechen'}).click();await expect(page.getByRole('dialog')).toBeVisible();page.once('dialog',dialog=>dialog.accept());await page.getByRole('button',{name:'Abbrechen'}).click();await expect(page.getByRole('dialog')).toHaveCount(0);});
test('Punkte lassen sich umordnen und unabhängig duplizieren',async({page})=>{await page.goto('./');await page.getByRole('button',{name:'+ Unterrichtsplan erstellen'}).click();await page.getByLabel('Unterrichtstitel').fill('Abfolge');await page.getByRole('button',{name:'+ Punkt hinzufügen'}).click();await page.getByLabel('Titel',{exact:true}).fill('A');await page.getByRole('button',{name:'+ Punkt hinzufügen'}).click();await page.getByLabel('Titel',{exact:true}).fill('B');await page.getByRole('button',{name:'Punkt 2 nach oben'}).click();await page.locator('.item-editor').first().getByRole('button',{name:'Duplizieren'}).click();await expect(page.locator('.item-editor')).toHaveCount(3);await page.getByRole('button',{name:'Unterrichtsplan speichern'}).click();await expect(page.getByRole('dialog')).toHaveCount(0);await expect(page.locator('article ol li')).toHaveText(['B','B (Kopie)','A']);});
