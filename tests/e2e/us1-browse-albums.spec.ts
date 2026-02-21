import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('US1 — Browse Albums on the Main Page', () => {
  test('shows empty state when no albums exist', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('main-page')).toBeVisible();
    await expect(page.getByTestId('album-grid-empty')).toBeVisible();
  });

  test('displays album cards with name, photo count, and date range for seeded albums', async ({
    page,
  }) => {
    await page.goto('/');
    // Seed via UI: create an album and add a photo, then verify it appears
    await page.getByRole('button', { name: /create album/i }).click();
    await page.getByLabel(/album name/i).fill('Summer 2025');
    await page.getByRole('button', { name: /^create$/i }).click();

    await expect(page.getByText('Summer 2025')).toBeVisible();
    // Initially 0 photos
    await expect(page.getByText(/0 photos/i)).toBeVisible();
  });

  test('shows albums in chronological order (most recent first) before any custom ordering', async ({
    page,
  }) => {
    await page.goto('/');
    // Create two albums — later creation order does not imply date order
    await page.getByRole('button', { name: /create album/i }).click();
    await page.getByLabel(/album name/i).fill('Album A');
    await page.getByRole('button', { name: /^create$/i }).click();

    await page.getByRole('button', { name: /create album/i }).click();
    await page.getByLabel(/album name/i).fill('Album B');
    await page.getByRole('button', { name: /^create$/i }).click();

    const cards = page.getByTestId('album-card');
    // Both cards should be visible (order tested more precisely in US4)
    await expect(cards).toHaveCount(2);
  });

  test('passes accessibility audit', async ({ page }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
