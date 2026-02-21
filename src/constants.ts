export const ACCEPTED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
] as const;

export type AcceptedMimeType = (typeof ACCEPTED_MIME_TYPES)[number];

export const MAX_ALBUM_NAME_LENGTH = 100;

export const SCALE_LIMITS = {
  MAX_ALBUMS: 50,
  MAX_PHOTOS_PER_ALBUM: 200,
} as const;

export const TIMING_BUDGETS = {
  /** All photo tiles visible in the initial viewport must render within this time (ms). */
  VIEWPORT_TILE_RENDER_MS: 500,
  /** Album card must snap to new position within this time after drag release (ms). */
  DND_SNAP_MS: 100,
  /** Main page must render all album cards within this time (ms). */
  MAIN_PAGE_RENDER_MS: 2000,
  /** Application cold start must complete within this time (ms). */
  COLD_START_MS: 3000,
} as const;

export const SAVE_FILE = {
  EXTENSION: '.photoalbum.zip',
  MANIFEST_NAME: 'manifest.json',
  PHOTOS_DIR: 'photos',
  SCHEMA_VERSION: '1.0.0',
} as const;
