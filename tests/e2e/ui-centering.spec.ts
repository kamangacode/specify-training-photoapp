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

/**
 * US3 — Centered Empty States & Dialogs (T016 + T016b)
 * Scenarios: US3-01 to US3-04
 * Contract: specs/002-ui-centering/contracts/e2e-scenarios.md
 */
test.describe('US3 — Centered Empty States & Dialogs', () => {
  // -----------------------------------------------------------------------
  // US3-01: Empty album list is horizontally centered on wide viewport
  // -----------------------------------------------------------------------
  test('US3-01: empty album list empty state is horizontally centered on 1440px viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForSelector('[data-testid="main-page"]');

    // Ensure there are no albums so the empty state is shown
    // (fresh app state has no albums by default)
    const emptyWrapper = page.locator('[data-testid="album-grid-empty"]');
    await emptyWrapper.waitFor({ state: 'visible' });

    const emptyState = emptyWrapper.locator('[role="status"]');
    const boundingBox = await emptyState.boundingBox();
    expect(boundingBox).not.toBeNull();

    const viewportWidth = 1440;
    const leftOffset = boundingBox!.x;
    const rightOffset = viewportWidth - (boundingBox!.x + boundingBox!.width);

    // Empty state must be horizontally centered (within 4px tolerance)
    expect(Math.abs(leftOffset - rightOffset)).toBeLessThanOrEqual(4);
  });

  // -----------------------------------------------------------------------
  // US3-02: Empty album view (no photos) is horizontally centered on wide viewport
  // -----------------------------------------------------------------------
  test('US3-02: empty photo grid empty state is horizontally centered on 1440px viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForSelector('[data-testid="main-page"]');

    // Create an album (it will have no photos)
    await createAlbum(page, 'US3-02 Empty Album');

    // Open the album
    await page.getByText('US3-02 Empty Album').click();
    await page.waitForSelector('[data-testid="album-view"]');

    const emptyWrapper = page.locator('[data-testid="photo-grid-empty"]');
    await emptyWrapper.waitFor({ state: 'visible' });

    const emptyState = emptyWrapper.locator('[role="status"]');
    const boundingBox = await emptyState.boundingBox();
    expect(boundingBox).not.toBeNull();

    const viewportWidth = 1440;
    const leftOffset = boundingBox!.x;
    const rightOffset = viewportWidth - (boundingBox!.x + boundingBox!.width);

    // Empty state must be horizontally centered (within 4px tolerance)
    expect(Math.abs(leftOffset - rightOffset)).toBeLessThanOrEqual(4);
  });

  // -----------------------------------------------------------------------
  // US3-03: Empty trash is horizontally centered on wide viewport
  // -----------------------------------------------------------------------
  test('US3-03: empty trash empty state is horizontally centered on 1440px viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForSelector('[data-testid="main-page"]');

    // Navigate to trash (which is empty by default)
    await page.getByRole('button', { name: /open trash/i }).click();
    await page.waitForSelector('[data-testid="trash-page"]');

    const emptyWrapper = page.locator('[data-testid="trash-view-empty"]');
    await emptyWrapper.waitFor({ state: 'visible' });

    const emptyState = emptyWrapper.locator('[role="status"]');
    const boundingBox = await emptyState.boundingBox();
    expect(boundingBox).not.toBeNull();

    const viewportWidth = 1440;
    const leftOffset = boundingBox!.x;
    const rightOffset = viewportWidth - (boundingBox!.x + boundingBox!.width);

    // Empty state must be horizontally centered (within 4px tolerance)
    expect(Math.abs(leftOffset - rightOffset)).toBeLessThanOrEqual(4);
  });

  // -----------------------------------------------------------------------
  // US3-04: Delete confirmation dialog is centered in the viewport
  //
  // The ConfirmDialog uses the native HTML <dialog> element with showModal().
  // The browser automatically centers native modal dialogs in the viewport.
  // This test verifies that the dialog is visible and centered at 1440px.
  // -----------------------------------------------------------------------
  test('US3-04: delete confirmation dialog is centered in viewport on 1440px viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForSelector('[data-testid="main-page"]');

    // Create an album and add a photo using a minimal JPEG buffer
    await createAlbum(page, 'US3-04 Album');
    await page.getByText('US3-04 Album').click();
    await page.waitForSelector('[data-testid="album-view"]');

    // Upload a minimal valid JPEG (smallest possible JPEG, 1×1 pixel)
    const minimalJpeg = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43,
      0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
      0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12,
      0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20,
      0x24, 0x2e, 0x27, 0x20, 0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29,
      0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27, 0x39, 0x3d, 0x38, 0x32,
      0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01,
      0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x1f, 0x00, 0x00,
      0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
      0x09, 0x0a, 0x0b, 0xff, 0xc4, 0x00, 0xb5, 0x10, 0x00, 0x02, 0x01, 0x03,
      0x03, 0x02, 0x04, 0x03, 0x05, 0x05, 0x04, 0x04, 0x00, 0x00, 0x01, 0x7d,
      0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12, 0x21, 0x31, 0x41, 0x06,
      0x13, 0x51, 0x61, 0x07, 0x22, 0x71, 0x14, 0x32, 0x81, 0x91, 0xa1, 0x08,
      0x23, 0x42, 0xb1, 0xc1, 0x15, 0x52, 0xd1, 0xf0, 0x24, 0x33, 0x62, 0x72,
      0x82, 0x09, 0x0a, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x25, 0x26, 0x27, 0x28,
      0x29, 0x2a, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x43, 0x44, 0x45,
      0x46, 0x47, 0x48, 0x49, 0x4a, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59,
      0x5a, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, 0x73, 0x74, 0x75,
      0x76, 0x77, 0x78, 0x79, 0x7a, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89,
      0x8a, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9a, 0xa2, 0xa3,
      0xa4, 0xa5, 0xa6, 0xa7, 0xa8, 0xa9, 0xaa, 0xb2, 0xb3, 0xb4, 0xb5, 0xb6,
      0xb7, 0xb8, 0xb9, 0xba, 0xc2, 0xc3, 0xc4, 0xc5, 0xc6, 0xc7, 0xc8, 0xc9,
      0xca, 0xd2, 0xd3, 0xd4, 0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 0xda, 0xe1, 0xe2,
      0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8, 0xe9, 0xea, 0xf1, 0xf2, 0xf3, 0xf4,
      0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01,
      0x00, 0x00, 0x3f, 0x00, 0xfb, 0xd7, 0xff, 0xd9,
    ]);

    const fileInput = page.locator('input[type="file"][aria-label="Select photos to add"]');
    await fileInput.setInputFiles({
      name: 'test-photo.jpg',
      mimeType: 'image/jpeg',
      buffer: minimalJpeg,
    });

    // Wait for photo to appear in the grid
    await page.waitForSelector('[data-testid="photo-grid"]');

    // Trash the photo by clicking the trash button on the photo tile
    const trashPhotoBtn = page.locator('[aria-label*="Trash"]').first();
    await trashPhotoBtn.click();

    // Go back to main page, then open trash
    await page.getByRole('button', { name: /back to albums/i }).click();
    await page.waitForSelector('[data-testid="main-page"]');
    await page.getByRole('button', { name: /open trash/i }).click();
    await page.waitForSelector('[data-testid="trash-page"]');

    // Click "Delete Permanently" to trigger the ConfirmDialog
    const deleteBtn = page.getByRole('button', { name: /delete permanently/i }).first();
    await deleteBtn.click();

    // The native <dialog> is open via showModal() — it is auto-centered by the browser
    const dialog = page.locator('dialog[aria-labelledby="confirm-title"]');
    await dialog.waitFor({ state: 'visible' });

    const dialogBox = await dialog.boundingBox();
    expect(dialogBox).not.toBeNull();

    const viewportWidth = 1440;
    const viewportHeight = 900;

    // Dialog center should be near viewport center (within 8px tolerance)
    const dialogCenterX = dialogBox!.x + dialogBox!.width / 2;
    const dialogCenterY = dialogBox!.y + dialogBox!.height / 2;
    const viewportCenterX = viewportWidth / 2;
    const viewportCenterY = viewportHeight / 2;

    expect(Math.abs(dialogCenterX - viewportCenterX)).toBeLessThanOrEqual(8);
    expect(Math.abs(dialogCenterY - viewportCenterY)).toBeLessThanOrEqual(8);
  });
});
