import { parsePhotoDate, isAcceptedImageFile } from './exif';
import type { Photo } from '../models/types';

export interface ProcessResult {
  photos: Photo[];
  blobs: Map<string, Blob>;
  errors: Array<{ fileName: string; reason: string }>;
}

/**
 * Processes an array of File objects from the browser file picker for import into an album.
 * Filters unsupported types with per-file error reporting.
 * Parses EXIF dates; falls back to file.lastModified for missing metadata.
 */
export async function processPhotoFiles(files: File[], albumId: string): Promise<ProcessResult> {
  const photos: Photo[] = [];
  const blobs = new Map<string, Blob>();
  const errors: Array<{ fileName: string; reason: string }> = [];

  let index = 0;
  for (const file of files) {
    if (!isAcceptedImageFile(file)) {
      errors.push({
        fileName: file.name,
        reason: `Unsupported file type: "${file.type || 'unknown'}". Accepted types: JPEG, PNG, WebP, GIF, HEIC, HEIF.`,
      });
      continue;
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const exifDate = await parsePhotoDate(file);
    const dateTaken = exifDate ? exifDate.toISOString() : new Date(file.lastModified).toISOString();

    const photo: Photo = {
      id,
      albumId,
      originalAlbumId: albumId,
      fileName: file.name,
      mimeType: file.type,
      dateTaken,
      dateImported: now,
      dateTrashed: null,
      status: 'active',
      manualSortIndex: index,
    };

    blobs.set(id, file);
    photos.push(photo);
    index++;
  }

  return { photos, blobs, errors };
}
