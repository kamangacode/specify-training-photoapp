import { describe, it, expect } from 'vitest';
import { parsePhotoDate, isAcceptedImageFile } from '../../src/services/exif';

describe('isAcceptedImageFile', () => {
  it('accepts image/jpeg', () => {
    const file = new File([], 'test.jpg', { type: 'image/jpeg' });
    expect(isAcceptedImageFile(file)).toBe(true);
  });

  it('accepts image/png', () => {
    const file = new File([], 'test.png', { type: 'image/png' });
    expect(isAcceptedImageFile(file)).toBe(true);
  });

  it('accepts image/webp', () => {
    const file = new File([], 'test.webp', { type: 'image/webp' });
    expect(isAcceptedImageFile(file)).toBe(true);
  });

  it('accepts image/heic', () => {
    const file = new File([], 'test.heic', { type: 'image/heic' });
    expect(isAcceptedImageFile(file)).toBe(true);
  });

  it('rejects application/pdf', () => {
    const file = new File([], 'doc.pdf', { type: 'application/pdf' });
    expect(isAcceptedImageFile(file)).toBe(false);
  });

  it('rejects text/plain', () => {
    const file = new File([], 'notes.txt', { type: 'text/plain' });
    expect(isAcceptedImageFile(file)).toBe(false);
  });

  it('rejects an image disguised by extension (validates MIME type, not extension)', () => {
    // file named .jpg but has wrong MIME type
    const file = new File([], 'trick.jpg', { type: 'application/octet-stream' });
    expect(isAcceptedImageFile(file)).toBe(false);
  });
});

describe('parsePhotoDate', () => {
  it('returns null for a plain PNG buffer without EXIF', async () => {
    const file = new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], 'test.png', {
      type: 'image/png',
    });
    const result = await parsePhotoDate(file);
    expect(result).toBeNull();
  });

  it('does not throw on any input', async () => {
    const file = new File([], 'empty.jpg', { type: 'image/jpeg' });
    await expect(parsePhotoDate(file)).resolves.not.toThrow();
  });
});
