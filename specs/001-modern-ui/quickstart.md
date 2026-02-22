# Quickstart: Modern UI Design Implementation

**Feature**: `001-modern-ui`
**Phase**: 1 — Design
**Date**: 2026-02-22

This guide gives an implementer everything they need to start working on the modern UI redesign in the first session.

---

## Prerequisites

```bash
# Ensure you're on the feature branch
git checkout 001-modern-ui

# Install dependencies (no new runtime deps for this feature)
npm install

# Verify the project builds and tests pass before starting
npm run build
npm test
npm run test:e2e
```

---

## Step 1: Create the Global Styles Foundation

Create the token system first — everything else depends on it.

```bash
mkdir -p src/styles
touch src/styles/tokens.css src/styles/globals.css src/styles/animations.css
```

### `src/styles/tokens.css` — paste the full token block from [data-model.md](data-model.md)

Key sections:
1. Color tokens (`--color-accent-primary`, `--color-text-primary`, etc.)
2. Typography tokens (`--font-family-sans`, `--font-size-*`)
3. Spacing tokens (`--spacing-*`, `--padding-card`, `--gap-grid`)
4. Border radius tokens (`--radius-card`, `--radius-button`)
5. Shadow tokens (`--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-accent`)
6. Transition tokens (`--transition-fast`, `--transition-base`, `--transition-slow`)
7. Z-index tokens (`--z-dropdown`, `--z-modal`)

### `src/styles/globals.css` — reset and base styles

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-family: var(--font-family-sans);
  font-size: var(--font-size-body-md);
  line-height: var(--line-height-normal);
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
  -webkit-font-smoothing: antialiased;
}

body {
  min-height: 100vh;
}

a {
  color: var(--color-accent-secondary);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

button {
  font-family: inherit;
  cursor: pointer;
  border: none;
  background: none;
}

img {
  display: block;
  max-width: 100%;
}
```

### `src/styles/animations.css` — shared keyframes

```css
@keyframes shimmer {
  0%   { background-position: -1200px 0; }
  100% { background-position: calc(1200px + 100%) 0; }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-surface-subtle) 25%,
    var(--color-bg-secondary) 50%,
    var(--color-surface-subtle) 75%
  );
  background-size: 1200px 100%;
  animation: shimmer 2s infinite;
  border-radius: var(--radius-sm);
}
```

---

## Step 2: Import Global Styles in main.tsx

```tsx
// src/main.tsx — add these imports at the top (before App import)
import './styles/tokens.css'
import './styles/globals.css'
import './styles/animations.css'
```

Run `npm run dev` and verify the app still renders without visual regressions before continuing.

---

## Step 3: Create the Color Contrast Utility

This utility enables unit tests for WCAG compliance (required by Testing Standards principle).

### `src/utils/colorContrast.ts`

```typescript
export function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) throw new Error(`Invalid hex color: ${hex}`)
  return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
}

export function getLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex)
  return [r, g, b]
    .map(v => {
      v = v / 255
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
    })
    .reduce((acc, v, i) => acc + v * [0.2126, 0.7152, 0.0722][i], 0)
}

export function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1)
  const l2 = getLuminance(hex2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

export function isWcagAA(foreground: string, background: string): boolean {
  return getContrastRatio(foreground, background) >= 4.5
}
```

### `tests/unit/utils/colorContrast.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { getContrastRatio, isWcagAA } from '../../../src/utils/colorContrast'

describe('colorContrast', () => {
  it('primary accent on white passes AA', () => {
    expect(getContrastRatio('#FF6B35', '#FFFFFF')).toBeGreaterThanOrEqual(4.5)
  })
  it('secondary accent on white passes AA', () => {
    expect(getContrastRatio('#4A90E2', '#FFFFFF')).toBeGreaterThanOrEqual(4.5)
  })
  it('primary text on white passes AAA', () => {
    expect(getContrastRatio('#1A1A1A', '#FFFFFF')).toBeGreaterThanOrEqual(7)
  })
  it('isWcagAA returns false for insufficient contrast', () => {
    expect(isWcagAA('#CCCCCC', '#FFFFFF')).toBe(false)
  })
})
```

---

## Step 4: Migrate Components — Implementation Order

Migrate in priority order (highest user impact first):

1. **Toolbar** — navigation, primary/secondary/destructive button styles (US1, P1)
2. **AlbumGrid + AlbumCard** — main view layout and card design (US1+US2, P1/P2)
3. **PhotoGrid + PhotoTile** — gallery grid and photo card (US2, P2)
4. **Skeleton screens** — add to AlbumCard and PhotoTile (US2, P2)
5. **Hover / active states** — micro-interactions on cards and buttons (US3, P3)
6. **Empty states** — no-albums and empty-album views (US2, P2)

### Per-Component Migration Pattern

For each component:

1. Create the `.module.css` file alongside the `.tsx` file
2. Write CSS using tokens from `tokens.css` (no magic values)
3. Import in the component: `import styles from './ComponentName.module.css'`
4. Replace `style={{ }}` props with `className={styles.className}` references
5. Add state class names for hover/focus/loading/empty/error
6. Write E2E test assertions for each visual state

---

## Step 5: Add Accessibility Testing to Playwright

Install `axe-playwright` (dev dependency only):

```bash
npm install -D axe-playwright
```

Add to E2E specs:

```typescript
import { injectAxe, checkA11y } from 'axe-playwright'

test('page has no WCAG violations', async ({ page }) => {
  await page.goto('http://localhost:5173')
  await injectAxe(page)
  await checkA11y(page)
})
```

---

## Verification Checklist

Before marking any US as complete:

- [ ] All inline `style={{ }}` props in migrated component replaced with CSS module classes
- [ ] No hard-coded hex colors or pixel values in CSS files (all use `var(--*)`)
- [ ] Unit test for `colorContrast.ts` passes (`npm test`)
- [ ] E2E test covers the US acceptance scenarios (`npm run test:e2e`)
- [ ] `axe-playwright` reports no violations on the affected views
- [ ] Layout holds at 768px, 1280px, and 1920px viewport widths (Playwright viewport tests)
- [ ] No existing tests broken (`npm test && npm run test:e2e`)

---

## Key File Paths

| File | Purpose |
|------|---------|
| [src/styles/tokens.css](../../../src/styles/tokens.css) | All design tokens — start here |
| [src/styles/globals.css](../../../src/styles/globals.css) | Global reset and base styles |
| [src/styles/animations.css](../../../src/styles/animations.css) | Shimmer, fade, slide keyframes |
| [src/main.tsx](../../../src/main.tsx) | Entry point — import global styles here |
| [src/utils/colorContrast.ts](../../../src/utils/colorContrast.ts) | WCAG contrast utility |
| [tests/unit/utils/colorContrast.test.ts](../../../tests/unit/utils/colorContrast.test.ts) | Contrast unit tests |
| [specs/001-modern-ui/data-model.md](data-model.md) | Full token reference |
| [specs/001-modern-ui/contracts/component-states.md](contracts/component-states.md) | Component visual state contracts |

---

## Running the Dev Server

```bash
npm run dev      # start Vite dev server (http://localhost:5173)
npm test         # run Vitest unit tests (watch mode)
npm run test:e2e # run Playwright E2E tests (requires dev server running)
npm run lint     # check ESLint
npm run build    # production build (TypeScript + Vite)
```
