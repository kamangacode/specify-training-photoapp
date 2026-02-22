---

description: "Task list for Photo Album Organizer implementation"
---

# Tasks: Photo Album Organizer

**Input**: Design documents from `/specs/001-photo-albums/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅ | quickstart.md ✅

**Tests**: Included — constitution Principle II mandates Test-First Development (TDD). Tests MUST be written and verified failing before implementation begins.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US5)
- Include exact file paths in descriptions

## Path Conventions

- App source: `src/` at repository root
- Tests: `tests/unit/`, `tests/integration/`, `tests/e2e/`
- Config files at root: `vite.config.ts`, `playwright.config.ts`, `index.html`

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Initialize project toolchain and directory structure. No dependencies — start immediately.

- [X] T001 Initialize Vite + React + TypeScript project (`vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`)
- [X] T002 Install all dependencies in `package.json`: `react`, `react-dom`, `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `exifr`, `jszip`; devDeps: `vitest`, `@vitest/coverage-v8`, `@testing-library/react`, `@testing-library/user-event`, `playwright`, `@playwright/test`, `@axe-core/playwright`, `eslint`, `prettier`
- [X] T003 [P] Configure ESLint + Prettier (`.eslintrc.cjs`, `.prettierrc`) with React and TypeScript rules
- [X] T004 [P] Configure Vitest with 80% coverage threshold in `vite.config.ts` (`test.coverage.thresholds.lines: 80`)
- [X] T005 [P] Configure Playwright for E2E testing (`playwright.config.ts`): baseURL `http://localhost:5173`, chromium + firefox + webkit browsers
- [X] T006 [P] Create full source directory structure: `src/components/albums/`, `src/components/photos/`, `src/components/trash/`, `src/components/common/`, `src/hooks/`, `src/services/`, `src/store/`, `src/models/`, `tests/unit/`, `tests/integration/`, `tests/e2e/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types, state management, and shared components that ALL user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T007 Define all TypeScript types in `src/models/types.ts`: `PhotoSortMode`, `PhotoStatus`, `Album`, `Photo`, `AppState` (add `isCustomOrdered: boolean` field — `false` until first `REORDER_ALBUMS` action), `AppAction` (all action variants per contracts/service-interfaces.md), `SaveFileManifest`
- [X] T008 [P] Define application constants in `src/constants.ts`: `ACCEPTED_MIME_TYPES`, `MAX_ALBUM_NAME_LENGTH`, `SCALE_LIMITS` (50 albums, 200 photos), `TIMING_BUDGETS` (viewport 500ms, DnD snap 100ms)
- [X] T009 [P] Write unit tests for foundational reducer actions in `tests/unit/reducer.test.ts`: `ADD_PHOTOS`, `IMPORT_STATE`, `MARK_EXPORTED`, `SET_PHOTO_SORT_MODE`, `REORDER_PHOTOS`, and `CREATE_ALBUM` (verifies new album appended to `albumOrder`; `isCustomOrdered` remains `false`). DO NOT test management actions (covered in T046) or album drag actions (covered in T041). Verify failing before T010.
- [X] T010 Implement AppState reducer in `src/store/reducer.ts`: all 12 action types from contracts/service-interfaces.md; pure function, no side effects; `DELETE_ALBUM` moves photos to Trash; `DELETE_PHOTO` calls `URL.revokeObjectURL`; `REORDER_ALBUMS` sets `isCustomOrdered: true`; `CREATE_ALBUM` appends to end of `albumOrder`
- [X] T011 [P] Write unit tests for store selectors in `tests/unit/selectors.test.ts` — verify failing before T012
- [X] T012 Implement AppContext + selectors in `src/store/AppContext.tsx` and `src/store/selectors.ts`: `getAlbumById`, `getPhotosByAlbum`, `getTrashedPhotos`, `getDerivedDateRange`, `getPhotoCount`, `getSortedPhotos` (date and manual modes), `getOrderedAlbums` (returns albums sorted by latest photo date when `isCustomOrdered === false`; returns `albumOrder` sequence when `isCustomOrdered === true`)
- [X] T013 [P] Implement `EmptyState` component in `src/components/common/EmptyState.tsx`: accepts `message` and optional `action` props; WCAG AA compliant
- [X] T014 [P] Implement `ConfirmDialog` component in `src/components/common/ConfirmDialog.tsx`: modal with confirm/cancel; traps focus; closes on Escape
- [X] T015 [P] Implement `UnsavedBadge` component in `src/components/common/UnsavedBadge.tsx`: visible indicator when `AppState.hasUnsavedChanges` is true
- [X] T016 Wire `AppContext` provider into `src/main.tsx`; add basic router/view state for main page, album view, and trash view

**Checkpoint**: Foundation ready — user story implementation can begin in parallel.

---

## Phase 3: User Story 1 — Browse Albums on the Main Page (Priority: P1) 🎯 MVP

**Goal**: User opens the app and sees all albums as cards with cover image, name, photo count, and date range. Empty state shown when no albums exist.

**Independent Test**: Launch app with pre-seeded albums in AppContext; verify album cards render with correct metadata and chronological order.

### Tests for User Story 1 ⚠️ Write FIRST — verify FAILING before implementation

- [X] T017 [P] [US1] Write E2E test for US1 in `tests/e2e/us1-browse-albums.spec.ts`: seeded albums render with name/count/date range; chronological order; empty state shown with no albums; @axe-core/playwright a11y audit passes

### Implementation for User Story 1

- [X] T018 [P] [US1] Implement `AlbumCard` component in `src/components/albums/AlbumCard.tsx`: displays cover image, album name, photo count, and derived date range; keyboard accessible
- [X] T018a [P] [US1] Implement `useAlbums` hook in `src/hooks/useAlbums.ts`: wraps `getOrderedAlbums` and `dispatch`; exposes `albums`, `createAlbum(name)`, `renameAlbum(id, name)`, `deleteAlbum(id)` (depends on T012)
- [X] T019 [US1] Implement `AlbumGrid` component in `src/components/albums/AlbumGrid.tsx`: renders list of `AlbumCard` sorted by `albumOrder`; renders `EmptyState` when no albums exist (depends on T018)
- [X] T020 [US1] Wire main page view in `src/App.tsx`: renders `AlbumGrid` with albums from AppContext; shows `UnsavedBadge` in toolbar (depends on T019)

**Checkpoint**: User Story 1 fully functional and independently testable. Run `npm run test:e2e -- us1`.

---

## Phase 4: User Story 2 — Create an Album and Add Photos (Priority: P1)

**Goal**: User creates a named album and adds photos from the file picker. Album card updates with correct date range from EXIF metadata. Invalid files show per-file error messages without blocking valid ones.

**Independent Test**: Create an album, add photos with and without EXIF dates, verify album card date range and cover image update correctly.

### Tests for User Story 2 ⚠️ Write FIRST — verify FAILING before implementation

- [X] T021 [P] [US2] Write E2E test for US2 in `tests/e2e/us2-create-album.spec.ts`: album creation flow; add photos with EXIF date; date range on card updates; invalid file shows error; valid files still imported; a11y audit passes
- [X] T022 [P] [US2] Write unit tests for EXIF service in `tests/unit/exif.test.ts`: `parsePhotoDate` returns Date for JPEG with EXIF; returns null for PNG without EXIF; `isAcceptedImageFile` accepts valid MIME types; rejects others
- [X] T023 [P] [US2] Write unit tests for fileImport service in `tests/unit/fileImport.test.ts`: `processPhotoFiles` processes valid files; rejects invalid MIME types with error entries; falls back to `file.lastModified` when EXIF absent; sets correct `albumId` and `manualSortIndex`
- [X] T024 [P] [US2] Write integration test for album creation + photo add flow in `tests/integration/albumCreation.test.tsx`: renders `AlbumForm`; submits name; dispatches `CREATE_ALBUM`; add photos dispatches `ADD_PHOTOS`; `AlbumCard` date range updates

### Implementation for User Story 2

- [X] T025 [P] [US2] Implement EXIF service in `src/services/exif.ts`: `parsePhotoDate(file)` → `Promise<Date | null>` using `exifr`; `isAcceptedImageFile(file)` validates against `ACCEPTED_MIME_TYPES` (depends on T022 failing)
- [X] T026 [P] [US2] Implement fileImport service in `src/services/fileImport.ts`: `processPhotoFiles(files, albumId)` → `{ photos, blobs, errors }`; calls `isAcceptedImageFile` and `parsePhotoDate`; generates UUIDs; sets `status: 'active'` (depends on T023 failing)
- [X] T027 [US2] Implement `AlbumForm` component in `src/components/albums/AlbumForm.tsx`: modal/dialog with album name input; validates non-empty; dispatches `CREATE_ALBUM`; accessible (depends on T024 failing)
- [X] T028 [US2] Implement `AddPhotosButton` component in `src/components/albums/AddPhotosButton.tsx`: file picker input (accept image MIME types); calls `processPhotoFiles`; dispatches `ADD_PHOTOS`; displays per-file errors via inline message (depends on T025, T026)
- [X] T029 [US2] Add "Create Album" button to main page toolbar in `src/App.tsx`; add "Add Photos" button to album view; wire `AlbumForm` and `AddPhotosButton` (depends on T027, T028)

**Checkpoint**: User Stories 1 + 2 independently testable. Run `npm run test:e2e -- us1 us2`.

---

## Phase 5: User Story 3 — View and Sort Photos Inside an Album (Priority: P2)

**Goal**: User opens an album and sees photos in a tile grid (date sort default). Can switch to manual drag-and-drop sort. Clicking a tile opens lightbox with prev/next navigation and wrap-around. Off-screen tiles load progressively.

**Independent Test**: Open album with pre-loaded photos; verify date order; switch to manual mode; drag photo to new position; open lightbox; navigate prev/next including wrap-around; Escape closes lightbox.

### Tests for User Story 3 ⚠️ Write FIRST — verify FAILING before implementation

- [X] T030 [P] [US3] Write E2E test for US3 in `tests/e2e/us3-view-sort-photos.spec.ts`: photos in date order by default; manual mode drag reorders tiles; lightbox opens on click; prev/next navigation; wrap-around at first/last; Escape closes; 500ms tile render Playwright perf assertion; a11y audit passes
- [X] T031 [P] [US3] Write unit tests for `useLightbox` hook in `tests/unit/useLightbox.test.ts`: open, close, navigate next/prev, wrap-around at boundaries
- [X] T032 [P] [US3] Write unit tests for photo sort selectors in `tests/unit/selectors.test.ts`: `getSortedPhotos` returns date-ascending order in date mode; respects `manualSortIndex` in manual mode

### Implementation for User Story 3

- [X] T033 [P] [US3] Implement `useLightbox` hook in `src/hooks/useLightbox.ts`: `open(photoId)`, `close()`, `next()`, `prev()` with wrap-around; exposes `activePhotoId`, `isOpen` (depends on T031 failing)
- [X] T033a [P] [US3] Implement `usePhotos` hook in `src/hooks/usePhotos.ts`: wraps `getPhotosByAlbum`, `getSortedPhotos`, `dispatch`; exposes `photos`, `addPhotos(files)`, `trashPhoto(id)`, `setSortMode(mode)`, `reorderPhotos(ids)` (depends on T012, T026)
- [X] T034 [P] [US3] Implement `SortToggle` component in `src/components/common/SortToggle.tsx`: button toggling between `'date'` and `'manual'` sort mode; dispatches `SET_PHOTO_SORT_MODE`
- [X] T035 [P] [US3] Implement `PhotoTile` component in `src/components/photos/PhotoTile.tsx`: renders image preview from Blob URL; click handler calls `onOpen(photoId)`; keyboard accessible (Enter/Space)
- [X] T036 [US3] Implement `PhotoGrid` component (date sort) in `src/components/photos/PhotoGrid.tsx`: renders `PhotoTile` grid; uses `IntersectionObserver` for lazy loading (visible tiles first within 500ms); renders `EmptyState` when album empty (depends on T035)
- [X] T037 [US3] Add `@dnd-kit` manual sort to `PhotoGrid` in `src/components/photos/PhotoGrid.tsx`: wrap tiles in `SortableContext` with `rectSortingStrategy` when `photoSortMode === 'manual'`; dispatch `REORDER_PHOTOS` on drag end (depends on T036)
- [X] T038 [US3] Implement `Lightbox` component in `src/components/photos/Lightbox.tsx`: full-size overlay; prev/next controls; keyboard (← →, Escape); focus trap; click-outside closes; WCAG AA (depends on T033 failing)
- [X] T039 [US3] Implement `AlbumView` component in `src/components/albums/AlbumView.tsx`: renders `PhotoGrid` + `SortToggle` + `Lightbox` + `AddPhotosButton`; receives `albumId` prop; wires `useLightbox` (depends on T034, T036, T038)

**Checkpoint**: User Stories 1–3 independently testable. Run `npm run test:e2e -- us1 us2 us3`.

---

## Phase 6: User Story 4 — Reorder Albums via Drag and Drop (Priority: P2)

**Goal**: User drags album cards to new positions on the main page. Order saves to AppState and persists in the exported save file. New albums append at the end of the custom order.

**Independent Test**: Drag one album before another; verify immediate visual feedback and updated order; new album created after drag appears at end.

### Tests for User Story 4 ⚠️ Write FIRST — verify FAILING before implementation

- [X] T040 [P] [US4] Write E2E test for US4 in `tests/e2e/us4-reorder-albums.spec.ts`: drag album to new position; verify updated order; new album appends at end; keyboard drag (arrow keys + Enter) reorders correctly; a11y audit passes
- [X] T041 [P] [US4] Add unit tests for `REORDER_ALBUMS` to `tests/unit/reducer.test.ts` (additive — T009 did not cover this): new order stored in `albumOrder`; `isCustomOrdered` set to `true`; `hasUnsavedChanges` set `true`; subsequent `CREATE_ALBUM` appends to end. Verify failing before T042.

### Implementation for User Story 4

- [X] T042 [US4] Wrap `AlbumGrid` with `@dnd-kit` `DndContext` + `SortableContext` in `src/components/albums/AlbumGrid.tsx`; dispatch `REORDER_ALBUMS` on `onDragEnd`; use `verticalListSortingStrategy` or `rectSortingStrategy` for grid (depends on T041 failing)
- [X] T043 [US4] Make `AlbumCard` a sortable draggable item in `src/components/albums/AlbumCard.tsx`: apply `useSortable` hook; render drag handle with accessible label (depends on T042)
- [X] T044 [US4] Verify `REORDER_ALBUMS` sets `isCustomOrdered: true` in `src/store/reducer.ts`; update T041 unit test to assert `isCustomOrdered` transitions correctly; verify `getOrderedAlbums` selector switches from date-sort to custom-order mode after first drag

**Checkpoint**: User Stories 1–4 independently testable. Run `npm run test:e2e -- us1 us2 us3 us4`.

---

## Phase 7: User Story 5 — Manage Albums and Photos (Priority: P3)

**Goal**: User can rename albums, delete albums (photos move to Trash), move photos to Trash, restore photos, permanently delete photos. Full export/import save file flow. Unsaved-changes indicator throughout.

**Independent Test**: Rename album → verify new name; delete album → verify photos in Trash; restore photo → back in album; permanently delete → gone; export save file → re-import → full state restored.

### Tests for User Story 5 ⚠️ Write FIRST — verify FAILING before implementation

- [X] T045 [P] [US5] Write E2E test for US5 in `tests/e2e/us5-manage-albums-photos.spec.ts`: rename album; delete album (photos appear in Trash); trash photo from album; restore photo to album; restore photo when original album deleted (prompts for destination); permanently delete from Trash with confirmation; a11y audit passes
- [X] T046 [P] [US5] Add unit tests for management reducer actions to `tests/unit/reducer.test.ts` (additive — T009 did not cover these): `RENAME_ALBUM`, `DELETE_ALBUM` (moves photos to Trash; `albumOrder` entry removed), `TRASH_PHOTO`, `RESTORE_PHOTO` (restores `albumId`; handles missing album), `DELETE_PHOTO` (calls `URL.revokeObjectURL`). Note: `MARK_EXPORTED` is already covered in T009.
- [X] T047 [P] [US5] Write unit tests for saveFile service in `tests/unit/saveFile.test.ts`: `exportToFile` produces valid ZIP with manifest + photos directory; `importFromFile` reconstructs AppState; `ImportError` thrown for missing manifest, missing photo file, version mismatch

### Implementation for User Story 5

- [X] T047a [P] [US5] Implement `useTrash` hook in `src/hooks/useTrash.ts`: wraps `getTrashedPhotos`, `dispatch`; exposes `trashedPhotos`, `restorePhoto(id, targetAlbumId)`, `deletePhoto(id)` (depends on T012)
- [X] T048 [P] [US5] Add rename and delete controls to `AlbumCard` in `src/components/albums/AlbumCard.tsx`: inline rename input or edit dialog; delete button opens `ConfirmDialog`; dispatches `RENAME_ALBUM` / `DELETE_ALBUM` (depends on T046 failing)
- [X] T049 [P] [US5] Add "Move to Trash" action to `PhotoTile` in `src/components/photos/PhotoTile.tsx`: action button/menu; dispatches `TRASH_PHOTO` (no confirmation required per spec) (depends on T046 failing)
- [X] T050 [P] [US5] Implement `TrashItem` component in `src/components/trash/TrashItem.tsx`: photo thumbnail; original album name; removal date; "Restore" button (dispatches `RESTORE_PHOTO`; prompts album picker if original album deleted); "Delete Permanently" button (opens `ConfirmDialog`, dispatches `DELETE_PHOTO`)
- [X] T051 [US5] Implement `TrashView` component in `src/components/trash/TrashView.tsx`: list of `TrashItem` components; renders `EmptyState` when Trash is empty (depends on T050)
- [X] T052 [US5] Implement saveFile service in `src/services/saveFile.ts`: `exportToFile` (builds JSZip with `manifest.json` + `photos/` dir; triggers download; dispatches `MARK_EXPORTED`); `importFromFile` (parses ZIP; validates manifest per contracts/save-file-format.md; reconstructs Blob URLs; returns `{ state, blobs }`); `ExportError`; `ImportError` (depends on T047 failing)
- [X] T053 [US5] Implement `Toolbar` component in `src/components/common/Toolbar.tsx`: Export button (calls `exportToFile`); Import button (file picker → calls `importFromFile` → dispatches `IMPORT_STATE`; warns if unsaved changes exist); `UnsavedBadge`; Trash navigation button
- [X] T054 [US5] Wire full navigation in `src/App.tsx`: main page ↔ album view (click album card) ↔ trash view (click Trash in toolbar); render `Toolbar` on all views (depends on T051, T052, T053)

**Checkpoint**: All user stories independently functional. Run `npm run test:e2e`.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Performance, accessibility, and resilience improvements that span multiple user stories.

- [X] T055 [P] Add Playwright performance spec in `tests/e2e/performance.spec.ts`: cold start < 3s via `PerformanceObserver`; viewport tile render < 500ms on album with 200 photos; DnD snap < 100ms
- [X] T056 [P] Verify `@axe-core/playwright` a11y audit passes in all 5 E2E spec files; fix any WCAG 2.1 AA violations found
- [X] T057 [P] Add skeleton placeholder tiles to `PhotoGrid` in `src/components/photos/PhotoGrid.tsx`: render grey boxes while `IntersectionObserver` loads off-screen images
- [X] T058 [P] Add batch import error display to `AddPhotosButton` in `src/components/albums/AddPhotosButton.tsx`: non-blocking inline list of rejected file names and reasons
- [X] T059 [P] Verify lightbox wrap-around edge cases in `Lightbox` in `src/components/photos/Lightbox.tsx`: navigating backwards from first photo jumps to last; forwards from last jumps to first
- [X] T060 Run full test suite and verify coverage: `npm run test:all` — all tests green; `npm run test:coverage` — ≥ 80% lines
- [X] T061 Run `npm run lint` and `npm run format` — fix all lint and formatting issues
- [X] T062 Run quickstart.md validation checklist end-to-end: create album, add photos, export, close, re-import, verify state restored, drag to reorder, view lightbox, trash photo, restore

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — **BLOCKS all user stories**
- **User Stories (Phases 3–7)**: All depend on Phase 2 completion; can run in priority order or in parallel with sufficient team capacity
- **Polish (Phase 8)**: Depends on all user story phases being complete

### User Story Dependencies

- **US1 (P1)**: Can start immediately after Phase 2
- **US2 (P1)**: Can start immediately after Phase 2 — no dependency on US1
- **US3 (P2)**: Depends on US2 completing (needs `AddPhotosButton` and photo data)
- **US4 (P2)**: Depends on US1 completing (needs `AlbumGrid` and `AlbumCard`)
- **US5 (P3)**: Depends on US1, US2, US3 completing (uses `AlbumCard`, `PhotoTile`, `TrashView`)

### Within Each User Story

1. Write tests → verify they FAIL
2. Models / types first (T007 — foundational)
3. Services before components that depend on them
4. Core components before composite components
5. Wire-up tasks last

### Parallel Opportunities

- All Phase 1 [P] tasks (T003–T006) can run in parallel
- All Phase 2 [P] test-writing tasks (T009, T011) can run in parallel with [P] component tasks (T013–T015)
- US1 and US2 can start simultaneously after Phase 2
- US3 and US4 can start simultaneously (both P2) once their P1 dependencies complete
- Within each story, all [P]-marked tasks can run in parallel

---

## Parallel Example: User Story 2

```bash
# Step 1 — Write all US2 tests simultaneously (all [P]):
Task: "E2E test for US2 in tests/e2e/us2-create-album.spec.ts"          # T021
Task: "Unit tests for EXIF service in tests/unit/exif.test.ts"          # T022
Task: "Unit tests for fileImport service in tests/unit/fileImport.test.ts" # T023
Task: "Integration test for album creation in tests/integration/albumCreation.test.tsx" # T024

# Step 2 — Verify all tests FAIL

# Step 3 — Implement services simultaneously (all [P]):
Task: "Implement EXIF service in src/services/exif.ts"                   # T025
Task: "Implement fileImport service in src/services/fileImport.ts"       # T026

# Step 4 — Implement components (sequential):
Task: "Implement AlbumForm in src/components/albums/AlbumForm.tsx"       # T027
Task: "Implement AddPhotosButton in src/components/albums/AddPhotosButton.tsx" # T028
Task: "Wire album creation and add-photos into App.tsx"                  # T029
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 → validate independently
4. Complete Phase 4: User Story 2 → validate independently
5. **STOP and VALIDATE**: Create album, add photos, verify cards and metadata correct
6. Demo / review before continuing

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. US1 → browse albums (empty state + album cards) → demo
3. US2 → create albums + add photos → demo
4. US3 → view photos + lightbox + sort → demo
5. US4 → album drag-and-drop reorder → demo
6. US5 → trash + save file export/import → full app demo
7. Polish → performance + a11y gates → release ready

### Parallel Team Strategy

With two developers:

1. Both complete Setup + Foundational together
2. Once Phase 2 is done:
   - Dev A: US1 (AlbumGrid, AlbumCard) → then US4 (DnD on albums)
   - Dev B: US2 (EXIF, fileImport, AlbumForm) → then US3 (PhotoGrid, Lightbox)
3. US5 (saveFile, Trash, management) after US1 + US2 + US3 complete
4. Polish phase together

---

## Notes

- **[P]** tasks have no shared file dependencies — safe to run in parallel
- **[Story]** labels map each task to its user story for traceability
- Tests MUST be written and verified FAILING before implementation (constitution Principle II)
- Verify `npm run test:all` passes after each story phase before moving to the next
- Commit after each completed task or logical group
- Blob URLs MUST be revoked via `URL.revokeObjectURL` in `DELETE_PHOTO` reducer action (memory)
- All interactive elements MUST have accessible labels; `ConfirmDialog` MUST trap focus
- `hasUnsavedChanges` is set `true` by every reducer action except `IMPORT_STATE` and `MARK_EXPORTED`
