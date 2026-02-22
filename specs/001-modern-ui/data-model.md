# Data Model: Modern UI Design

**Feature**: `001-modern-ui`
**Phase**: 1 — Design
**Date**: 2026-02-22

> This feature is a **visual redesign** — it introduces no new data persistence or API changes.
> The data model describes the **design system entities**: the tokens, states, and visual properties
> that are applied to existing data (Albums, Photos) without altering their structure.

---

## Entity 1: Visual Theme

**What it represents**: The complete collection of CSS custom properties that define the application's visual language. Applied globally via `src/styles/tokens.css`, imported once in `src/main.tsx`.

### Color Tokens

| Token | Hex | Role |
|-------|-----|------|
| `--color-accent-primary` | `#FF6B35` | Primary actions, active nav, highlights |
| `--color-accent-primary-hover` | `#E55A2B` | Hover state for primary |
| `--color-accent-primary-light` | `#FFE8DC` | Tinted backgrounds |
| `--color-accent-secondary` | `#4A90E2` | Secondary actions, focus rings, links |
| `--color-accent-secondary-hover` | `#357ABD` | Hover state for secondary |
| `--color-accent-secondary-light` | `#E8F0FF` | Tinted backgrounds |
| `--color-accent-tertiary` | `#7ED321` | Success, tags |
| `--color-accent-tertiary-hover` | `#6BB318` | Hover for tertiary |
| `--color-accent-tertiary-light` | `#F0FFD6` | Tinted backgrounds |
| `--color-text-primary` | `#1A1A1A` | Body text, headings (18.5:1 on white) |
| `--color-text-secondary` | `#4A4A4A` | Captions, metadata (8.6:1 on white) |
| `--color-text-tertiary` | `#757575` | Placeholders, disabled (5.5:1 on white) |
| `--color-text-disabled` | `#BDBDBD` | Disabled elements |
| `--color-bg-primary` | `#FFFFFF` | Page background |
| `--color-bg-secondary` | `#F8F9FB` | Section backgrounds |
| `--color-surface` | `#FFFFFF` | Card backgrounds |
| `--color-surface-subtle` | `#F0F2F5` | Skeleton placeholders |
| `--color-border` | `#E0E0E0` | Card borders, dividers |
| `--color-border-focus` | `#4A90E2` | Focus ring |
| `--color-success` | `#34A853` | Success semantic |
| `--color-warning` | `#FBBC04` | Warning semantic |
| `--color-error` | `#EA4335` | Error semantic |
| `--color-overlay-dark` | `rgba(26,26,26,0.3)` | Dark image overlays |
| `--color-overlay-light` | `rgba(255,107,53,0.1)` | Warm tint on hover |

### Typography Tokens

| Token | Value |
|-------|-------|
| `--font-family-sans` | `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif` |
| `--font-size-h1` | `clamp(2rem, 5vw, 3.5rem)` |
| `--font-size-h2` | `clamp(1.75rem, 4vw, 2.5rem)` |
| `--font-size-h3` | `clamp(1.5rem, 3vw, 2rem)` |
| `--font-size-h4` | `1.25rem` |
| `--font-size-body-lg` | `1.125rem` |
| `--font-size-body-md` | `1rem` |
| `--font-size-body-sm` | `0.875rem` |
| `--font-size-body-xs` | `0.75rem` |
| `--font-weight-regular` | `400` |
| `--font-weight-medium` | `500` |
| `--font-weight-semibold` | `600` |
| `--font-weight-bold` | `700` |
| `--line-height-tight` | `1.2` |
| `--line-height-normal` | `1.5` |
| `--line-height-relaxed` | `1.75` |

### Spacing Tokens (8px grid)

| Token | Value | px equivalent |
|-------|-------|--------------|
| `--spacing-1` | `0.25rem` | 4px |
| `--spacing-2` | `0.5rem` | 8px |
| `--spacing-3` | `0.75rem` | 12px |
| `--spacing-4` | `1rem` | 16px |
| `--spacing-5` | `1.25rem` | 20px |
| `--spacing-6` | `1.5rem` | 24px |
| `--spacing-8` | `2rem` | 32px |
| `--spacing-10` | `2.5rem` | 40px |
| `--spacing-12` | `3rem` | 48px |
| `--spacing-16` | `4rem` | 64px |
| `--padding-button` | `var(--spacing-4) var(--spacing-6)` | 16px 24px |
| `--padding-card` | `var(--spacing-6)` | 24px |
| `--padding-section` | `var(--spacing-8) var(--spacing-4)` | 32px 16px |
| `--gap-grid` | `var(--spacing-4)` | 16px |

### Border Radius Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | `0.25rem` | 4px — tags, badges |
| `--radius-base` | `0.5rem` | 8px — inputs |
| `--radius-md` | `0.75rem` | 12px — buttons |
| `--radius-lg` | `1rem` | 16px — cards |
| `--radius-xl` | `1.5rem` | 24px — large surfaces |
| `--radius-full` | `9999px` | pill shapes |
| `--radius-card` | `var(--radius-lg)` | photo/album cards |
| `--radius-button` | `var(--radius-md)` | action buttons |
| `--radius-input` | `var(--radius-base)` | text inputs |

### Shadow Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 2px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)` | Default card |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)` | Hovered card |
| `--shadow-lg` | `0 12px 24px rgba(0,0,0,0.12), 0 6px 12px rgba(0,0,0,0.06)` | Drag target, dropdown |
| `--shadow-accent` | `0 4px 16px rgba(255,107,53,0.15)` | Featured card |

### Transition Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--transition-fast` | `150ms cubic-bezier(0.4, 0, 0.2, 1)` | Color changes on hover |
| `--transition-base` | `200ms cubic-bezier(0.4, 0, 0.2, 1)` | Card elevation, opacity |
| `--transition-slow` | `300ms cubic-bezier(0.4, 0, 0.2, 1)` | Skeleton fade-in |

### Z-index Tokens

| Token | Value |
|-------|-------|
| `--z-dropdown` | `100` |
| `--z-sticky` | `200` |
| `--z-modal-bg` | `400` |
| `--z-modal` | `500` |
| `--z-tooltip` | `600` |

---

## Entity 2: Component State

**What it represents**: The visual representation of each interactive element across its full set of states. States are implemented via CSS class selectors (`:hover`, `:focus-visible`, `:active`, `.is-loading`, `.is-empty`, `.is-selected`, `.is-disabled`).

### States per Component Type

| Component | States | Visual Change |
|-----------|--------|--------------|
| **Photo card** | default, hover, active (click), selected, loading (skeleton), error (broken image) | elevation (shadow-sm → shadow-md), slight Y-transform (-4px), overlay tint on hover |
| **Album card** | default, hover, active, selected, loading (skeleton) | same as photo card |
| **Primary button** | default, hover, active, disabled, focus | background darkens on hover, scale(0.98) on active, `--color-accent-primary-hover`, focus ring |
| **Secondary button** | default, hover, active, disabled, focus | outline/ghost style, border color changes on hover |
| **Navigation item** | default, active (current route), hover | text color → accent-primary for active, underline or left-border indicator |
| **Input / Search** | default, focus, error, disabled | focus ring via `--color-border-focus`, error border in `--color-error` |
| **Drag handle** | idle, dragging, over-drop-target | elevated shadow, slightly transparent, drop target highlighted |

### Loading State (Skeleton)

The skeleton state is modeled as a CSS animation applied to a placeholder element rendered while the real content loads.

**Structure**:
```
[component-root].is-loading
  └── .skeleton-[area]   ← animated placeholder with @keyframes shimmer
```

**Keyframe**:
```css
@keyframes shimmer {
  0%   { background-position: -1200px 0; }
  100% { background-position: calc(1200px + 100%) 0; }
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
}
```

### Empty State

The empty state is a styled placeholder rendered when no content exists (no albums, empty album). It uses a dedicated component or CSS class with:
- Center-aligned content
- Illustrative icon or emoji (via CSS content or SVG)
- `--font-size-body-lg` heading
- `--color-text-secondary` body text
- Optional CTA button

### Error State (broken image)

When a photo fails to load (`onError` on `<img>`), the photo tile falls back to a placeholder card:
- Background: `var(--color-surface-subtle)`
- Icon: broken image SVG
- Maintains card dimensions (no layout shift)
- Matches modern card styling

---

## Validation Rules

| Rule | Detail |
|------|--------|
| All color tokens MUST meet WCAG 2.1 AA | Enforced by `colorContrast.ts` unit tests |
| No magic hex values in component files | All colors reference `var(--color-*)` |
| No magic spacing numbers | All spacing references `var(--spacing-*)` or semantic aliases |
| Transition duration MUST NOT exceed 300ms | Enforced by code review against transition tokens |
| Skeleton MUST preserve layout dimensions | Skeleton placeholder matches content dimensions |

---

## State Transitions

```
Photo Card:
  idle
    → hover (pointer-enter): shadow-sm → shadow-md, translateY(-4px), overlay visible
    → active (mousedown): shadow-md → shadow-sm, scale(0.98)
    → idle (pointer-leave): reverse hover
    → selected (click/toggle): accent-color border, checkmark overlay

Album Card:
  idle → hover → active → selected  (same pattern as Photo Card)

Button (primary):
  default
    → hover: background darken, translateY(-1px), shadow-sm
    → active: scale(0.98), translateY(0)
    → focus: focus ring (2px, offset 2px, --color-border-focus)
    → disabled: opacity 0.5, cursor not-allowed
```
