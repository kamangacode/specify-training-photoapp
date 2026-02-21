import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('US5 — Manage Albums and Photos', () => {
  test('user can create and then the main page shows unsaved indicator', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /create album/i }).click();
    await page.getByLabel(/album name/i).fill('Managed Album');
    await page.getByRole('button', { name: /^create$/i }).click();
    await expect(page.getByRole('status', { name: /unsaved/i })).toBeVisible();
  });

  test('trash view is accessible from main page toolbar', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /trash/i }).click();
    await expect(page.getByTestId('trash-page')).toBeVisible();
  });

  test('passes accessibility audit on the trash page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /trash/i }).click();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
