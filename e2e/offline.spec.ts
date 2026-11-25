import {test,expect} from '@playwright/test';
import {createTestPlan} from './helpers';

test('Pläne und eine laufende Durchführung bleiben nach Offline-Reload nutzbar',async({page})=>{
 await page.goto('./');
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
 await expect(page.getByTestId('offline-status')).toContainText('Offline-Grundfunktionen vorbereitet');
 await page.reload();
 await createTestPlan(page);

 const plan=page.getByRole('article').filter({hasText:'Testplan: Brüche'});
 await page.context().setOffline(true);
 await plan.getByRole('button',{name:'Bearbeiten'}).click();
 await page.getByLabel('Unterrichtstitel').fill('Offline bearbeiteter Plan');
 await page.getByRole('button',{name:'Unterrichtsplan speichern'}).click();
 await expect(page.getByRole('heading',{name:'Offline bearbeiteter Plan'})).toBeVisible();

 const updatedPlan=page.getByRole('article').filter({hasText:'Offline bearbeiteter Plan'});
 await updatedPlan.getByRole('button',{name:'Cockpit öffnen'}).click();
 await page.getByRole('button',{name:'Unterricht starten'}).click();
 await expect(page.getByRole('button',{name:'Pause',exact:true})).toBeVisible();
 const notes=page.locator('details.notes-panel').filter({hasText:'Notizen zu dieser Durchführung'});
 await notes.locator('summary').click();
 await notes.getByLabel('Neue Notiz').fill('Offline verfasste Notiz');
 await notes.getByRole('button',{name:'Notiz speichern'}).click();
 await expect(notes.getByRole('status')).toHaveText('Notiz gespeichert.');

 await page.reload();
 await expect(page.getByRole('button',{name:'Pause',exact:true})).toBeVisible();
 const continuedNotes=page.locator('details.notes-panel').filter({hasText:'Notizen zu dieser Durchführung'});
 await continuedNotes.locator('summary').click();
 await expect(continuedNotes.getByText('Offline verfasste Notiz')).toBeVisible();
 await expect(page.getByTestId('offline-status')).toContainText('Offlinebetrieb');
});
