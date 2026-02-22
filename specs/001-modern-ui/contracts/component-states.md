# UI Contracts: Component States & Visual Interface

**Feature**: `001-modern-ui`
**Phase**: 1 — Design
**Date**: 2026-02-22
**Type**: UI contract — describes the visual interface each component exposes to users and to the application

---

## Overview

This document defines the **visual interface contract** for each component affected by the modern UI redesign. Each contract specifies:
- The required visual states a component MUST implement
- The CSS class API (module class names) the component exposes
- The tokens it MUST consume (no magic values permitted)
- The interaction behavior (what triggers each state)

These contracts are the reference point for implementation tasks and E2E test assertions.

---

## Contract 1: Photo Card (`PhotoTile`)

**Component file**: `src/components/PhotoTile/PhotoTile.tsx`
**CSS Module**: `src/components/PhotoTile/PhotoTile.module.css`

### Required Visual States

| State | CSS Trigger | Visual Properties |
|-------|------------|-------------------|
| `default` | static render | `shadow-sm`, `radius-card`, `border: 1px solid --color-border` |
| `hover` | `:hover` | `shadow-md`, `translateY(-4px)`, overlay `opacity: 1` |
| `active` | `:active` | `shadow-sm`, `scale(0.98)` |
| `selected` | `.is-selected` class | `2px solid --color-accent-primary` border, checkmark overlay |
| `loading` | `.is-loading` class | skeleton shimmer on image area + text areas |
| `error` | `.has-error` class | placeholder icon, `bg: --color-surface-subtle` |
| `drag-source` | `.is-dragging` class | `opacity: 0.6`, `shadow-lg`, cursor `grabbing` |
| `drop-target` | `.is-drop-target` class | `border: 2px dashed --color-accent-secondary`, highlight tint |

### Required CSS Class Names (module API)

```
.card           — root element: padding, radius, shadow, transition
.image          — image container: aspect-ratio 1, overflow hidden, radius
.img            — img element: object-fit cover, hover scale transition
.overlay        — absolute overlay: opacity transition, flex center
.text           — text area below image: padding, border-top
.title          — album/photo name: font-weight semibold, text-primary
.meta           — count/date: font-xs, text-tertiary
.skeleton       — shimmer animation wrapper
.skeletonImage  — image placeholder with shimmer
.skeletonTitle  — title placeholder with shimmer
.skeletonMeta   — meta placeholder with shimmer
```

### Token Requirements

MUST use tokens from `tokens.css` for all values. MUST NOT use hard-coded hex colors, pixel values, or timing values.

```css
/* Required token references */
background: var(--color-surface)
border-radius: var(--radius-card)
box-shadow: var(--shadow-sm) → var(--shadow-md) on hover
transition: var(--transition-base)
padding: var(--padding-card)
color: var(--color-text-primary)
color: var(--color-text-tertiary)
```

### Interaction Behavior

- Hover: pointer-enter triggers CSS `:hover` — no JS required
- Click: emits `onClick` prop — visual active state via `:active`
- Selection: parent passes `isSelected: boolean` prop → component applies `.is-selected` class
- Loading: parent passes `isLoading: boolean` prop → component renders skeleton markup
- Broken image: `onError` on `<img>` sets internal state → component applies `.has-error` class

---

## Contract 2: Album Card (`AlbumCard`)

**Component file**: `src/components/AlbumCard/AlbumCard.tsx`
**CSS Module**: `src/components/AlbumCard/AlbumCard.module.css`

### Required Visual States

| State | CSS Trigger | Visual Properties |
|-------|------------|-------------------|
| `default` | static render | same as Photo Card |
| `hover` | `:hover` | same as Photo Card |
| `active` | `:active` | same as Photo Card |
| `selected` | `.is-selected` | accent border |
| `loading` | `.is-loading` | skeleton on thumbnail + title |
| `drag-source` | `.is-dragging` | opacity 0.6, shadow-lg |
| `drop-target` | `.is-drop-target` | dashed accent border |

### Differences from Photo Card

- Thumbnail shows the album cover photo (or placeholder if empty)
- Photo count badge displayed in `meta`
- May show a multi-image stack visual (decorative offset shadows showing "depth" of multiple photos)

### Token Requirements

Same as Photo Card. Additionally:
```css
/* Badge */
background: var(--color-accent-primary-light)
color: var(--color-accent-primary)
border-radius: var(--radius-full)
```

---

## Contract 3: Photo Grid (`PhotoGrid`)

**Component file**: `src/components/PhotoGrid/PhotoGrid.tsx`
**CSS Module**: `src/components/PhotoGrid/PhotoGrid.module.css`

### Required Visual States

| State | Trigger | Visual |
|-------|---------|--------|
| `default` | has photos | CSS Grid, `gap: --gap-grid` |
| `empty` | no photos | centered `EmptyState` component |
| `loading` | `isLoading` prop | skeleton grid (4+ skeleton cards) |

### Layout Contract

```css
/* Grid layout — responsive without breakpoints */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--gap-grid);
  padding: var(--padding-section);
}
```

Responsive behavior: `auto-fill` with `minmax(200px, 1fr)` naturally adapts from 768px to 1920px — no media query required for column count.

### Empty State Contract

When no photos exist, renders an `EmptyState` element:
- Centered vertically and horizontally in the grid area
- Icon or illustration (SVG)
- Heading: `font-size-body-lg`, `font-weight-semibold`, `color-text-primary`
- Body: `font-size-body-md`, `color-text-secondary`
- Optional CTA button (add photo)

---

## Contract 4: Album Grid (`AlbumGrid`)

**Component file**: `src/components/AlbumGrid/AlbumGrid.tsx`
**CSS Module**: `src/components/AlbumGrid/AlbumGrid.module.css`

### Required Visual States

Same as Photo Grid. Album-specific empty state:
- Heading: "No albums yet"
- Body: "Create your first album to get started"
- CTA: "Create album" (primary button)

### Layout Contract

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--gap-grid);
  padding: var(--padding-section);
}
```

Album cards are slightly wider than photo tiles (240px min vs 200px).

---

## Contract 5: Toolbar

**Component file**: `src/components/Toolbar/Toolbar.tsx`
**CSS Module**: `src/components/Toolbar/Toolbar.module.css`

### Required Visual States

| Element | State | Visual |
|---------|-------|--------|
| Primary action button | default, hover, active, disabled, focus | filled `--color-accent-primary` background |
| Secondary action button | default, hover, active, disabled, focus | ghost/outline style with `--color-accent-secondary` border |
| Destructive action button | default, hover, active, disabled | `--color-error` tint |
| Navigation breadcrumb | current, parent | current: `font-weight-bold`; parent: `color-text-secondary`, hover underline |

### Button Hierarchy Contract

Primary (add, create): filled accent background, white text
Secondary (export, edit): outlined with accent border, accent text
Destructive (delete): error-colored border and text on ghost background; filled error on hover

### Token Requirements

```css
/* Primary button */
background: var(--color-accent-primary)
color: #FFFFFF
border-radius: var(--radius-button)
padding: var(--padding-button)
transition: var(--transition-fast)

/* On hover */
background: var(--color-accent-primary-hover)
box-shadow: var(--shadow-sm)
transform: translateY(-1px)

/* On active */
transform: scale(0.98)

/* Focus ring (all buttons) */
outline: 2px solid var(--color-border-focus)
outline-offset: 2px
```

---

## Contract 6: Navigation / App Header

**Component**: Any navigation/header component (e.g., `App.tsx` nav area or dedicated `Nav` component)
**CSS Module**: Applicable module for the nav component

### Required Visual States

| Element | State | Visual |
|---------|-------|--------|
| Nav link | default | `color-text-secondary` |
| Nav link | hover | `color-text-primary`, underline or indicator |
| Nav link | active (current route) | `color-accent-primary`, bold weight, left-border or underline indicator |
| Nav container | static | `color-bg-primary` background, `shadow-sm` bottom shadow for separation |

---

## Contract 7: Skeleton Screens

**Shared CSS**: `src/styles/animations.css` + per-component `.module.css`

### Required Behavior

- Skeleton MUST maintain the same dimensions as the real content it replaces
- Skeleton MUST animate via `@keyframes shimmer` (left-to-right sweep)
- Skeleton animation MUST use `--color-surface-subtle` and `--color-bg-secondary` gradient stops
- Skeleton MUST disappear when real content is ready (no lingering after load)
- Skeleton placeholder cards MUST match the card `radius`, `padding`, and `shadow` of real cards

### Skeleton API

Each component that supports loading state exposes an `isLoading: boolean` prop. When `true`, the component renders skeleton markup instead of real content.

```tsx
// Contract: Component loading API
interface PhotoTileProps {
  photo?: Photo;
  isLoading?: boolean;   // renders skeleton when true
  isSelected?: boolean;
  onClick?: () => void;
}
```

---

## Accessibility Requirements (All Contracts)

The following requirements apply to ALL component contracts:

| Requirement | Detail |
|-------------|--------|
| Interactive elements have `:focus-visible` style | 2px solid `--color-border-focus`, offset 2px |
| Hover state MUST NOT be the only affordance | Active state and keyboard navigation must also work |
| Color MUST NOT be the only differentiator | Selected state uses border + visual indicator, not just color |
| Skeleton screens have `aria-busy="true"` on the container | Signals loading state to screen readers |
| Empty states have descriptive text (not just icons) | Icon is decorative; visible text message required |
| All interactive elements have accessible names | `aria-label`, `title`, or visible text label |
