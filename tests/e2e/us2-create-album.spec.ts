import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('US2 — Create an Album and Add Photos', () => {
  test('user creates an album with a name', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /create album/i }).click();
    await page.getByLabel(/album name/i).fill('My Vacation');
    await page.getByRole('button', { name: /^create$/i }).click();
    await expect(page.getByText('My Vacation')).toBeVisible();
  });

  test('shows empty state for new album before adding photos', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /create album/i }).click();
    await page.getByLabel(/album name/i).fill('Empty Album');
    await page.getByRole('button', { name: /^create$/i }).click();
    await expect(page.getByText(/0 photos/i)).toBeVisible();
  });

  test('passes accessibility audit on the create album flow', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /create album/i }).click();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
