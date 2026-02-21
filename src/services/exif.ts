import { ACCEPTED_MIME_TYPES } from '../constants';

/**
 * Attempts to parse the date a photo was taken from its EXIF metadata.
 * Uses the DateTimeOriginal EXIF tag via the `exifr` library.
 * NEVER throws — returns null on any parse failure.
 */
export async function parsePhotoDate(file: File): Promise<Date | null> {
  try {
    const exifr = await import('exifr');
    const result = await exifr.parse(file, ['DateTimeOriginal']);
    if (result && result['DateTimeOriginal'] instanceof Date) {
      return result['DateTimeOriginal'];
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Checks whether a File is an accepted image type.
 * Validates by MIME type, not file extension.
 */
export function isAcceptedImageFile(file: File): boolean {
  return (ACCEPTED_MIME_TYPES as readonly string[]).includes(file.type);
}
