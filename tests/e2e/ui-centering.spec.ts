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

/**
 * US2 — Centered Page Headers & Toolbar (T012)
 * Scenarios: US2-01 to US2-03
 * Contract: specs/002-ui-centering/contracts/e2e-scenarios.md
 */
test.describe('US2 — Centered Page Headers & Toolbar', () => {
  // -----------------------------------------------------------------------
  // US2-01: Toolbar inner wrapper aligns with album grid on wide screen
  // -----------------------------------------------------------------------
  test('US2-01: toolbar inner wrapper left edge aligns with album grid left edge on 1440px viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForSelector('[data-testid="main-page"]');

    await createAlbum(page, 'US2-01 Album');

    // The toolbarInner div is the first child of the toolbar
    const toolbarInner = page.locator('[data-testid="toolbar"] > div').first();
    const albumGrid = page.locator('[data-testid="album-grid"], [data-testid="album-grid-empty"]').first();

    const toolbarBox = await toolbarInner.boundingBox();
    const gridBox = await albumGrid.boundingBox();

    expect(toolbarBox).not.toBeNull();
    expect(gridBox).not.toBeNull();

    // Toolbar inner wrapper left edge must align with album grid left edge (within 2px)
    expect(Math.abs(toolbarBox!.x - gridBox!.x)).toBeLessThanOrEqual(2);
  });

  // -----------------------------------------------------------------------
  // US2-02: Album view header aligns with photo grid on wide screen
  // -----------------------------------------------------------------------
  test('US2-02: album view header inner left edge aligns with photo grid left edge on 1440px viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForSelector('[data-testid="main-page"]');

    await createAlbum(page, 'US2-02 Album');

    // Open the album
    await page.getByText('US2-02 Album').click();
    await page.waitForSelector('[data-testid="album-view"]');

    // The headerInner div is the first child of the album view header
    const headerInner = page.locator('[data-testid="album-view"] header > div').first();
    const photoGrid = page.locator('[data-testid="photo-grid"], [data-testid="photo-grid-empty"]').first();

    const headerBox = await headerInner.boundingBox();
    const gridBox = await photoGrid.boundingBox();

    expect(headerBox).not.toBeNull();
    expect(gridBox).not.toBeNull();

    // Header inner container left edge must align with photo grid left edge (within 2px)
    expect(Math.abs(headerBox!.x - gridBox!.x)).toBeLessThanOrEqual(2);
  });

  // -----------------------------------------------------------------------
  // US2-03: Trash page header back button aligns with trash list on wide screen
  // -----------------------------------------------------------------------
  test('US2-03: trash page header back button left edge aligns with trash content left edge on 1440px viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForSelector('[data-testid="main-page"]');

    // Navigate to trash view
    await page.getByRole('button', { name: /open trash/i }).click();
    await page.waitForSelector('[data-testid="trash-page"]');

    // Back button in the trash page header
    const backButton = page.getByRole('button', { name: /back to albums/i });
    const backBox = await backButton.boundingBox();
    expect(backBox).not.toBeNull();

    // Align against the trash content area (items or empty state)
    const trashContent = page.locator('[data-testid="trash-view"], [data-testid="trash-view-empty"]').first();
    const trashBox = await trashContent.boundingBox();
    expect(trashBox).not.toBeNull();

    // Back button left edge must align with trash content left edge (within 2px)
    expect(Math.abs(backBox!.x - trashBox!.x)).toBeLessThanOrEqual(2);
  });
});
