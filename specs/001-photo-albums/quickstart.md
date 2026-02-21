# Quickstart: Photo Album Organizer (001-photo-albums)

**Date**: 2026-02-21
**Branch**: `001-photo-albums`

---

## Prerequisites

- Node.js 20+ (LTS)
- npm 10+
- A modern browser (Chrome 120+, Firefox 120+, Safari 17+, or Edge 120+)

---

## Setup

```bash
# Clone and enter the repository
git clone <repo-url>
cd photoapp
git checkout 001-photo-albums

# Install dependencies
npm install
```

---

## Development

```bash
# Start the dev server with HMR
npm run dev
# → App running at http://localhost:5173
```

---

## Testing

```bash
# Run unit and integration tests (Vitest)
npm run test

# Run with coverage report (enforces 80% threshold)
npm run test:coverage

# Run E2E acceptance tests (Playwright — requires dev server running)
npm run test:e2e

# Run all tests (unit + E2E) — used in CI
npm run test:all
```

**TDD workflow (required by constitution Principle II):**

1. Write the Playwright E2E test for the user story you are implementing.
2. Run `npm run test:e2e` — confirm the test FAILS (Red).
3. Write Vitest unit/integration tests for the service or component.
4. Run `npm run test` — confirm these tests also FAIL.
5. Implement the feature until all tests pass (Green).
6. Refactor without breaking tests (Refactor).

---

## Build

```bash
# Production build (output to dist/)
npm run build

# Preview the production build locally
npm run preview
# → App running at http://localhost:4173
```

Bundle targets: < 250KB gzipped JavaScript, < 3s cold start on mid-range hardware.

---

## Linting & Formatting

```bash
# Run ESLint (required to pass before merge per Quality Gates)
npm run lint

# Auto-fix lint issues
npm run lint:fix

# Format with Prettier
npm run format
```

---

## Using the Application

### First Use (no save file)

1. Open the app in your browser.
2. Click **"Create Album"** on the empty main page.
3. Enter an album name and confirm.
4. Open the album and click **"Add Photos"**.
5. Select one or more image files from your device via the file picker.
6. Photos appear as tiles in the album. Date range updates on the album card.

### Saving Your Work

The app does NOT auto-save. Before closing the tab:

1. Click **"Export"** in the toolbar.
2. A `.photoalbum.zip` file is downloaded to your device.
3. The unsaved-changes indicator clears.

### Restoring From a Save File

1. Open the app in your browser.
2. Click **"Import"** in the toolbar.
3. Select your `.photoalbum.zip` file via the file picker.
4. All albums, photos, and custom order are restored.

### Reordering Albums

On the main page, drag an album card to a new position and drop it. The order is updated immediately. Remember to export to persist the new order.

### Viewing Photos

- Open an album to see the photo tile grid.
- Click any tile to open the full-size lightbox.
- Use the arrow controls (or keyboard ← →) to navigate between photos.
- Press Escape or click outside the photo to close the lightbox.

### Sorting Photos Within an Album

- Default: photos are sorted by date taken (oldest first).
- Click the **"Manual Sort"** toggle to switch to drag-and-drop mode.
- Drag photo tiles to reorder. Switch back to date sort at any time — manual order is preserved.

### Trash

- To remove a photo from an album, open the album, select the photo, and click **"Move to Trash"**.
- Access the **Trash** view from the main navigation.
- In Trash: click **"Restore"** to send a photo back to its album, or **"Delete Permanently"** to remove it forever.

---

## Project Structure Reference

```
src/
├── components/
│   ├── albums/       AlbumGrid, AlbumCard, AlbumForm
│   ├── photos/       PhotoGrid, PhotoTile, Lightbox
│   ├── trash/        TrashView, TrashItem
│   └── common/       EmptyState, ConfirmDialog, UnsavedBadge, SortToggle
├── hooks/            useAlbums, usePhotos, useTrash, useDragDrop, useLightbox
├── services/         exif.ts, saveFile.ts, fileImport.ts
├── store/            AppContext, reducer, actions, selectors
├── models/           types.ts
├── constants.ts
└── main.tsx

tests/
├── unit/             Service and hook tests (Vitest)
├── integration/      Component tests (Vitest + React Testing Library)
└── e2e/              Acceptance tests (Playwright)
    ├── us1-browse-albums.spec.ts
    ├── us2-create-album.spec.ts
    ├── us3-view-sort-photos.spec.ts
    ├── us4-reorder-albums.spec.ts
    └── us5-manage-albums-photos.spec.ts
```

---

## Validation Checklist

Before marking any feature task complete, verify:

- [ ] Tests pass: `npm run test:all`
- [ ] Coverage at or above 80%: `npm run test:coverage`
- [ ] Lint clean: `npm run lint`
- [ ] No console errors in browser dev tools
- [ ] Empty state, error state, and loading state all render correctly for the implemented flow
- [ ] Keyboard navigation works for any new interactive element (Tab, Enter, Escape)
- [ ] No albums are nested inside other albums
