import {test,expect} from '@playwright/test';
import {createTestPlan} from './helpers';

test('Plan-PDF kann kompakt erzeugt und heruntergeladen werden',async({page})=>{
 await page.goto('./');await createTestPlan(page);
 const card=page.getByRole('article').filter({hasText:'Testplan: Brüche'});
 await card.getByRole('button',{name:'PDF exportieren'}).click();
 await expect(page.getByRole('dialog',{name:'PDF exportieren'})).toBeVisible();
 await page.getByLabel('Umfang').selectOption('compact');
 const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Herunterladen'}).click();
 expect((await downloadPromise).suggestedFilename()).toContain('.pdf');
 await expect(page.getByRole('status')).toContainText('heruntergeladen');
});

test('Durchführungs-PDF lässt sich über das Cockpit anfordern',async({page})=>{
 await page.goto('./');await createTestPlan(page);
 await page.getByRole('article').filter({hasText:'Testplan: Brüche'}).getByRole('button',{name:'Cockpit öffnen'}).click();
 await page.getByRole('button',{name:'PDF exportieren'}).click();
 await expect(page.getByText('Durchführung: Testplan: Brüche')).toBeVisible();
 await page.getByLabel('Exportgegenstand').selectOption('plan');
 await expect(page.getByText('Plan: Testplan: Brüche')).toBeVisible();
 await page.getByLabel('Exportgegenstand').selectOption('session');
 const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Herunterladen'}).click();
 expect((await downloadPromise).suggestedFilename()).toContain('durchfuehrung.pdf');
});
