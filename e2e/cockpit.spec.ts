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
