import { describe, it, expect } from 'vitest';
import { importFromFile, ImportError } from '../../src/services/saveFile';
import JSZip from 'jszip';
import type { SaveFileManifest } from '../../src/models/types';

async function makeValidZip(manifest: SaveFileManifest, photos: Map<string, Blob>): Promise<File> {
  const zip = new JSZip();
  zip.file('manifest.json', JSON.stringify(manifest));
  const photosFolder = zip.folder('photos')!;
  for (const [photoId, blob] of photos) {
    const photo = manifest.photos.find((p) => p.id === photoId);
    if (!photo) continue;
    const ext = photo.mimeType.split('/')[1] ?? 'jpg';
    photosFolder.file(`${photoId}.${ext}`, blob);
  }
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  return new File([zipBlob], 'test.photoalbum.zip', { type: 'application/zip' });
}

const baseManifest: SaveFileManifest = {
  version: '1.0.0',
  exportedAt: '2026-02-21T12:00:00.000Z',
  albums: [
    {
      id: 'a1',
      name: 'Test',
      photoIds: ['p1'],
      photoSortMode: 'date',
      coverPhotoId: 'p1',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ],
  photos: [
    {
      id: 'p1',
      albumId: 'a1',
      originalAlbumId: 'a1',
      fileName: 'test.jpg',
      mimeType: 'image/jpeg',
      dateTaken: '2026-01-01T00:00:00.000Z',
      dateImported: '2026-01-01T00:00:00.000Z',
      dateTrashed: null,
      status: 'active',
      manualSortIndex: 0,
    },
  ],
  albumOrder: ['a1'],
};

describe('importFromFile', () => {
  it('reconstructs AppState from a valid save file', async () => {
    const blob = new Blob([new Uint8Array(4)], { type: 'image/jpeg' });
    const photos = new Map([['p1', blob]]);
    const file = await makeValidZip(baseManifest, photos);

    const result = await importFromFile(file);

    expect(result.state.albums['a1']!.name).toBe('Test');
    expect(result.state.photos['p1']!.status).toBe('active');
    expect(result.blobs.size).toBe(1);
    expect(result.state.hasUnsavedChanges).toBe(false);
  });

  it('throws ImportError with MISSING_MANIFEST code when manifest.json is absent', async () => {
    const zip = new JSZip();
    zip.folder('photos');
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const file = new File([zipBlob], 'bad.photoalbum.zip', { type: 'application/zip' });

    await expect(importFromFile(file)).rejects.toMatchObject({
      code: 'MISSING_MANIFEST',
    });
  });

  it('throws ImportError with CORRUPT_DATA code when a photo file is missing', async () => {
    const emptyPhotos = new Map<string, Blob>();
    const file = await makeValidZip(baseManifest, emptyPhotos);

    await expect(importFromFile(file)).rejects.toMatchObject({
      code: 'CORRUPT_DATA',
    });
  });

  it('throws ImportError with VERSION_MISMATCH code for incompatible major version', async () => {
    const manifest: SaveFileManifest = { ...baseManifest, version: '99.0.0' };
    const blob = new Blob([new Uint8Array(4)], { type: 'image/jpeg' });
    const photos = new Map([['p1', blob]]);
    const file = await makeValidZip(manifest, photos);

    await expect(importFromFile(file)).rejects.toMatchObject({
      code: 'VERSION_MISMATCH',
    });
  });
});
