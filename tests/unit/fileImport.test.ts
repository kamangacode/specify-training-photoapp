import { describe, it, expect } from 'vitest';
import { processPhotoFiles } from '../../src/services/fileImport';

describe('processPhotoFiles', () => {
  it('processes valid image files and returns Photo records', async () => {
    const file = new File([new Uint8Array(4)], 'photo.jpg', { type: 'image/jpeg' });
    const result = await processPhotoFiles([file], 'album-1');

    expect(result.photos).toHaveLength(1);
    expect(result.errors).toHaveLength(0);
    expect(result.photos[0]!.albumId).toBe('album-1');
    expect(result.photos[0]!.status).toBe('active');
    expect(result.photos[0]!.fileName).toBe('photo.jpg');
    expect(result.photos[0]!.mimeType).toBe('image/jpeg');
    expect(result.photos[0]!.manualSortIndex).toBe(0);
  });

  it('rejects invalid MIME types with error entries without failing the batch', async () => {
    const good = new File([new Uint8Array(4)], 'good.jpg', { type: 'image/jpeg' });
    const bad = new File([new Uint8Array(4)], 'bad.pdf', { type: 'application/pdf' });
    const result = await processPhotoFiles([good, bad], 'album-1');

    expect(result.photos).toHaveLength(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]!.fileName).toBe('bad.pdf');
    expect(result.errors[0]!.reason).toBeTruthy();
  });

  it('falls back to file.lastModified when EXIF is absent', async () => {
    const file = new File([new Uint8Array(4)], 'no-exif.png', { type: 'image/png' });
    const result = await processPhotoFiles([file], 'album-1');

    expect(result.photos).toHaveLength(1);
    const photo = result.photos[0]!;
    // dateTaken should be a valid ISO string (from lastModified fallback)
    expect(() => new Date(photo.dateTaken)).not.toThrow();
    expect(new Date(photo.dateTaken).getTime()).not.toBeNaN();
  });

  it('sets manualSortIndex sequentially based on position in result array', async () => {
    const f1 = new File([new Uint8Array(4)], 'a.jpg', { type: 'image/jpeg' });
    const f2 = new File([new Uint8Array(4)], 'b.png', { type: 'image/png' });
    const result = await processPhotoFiles([f1, f2], 'album-1');

    expect(result.photos[0]!.manualSortIndex).toBe(0);
    expect(result.photos[1]!.manualSortIndex).toBe(1);
  });

  it('creates a Blob entry for each accepted photo', async () => {
    const file = new File([new Uint8Array(4)], 'photo.jpg', { type: 'image/jpeg' });
    const result = await processPhotoFiles([file], 'album-1');

    expect(result.blobs.size).toBe(1);
    const blob = result.blobs.get(result.photos[0]!.id);
    expect(blob).toBeInstanceOf(Blob);
  });
});
