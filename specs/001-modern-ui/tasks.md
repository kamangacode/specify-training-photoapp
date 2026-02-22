# Tasks: Modern UI Design

**Input**: Design documents from `/specs/001-modern-ui/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓, quickstart.md ✓

**Tests**: Included per Constitution Principle II (Test-First Development is MANDATORY).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths are included in every description

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Scaffold new directories and install dev tooling needed by all subsequent phases.

- [X] T001 Create `src/styles/` directory and scaffold three empty CSS files: `tokens.css`, `globals.css`, `animations.css`
- [X] T002 Install axe-playwright dev dependency: `npm install -D axe-playwright` (required for WCAG E2E checks)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Design token system, global CSS foundation, and the color-contrast utility that all user stories depend on. MUST be complete before any user story begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T003 Write Vitest unit tests for color contrast utility in `tests/unit/utils/colorContrast.test.ts` — must FAIL (RED) before T004; covers `getContrastRatio`, `isWcagAA`, and all palette hex pairs from data-model.md
- [X] T004 Create `src/utils/colorContrast.ts` with `hexToRgb`, `getLuminance`, `getContrastRatio`, `isWcagAA` — makes T003 tests GREEN
- [X] T005 Fill `src/styles/tokens.css` with the full design token system from data-model.md: color tokens (accent-primary `#FF6B35`, accent-secondary `#4A90E2`, accent-tertiary `#7ED321`, text, surface, border, semantic, overlay), typography tokens (font-family-sans, font-size-h1 through body-xs, font-weight, line-height), spacing tokens (spacing-1 through spacing-24, padding-button/card/section, gap-grid), border-radius tokens (radius-sm through radius-full, radius-card/button/input), shadow tokens (shadow-sm/md/lg/accent), transition tokens (transition-fast/base/slow), z-index tokens
- [X] T006 [P] Fill `src/styles/globals.css` with CSS reset and base styles: `* { box-sizing: border-box; margin: 0; padding: 0; }`, html/body (font-family-sans, color-text-primary, bg-primary, antialiased), a, button (font inherit, cursor pointer), img (display block, max-width 100%)
- [X] T007 [P] Fill `src/styles/animations.css` with reusable keyframes and utility class: `@keyframes shimmer` (left-to-right gradient sweep using color-surface-subtle), `@keyframes fadeIn`, `@keyframes slideUp`, `.skeleton` class (linear-gradient + shimmer animation + border-radius-sm)
- [X] T008 Update `src/main.tsx` to import `./styles/tokens.css`, `./styles/globals.css`, `./styles/animations.css` at the top — before the App import; verify `npm run dev` still loads without errors

**Checkpoint**: Run `npm test` — T003 unit tests must pass (GREEN). Run `npm run dev` — app loads without visual regressions.

---

## Phase 3: User Story 1 — Modern Navigation & Home View (Priority: P1) 🎯 MVP

**Goal**: Deliver a visually coherent main view: modernized Toolbar with clear button hierarchy, an AlbumGrid with card-based layout, and consistent spacing and typography throughout the home page.

**Independent Test**: Launch the app (`npm run dev`), open `http://localhost:5173`. Verify the main view has consistent spacing, readable typography, clearly styled primary/secondary/destructive buttons in the toolbar, and album cards with rounded corners and subtle shadows — with no inline `style={{}}` remaining on any component in this phase.

### Tests for User Story 1 ⚠️ Write FIRST — verify RED before implementing

- [X] T009 [P] [US1] Write E2E test for US1 in `tests/e2e/ui-us1-modern-navigation.spec.ts`: assertions for (1) toolbar renders with `.toolbar` CSS class, (2) primary button has `color: #FF6B35` or derived accent color, (3) album cards have `border-radius ≥ 12px`, (4) `checkA11y(page)` from axe-playwright passes on `/` route — test must FAIL (RED) before implementation

### Implementation for User Story 1

- [X] T010 [P] [US1] Create `src/components/common/Toolbar.module.css` with: `.toolbar` (flex, space-between, bg-bg-primary, shadow-sm, padding-card), `.buttonPrimary` (bg accent-primary, white text, radius-button, padding-button, hover + active states via tokens), `.buttonSecondary` (outline style, accent-secondary border/text, same shape), `.buttonDestructive` (ghost, error color, fills error on hover)
- [X] T010 [US1] Update `src/components/common/Toolbar.tsx`: import `styles from './Toolbar.module.css'`; replace all `style={{ }}` props with `className={styles.*}` references; apply `.buttonPrimary` / `.buttonSecondary` / `.buttonDestructive` based on action type (add/create = primary, export/edit = secondary, delete = destructive)
- [X] T010 [P] [US1] Create `src/components/albums/AlbumCard.module.css` with: `.card` (bg-surface, radius-card, shadow-sm, border color-border, transition-base, cursor pointer), `.card:hover` (shadow-md, translateY(-4px)), `.card:active` (shadow-sm, scale 0.98), `.card.isSelected` (2px solid accent-primary border), `.image` (aspect-ratio 1, overflow hidden, radius inherited), `.img` (object-fit cover, transition-slow for scale), `.card:hover .img` (scale 1.03), `.overlay` (absolute inset-0, overlay-light, opacity 0→1 on hover), `.text` (padding-4, border-top color-border), `.title` (font-semibold, text-primary, body-md), `.meta` (font-xs, text-tertiary), `.skeletonImage` + `.skeletonTitle` + `.skeletonMeta` (compose from `.skeleton` in animations.css with appropriate dimensions)
- [X] T010 [US1] Update `src/components/albums/AlbumCard.tsx`: add `isLoading?: boolean` and `isSelected?: boolean` props; import `styles from './AlbumCard.module.css'`; replace all `style={{ }}` props with CSS module class names; render skeleton markup when `isLoading` is true; apply `.isSelected` class when selected; handle image `onError` to show placeholder
- [X] T010 [P] [US1] Create `src/components/albums/AlbumGrid.module.css` with: `.grid` (display grid, auto-fill, minmax 240px 1fr, gap-grid, padding-section), `.empty` (display flex, flex-direction column, align-items center, justify-content center, min-height 300px)
- [X] T010 [US1] Update `src/components/albums/AlbumGrid.tsx`: import `styles from './AlbumGrid.module.css'`; replace all `style={{ }}` props with CSS module class names; ensure empty state renders `EmptyState` component in `.empty` wrapper
- [X] T010 [P] [US1] Create `src/views/MainPage.module.css` with: `.page` (min-height 100vh, bg-bg-secondary), `.header` (bg-bg-primary, shadow-sm, padding using tokens), `.content` (max-width 1920px, margin auto, padding-section)
- [X] T010 [US1] Update `src/views/MainPage.tsx`: import `styles from './MainPage.module.css'`; replace all `style={{ }}` props with CSS module class names
- [X] T010 [P] [US1] Create `src/App.module.css` with navigation styles: `.app` (min-height 100vh), `.nav` (bg-bg-primary, border-bottom, shadow-sm), `.navLink` (text-secondary, hover text-primary, transition-fast), `.navLink.active` (text accent-primary, font-semibold, border-bottom or left-border indicator)
- [X] T010 [US1] Update `src/App.tsx`: import `styles from './App.module.css'`; replace all `style={{ }}` props with CSS module class names; apply `.active` class to the current route nav link

**Checkpoint**: Run `npm run test:e2e -- ui-us1`. T009 E2E test must pass (GREEN). Verify the main page renders with modern card layout, correct button hierarchy, and no axe violations.

---

## Phase 4: User Story 2 — Modern Photo Gallery Experience (Priority: P2)

**Goal**: Photo grid inside an album shows cards with uniform sizing, rounded corners, card elevation, responsive layout, skeleton loading screens, and a styled empty state.

**Independent Test**: Open any album in the app. Verify photo cards have `border-radius ≥ 12px`, a visible shadow, even grid spacing, and an overlay on hover. Open an empty album and verify a styled empty state message appears. Run `npm run test:e2e -- ui-us2`.

### Tests for User Story 2 ⚠️ Write FIRST — verify RED before implementing

- [ ] T020 [P] [US2] Write E2E test for US2 in `tests/e2e/ui-us2-modern-gallery.spec.ts`: assertions for (1) photo tiles have `border-radius ≥ 12px`, (2) grid renders at correct column count at 768px, 1280px, 1920px viewports, (3) empty album shows styled message (not blank), (4) `checkA11y(page)` passes on album view route — test must FAIL (RED) before implementation

### Implementation for User Story 2

- [ ] T021 [P] [US2] Create `src/components/photos/PhotoTile.module.css` with: `.tile` (bg-surface, radius-card, shadow-sm, border color-border, overflow hidden, transition-base, cursor pointer), `.tile:hover` (shadow-md, translateY(-3px)), `.tile:active` (shadow-sm, scale 0.98), `.imageWrapper` (aspect-ratio 1, overflow hidden, position relative, bg-surface-subtle), `.img` (width/height 100%, object-fit cover, transition-slow scale), `.tile:hover .img` (scale 1.05), `.overlay` (absolute inset-0, overlay-light opacity 0→1 on hover, flex center), `.skeletonWrapper` (aspect-ratio 1, full width), `.skeleton` (compose animation from animations.css), `.errorPlaceholder` (bg-surface-subtle, flex center, icon in text-tertiary)
- [ ] T022 [US2] Update `src/components/photos/PhotoTile.tsx`: add `isLoading?: boolean` prop; import `styles from './PhotoTile.module.css'`; replace all `style={{ }}` props with CSS module class names; render skeleton markup when `isLoading` is true; handle `onError` on `<img>` to show `.errorPlaceholder`
- [ ] T023 [P] [US2] Create `src/components/photos/PhotoGrid.module.css` with: `.grid` (display grid, auto-fill, minmax 200px 1fr, gap-grid, padding-section)
- [ ] T024 [US2] Update `src/components/photos/PhotoGrid.tsx`: import `styles from './PhotoGrid.module.css'`; replace all `style={{ }}` props with CSS module class names; pass `isLoading` prop to each `PhotoTile`; render `EmptyState` when grid is empty
- [ ] T025 [P] [US2] Create `src/components/common/EmptyState.module.css` with: `.container` (display flex, flex-direction column, align-items center, gap-stack, padding-section, text-center), `.icon` (size-icon-xl, text-tertiary, margin-bottom spacing-4), `.heading` (font-size-body-lg, font-semibold, text-primary), `.body` (font-size-body-md, text-secondary, max-width 320px), `.cta` (margin-top spacing-4)
- [ ] T026 [US2] Update `src/components/common/EmptyState.tsx`: import `styles from './EmptyState.module.css'`; replace all `style={{ }}` props with CSS module class names; ensure the component receives and renders a heading, body text, and optional CTA button with proper styling
- [ ] T027 [P] [US2] Create `src/components/albums/AlbumView.module.css` with: `.view` (display flex, flex-direction column, min-height 100vh, bg-bg-secondary), `.header` (bg-bg-primary, shadow-sm, padding-card, flex space-between), `.body` (flex 1, padding-section)
- [ ] T028 [US2] Update `src/components/albums/AlbumView.tsx`: import `styles from './AlbumView.module.css'`; replace all `style={{ }}` props with CSS module class names
- [ ] T029 [P] [US2] Create `src/views/AlbumViewPage.module.css` with: `.page` (min-height 100vh, bg-bg-secondary)
- [ ] T030 [US2] Update `src/views/AlbumViewPage.tsx`: import `styles from './AlbumViewPage.module.css'`; replace all `style={{ }}` props with CSS module class names

**Checkpoint**: Run `npm run test:e2e -- ui-us2`. T020 E2E test must pass (GREEN). Photo grid renders cleanly with cards, correct empty state, and responsive layout at all viewport widths.

---

## Phase 5: User Story 3 — Interactive Feedback & Micro-interactions (Priority: P3)

**Goal**: Hover states, click feedback, and drag-and-drop visual cues are clearly communicated across all interactive elements. Users receive immediate visual feedback for every interaction.

**Independent Test**: Hover over photo/album cards — verify visible shadow lift. Click a button — verify active scale feedback. Drag a photo or album — verify drag-source opacity drop and drop-target dashed border. Run `npm run test:e2e -- ui-us3`.

### Tests for User Story 3 ⚠️ Write FIRST — verify RED before implementing

- [ ] T031 [P] [US3] Write E2E test for US3 in `tests/e2e/ui-us3-micro-interactions.spec.ts`: assertions for (1) hover on album card changes `box-shadow` (Playwright evaluate computed style), (2) primary button has `outline` style on keyboard `:focus-visible`, (3) drag start on draggable card adds a CSS class with opacity < 1, (4) `checkA11y(page)` passes — test must FAIL (RED) before implementation

### Implementation for User Story 3

- [ ] T032 [US3] Enhance `src/components/albums/AlbumCard.module.css`: add `.isDragging` class (opacity 0.6, shadow-lg, cursor grabbing, scale 1.02), `.isDropTarget` class (border 2px dashed accent-secondary, bg accent-secondary-light, transition-fast)
- [ ] T033 [US3] Update `src/components/albums/AlbumCard.tsx`: apply `styles.isDragging` CSS class during `onDragStart` → `onDragEnd` lifecycle; apply `styles.isDropTarget` CSS class during `onDragOver` → `onDragLeave`/`onDrop` lifecycle; ensure drag handlers use `className` (CSS) not inline `style`
- [ ] T034 [US3] Enhance `src/components/photos/PhotoTile.module.css`: add `.isDragging` class (opacity 0.6, shadow-lg, cursor grabbing), `.isDropTarget` class (border 2px dashed accent-secondary, bg accent-secondary-light), `.tile:active` scale(0.97) for click feedback (if not already added in T021)
- [ ] T035 [US3] Update `src/components/photos/PhotoTile.tsx`: apply `styles.isDragging` and `styles.isDropTarget` CSS class names during drag lifecycle events; ensure existing drag handlers are class-based not style-based
- [ ] T036 [P] [US3] Create `src/components/common/ConfirmDialog.module.css` with: `.overlay` (fixed inset-0, bg overlay-dark, z-modal-bg, flex center), `.dialog` (bg-surface, radius-lg, shadow-xl, padding-section, max-width 400px), `.title` (font-semibold, body-lg, text-primary, margin-bottom spacing-4), `.message` (text-secondary, body-md, margin-bottom spacing-6), `.actions` (flex gap-spacing-4, justify-flex-end)
- [ ] T037 [US3] Update `src/components/common/ConfirmDialog.tsx`: import `styles from './ConfirmDialog.module.css'`; replace all `style={{ }}` props with CSS module class names; confirm button uses `.buttonDestructive` pattern (from Toolbar.module.css tokens reference), cancel uses `.buttonSecondary` pattern
- [ ] T038 [US3] Verify all interactive elements in migrated components have `:focus-visible` styles in their CSS modules: check Toolbar.module.css, AlbumCard.module.css, PhotoTile.module.css — add `outline: 2px solid var(--color-border-focus); outline-offset: 2px;` to any missing `:focus-visible` selectors

**Checkpoint**: Run `npm run test:e2e -- ui-us3`. T031 E2E test must pass (GREEN). All drag interactions, hover states, and keyboard focus rings are visually present.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Modernize remaining components not covered by US1–3 and validate the full design system across the entire application.

- [ ] T039 [P] Create `src/components/albums/AlbumForm.module.css` and update `src/components/albums/AlbumForm.tsx` to replace all inline styles with CSS module classes; form input fields use `--radius-input` and `--color-border-focus` focus styles
- [ ] T040 [P] Create `src/components/albums/AddPhotosButton.module.css` and update `src/components/albums/AddPhotosButton.tsx` to replace all inline styles with CSS module classes; styled as secondary/outlined button using tokens
- [ ] T041 [P] Create `src/components/common/SortToggle.module.css` and update `src/components/common/SortToggle.tsx` to replace all inline styles with CSS module classes
- [ ] T042 [P] Create `src/components/common/UnsavedBadge.module.css` and update `src/components/common/UnsavedBadge.tsx` to replace all inline styles with CSS module classes; badge uses `--radius-full` and accent-primary-light background
- [ ] T043 [P] Create `src/components/photos/Lightbox.module.css` and update `src/components/photos/Lightbox.tsx` to replace all inline styles with CSS module classes; overlay uses `--color-overlay-dark`, `--z-modal`
- [ ] T044 [P] Create `src/components/trash/TrashItem.module.css` and update `src/components/trash/TrashItem.tsx` to replace all inline styles with CSS module classes
- [ ] T045 [P] Create `src/components/trash/TrashView.module.css` and update `src/components/trash/TrashView.tsx` to replace all inline styles with CSS module classes
- [ ] T046 [P] Create `src/views/TrashPage.module.css` and update `src/views/TrashPage.tsx` to replace all inline styles with CSS module classes
- [ ] T047 Run grep verification: `grep -r 'style={{' src/` — confirm zero remaining inline `style={{ }}` props in all `.tsx` files (document any intentional exceptions with a comment)
- [ ] T048 [P] Run full Vitest suite: `npm test` — all existing unit + integration tests must pass; fix any regressions caused by component prop changes
- [ ] T049 [P] Run full Playwright E2E suite: `npm run test:e2e` — all existing `us1-` through `us5-` specs plus the three new `ui-us1-`, `ui-us2-`, `ui-us3-` specs must pass; fix any failures
- [ ] T050 Run axe-playwright accessibility audit on all three primary views (main page, album view, trash page); fix any WCAG 2.1 AA violations before marking this task complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1; BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Phase 2 only — can start independently
- **User Story 2 (Phase 4)**: Depends on Phase 2 only — can start independently
- **User Story 3 (Phase 5)**: Depends on Phase 2 + US1 & US2 CSS modules (T010, T012, T021) — start after phases 3 & 4 complete
- **Polish (Phase 6)**: Depends on all prior phases complete

### User Story Dependencies

- **US1 (P1)**: Requires foundational tokens/CSS only — no other US dependency
- **US2 (P2)**: Requires foundational tokens/CSS only — independent of US1
- **US3 (P3)**: Requires US1 CSS modules (AlbumCard, Toolbar) and US2 CSS modules (PhotoTile) to enhance — implement after US1 and US2

### Within Each User Story

- E2E test tasks MUST be written and verified RED before implementation
- CSS module files MUST be created before updating the corresponding `.tsx` file
- `.tsx` component updates MUST be complete before E2E checkpoint validation

### Parallel Opportunities

| Parallel group | Tasks |
|---------------|-------|
| Foundational CSS files | T006, T007 (same phase, different files) |
| US1 CSS modules | T010, T012, T014, T016, T018 (all different files) |
| US2 CSS modules | T021, T023, T025, T027, T029 (all different files) |
| US3 new CSS files | T036 (new file, parallel with T032/T034 enhancements) |
| Polish CSS + TS pairs | T039–T046 (all different components, fully parallel) |
| Final validation | T048, T049 (different test runners — run together) |

---

## Parallel Example: User Story 1

```bash
# Step 1: Write E2E test (single task, must verify RED)
Task T009: Write tests/e2e/ui-us1-modern-navigation.spec.ts

# Step 2: Create all CSS module files in parallel
Task T010: Toolbar.module.css
Task T012: AlbumCard.module.css
Task T014: AlbumGrid.module.css
Task T016: MainPage.module.css
Task T018: App.module.css

# Step 3: Update TSX files (each depends on its own CSS module above)
Task T011: Toolbar.tsx        ← after T010
Task T013: AlbumCard.tsx      ← after T012
Task T015: AlbumGrid.tsx      ← after T014
Task T017: MainPage.tsx       ← after T016
Task T019: App.tsx            ← after T018
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T002)
2. Complete Phase 2: Foundational (T003–T008) — CRITICAL
3. Complete Phase 3: User Story 1 (T009–T019)
4. **STOP and VALIDATE**: `npm test && npm run test:e2e -- ui-us1`
5. Demo: main page with modern album grid and toolbar

### Incremental Delivery

1. Setup + Foundational → design system live in the app
2. + US1 → modern home page with album grid (MVP demo)
3. + US2 → modern photo gallery (core interaction surface)
4. + US3 → micro-interactions (feel alive and reactive)
5. + Polish → full app coverage

### Parallel Team Strategy

With multiple developers after Phase 2 completes:
- Developer A: Phase 3 (US1 — navigation and home)
- Developer B: Phase 4 (US2 — photo gallery)
- Developer C waits for A and B to finish, then: Phase 5 (US3 — micro-interactions)

---

## Notes

- **[P] tasks**: different files, no shared dependencies within the same phase — safe to parallelize
- **[Story] label**: maps each task to its acceptance scenario for traceability against spec.md
- **No magic values**: every CSS file MUST use `var(--*)` tokens; never hard-code hex, px, or ms values
- **TDD**: E2E tests in RED before implementation, GREEN at checkpoint — Constitution Principle II
- **No inline styles**: after migration, `grep -r 'style={{' src/` must return zero results
- **WCAG**: `axe-playwright` must pass on all primary views — Constitution Principle III
- Commit after each phase checkpoint (or per logical task group)
