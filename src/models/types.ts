// ---- Enums / union types ----

export type PhotoSortMode = 'date' | 'manual';
export type PhotoStatus = 'active' | 'trashed';

// ---- Core entities ----

export interface Album {
  id: string;
  name: string;
  /** Ordered list of photo IDs; defines manual sort order. */
  photoIds: string[];
  photoSortMode: PhotoSortMode;
  /** ID of the cover photo, or null when the album is empty. */
  coverPhotoId: string | null;
  createdAt: string; // ISO-8601
}

export interface Photo {
  id: string;
  /** ID of the album this photo belongs to. Empty string when trashed. */
  albumId: string;
  /** Album at the time the photo was most recently trashed. Same as albumId when active. */
  originalAlbumId: string;
  fileName: string;
  mimeType: string;
  dateTaken: string; // ISO-8601 — from EXIF or falls back to dateImported
  dateImported: string; // ISO-8601
  dateTrashed: string | null; // ISO-8601 or null
  status: PhotoStatus;
  /** Zero-based index within album.photoIds for manual sort. */
  manualSortIndex: number;
}

// ---- Application state ----

export interface AppState {
  albums: Record<string, Album>;
  photos: Record<string, Photo>;
  /** Runtime-only: photo ID → raw image Blob. Not serialized in the save file JSON. */
  photoBlobs: Map<string, Blob>;
  /** Ordered list of album IDs for the main page. */
  albumOrder: string[];
  /**
   * false = albums are sorted by latest photo date (default until first drag).
   * true  = user has performed at least one drag-and-drop reorder.
   */
  isCustomOrdered: boolean;
  lastExportedAt: string | null; // ISO-8601
  hasUnsavedChanges: boolean;
}

// ---- Reducer actions ----

export type AppAction =
  // Albums
  | { type: 'CREATE_ALBUM'; payload: { name: string } }
  | { type: 'RENAME_ALBUM'; payload: { albumId: string; name: string } }
  | { type: 'DELETE_ALBUM'; payload: { albumId: string } }
  | { type: 'REORDER_ALBUMS'; payload: { albumOrder: string[] } }
  // Photos
  | { type: 'ADD_PHOTOS'; payload: { photos: Photo[]; blobs: Map<string, Blob> } }
  | { type: 'TRASH_PHOTO'; payload: { photoId: string } }
  | { type: 'RESTORE_PHOTO'; payload: { photoId: string; targetAlbumId: string } }
  | { type: 'DELETE_PHOTO'; payload: { photoId: string } }
  // Photo sorting within album
  | { type: 'SET_PHOTO_SORT_MODE'; payload: { albumId: string; mode: PhotoSortMode } }
  | { type: 'REORDER_PHOTOS'; payload: { albumId: string; photoIds: string[] } }
  // Persistence
  | { type: 'IMPORT_STATE'; payload: { state: AppState; blobs: Map<string, Blob> } }
  | { type: 'MARK_EXPORTED'; payload: { exportedAt: string } };

// ---- Save file ----

export interface SaveFileManifest {
  version: string;
  exportedAt: string;
  albums: Album[];
  photos: Omit<Photo, never>[]; // blobUrl is runtime-only; all Photo fields are serializable
  albumOrder: string[];
}
