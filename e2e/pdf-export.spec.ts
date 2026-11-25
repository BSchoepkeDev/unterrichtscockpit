import {test,expect} from '@playwright/test';

test('Plan-PDF kann kompakt erzeugt und heruntergeladen werden',async({page})=>{
 await page.goto('./');await page.getByRole('button',{name:'Beispieldaten laden'}).click();
 const card=page.getByRole('article').filter({hasText:'Beispiel: 45 Minuten – Brüche'});
 await card.getByRole('button',{name:'PDF exportieren'}).click();
 await expect(page.getByRole('dialog',{name:'PDF exportieren'})).toBeVisible();
 await page.getByLabel('Umfang').selectOption('compact');
 const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Herunterladen'}).click();
 expect((await downloadPromise).suggestedFilename()).toContain('.pdf');
 await expect(page.getByRole('status')).toContainText('heruntergeladen');
});

test('Durchführungs-PDF lässt sich über das Cockpit anfordern',async({page})=>{
 await page.goto('./');await page.getByRole('button',{name:'Beispieldaten laden'}).click();
 await page.getByRole('article').filter({hasText:'Beispiel: 45 Minuten – Brüche'}).getByRole('button',{name:'Cockpit öffnen'}).click();
 await page.getByRole('button',{name:'PDF exportieren'}).click();
 await expect(page.getByText('Durchführung: Beispiel: 45 Minuten – Brüche')).toBeVisible();
 await page.getByLabel('Exportgegenstand').selectOption('plan');
 await expect(page.getByText('Plan: Beispiel: 45 Minuten – Brüche')).toBeVisible();
 await page.getByLabel('Exportgegenstand').selectOption('session');
 const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Herunterladen'}).click();
 expect((await downloadPromise).suggestedFilename()).toContain('durchfuehrung.pdf');
});
