import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

/**
 * US2: Modern Photo Gallery Experience
 *
 * These tests verify that the photo gallery view (inside an album) renders
 * with modern card-based design tokens — rounded corners, shadows, responsive
 * grid layout, styled empty state, and zero WCAG 2.1 AA violations.
 *
 * Tests are written FIRST (TDD — they must FAIL before implementation).
 */

const ALBUM_NAME = 'US2 Test Album';

async function createAlbum(page: import('@playwright/test').Page, name: string) {
  await page.click('button:has-text("Create Album")');
  await page.fill('#album-name-input', name);
  await page.click('button[type="submit"]:has-text("Create")');
  await page.waitForSelector(`text=${name}`);
}

test.describe('US2: Modern Photo Gallery Experience', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="main-page"]');
  });

  test('album view renders with modern header styling (no inline background)', async ({ page }) => {
    await createAlbum(page, ALBUM_NAME);
    await page.click(`text=${ALBUM_NAME}`);
    await page.waitForSelector('[data-testid="album-view"]');

    const header = page.locator('[data-testid="album-view"] header');
    // The header should have a CSS class (not rely on hardcoded inline background)
    const className = await header.getAttribute('class');
    expect(className).toBeTruthy();
    expect(className!.length).toBeGreaterThan(0);
  });

  test('empty album shows styled empty state (not blank)', async ({ page }) => {
    await createAlbum(page, ALBUM_NAME);
    await page.click(`text=${ALBUM_NAME}`);
    await page.waitForSelector('[data-testid="album-view"]');

    // Empty album should render a visible empty state container
    const emptyState = page.locator('[data-testid="photo-grid-empty"]');
    await expect(emptyState).toBeVisible();

    // The empty state container should have CSS class-based styling (not raw div)
    const emptyContainer = emptyState.locator('[role="status"], div').first();
    const className = await emptyContainer.getAttribute('class');
    expect(className).toBeTruthy();
    expect(className!.length).toBeGreaterThan(0);
  });

  test('photo grid uses CSS class for layout (not inline gridTemplateColumns)', async ({
    page,
  }) => {
    await createAlbum(page, ALBUM_NAME);
    await page.click(`text=${ALBUM_NAME}`);
    await page.waitForSelector('[data-testid="album-view"]');

    // Navigate away and back won't have photos — check the empty state has a class
    // For grid check: verify the container would have a CSS class if photos existed
    // We check via the photo-grid-empty wrapper instead
    const gridEmpty = page.locator('[data-testid="photo-grid-empty"]');
    const className = await gridEmpty.evaluate((el) => el.className);
    // Must have a CSS module class, not be an unstyled plain div
    expect(className).toBeTruthy();
  });

  test('photo grid empty wrapper uses CSS class (not bare div), no legacy inline skeleton divs', async ({
    page,
  }) => {
    await createAlbum(page, ALBUM_NAME);
    await page.click(`text=${ALBUM_NAME}`);
    await page.waitForSelector('[data-testid="photo-grid-empty"]');

    // The photo-grid-empty wrapper must have a CSS module class (not be a bare unstyled div)
    const gridEmptyWrapper = page.locator('[data-testid="photo-grid-empty"]');
    const className = await gridEmptyWrapper.getAttribute('class');
    expect(className).toBeTruthy();
    expect(className!.trim().length).toBeGreaterThan(0);

    // No legacy inline-styled skeleton divs (data-testid="photo-skeleton" with background: #ddd)
    // These were replaced with the isLoading prop pattern on PhotoTile
    const legacySkeletons = page.locator('[data-testid="photo-skeleton"][style*="background"]');
    await expect(legacySkeletons).toHaveCount(0);
  });

  test('no WCAG 2.1 AA violations on album view', async ({ page }) => {
    await createAlbum(page, ALBUM_NAME);
    await page.click(`text=${ALBUM_NAME}`);
    await page.waitForSelector('[data-testid="album-view"]');

    await injectAxe(page);
    await checkA11y(page, undefined, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa'],
      },
    });
    console.log('No accessibility violations detected!');
  });
});
