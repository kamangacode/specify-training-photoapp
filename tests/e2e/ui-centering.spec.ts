import { test, expect } from '@playwright/test';

/**
 * UI Centering — E2E Acceptance Tests
 * Feature: 002-ui-centering
 *
 * US1 — Centered Content Layout (T005)
 * Scenarios: US1-01 to US1-05
 * Contract: specs/002-ui-centering/contracts/e2e-scenarios.md
 */

async function createAlbum(page: import('@playwright/test').Page, name: string) {
  await page.getByRole('button', { name: /create album/i }).click();
  await page.getByLabel(/album name/i).fill(name);
  await page.getByRole('button', { name: /^create$/i }).click();
  await page.waitForSelector(`text=${name}`);
}

test.describe('US1 — Centered Content Layout', () => {
  // -----------------------------------------------------------------------
  // US1-01: Main page content centered on wide viewport (1440×900)
  // -----------------------------------------------------------------------
  test('US1-01: album grid is horizontally centered on 1440px viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForSelector('[data-testid="main-page"]');

    await createAlbum(page, 'US1-01 Album');

    // The .main container wraps the album grid
    const mainContainer = page.locator('[data-testid="main-page"] > main, [data-testid="main-content"]').first();

    // Fallback: locate the element that holds the album cards
    const albumGrid = page.locator('[data-testid="album-grid"], [data-testid="album-grid-empty"]').first();
    const boundingBox = await albumGrid.boundingBox();
    expect(boundingBox).not.toBeNull();

    const viewportWidth = 1440;
    const leftOffset = boundingBox!.x;
    const rightOffset = viewportWidth - (boundingBox!.x + boundingBox!.width);

    // Content must not span full viewport — there should be margins
    expect(boundingBox!.width).toBeLessThan(viewportWidth);
    // Left and right offsets are approximately equal (within 2px tolerance)
    expect(Math.abs(leftOffset - rightOffset)).toBeLessThanOrEqual(2);
  });

  // -----------------------------------------------------------------------
  // US1-02: Main page is full-width on mobile (375×812)
  // -----------------------------------------------------------------------
  test('US1-02: album grid is near full-width on 375px mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForSelector('[data-testid="main-page"]');

    await createAlbum(page, 'US1-02 Album');

    const albumGrid = page.locator('[data-testid="album-grid"], [data-testid="album-grid-empty"]').first();
    const boundingBox = await albumGrid.boundingBox();
    expect(boundingBox).not.toBeNull();

    // On mobile the content should be at least viewport width minus ~30px padding
    expect(boundingBox!.width).toBeGreaterThanOrEqual(375 - 30);
  });

  // -----------------------------------------------------------------------
  // US1-03: No horizontal scroll at any viewport width
  // -----------------------------------------------------------------------
  test('US1-03: no horizontal scroll at various viewport widths', async ({ page }) => {
    const viewports = [320, 375, 640, 768, 1024, 1440, 1920, 2560];

    for (const width of viewports) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await page.waitForSelector('[data-testid="main-page"]');

      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(hasHorizontalScroll, `horizontal scroll at viewport width ${width}px`).toBe(false);
    }
  });

  // -----------------------------------------------------------------------
  // US1-05: Content has min 16px padding on tablet viewport (768×1024)
  // -----------------------------------------------------------------------
  test('US1-05: album grid has at least 16px padding from viewport edges on 768px tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForSelector('[data-testid="main-page"]');

    await createAlbum(page, 'US1-05 Album');

    const albumGrid = page.locator('[data-testid="album-grid"], [data-testid="album-grid-empty"]').first();
    const boundingBox = await albumGrid.boundingBox();
    expect(boundingBox).not.toBeNull();

    const leftPadding = boundingBox!.x;
    const rightPadding = 768 - (boundingBox!.x + boundingBox!.width);

    expect(leftPadding).toBeGreaterThanOrEqual(16);
    expect(rightPadding).toBeGreaterThanOrEqual(16);
  });

  // -----------------------------------------------------------------------
  // US1-04: Album view photo grid centered on wide viewport (1440×900)
  // -----------------------------------------------------------------------
  test('US1-04: photo grid is horizontally centered in album view on 1440px viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForSelector('[data-testid="main-page"]');

    await createAlbum(page, 'US1-04 Album');

    // Open the album
    await page.getByText('US1-04 Album').click();
    await page.waitForSelector('[data-testid="album-view"]');

    // The .body container wraps the photo grid (or empty state)
    const photoGrid = page.locator('[data-testid="photo-grid"], [data-testid="photo-grid-empty"]').first();
    const boundingBox = await photoGrid.boundingBox();
    expect(boundingBox).not.toBeNull();

    const viewportWidth = 1440;
    const leftOffset = boundingBox!.x;
    const rightOffset = viewportWidth - (boundingBox!.x + boundingBox!.width);

    // Content must not fill the entire viewport
    expect(boundingBox!.width).toBeLessThan(viewportWidth);
    // Left and right margins are approximately equal (within 2px tolerance)
    expect(Math.abs(leftOffset - rightOffset)).toBeLessThanOrEqual(2);
  });
});
