import { test, expect } from '@playwright/test';

test('Sicherungsdatei wird geprüft, erhält Vorschau und kann bestätigt wiederhergestellt werden', async ({ page }) => {
  await page.goto('./'); await page.getByRole('button', { name: 'Beispieldaten laden' }).click(); await expect(page.locator('article')).toHaveCount(7);
  await page.getByRole('link', { name: 'Datensicherung' }).click();
  const downloadPromise = page.waitForEvent('download'); await page.getByRole('button', { name: 'Sicherung herunterladen' }).click(); const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^Unterrichtscockpit-Sicherung-.*\.ucbackup$/); const path = await download.path(); expect(path).toBeTruthy();
  await page.getByLabel('Sicherungsdatei auswählen').setInputFiles(path!);
  await expect(page.getByRole('heading', { name: /Geprüfte Sicherung/ })).toBeVisible(); await expect(page.getByText(/Plansätze 7/)).toBeVisible();
  await page.getByLabel('Wiederherstellungsart').selectOption('replace'); await page.getByLabel(/Ich bestätige ausdrücklich/).check(); await page.getByRole('button', { name: 'Datenbestand ersetzen' }).click();
  await expect(page.getByRole('status')).toContainText('Wiederherstellung abgeschlossen');
});

test('Beschädigte Sicherung wird vor dem Schreiben abgewiesen', async ({ page }) => {
  await page.goto('./'); await page.getByRole('button', { name: 'Beispieldaten laden' }).click(); await expect(page.locator('article')).toHaveCount(7);
  await page.getByRole('link', { name: 'Datensicherung' }).click();
  await page.getByLabel('Sicherungsdatei auswählen').setInputFiles({ name: 'bad.ucbackup', mimeType: 'application/json', buffer: Buffer.from('{"format":"wrong"}') });
  await expect(page.getByRole('alert')).toContainText('keine Unterrichtscockpit-Sicherung'); await page.getByRole('link', { name: 'Bibliothek' }).click(); await expect(page.locator('article')).toHaveCount(7);
});
