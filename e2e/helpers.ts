import {expect,type Page} from '@playwright/test';

export const testPlanTitle='Testplan: Brüche';

export async function createTestPlan(page:Page){
 await page.getByRole('button',{name:/Unterrichtsplan erstellen/}).click();
 const editor=page.getByRole('dialog');
 await editor.getByLabel('Unterrichtstitel').fill(testPlanTitle);
 await editor.getByLabel('Geplante Gesamtdauer (Minuten)').fill('45');
 const points=[
  {title:'Impuls',phase:'Einstieg',minutes:'15'},
  {title:'Arbeitsphase',phase:'Erarbeitung',minutes:'20'},
  {title:'Sicherung',phase:'Sicherung',minutes:'10'},
 ];
 for(const [index,point] of points.entries()){
  await editor.getByRole('button',{name:'+ Punkt hinzufügen'}).click();
  const item=editor.locator('.item-editor').nth(index);
  await item.getByLabel('Titel').fill(point.title);
  await item.getByLabel('Unterrichtsphase').fill(point.phase);
  await item.getByLabel('Dauer (Minuten)').fill(point.minutes);
 }
 await editor.getByRole('button',{name:'Unterrichtsplan speichern'}).click();
 await expect(page.getByRole('heading',{name:testPlanTitle})).toBeVisible();
}
