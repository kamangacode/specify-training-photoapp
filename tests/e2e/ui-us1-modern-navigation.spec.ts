import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

/**
 * US1: Modern Navigation & Home View
 * Acceptance scenarios from spec.md:
 * 1. Visually coherent layout with consistent spacing, readable typography, balanced color palette
 * 2. Navigation items clearly distinguishable, properly aligned
 * 3. Transitions between views feel smooth
 */

test.describe('US1: Modern Navigation & Home View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="main-page"]');
  });

  test('album cards have modern rounded corners (border-radius ≥ 12px)', async ({ page }) => {
    // The main page always shows either the grid or empty state
    // After redesign, album cards must have rounded corners
    const albumCard = page.locator('[data-testid="album-card"]').first();
    const emptyOrCard = await albumCard.count();

    if (emptyOrCard > 0) {
      const borderRadius = await albumCard.evaluate((el) => {
        return parseFloat(window.getComputedStyle(el).borderRadius);
      });
      expect(borderRadius).toBeGreaterThanOrEqual(12);
    } else {
      // Empty state is acceptable — check the page still renders
      await expect(page.locator('[data-testid="main-page"]')).toBeVisible();
    }
  });

  test('CSS design tokens are loaded on the page', async ({ page }) => {
    // After implementation, --color-accent-primary must be defined in :root
    const tokenDefined = await page.evaluate(() => {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue('--color-accent-primary')
        .trim();
      return value.length > 0;
    });
    expect(tokenDefined).toBe(true);
  });

  test('toolbar renders with modern styling classes', async ({ page }) => {
    // After implementation, the toolbar container must have a CSS class (not just inline style)
    const toolbar = page.locator('[data-testid="toolbar"]');
    await expect(toolbar).toBeVisible();

    const hasClass = await toolbar.evaluate((el) => {
      // CSS module-applied elements have non-empty className
      return el.className.length > 0;
    });
    expect(hasClass).toBe(true);
  });

  test('main page uses background color from design tokens (not default white)', async ({ page }) => {
    // After implementing globals.css, body gets bg-secondary (#F8F9FB)
    const bgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    // bg-secondary: #F8F9FB = rgb(248, 249, 251)
    expect(bgColor).toBe('rgb(248, 249, 251)');
  });

  test('no WCAG 2.1 AA violations on main page', async ({ page }) => {
    await injectAxe(page);
    await checkA11y(page, undefined, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa'],
      },
    });
  });
});
