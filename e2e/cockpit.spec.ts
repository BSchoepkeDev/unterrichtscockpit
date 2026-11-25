import {test,expect} from '@playwright/test';
test('cockpit checkbox, details and reload remain independent',async({page})=>{
 await page.goto('./');
 await page.getByRole('button',{name:'Beispieldaten laden'}).click();
 await page.getByRole('article').filter({hasText:'Beispiel: 45 Minuten – Brüche'}).getByRole('button',{name:'Cockpit öffnen'}).click();
 const check=page.getByRole('checkbox',{name:'Erledigt: Impuls (1)'});
 await expect(check).toBeVisible();
 await check.check();
 await expect(page.getByText('1 von 3 erledigt (33 %)')).toBeVisible();
 await expect(page.getByRole('dialog')).toHaveCount(0);
 await page.getByRole('button',{name:'Details: Impuls (1)'}).click();
 await expect(page.getByRole('dialog')).toBeVisible();
 await page.getByRole('button',{name:'Schließen',exact:true}).click();
 await expect(check).toBeChecked();
 await page.reload();
 await expect(check).toBeChecked();
 await check.uncheck();
 await expect(page.getByText('0 von 3 erledigt (0 %)')).toBeVisible();
});

test('Plan- und Durchführungsnotizen bleiben getrennt und nach Reload erhalten',async({page})=>{
 await page.goto('./');await page.getByRole('button',{name:'Beispieldaten laden'}).click();
 await page.getByRole('article').filter({hasText:'Beispiel: 45 Minuten – Brüche'}).getByRole('button',{name:'Cockpit öffnen'}).click();
 const plan=page.locator('details.notes-panel').filter({hasText:'Notizen zum Unterrichtsplan'}),session=page.locator('details.notes-panel').filter({hasText:'Notizen zu dieser Durchführung'});
 await plan.locator('summary').click();await plan.getByLabel('Neue Notiz').fill('Vorbereitung für alle Durchführungen');await plan.getByRole('button',{name:'Notiz speichern'}).click();
 await session.locator('summary').click();await session.getByLabel('Zuordnung').selectOption({label:'Punkt: Impuls'});await session.getByLabel('Neue Notiz').fill('Beobachtung nur in dieser Stunde');await session.getByRole('button',{name:'Notiz speichern'}).click();
 await expect(plan.getByText('Vorbereitung für alle Durchführungen')).toBeVisible();await expect(session.getByText('Beobachtung nur in dieser Stunde')).toBeVisible();
 await page.reload();
 const reopenedPlan=page.locator('details.notes-panel').filter({hasText:'Notizen zum Unterrichtsplan'}),reopenedSession=page.locator('details.notes-panel').filter({hasText:'Notizen zu dieser Durchführung'});
 await reopenedPlan.locator('summary').click();await expect(reopenedPlan.getByText('Vorbereitung für alle Durchführungen')).toBeVisible();
 await reopenedSession.locator('summary').click();await expect(reopenedSession.getByText('Beobachtung nur in dieser Stunde')).toBeVisible();
});

test('optionale Spracherkennung übernimmt finale Ergebnisse erst nach Nutzeraktion',async({page})=>{
 await page.addInitScript(()=>{Object.defineProperty(window,'SpeechRecognition',{configurable:true,value:class{onresult:any;onend:any;onerror:any;lang='';continuous=false;interimResults=false;start(){const result=Object.assign([{transcript:'Mündliche Beobachtung'}],{isFinal:true});this.onresult?.({resultIndex:0,results:[result]});}stop(){this.onend?.();}abort(){this.onend?.();}}});});
 await page.goto('./');await page.getByRole('button',{name:'Beispieldaten laden'}).click();
 await page.getByRole('article').filter({hasText:'Beispiel: 45 Minuten – Brüche'}).getByRole('button',{name:'Cockpit öffnen'}).click();
 const panel=page.locator('details.notes-panel').filter({hasText:'Notizen zu dieser Durchführung'});await panel.locator('summary').click();
 await panel.getByRole('button',{name:'Direkt diktieren'}).click();await expect(panel.getByLabel('Neue Notiz')).toHaveValue('Mündliche Beobachtung');
 await panel.getByRole('button',{name:'Notiz speichern'}).click();await expect(panel.getByText('Browser-Diktat')).toBeVisible();
});

test('verweigerte Browser-Spracherkennung lässt Tastatureingabe verfügbar',async({page})=>{
 await page.addInitScript(()=>{Object.defineProperty(window,'SpeechRecognition',{configurable:true,value:class{onresult:any;onend:any;onerror:any;lang='';continuous=false;interimResults=false;start(){this.onerror?.({error:'not-allowed'});this.onend?.();}stop(){this.onend?.();}abort(){this.onend?.();}}});});
 await page.goto('./');await page.getByRole('button',{name:'Beispieldaten laden'}).click();
 await page.getByRole('article').filter({hasText:'Beispiel: 45 Minuten – Brüche'}).getByRole('button',{name:'Cockpit öffnen'}).click();
 const panel=page.locator('details.notes-panel').filter({hasText:'Notizen zu dieser Durchführung'});await panel.locator('summary').click();
 await panel.getByRole('button',{name:'Direkt diktieren'}).click();await expect(panel.getByRole('status')).toContainText('wurde verweigert');
 await expect(panel.getByLabel('Neue Notiz')).toBeEnabled();await panel.getByLabel('Neue Notiz').fill('Weiter per Tastatur');await expect(panel.getByRole('button',{name:'Notiz speichern'})).toBeEnabled();
});

test('ohne Web Speech API bleibt das Diktatfeld vollständig nutzbar',async({page})=>{
 await page.addInitScript(()=>{Object.defineProperty(window,'SpeechRecognition',{configurable:true,value:undefined});Object.defineProperty(window,'webkitSpeechRecognition',{configurable:true,value:undefined});});
 await page.goto('./');await page.getByRole('button',{name:'Beispieldaten laden'}).click();
 await page.getByRole('article').filter({hasText:'Beispiel: 45 Minuten – Brüche'}).getByRole('button',{name:'Cockpit öffnen'}).click();
 const panel=page.locator('details.notes-panel').filter({hasText:'Notizen zu dieser Durchführung'});await panel.locator('summary').click();
 await expect(panel.getByText('Direkte Browser-Spracherkennung ist nicht verfügbar.')).toBeVisible();await expect(panel.getByRole('button',{name:'Direkt diktieren'})).toHaveCount(0);
 await panel.getByLabel('Neue Notiz').fill('iPad-Tastaturdiktat oder Texteingabe');await expect(panel.getByRole('button',{name:'Notiz speichern'})).toBeEnabled();
});
