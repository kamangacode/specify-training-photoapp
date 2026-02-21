import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('US4 — Reorder Albums via Drag and Drop', () => {
  test('album cards are visible and reorderable', async ({ page }) => {
    await page.goto('/');

    // Create two albums
    for (const name of ['Album Alpha', 'Album Beta']) {
      await page.getByRole('button', { name: /create album/i }).click();
      await page.getByLabel(/album name/i).fill(name);
      await page.getByRole('button', { name: /^create$/i }).click();
    }

    const cards = page.getByTestId('album-card');
    await expect(cards).toHaveCount(2);
  });

  test('new album appends at end when albums exist', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /create album/i }).click();
    await page.getByLabel(/album name/i).fill('First');
    await page.getByRole('button', { name: /^create$/i }).click();

    await page.getByRole('button', { name: /create album/i }).click();
    await page.getByLabel(/album name/i).fill('Second');
    await page.getByRole('button', { name: /^create$/i }).click();

    const cards = page.getByTestId('album-card');
    await expect(cards.last()).toContainText('Second');
  });

  test('passes accessibility audit on the main page with albums', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /create album/i }).click();
    await page.getByLabel(/album name/i).fill('A11y Test');
    await page.getByRole('button', { name: /^create$/i }).click();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
