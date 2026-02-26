# UI Contract: Responsive Layout Breakpoints

**Feature**: `001-ui-centering`
**Type**: UI Layout Contract
**Applies to**: MainPage, AlbumViewPage, TrashPage — main content area + toolbar inner content

---

## Breakpoints

| Breakpoint | Viewport width | Content behavior |
|------------|----------------|-----------------|
| Mobile | < 640px | Full width, no max-width constraint, padding: 12px each side |
| Tablet | 640px – 1100px | Full width, padding: 16–24px each side (scales with viewport) |
| Desktop | > 1100px | Max-width: 1100px, centered with `margin: 0 auto`, padding: 24px each side |

---

## Per-Component Contracts

### Main content area (`.main` in page modules)

| Property | Mobile (<640px) | Desktop (>1100px) |
|----------|-----------------|-------------------|
| `max-width` | none | `var(--page-max-width)` = 1100px |
| `margin` | 0 | `0 auto` |
| `width` | `100%` | `100%` (bounded by max-width) |
| `padding` | `0 var(--spacing-3)` | `0 var(--spacing-6)` |

### Toolbar inner wrapper (new `.toolbarInner` class)

| Property | Mobile (<640px) | Desktop (>1100px) |
|----------|-----------------|-------------------|
| `max-width` | none | `var(--page-max-width)` = 1100px |
| `margin` | 0 | `0 auto` |
| `padding` | `0 var(--spacing-3)` | `0 var(--spacing-6)` |

> **Note**: The toolbar's outer container keeps `width: 100%` and sticky background. Only the inner wrapper is constrained.

### Header/page title row

Same max-width and horizontal padding as the main content area — visual left-edge alignment guaranteed.

---

## Acceptance Test Matrix

| Scenario | Viewport | Expected |
|----------|----------|----------|
| Album list on wide screen | 1440px | Album grid centered, equal margins left/right |
| Album list on mobile | 375px | Album grid full width, 12px side padding |
| Toolbar on wide screen | 1440px | Toolbar actions aligned with album grid left/right edges |
| Empty trash on wide screen | 1440px | "Trash is empty" message centered in constrained area |
| Album title + back button on 1440px | 1440px | Header aligns with photo grid below |
| Resize from 1440px to 375px | — | No horizontal scrollbar appears at any size |

---

## Token

```css
/* to be added in src/styles/tokens.css */
--page-max-width: 1100px;
```
