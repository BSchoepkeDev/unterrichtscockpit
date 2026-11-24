import {test,expect} from '@playwright/test';

async function openExample(page:import('@playwright/test').Page){
 await page.goto('./');
 await page.getByRole('button',{name:'Beispieldaten laden'}).click();
 await page.getByRole('article').filter({hasText:'Beispiel: 45 Minuten – Brüche'})
   .getByRole('button',{name:'Cockpit öffnen'}).click();
 await expect(page.getByRole('button',{name:'Unterricht starten'})).toBeVisible();
}
test('Start, Pause, automatischer Phasenwechsel und Reload behalten den Timer',async({page})=>{
 await openExample(page);
 await page.getByRole('button',{name:'Unterricht starten'}).click();
 await expect(page.getByRole('button',{name:'Pause',exact:true})).toBeVisible();
 const first=page.getByRole('article').filter({has:page.getByRole('button',{name:'Details: Impuls (1)'})});
 const second=page.getByRole('article').filter({has:page.getByRole('button',{name:'Details: Arbeitsphase (2)'})});
 await expect(first.getByText('Aktive Phase')).toBeVisible();
 await first.getByRole('button',{name:'Details: Impuls (1)'}).click();
 await expect(page.getByRole('dialog')).toBeVisible();
 await page.getByRole('dialog').getByRole('button',{name:'Schließen'}).click();
 await expect(first.getByText('Aktive Phase')).toBeVisible();
 await page.getByRole('button',{name:'Pause',exact:true}).click();
 await expect(page.getByRole('button',{name:'Fortsetzen'})).toBeVisible();
 const paused=await page.getByTestId('total-time').textContent();
 await page.waitForTimeout(1200);
 await expect(page.getByTestId('total-time')).toHaveText(paused!);
 await page.getByRole('button',{name:'Fortsetzen'}).click();
 await first.getByRole('checkbox',{name:'Erledigt: Impuls (1)'}).check();
 await expect(second.getByText('Aktive Phase')).toBeVisible();
 await expect(first.getByRole('checkbox')).toBeChecked();
 await page.reload();
 await expect(page.getByRole('button',{name:'Pause',exact:true})).toBeVisible();
 await expect(second.getByText('Aktive Phase')).toBeVisible();
 await expect(first.getByRole('checkbox')).toBeChecked();
});
test('Unterrichtsende ist bestätigt und lässt Sitzung gespeichert',async({page})=>{
 await openExample(page);
 await page.getByRole('button',{name:'Unterricht starten'}).click();
 page.once('dialog',dialog=>dialog.accept());
 await page.getByRole('button',{name:'Unterricht beenden'}).click();
 await expect(page.getByText('Wähle einen Unterrichtsplan, um die Übersicht zu öffnen.')).toBeVisible();
});
test('Zeitwarnungen und Wake-Lock-Einstellung bleiben nach Neuladen erhalten',async({page})=>{
 await page.goto('./');
 await page.getByRole('link',{name:'Einstellungen'}).click();
 const yellow=page.getByRole('spinbutton',{name:'Gelbe Warnung nach Überschreitung (Sekunden)'});
 const red=page.getByRole('spinbutton',{name:'Rote Warnung ab Überschreitung (Sekunden)'});
 await expect(yellow).toHaveValue('0');
 await expect(red).toHaveValue('180');
 await red.fill('240');
 await yellow.fill('20');
 const wake=page.getByRole('combobox',{name:'Bildschirmaktivhaltung'});
 await wake.selectOption('off');
 await page.reload();
 await expect(yellow).toHaveValue('20');
 await expect(red).toHaveValue('240');
 await expect(wake).toHaveValue('off');
});
