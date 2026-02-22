# Implementation Plan: Modern UI Design

**Branch**: `001-modern-ui` | **Date**: 2026-02-22 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-modern-ui/spec.md`

## Summary

Redesign the photoapp visual layer from inline styles to a CSS Modules + CSS Custom Properties design system. The modernization introduces a fun, colorful light-mode palette (coral-orange primary, bright blue secondary, lime green tertiary), consistent 8px-grid spacing, card-level elevation with subtle shadows, skeleton loading screens, and smooth micro-interactions — all without adding runtime dependencies or breaking existing functionality.

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: React 18, Vite 5 (CSS Modules natively supported — no new deps required)
**Storage**: N/A (visual redesign only — no data model changes)
**Testing**: Vitest (unit), Playwright (E2E + axe accessibility)
**Target Platform**: Web desktop browser (Chrome, Firefox, Safari); 768px–1920px viewport range
**Project Type**: Web application (React SPA)
**Performance Goals**: 60fps during photo browsing and interactions; cold start < 3s
**Constraints**: No new runtime dependencies; existing features must remain fully functional; light mode only; WCAG 2.1 AA minimum contrast on all text and interactive elements
**Scale/Scope**: ~10 components redesigned; 3 views; global CSS token system added

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Phase 0 Check

| Principle | Gate | Status | Notes |
|-----------|------|--------|-------|
| I. Code Quality | Functions single-responsibility; no dead code; no magic numbers; complexity justified | ✅ PASS | CSS tokens replace all magic numbers/hex values. Each CSS module is scoped to its component. |
| I. Code Quality | All code must pass linting and formatting | ✅ PASS | ESLint + Prettier already configured; CSS files not in linting scope but will follow consistent formatting |
| II. Testing Standards | Tests written before implementation (TDD) | ✅ PASS | Task ordering in tasks.md will place test tasks before implementation tasks |
| II. Testing Standards | Unit tests cover all business logic; integration tests cover inter-component interactions | ✅ PASS | Contrast ratio utilities get Vitest unit tests; E2E covers visual states |
| II. Testing Standards | Coverage ≥ 80% for new code | ✅ PASS | New logic is limited to `colorContrast.ts` utility; will be 100% unit-tested |
| III. UX Consistency | Loading, empty, error states implemented | ✅ PASS | FR-006 (empty states) and FR-008 (skeleton screens) are explicit requirements |
| III. UX Consistency | All UI conforms to project design system | ✅ PASS | The design system is being established by this feature; all components migrate to it |
| III. UX Consistency | WCAG 2.1 AA minimum | ✅ PASS | All palette colors verified ≥4.5:1 contrast; axe-core in Playwright CI |
| IV. Performance | 60fps photo browsing | ✅ PASS | CSS-only transitions, no runtime CSS generation, no JS animation loops |
| IV. Performance | Cold start < 3s | ✅ PASS | CSS Modules produce static CSS at build time; zero runtime overhead |
| IV. Performance | Performance regression tests in CI | ✅ PASS | Existing Playwright CI config; axe accessibility audit added |

### Post-Phase 1 Re-check

All gates remain green after design. The CSS Modules approach introduces no new build complexity. The `axe-playwright` dependency is dev-only (no runtime impact). No constitution violations.

**Complexity Tracking**: No violations — no table required.

## Project Structure

### Documentation (this feature)

```text
specs/001-modern-ui/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── component-states.md
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── styles/
│   ├── tokens.css              # NEW — All design tokens (colors, spacing, typography, shadows, transitions)
│   ├── globals.css             # NEW — Reset, html/body base styles
│   └── animations.css          # NEW — @keyframes shimmer, fade, slide
├── utils/
│   └── colorContrast.ts        # NEW — getContrastRatio() utility (for tests)
├── components/
│   ├── AlbumCard/
│   │   ├── AlbumCard.tsx       # MODIFY — add CSS module classNames
│   │   └── AlbumCard.module.css # NEW — card layout, hover elevation, skeleton
│   ├── AlbumGrid/
│   │   ├── AlbumGrid.tsx       # MODIFY — add CSS module classNames, empty state
│   │   └── AlbumGrid.module.css # NEW — grid layout, spacing
│   ├── PhotoTile/
│   │   ├── PhotoTile.tsx       # MODIFY — add CSS module classNames, skeleton, hover
│   │   └── PhotoTile.module.css # NEW — tile styling, overlay, skeleton
│   ├── PhotoGrid/
│   │   ├── PhotoGrid.tsx       # MODIFY — add CSS module classNames, empty state
│   │   └── PhotoGrid.module.css # NEW — grid layout, responsive breakpoints
│   ├── Toolbar/
│   │   ├── Toolbar.tsx         # MODIFY — add CSS module classNames, action hierarchy
│   │   └── Toolbar.module.css   # NEW — toolbar layout, button variants
│   └── [other components]/
│       ├── [Name].tsx          # MODIFY as needed
│       └── [Name].module.css   # NEW as needed
├── views/
│   ├── AlbumsView/
│   │   ├── AlbumsView.tsx      # MODIFY — layout classNames
│   │   └── AlbumsView.module.css # NEW
│   └── PhotosView/
│       ├── PhotosView.tsx      # MODIFY — layout classNames
│       └── PhotosView.module.css # NEW
└── main.tsx                    # MODIFY — import global styles

tests/
├── unit/
│   └── utils/
│       └── colorContrast.test.ts  # NEW — unit tests for contrast utility
└── e2e/
    ├── us1-modern-navigation.spec.ts  # NEW — Playwright E2E for US1
    ├── us2-modern-gallery.spec.ts     # NEW — Playwright E2E for US2
    └── us3-micro-interactions.spec.ts # NEW — Playwright E2E for US3
```

**Structure Decision**: Single-project (Option 1). The photoapp is a React SPA. New CSS files are placed alongside their components following the existing component directory pattern. Global styles live in `src/styles/` (new directory). Test files follow the existing `tests/unit/` and `tests/e2e/` split.
