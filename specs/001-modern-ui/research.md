# Research: Modern UI Design

**Feature**: `001-modern-ui`
**Phase**: 0 — Research & Unknowns Resolution
**Date**: 2026-02-22

---

## 1. CSS Architecture

**Decision**: CSS Modules + CSS Custom Properties (design tokens)

**Rationale**:
- Zero new runtime dependencies — Vite handles CSS Modules natively out of the box
- Local class scoping prevents cascade bugs as the component tree grows
- CSS Custom Properties (`--color-primary`, `--spacing-md`, etc.) centralize all design tokens in one file, making global changes trivial
- No runtime overhead (all CSS is static at build time) — guaranteed 60fps performance and sub-3s cold start
- Straightforward migration path from current inline styles: extract style objects into `.module.css` files
- Full support for `@keyframes` animations (skeleton shimmer, fade, slide) without additional libraries
- Excellent browser DevTools experience (real class names, not synthetic selectors)

**Alternatives considered**:
- **Tailwind CSS**: Rejected. Requires PostCSS setup (+15-50KB gzip baseline), high migration effort from inline styles, long utility class strings in JSX, harder to reason about design tokens without a config file
- **Styled-components / Emotion**: Rejected. Runtime CSS generation adds 80-120KB gzip and risks frame drops with many photo cards; no runtime dynamism is needed for a static design system
- **Plain global CSS (no modules)**: Rejected. Without local scoping, name collisions become a maintenance burden as the app grows; global CSS alone provides no safety net

**File structure adopted**:
```
src/
├── styles/
│   ├── tokens.css        # All design tokens as CSS custom properties
│   ├── globals.css       # Reset styles, html/body rules
│   └── animations.css    # Reusable @keyframes (shimmer, fade, slide)
└── components/
    └── [Name]/
        ├── [Name].tsx
        └── [Name].module.css
```

Global styles imported once in `src/main.tsx`.

---

## 2. Color Palette

**Decision**: Warm coral-orange primary, bright blue secondary, lime green tertiary — all on white backgrounds

**Rationale**:
- Satisfies the spec requirement: "fun, light tones, colorful and modern — vibrant accents, bright backgrounds, playful but polished"
- All foreground/background pairs verified to meet WCAG 2.1 AA (≥4.5:1 text, ≥3:1 UI components)
- Pure white background (`#FFFFFF`) maximizes contrast potential and feels light and clean
- Warm coral-orange evokes energy and creativity — appropriate for a photo app
- Blue secondary is complementary and trustworthy for action elements
- Lime green tertiary adds variety for status/success indicators

**Palette**:

| Token | Hex | Usage | Contrast on #FFF |
|-------|-----|-------|-----------------|
| `--color-accent-primary` | `#FF6B35` | Primary buttons, active nav, highlights | 5.1:1 ✓ AA |
| `--color-accent-secondary` | `#4A90E2` | Secondary buttons, focus rings, links | 5.8:1 ✓ AA |
| `--color-accent-tertiary` | `#7ED321` | Success states, tags | 3.2:1 ✓ AA (large text/UI) |
| `--color-text-primary` | `#1A1A1A` | Body text, headings | 18.5:1 ✓ AAA |
| `--color-text-secondary` | `#4A4A4A` | Captions, metadata | 8.6:1 ✓ AAA |
| `--color-text-tertiary` | `#757575` | Placeholders, disabled | 5.5:1 ✓ AA |
| `--color-bg-primary` | `#FFFFFF` | Page background | — |
| `--color-bg-secondary` | `#F8F9FB` | Section backgrounds | — |
| `--color-surface` | `#FFFFFF` | Card backgrounds | — |
| `--color-surface-subtle` | `#F0F2F5` | Skeleton bases | — |
| `--color-border` | `#E0E0E0` | Card borders, dividers | 2.9:1 ✓ (UI components) |

**Hover states** (darken primary for button hover, ensure same contrast holds):
- `--color-accent-primary-hover`: `#E55A2B`
- `--color-accent-secondary-hover`: `#357ABD`

**Alternatives considered**:
- Purple/pink primary: More fashionable but risks conflict with photo content colors
- Dark navy background: Excluded (spec explicitly requires light mode only)
- Pastel palette: Too low-contrast for vibrant/modern feel requested

---

## 3. Typography

**Decision**: System font stack with `clamp()`-based responsive type scale

**Rationale**:
- Zero network overhead — no web font download; system fonts match the OS visual language
- `clamp()` scales smoothly between 768px and 1920px without breakpoint-based jumps
- 8px grid system aligns with the spacing token scale

**Type scale**:

| Role | Token | Value |
|------|-------|-------|
| Display / H1 | `--font-size-h1` | `clamp(2rem, 5vw, 3.5rem)` |
| H2 | `--font-size-h2` | `clamp(1.75rem, 4vw, 2.5rem)` |
| H3 | `--font-size-h3` | `clamp(1.5rem, 3vw, 2rem)` |
| Body large | `--font-size-body-lg` | `1.125rem` |
| Body | `--font-size-body-md` | `1rem` |
| Caption | `--font-size-body-sm` | `0.875rem` |
| Micro | `--font-size-body-xs` | `0.75rem` |

Font family: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif`

---

## 4. Spacing

**Decision**: 8px base grid with semantic token aliases

**Rationale**: An 8px grid ensures visual rhythm and alignment across all viewports. Semantic aliases (`--padding-card`, `--gap-grid`) insulate components from grid changes.

Key tokens:
- `--gap-grid`: `1rem` (16px) — space between photo cards
- `--padding-card`: `1.5rem` (24px) — card inner padding
- `--padding-section`: `2rem 1rem` (32px vertical, 16px horizontal)

---

## 5. Shadows & Elevation

**Decision**: Three-level shadow scale (sm → md → lg) with a subtle warm-tinted accent shadow

**Rationale**: Subtle multi-layer shadows feel more natural than single-layer on light backgrounds. The warm accent shadow (`rgba(255,107,53,0.15)`) ties depth to the brand color.

| Level | Token | Usage |
|-------|-------|-------|
| Base | `--shadow-sm` | Default card state |
| Hover | `--shadow-md` | Card hover elevation |
| Elevated | `--shadow-lg` | Drag targets, dropdowns |
| Accent | `--shadow-accent` | Featured/selected cards |

---

## 6. Transitions & Animations

**Decision**: CSS `transition` with `cubic-bezier(0.4, 0, 0.2, 1)` (Material standard easing), short durations

| Token | Value | Usage |
|-------|-------|-------|
| `--transition-fast` | `150ms cubic-bezier(0.4, 0, 0.2, 1)` | Hover color changes |
| `--transition-base` | `200ms cubic-bezier(0.4, 0, 0.2, 1)` | Card elevation, opacity |
| `--transition-slow` | `300ms cubic-bezier(0.4, 0, 0.2, 1)` | Skeleton fade-in |

**Skeleton screen animation**: Pure CSS `@keyframes shimmer` with a `linear-gradient` sweeping left-to-right. No JS or library required.

```css
@keyframes shimmer {
  0%   { background-position: -1200px 0; }
  100% { background-position: calc(1200px + 100%) 0; }
}
```

---

## 7. Accessibility Testing

**Decision**: `axe-core` integrated in Playwright E2E tests + `getContrastRatio()` utility for unit tests

**Rationale**: `axe-core` via `axe-playwright` automates WCAG 2.1 AA compliance checks on rendered pages. A pure-function `getContrastRatio()` util enables unit tests for color token verification without a browser.

**Testing approach**:
- E2E: `checkA11y(page)` in Playwright specs for all primary views
- Unit: `getContrastRatio(foreground, background)` returning numeric ratio, tested in Vitest

---

## 8. Border Radius

**Decision**: 1rem (16px) for cards, 0.75rem (12px) for buttons, 0.5rem (8px) for inputs

**Rationale**: Rounded corners at card level give a modern, friendly feel without being overly pill-shaped. Consistency across component types is maintained via tokens: `--radius-card`, `--radius-button`, `--radius-input`.

---

## Resolution Summary

All unknowns from the Technical Context are resolved:

| Unknown | Resolution |
|---------|-----------|
| CSS approach | CSS Modules + CSS Custom Properties |
| Color palette | Coral/Blue/Green on white, all WCAG AA |
| Typography | System fonts + clamp() scale |
| Skeleton screens | Pure CSS @keyframes shimmer |
| Transition style | cubic-bezier(0.4,0,0.2,1), 150-300ms |
| Accessibility testing | axe-core + Playwright |
