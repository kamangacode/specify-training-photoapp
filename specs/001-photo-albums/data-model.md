# Data Model: Photo Album Organizer (001-photo-albums)

**Date**: 2026-02-21
**Branch**: `001-photo-albums`

---

## Entities

### Album

Represents a user-named container of photos. Always at the top level — never nested inside another album (FR-010).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` (UUID v4) | Yes | Unique identifier. Immutable after creation. |
| `name` | `string` | Yes | User-provided display name. Non-unique across albums. Min 1 char, max 100 chars. |
| `photoIds` | `string[]` | Yes | Ordered list of photo IDs belonging to this album. Defines manual sort order. Empty array for new albums. |
| `photoSortMode` | `'date' \| 'manual'` | Yes | Active sort mode for the album's photo grid. Defaults to `'date'`. |
| `coverPhotoId` | `string \| null` | Yes | ID of the photo used as the album card cover image. Defaults to the first photo added; `null` when album is empty. |
| `createdAt` | `string` (ISO-8601) | Yes | Timestamp when the album was created. |

**Derived (computed, never stored):**
- `dateRange: { earliest: Date; latest: Date } | null` — computed from the `dateTaken` of all active (non-trashed) photos in the album. `null` when album is empty.
- `photoCount: number` — count of active (non-trashed) photos in the album.

**Validation rules:**
- `name` MUST NOT be empty or whitespace-only.
- `photoIds` MUST NOT contain duplicate IDs.
- `photoIds` MUST NOT reference a photo belonging to a different album.
- `coverPhotoId` MUST be `null` or reference a photo in `photoIds`.

---

### Photo

Represents a single image file. Belongs to exactly one album or is held in Trash.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` (UUID v4) | Yes | Unique identifier. Immutable. |
| `albumId` | `string` | Yes | ID of the album this photo currently belongs to. Empty string `""` when photo is trashed. |
| `originalAlbumId` | `string` | Yes | ID of the album at the time the photo was most recently trashed. Identical to `albumId` when photo is active. Used for Trash restore flow. |
| `fileName` | `string` | Yes | Original file name including extension (e.g., `IMG_1234.jpg`). Used when re-exporting. |
| `mimeType` | `string` | Yes | MIME type of the image (e.g., `image/jpeg`, `image/png`, `image/webp`, `image/heic`). |
| `dateTaken` | `string` (ISO-8601) | Yes | Date the photo was taken. Sourced from EXIF `DateTimeOriginal` if present; falls back to `dateImported`. |
| `dateImported` | `string` (ISO-8601) | Yes | Timestamp when the photo was added to the application. |
| `dateTrashed` | `string \| null` (ISO-8601) | Yes | Timestamp when the photo was moved to Trash. `null` when photo is active. |
| `status` | `'active' \| 'trashed'` | Yes | Lifecycle state of the photo. |
| `manualSortIndex` | `number` | Yes | Zero-based index within `album.photoIds` for manual sort ordering. Recomputed when photos are reordered via drag-and-drop in manual mode. |

**Runtime-only (not stored in save file):**
- `blobUrl: string` — Object URL created from the image Blob at load/import time. Revoked when the photo is permanently deleted.

**Validation rules:**
- Accepted `mimeType` values: `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/heic`, `image/heif`.
- `status === 'active'` → `albumId` MUST be a valid, existing album ID; `dateTrashed` MUST be `null`.
- `status === 'trashed'` → `albumId` MUST be `""` (empty); `dateTrashed` MUST be a valid ISO-8601 string.
- `manualSortIndex` MUST be unique within its album's `photoIds` array.

---

### AppState

Top-level in-memory state of the application. This is the runtime representation; the save file serializes a subset of it.

| Field | Type | Description |
|-------|------|-------------|
| `albums` | `Record<string, Album>` | Map of all albums keyed by ID. |
| `photos` | `Record<string, Photo>` | Map of all photos (active + trashed) keyed by ID. |
| `photoBlobs` | `Map<string, Blob>` | Runtime-only map of photo ID → raw image Blob. Not serialized to save file JSON; stored separately in the ZIP. |
| `albumOrder` | `string[]` | Custom main-page album order (array of album IDs). Populated on first load from chronological order; updated via drag-and-drop. |
| `lastExportedAt` | `string \| null` (ISO-8601) | Timestamp of the most recent successful export. `null` if never exported. |
| `hasUnsavedChanges` | `boolean` | Derived flag: `true` when any mutation has occurred since `lastExportedAt`. |

---

## State Transitions

### Photo Lifecycle

```
[File selected by user]
        │
        ▼
   status: 'active'
   albumId: <album>
   dateTrashed: null
        │
        │  (User moves photo to Trash — FR-019)
        ▼
   status: 'trashed'
   albumId: ""
   originalAlbumId: <previous album>
   dateTrashed: <now>
        │
        ├──────────────────────────────┐
        │  (User restores — FR-021)    │  (User permanently deletes — FR-022)
        ▼                              ▼
   status: 'active'              [Removed from AppState]
   albumId: <original or new>    blobUrl revoked
   dateTrashed: null
```

### Album Lifecycle

```
[User creates album — FR-004]
        │
        ▼
   Album created, photoIds: [], coverPhotoId: null
        │
        ├── Photos added (FR-005) → photoIds grows, coverPhotoId set
        ├── Photos removed to Trash (FR-019) → photoIds shrinks
        ├── Renamed (FR-011) → name updated
        │
        │  (User deletes album — FR-012)
        ▼
   Album removed from AppState
   All active photos in album → status: 'trashed'
```

---

## Save File Schema

The save file is a ZIP archive (`.photoalbum.zip`) containing:

```
<filename>.photoalbum.zip
├── manifest.json
└── photos/
    ├── {photoId}.jpg
    ├── {photoId}.png
    └── ...
```

### manifest.json

```jsonc
{
  "version": "1.0.0",           // Save file schema version (semver)
  "exportedAt": "ISO-8601",     // Timestamp of export
  "albums": [                   // Array of Album objects (all fields)
    {
      "id": "uuid",
      "name": "string",
      "photoIds": ["uuid", ...],
      "photoSortMode": "date | manual",
      "coverPhotoId": "uuid | null",
      "createdAt": "ISO-8601"
    }
  ],
  "photos": [                   // Array of Photo objects (all fields except blobUrl)
    {
      "id": "uuid",
      "albumId": "uuid | ''",
      "originalAlbumId": "uuid",
      "fileName": "string",
      "mimeType": "string",
      "dateTaken": "ISO-8601",
      "dateImported": "ISO-8601",
      "dateTrashed": "ISO-8601 | null",
      "status": "active | trashed",
      "manualSortIndex": 0
    }
  ],
  "albumOrder": ["uuid", ...]   // Custom main-page album order
}
```

**Validation on import:**
- `version` must be parseable and compatible with the current app version.
- Each photo in `manifest.json` must have a corresponding file in `photos/` directory.
- Each album's `photoIds` must reference valid photo IDs in the manifest.
- `albumOrder` must contain only valid album IDs.
- Unknown fields are ignored (forward compatibility).
