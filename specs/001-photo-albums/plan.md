# Implementation Plan: Photo Album Organizer

**Branch**: `001-photo-albums` | **Date**: 2026-02-21 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-photo-albums/spec.md`

## Summary

Build a browser-based, single-user photo album organizer with no backend. Users manually create named albums, add photos from their device, and browse them in a tile grid with a lightbox viewer. Albums are ordered on a main page via drag-and-drop; photos within an album default to date sort with a toggle for manual drag-and-drop order. A Trash area holds deleted photos before permanent removal. All data persists via explicit export/import of a single bundled save file (ZIP containing image files + JSON manifest). No server, no automatic persistence.

**Tech approach**: React SPA built with Vite. State managed in-memory with React Context + useReducer. EXIF parsing via `exifr`. Drag-and-drop via `@dnd-kit/core`. Save file bundling via `JSZip`. Testing via Vitest (unit/integration) + Playwright (E2E).

## Technical Context

**Language/Version**: TypeScript 5.x + React 18 (JSX)
**Primary Dependencies**: Vite 5 (build), exifr (EXIF parsing), @dnd-kit/core + @dnd-kit/sortable (drag-and-drop), JSZip (save file bundling), React Context + useReducer (state)
**Storage**: In-session browser memory; persistence via user-triggered export (ZIP download) and import (file picker)
**Testing**: Vitest + React Testing Library (unit/integration), Playwright (E2E/acceptance)
**Target Platform**: Modern web browsers — Chrome, Firefox, Safari, Edge (latest 2 major versions); no installation required
**Project Type**: Frontend-only web application (SPA)
**Performance Goals**: 60fps UI rendering; 500ms viewport tile load; <100ms drag-and-drop snap; <2s main page render for 50 albums; <3s cold start
**Constraints**: No backend, no cloud, no auth; browser file picker for photo import; photos stored as Blob URLs in-session; 50 albums / 200 photos scale targets; WCAG 2.1 AA accessibility; 150MB memory ceiling
**Scale/Scope**: Single user, single browser tab, up to 50 albums, up to 200 photos per album

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Code Quality
- ✅ All components will have a single responsibility (display vs. logic separated via custom hooks and services)
- ✅ No magic numbers: all constants (scale limits, timing budgets, accepted MIME types) extracted to a `constants.ts`
- ✅ Complexity justified: `@dnd-kit` chosen over native HTML5 DnD because native lacks accessibility support required by constitution Principle III; documented in research.md

### II. Testing Standards
- ✅ TDD mandatory: test tasks must appear before implementation tasks in tasks.md
- ✅ Acceptance scenarios in spec (FR-001–FR-026) map 1:1 to E2E Playwright tests
- ✅ 80% coverage floor enforced in Vitest config via `coverage.thresholds`
- ✅ Red-Green-Refactor cycle enforced via task ordering (tests written → verified failing → implementation)

### III. User Experience Consistency
- ✅ All empty states defined in spec (no albums, empty album, empty trash)
- ✅ All error states defined (invalid file format, album deletion confirmation, photo deletion confirmation)
- ✅ Loading state: progressive tile loading with placeholder skeleton tiles while images decode
- ✅ WCAG 2.1 AA: `@dnd-kit` provides keyboard drag-and-drop; lightbox traps focus; all interactive elements have accessible labels

### IV. Performance Requirements
- ✅ 60fps: React rendering is batched; DnD previews use CSS transforms, not layout recalc
- ✅ 500ms viewport tiles: lazy loading via IntersectionObserver; only decode images in viewport
- ✅ <3s cold start: Vite code-splitting; no server round-trips; initial bundle target <250KB gzipped
- ✅ 150MB memory: Blob URLs released when albums/photos deleted; no duplicate image storage
- ✅ Performance regression CI: Playwright perf assertions on cold start and tile render timing

**Gate result: PASS — proceeding to Phase 0.**

## Project Structure

### Documentation (this feature)

```text
specs/001-photo-albums/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── save-file-format.md
│   └── service-interfaces.md
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── albums/          # AlbumGrid, AlbumCard, AlbumForm, AlbumView
│   ├── photos/          # PhotoGrid, PhotoTile, Lightbox
│   ├── trash/           # TrashView, TrashItem
│   └── common/          # EmptyState, ConfirmDialog, UnsavedBadge, SortToggle
├── hooks/               # useAlbums, usePhotos, useTrash, useLightbox
├── services/            # exif.ts, saveFile.ts, fileImport.ts
├── store/               # AppContext, reducer, actions, selectors
├── models/              # types.ts (Album, Photo, AppState, SaveFileManifest)
├── constants.ts         # SCALE_LIMITS, TIMING_BUDGETS, ACCEPTED_MIME_TYPES
└── main.tsx             # Entry point

tests/
├── unit/                # Service and hook unit tests
├── integration/         # Component integration tests (React Testing Library)
└── e2e/                 # Playwright acceptance tests (one file per user story)

public/                  # Static assets (favicon, etc.)
index.html
vite.config.ts
playwright.config.ts
```

**Structure Decision**: Frontend-only SPA. No backend directory. `src/` holds all application code split by concern (components, hooks, services, store, models). Tests mirror the three-level hierarchy from the constitution (unit → integration → E2E). This is the minimal structure for a React + Vite project of this scope.

## Complexity Tracking

> No constitution violations requiring justification at this stage.
