# Research: Photo Album Organizer (001-photo-albums)

**Date**: 2026-02-21
**Branch**: `001-photo-albums`

## 1. EXIF Metadata Parsing

**Decision**: `exifr`

**Rationale**: exifr is built specifically for modern browser environments, exposes a clean async API that accepts `File` objects directly from the browser file picker, ships with full TypeScript type definitions (no `@types` package needed), is actively maintained, and supports JPEG, PNG, WebP, and TIFF — covering all common photo formats users are likely to import.

**Alternatives considered**:
- `exif-js`: Older synchronous/callback-based API; less actively maintained; no native TypeScript support. Rejected.
- `piexifjs`: Lightweight but synchronous; limited documentation; primarily JPEG-only; less maintained. Rejected.

**Usage notes**:
- Tree-shake to import only EXIF tags needed (specifically `DateTimeOriginal`).
- Async-first: parse runs off the main thread render cycle — no UI jank during import.
- Bundle impact: ~40–60KB minified; acceptable for this app size.
- Fallback: if `DateTimeOriginal` is absent, use `file.lastModified` as the import-date fallback (per FR-006).

---

## 2. Drag-and-Drop

**Decision**: `@dnd-kit/core` + `@dnd-kit/sortable`

**Rationale**: The only evaluated library with first-class WCAG 2.1 AA keyboard accessibility (arrow-key reordering, Enter to confirm, Escape to cancel, screen-reader ARIA announcements) — a hard requirement from the project constitution (Principle III). It has a clean React 18 hooks API, supports both 1D list sorting (album grid on main page) and 2D grid sorting (photo tiles within an album), and separates the sensor/state engine (`@dnd-kit/core`) from the sortable UI logic (`@dnd-kit/sortable`), making the codebase easier to reason about.

**Alternatives considered**:
- `react-beautiful-dnd`: Polished visuals but in maintenance-only mode since 2021; keyboard drag-and-drop was never fully implemented. Does not meet accessibility requirement. Rejected.
- `SortableJS` + `react-sortablejs`: Feature-rich for mouse/touch but ARIA and keyboard support is secondary; cannot satisfy the constitution's accessibility mandate. Rejected.

**Usage notes**:
- Use separate `SortableContext` instances: one for the album grid on the main page, one inside each album for photo tiles. This prevents cross-context drag confusion and keeps ARIA scoping correct.
- Keyboard: arrow keys to move, Enter to drop, Escape to cancel. Test with VoiceOver (macOS/iOS) and NVDA (Windows).
- DnD drag previews use CSS `transform` — no layout recalculation, preserving 60fps (Principle IV).
- Photo tile grid uses `strategy: rectSortingStrategy` from `@dnd-kit/sortable` for 2D grid reordering.

---

## 3. Save File Bundling

**Decision**: `JSZip`

**Rationale**: The save file must contain both structured metadata (JSON) and binary image data. JSZip can bundle these into a single `.zip` file that the browser can download and the user can import — no server required. It is actively maintained, has TypeScript support, and works entirely in-browser.

**Alternatives considered**:
- Pure JSON with base64-encoded images: Simple but produces very large files (base64 adds ~33% overhead); impractical for albums with many photos. Rejected.
- IndexedDB automatic persistence: Would satisfy persistence but was explicitly ruled out by the user (clarification Q1: local file model selected). Not applicable.

**Usage notes**:
- Export structure: a `manifest.json` at the ZIP root plus a `photos/` directory containing each image file named by its photo ID with original extension.
- Import: read ZIP, parse `manifest.json`, reconstruct `Blob` URLs for each image at load time.
- File extension: `.photoalbum.zip` to distinguish from generic ZIPs.
- Memory: generate ZIP asynchronously via `JSZip.generateAsync({ type: 'blob' })` and use `URL.createObjectURL` for the download link — never hold the entire ZIP in memory as a string.

---

## 4. Frontend Framework & Build Tooling

**Decision**: React 18 + TypeScript 5 + Vite 5

**Rationale**: React 18's concurrent rendering and batched state updates are well-suited for a stateful photo app with many interactive elements. TypeScript ensures type safety across the Album, Photo, Trash, and AppState models. Vite 5 provides near-instant HMR and native ESM output, keeping cold start under the 3s budget with code-splitting.

**Alternatives considered**:
- Vue 3: Solid option but smaller ecosystem for dnd-kit and photo-app patterns compared to React. Not ruled out for future; React chosen for ecosystem alignment.
- Vanilla JS: No framework overhead, but state management complexity (albums, photos, trash, sort modes, drag state, lightbox state) would require significant custom infrastructure. Rejected for this scope.

**Usage notes**:
- State management: React Context + `useReducer` for global app state (albums, photos, albumOrder, unsaved-changes flag). No external state library needed at this scale.
- Code splitting: Lazy-load the Trash view and Lightbox components (not on the critical path for cold start).
- Initial bundle target: < 250KB gzipped (React ~45KB, dnd-kit ~20KB, exifr ~50KB, JSZip ~90KB, app code ~45KB).

---

## 5. Testing Stack

**Decision**: Vitest + React Testing Library (unit/integration) + Playwright (E2E/acceptance)

**Rationale**: Vitest is Vite-native — same config, same transform pipeline — making test runs fast and CI setup minimal. React Testing Library enforces testing from the user's perspective (no implementation details). Playwright covers the full browser E2E acceptance scenarios required by Principle II of the constitution (one Playwright test file per user story).

**Usage notes**:
- Coverage: `vitest --coverage` with `coverage.thresholds: { lines: 80 }` enforced in CI (Principle II).
- Accessibility audit: `@axe-core/playwright` plugin runs against every Playwright test that touches UI (Quality Gate: a11y check).
- Performance assertions: Playwright `page.evaluate` to assert cold start < 3s and tile render < 500ms via `PerformanceObserver` (Principle IV CI gate).
- TDD order enforced in task structure: Playwright E2E test written and verified failing → Vitest unit/integration tests written and verified failing → implementation.
