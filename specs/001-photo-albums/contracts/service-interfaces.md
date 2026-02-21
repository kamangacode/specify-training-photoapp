# Contract: Service Interfaces

**Feature**: Photo Album Organizer (001-photo-albums)
**Date**: 2026-02-21

These are the TypeScript interface contracts for the three core services. Implementations live in `src/services/`. Each service has a single responsibility and is independently testable.

---

## 1. EXIF Service (`src/services/exif.ts`)

Responsible for extracting photo metadata from image files.

```typescript
/**
 * Attempts to parse the date a photo was taken from its EXIF metadata.
 * Uses the DateTimeOriginal EXIF tag.
 *
 * @param file - A File object from the browser file picker.
 * @returns The date the photo was taken, or null if no EXIF date is available.
 */
export function parsePhotoDate(file: File): Promise<Date | null>;

/**
 * Checks whether a File is an accepted image type.
 * Validates by MIME type (not file extension).
 *
 * @param file - A File object to validate.
 * @returns true if the file is an accepted image; false otherwise.
 */
export function isAcceptedImageFile(file: File): boolean;

// Accepted MIME types (defined in src/constants.ts):
// ACCEPTED_MIME_TYPES = [
//   'image/jpeg', 'image/png', 'image/webp',
//   'image/gif', 'image/heic', 'image/heif'
// ]
```

**Contract rules:**
- `parsePhotoDate` MUST NOT throw. On any error (parse failure, unsupported format), return `null`.
- `parsePhotoDate` MUST NOT block the main thread (must be async).
- `isAcceptedImageFile` MUST check `file.type` against `ACCEPTED_MIME_TYPES`; MUST NOT rely on the file extension alone.

---

## 2. Save File Service (`src/services/saveFile.ts`)

Responsible for exporting and importing the `.photoalbum.zip` save file.

```typescript
/**
 * Exports the current application state to a ZIP file and triggers a browser download.
 * Includes all albums, photos (active + trashed), and the raw image blobs.
 * Updates AppState.lastExportedAt and resets hasUnsavedChanges after success.
 *
 * @param state   - Current AppState (albums, photos, albumOrder).
 * @param blobs   - Map of photoId → Blob for all photos.
 * @param filename - Optional custom filename (default: "photos-YYYY-MM-DD.photoalbum.zip").
 * @throws {ExportError} if ZIP generation fails.
 */
export function exportToFile(
  state: Readonly<AppState>,
  blobs: ReadonlyMap<string, Blob>,
  filename?: string
): Promise<void>;

/**
 * Imports a .photoalbum.zip file and returns the reconstructed application state.
 * Validates the ZIP structure and manifest before returning.
 * Does NOT modify global app state — the caller applies the returned state via dispatch.
 *
 * @param file - A File object pointing to a .photoalbum.zip archive.
 * @returns The reconstructed AppState and a new Blob map for all photos.
 * @throws {ImportError} with a user-readable message if the file is invalid or corrupt.
 */
export function importFromFile(
  file: File
): Promise<{ state: AppState; blobs: Map<string, Blob> }>;

// Error types
export class ExportError extends Error {
  constructor(message: string, cause?: unknown);
}

export class ImportError extends Error {
  readonly code: 'INVALID_FILE' | 'MISSING_MANIFEST' | 'CORRUPT_DATA' | 'VERSION_MISMATCH';
  constructor(code: ImportError['code'], message: string, cause?: unknown);
}
```

**Contract rules:**
- `exportToFile` MUST generate the ZIP asynchronously (never block the main thread).
- `exportToFile` MUST revoke any previously created download Object URL after triggering the download.
- `importFromFile` MUST validate all rules from the save file format contract before returning.
- `importFromFile` MUST generate a Blob URL for each photo and include it in `AppState.photoBlobs`.
- Both functions MUST surface user-readable error messages (no raw stack traces per constitution Principle III).

---

## 3. Photo Import Service (`src/services/fileImport.ts`)

Responsible for processing image files selected via the browser file picker and creating Photo records.

```typescript
/**
 * Processes an array of File objects from the browser file picker for import into an album.
 * Filters out unsupported file types (with per-file error reporting, not a wholesale failure).
 * Parses EXIF dates; falls back to file.lastModified for missing metadata.
 * Creates a Blob URL for each accepted photo.
 *
 * @param files   - Array of File objects from the file input element.
 * @param albumId - ID of the album the photos are being added to.
 * @returns Object containing successfully created Photo records, their Blobs, and any per-file errors.
 */
export function processPhotoFiles(
  files: File[],
  albumId: string
): Promise<{
  photos: Photo[];
  blobs: Map<string, Blob>;
  errors: Array<{ fileName: string; reason: string }>;
}>;
```

**Contract rules:**
- `processPhotoFiles` MUST NOT fail the entire batch if one file is invalid — process valid files and collect errors for invalid ones.
- `processPhotoFiles` MUST call `isAcceptedImageFile` from the EXIF service to validate each file.
- The returned `errors` array MUST contain a user-readable `reason` string for each rejected file.
- Each returned `Photo` MUST have `status: 'active'`, `albumId` set to the provided `albumId`, and `manualSortIndex` set to its position in the returned array (caller appends to album's existing `photoIds`).

---

## 4. AppState Reducer Actions

The following action types are dispatched to the `useReducer` in `AppContext`. This is the internal mutation API — not a service, but documented here as it forms the contract between UI components and state management.

```typescript
type AppAction =
  // Albums
  | { type: 'CREATE_ALBUM'; payload: { name: string } }
  | { type: 'RENAME_ALBUM'; payload: { albumId: string; name: string } }
  | { type: 'DELETE_ALBUM'; payload: { albumId: string } }           // moves photos to Trash
  | { type: 'REORDER_ALBUMS'; payload: { albumOrder: string[] } }   // full new order array

  // Photos
  | { type: 'ADD_PHOTOS'; payload: { photos: Photo[]; blobs: Map<string, Blob> } }
  | { type: 'TRASH_PHOTO'; payload: { photoId: string } }
  | { type: 'RESTORE_PHOTO'; payload: { photoId: string; targetAlbumId: string } }
  | { type: 'DELETE_PHOTO'; payload: { photoId: string } }          // permanent; revokes Blob URL

  // Photo sorting within album
  | { type: 'SET_PHOTO_SORT_MODE'; payload: { albumId: string; mode: 'date' | 'manual' } }
  | { type: 'REORDER_PHOTOS'; payload: { albumId: string; photoIds: string[] } }

  // Persistence
  | { type: 'IMPORT_STATE'; payload: { state: AppState; blobs: Map<string, Blob> } }
  | { type: 'MARK_EXPORTED'; payload: { exportedAt: string } };
```

**Contract rules:**
- Every action MUST set `hasUnsavedChanges: true` EXCEPT `IMPORT_STATE` and `MARK_EXPORTED`.
- `DELETE_ALBUM` MUST move all active photos in the album to Trash (not permanently delete).
- `DELETE_PHOTO` MUST call `URL.revokeObjectURL` on the photo's Blob URL before removing it.
- `REORDER_ALBUMS` payload MUST be the complete new `albumOrder` array (not a delta).
- The reducer MUST be a pure function with no side effects.
