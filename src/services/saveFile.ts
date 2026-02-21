import JSZip from 'jszip';
import type { AppState, SaveFileManifest } from '../models/types';
import { SAVE_FILE } from '../constants';
import { initialState } from '../store/reducer';

// ─── Error types ──────────────────────────────────────────────────────────────

export class ExportError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'ExportError';
    if (cause) this.cause = cause;
  }
}

export class ImportError extends Error {
  readonly code: 'INVALID_FILE' | 'MISSING_MANIFEST' | 'CORRUPT_DATA' | 'VERSION_MISMATCH';
  constructor(
    code: ImportError['code'],
    message: string,
    cause?: unknown
  ) {
    super(message);
    this.name = 'ImportError';
    this.code = code;
    if (cause) this.cause = cause;
  }
}

// ─── Export ───────────────────────────────────────────────────────────────────

export async function exportToFile(
  state: Readonly<AppState>,
  blobs: ReadonlyMap<string, Blob>,
  filename?: string
): Promise<void> {
  try {
    const zip = new JSZip();

    const manifest: SaveFileManifest = {
      version: SAVE_FILE.SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      albums: Object.values(state.albums),
      photos: Object.values(state.photos),
      albumOrder: state.albumOrder,
    };

    zip.file(SAVE_FILE.MANIFEST_NAME, JSON.stringify(manifest, null, 2));

    const photosFolder = zip.folder(SAVE_FILE.PHOTOS_DIR)!;
    for (const photo of Object.values(state.photos)) {
      const blob = blobs.get(photo.id);
      if (!blob) continue;
      const ext = photo.mimeType.split('/')[1] ?? 'jpg';
      photosFolder.file(`${photo.id}.${ext}`, blob);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });

    const date = new Date().toISOString().slice(0, 10);
    const downloadName = filename ?? `photos-${date}${SAVE_FILE.EXTENSION}`;

    const url = URL.createObjectURL(zipBlob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = downloadName;
    anchor.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    throw new ExportError('Failed to export save file. Please try again.', err);
  }
}

// ─── Import ───────────────────────────────────────────────────────────────────

const SUPPORTED_MAJOR = parseInt(SAVE_FILE.SCHEMA_VERSION.split('.')[0]!, 10);

export async function importFromFile(
  file: File
): Promise<{ state: AppState; blobs: Map<string, Blob> }> {
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(file);
  } catch (err) {
    throw new ImportError('INVALID_FILE', 'The selected file is not a valid ZIP archive.', err);
  }

  const manifestFile = zip.file(SAVE_FILE.MANIFEST_NAME);
  if (!manifestFile) {
    throw new ImportError('MISSING_MANIFEST', 'Invalid save file: manifest.json not found.');
  }

  let manifest: SaveFileManifest;
  try {
    const json = await manifestFile.async('text');
    manifest = JSON.parse(json) as SaveFileManifest;
  } catch (err) {
    throw new ImportError('CORRUPT_DATA', 'Invalid save file: manifest.json could not be parsed.', err);
  }

  // Version check
  const fileMajor = parseInt((manifest.version ?? '').split('.')[0]!, 10);
  if (isNaN(fileMajor) || fileMajor !== SUPPORTED_MAJOR) {
    throw new ImportError(
      'VERSION_MISMATCH',
      fileMajor > SUPPORTED_MAJOR
        ? 'This save file was created by a newer version of the app and cannot be opened.'
        : `This save file version (${manifest.version}) is not supported.`
    );
  }

  // Validate photos have corresponding files
  const blobs = new Map<string, Blob>();
  for (const photo of manifest.photos) {
    const ext = photo.mimeType.split('/')[1] ?? 'jpg';
    const photoFile = zip.file(`${SAVE_FILE.PHOTOS_DIR}/${photo.id}.${ext}`);
    if (!photoFile) {
      throw new ImportError(
        'CORRUPT_DATA',
        `Save file is corrupt: missing image for photo ${photo.id}.`
      );
    }
    const photoBlob = await photoFile.async('blob');
    blobs.set(photo.id, photoBlob);
  }

  // Build state
  const albums: AppState['albums'] = {};
  for (const album of manifest.albums) {
    albums[album.id] = album;
  }

  const photos: AppState['photos'] = {};
  for (const photo of manifest.photos) {
    photos[photo.id] = photo;
  }

  // Filter albumOrder to only valid album IDs
  const validAlbumIds = new Set(Object.keys(albums));
  const albumOrder = manifest.albumOrder.filter((id) => validAlbumIds.has(id));

  const state: AppState = {
    ...initialState,
    albums,
    photos,
    photoBlobs: blobs,
    albumOrder,
    isCustomOrdered: albumOrder.length > 0,
    lastExportedAt: manifest.exportedAt,
    hasUnsavedChanges: false,
  };

  return { state, blobs };
}
