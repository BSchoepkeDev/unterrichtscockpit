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
