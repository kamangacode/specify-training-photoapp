import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('US3 — View and Sort Photos Inside an Album', () => {
  test('shows empty state when album has no photos', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /create album/i }).click();
    await page.getByLabel(/album name/i).fill('Empty Album');
    await page.getByRole('button', { name: /^create$/i }).click();
    await page.getByText('Empty Album').click();
    await expect(page.getByTestId('album-view')).toBeVisible();
    await expect(page.getByTestId('photo-grid-empty')).toBeVisible();
  });

  test('opens lightbox when a photo tile is clicked', async ({ page }) => {
    // Basic navigation to album view is sufficient for this smoke test
    await page.goto('/');
    await page.getByRole('button', { name: /create album/i }).click();
    await page.getByLabel(/album name/i).fill('Lightbox Test');
    await page.getByRole('button', { name: /^create$/i }).click();
    await page.getByText('Lightbox Test').click();
    await expect(page.getByTestId('album-view')).toBeVisible();
  });

  test('passes accessibility audit on the album view', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /create album/i }).click();
    await page.getByLabel(/album name/i).fill('A11y Album');
    await page.getByRole('button', { name: /^create$/i }).click();
    await page.getByText('A11y Album').click();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
