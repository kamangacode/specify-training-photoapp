# Contract: Save File Format

**Feature**: Photo Album Organizer (001-photo-albums)
**Date**: 2026-02-21

---

## Overview

The save file is the application's sole persistence mechanism (FR-016, FR-017). It is a ZIP archive with the extension `.photoalbum.zip`, downloadable by the user and loadable via the browser file picker. It contains all album metadata, photo metadata, and the raw image binaries.

---

## File Extension & MIME Type

| Property | Value |
|----------|-------|
| Extension | `.photoalbum.zip` |
| MIME type on import | `application/zip` or `application/x-zip-compressed` (both accepted) |
| Content-Type on export download | `application/zip` |

---

## ZIP Structure

```
<user-chosen-name>.photoalbum.zip
├── manifest.json       Required. Contains all metadata.
└── photos/             Required. Contains all image files.
    ├── {photoId}.jpg   One file per photo; name = photoId + original extension.
    ├── {photoId}.png
    └── ...
```

- `manifest.json` MUST be at the ZIP root (not nested in a subdirectory).
- `photos/` MUST be a directory at the ZIP root.
- Photo files MUST be named exactly `{photoId}.{extension}` where `extension` matches the photo's `mimeType`.
- Trashed photos ARE included in the save file (both in `manifest.json` and in `photos/`).

---

## manifest.json Schema

```jsonc
{
  // Schema version. MUST be present. Used for forward/backward compatibility checks.
  "version": "1.0.0",

  // ISO-8601 UTC timestamp of when this file was exported.
  "exportedAt": "2026-02-21T14:30:00.000Z",

  // Array of all Album objects.
  "albums": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",  // UUID v4
      "name": "Summer 2025",                          // 1–100 chars
      "photoIds": [                                   // ordered; defines manual sort
        "7b3f1d2a-...",
        "a8c42e9b-..."
      ],
      "photoSortMode": "date",                        // "date" | "manual"
      "coverPhotoId": "7b3f1d2a-...",                 // UUID | null
      "createdAt": "2026-02-10T09:00:00.000Z"
    }
  ],

  // Array of all Photo objects (active + trashed). blobUrl is NEVER included.
  "photos": [
    {
      "id": "7b3f1d2a-...",
      "albumId": "550e8400-...",         // "" (empty string) when trashed
      "originalAlbumId": "550e8400-...",
      "fileName": "IMG_1234.jpg",
      "mimeType": "image/jpeg",
      "dateTaken": "2025-07-15T10:22:00.000Z",
      "dateImported": "2026-02-10T09:05:00.000Z",
      "dateTrashed": null,               // ISO-8601 string | null
      "status": "active",               // "active" | "trashed"
      "manualSortIndex": 0
    }
  ],

  // Ordered array of album IDs defining the custom main-page sort order.
  "albumOrder": [
    "550e8400-...",
    "another-album-id-..."
  ]
}
```

---

## Versioning & Compatibility

| Rule | Detail |
|------|--------|
| Current schema version | `1.0.0` |
| Version format | Semantic versioning (`MAJOR.MINOR.PATCH`) |
| Breaking change → | MAJOR bump (app MUST reject incompatible versions with a clear user message) |
| Additive change → | MINOR bump (app MUST accept and ignore unknown fields) |
| Clarification → | PATCH bump (fully backward compatible) |

**Import version handling:**
- If `manifest.version` MAJOR differs from the app's supported MAJOR: show an error — "This save file was created by a newer version of the app and cannot be opened."
- If `manifest.version` MAJOR matches: import proceeds; unknown fields in albums/photos are ignored.

---

## Validation Rules on Import

1. ZIP MUST contain `manifest.json` at root. Error: "Invalid save file: manifest.json not found."
2. ZIP MUST contain a `photos/` directory. Error: "Invalid save file: photos directory not found."
3. Every photo ID in `manifest.json` MUST have a corresponding file in `photos/`. Error: "Save file is corrupt: missing image for photo {id}."
4. Every photo ID in each album's `photoIds` MUST exist in the `photos` array. Error: "Save file is corrupt: album references unknown photo {id}."
5. Every album ID in `albumOrder` MUST exist in the `albums` array. Unknown IDs are silently dropped.
6. `mimeType` MUST be one of the accepted image types. Unsupported types are silently skipped with a non-blocking warning in the UI.

---

## Export Behavior

- Export is triggered manually by the user (FR-016).
- The default download filename: `photos-{YYYY-MM-DD}.photoalbum.zip` using the export date.
- After a successful export, `AppState.lastExportedAt` is updated and `hasUnsavedChanges` resets to `false` (FR-018).
- If the user has made no changes since the last export, the export still proceeds (no-op prevention is a UX hint, not a block).

---

## Import Behavior

- Import is triggered manually by the user (FR-017).
- The browser file picker filters for `.zip` and `.photoalbum.zip` files.
- If the app currently has unsaved changes, the user MUST be warned before the import replaces in-memory state (FR-018).
- Blob URLs are generated for each imported photo immediately after import and stored in `AppState.photoBlobs`.
- After successful import, `hasUnsavedChanges` is set to `false` (the imported file is considered the baseline).
