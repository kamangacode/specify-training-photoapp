import { describe, it, expect } from 'vitest';
import {
  getAlbumById,
  getPhotosByAlbum,
  getTrashedPhotos,
  getDerivedDateRange,
  getPhotoCount,
  getSortedPhotos,
  getOrderedAlbums,
} from '../../src/store/selectors';
import type { AppState, Album, Photo } from '../../src/models/types';
import { initialState } from '../../src/store/reducer';

// ─── helpers ──────────────────────────────────────────────────────────────────

function makeAlbum(overrides: Partial<Album> = {}): Album {
  return {
    id: 'album-1',
    name: 'Test Album',
    photoIds: [],
    photoSortMode: 'date',
    coverPhotoId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function makePhoto(overrides: Partial<Photo> = {}): Photo {
  return {
    id: 'photo-1',
    albumId: 'album-1',
    originalAlbumId: 'album-1',
    fileName: 'test.jpg',
    mimeType: 'image/jpeg',
    dateTaken: '2026-01-15T00:00:00.000Z',
    dateImported: '2026-01-15T00:00:00.000Z',
    dateTrashed: null,
    status: 'active',
    manualSortIndex: 0,
    ...overrides,
  };
}

// ─── getAlbumById ─────────────────────────────────────────────────────────────

describe('getAlbumById', () => {
  it('returns the album when it exists', () => {
    const album = makeAlbum();
    const state: AppState = { ...initialState, albums: { 'album-1': album } };
    expect(getAlbumById(state, 'album-1')).toEqual(album);
  });

  it('returns undefined when album does not exist', () => {
    expect(getAlbumById(initialState, 'missing')).toBeUndefined();
  });
});

// ─── getPhotosByAlbum ─────────────────────────────────────────────────────────

describe('getPhotosByAlbum', () => {
  it('returns only active photos belonging to the album', () => {
    const p1 = makePhoto({ id: 'p1', albumId: 'album-1' });
    const p2 = makePhoto({ id: 'p2', albumId: 'album-2' });
    const p3 = makePhoto({ id: 'p3', albumId: 'album-1', status: 'trashed', albumId: '' });
    const state: AppState = { ...initialState, photos: { p1, p2, p3 } };
    const result = getPhotosByAlbum(state, 'album-1');
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe('p1');
  });
});

// ─── getTrashedPhotos ─────────────────────────────────────────────────────────

describe('getTrashedPhotos', () => {
  it('returns all trashed photos', () => {
    const p1 = makePhoto({ id: 'p1', status: 'active' });
    const p2 = makePhoto({ id: 'p2', status: 'trashed', albumId: '', dateTrashed: '2026-01-01T00:00:00.000Z' });
    const state: AppState = { ...initialState, photos: { p1, p2 } };
    const result = getTrashedPhotos(state);
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe('p2');
  });
});

// ─── getDerivedDateRange ──────────────────────────────────────────────────────

describe('getDerivedDateRange', () => {
  it('returns null for an empty album', () => {
    const album = makeAlbum({ photoIds: [] });
    const state: AppState = { ...initialState, albums: { 'album-1': album } };
    expect(getDerivedDateRange(state, 'album-1')).toBeNull();
  });

  it('returns correct earliest and latest for multiple photos', () => {
    const p1 = makePhoto({ id: 'p1', dateTaken: '2026-01-10T00:00:00.000Z' });
    const p2 = makePhoto({ id: 'p2', dateTaken: '2026-03-05T00:00:00.000Z' });
    const album = makeAlbum({ photoIds: ['p1', 'p2'] });
    const state: AppState = {
      ...initialState,
      albums: { 'album-1': album },
      photos: { p1, p2 },
    };
    const range = getDerivedDateRange(state, 'album-1');
    expect(range).not.toBeNull();
    expect(range!.earliest.toISOString()).toBe(new Date('2026-01-10T00:00:00.000Z').toISOString());
    expect(range!.latest.toISOString()).toBe(new Date('2026-03-05T00:00:00.000Z').toISOString());
  });
});

// ─── getPhotoCount ────────────────────────────────────────────────────────────

describe('getPhotoCount', () => {
  it('counts only active photos for the album', () => {
    const p1 = makePhoto({ id: 'p1', status: 'active' });
    const p2 = makePhoto({ id: 'p2', status: 'trashed', albumId: '' });
    const album = makeAlbum({ photoIds: ['p1', 'p2'] });
    const state: AppState = {
      ...initialState,
      albums: { 'album-1': album },
      photos: { p1, p2 },
    };
    expect(getPhotoCount(state, 'album-1')).toBe(1);
  });
});

// ─── getSortedPhotos ──────────────────────────────────────────────────────────

describe('getSortedPhotos', () => {
  it('returns photos in date-ascending order in date mode', () => {
    const p1 = makePhoto({ id: 'p1', dateTaken: '2026-03-01T00:00:00.000Z', manualSortIndex: 1 });
    const p2 = makePhoto({ id: 'p2', dateTaken: '2026-01-01T00:00:00.000Z', manualSortIndex: 0 });
    const album = makeAlbum({ photoIds: ['p1', 'p2'], photoSortMode: 'date' });
    const state: AppState = {
      ...initialState,
      albums: { 'album-1': album },
      photos: { p1, p2 },
    };
    const sorted = getSortedPhotos(state, 'album-1');
    expect(sorted[0]!.id).toBe('p2'); // older first
    expect(sorted[1]!.id).toBe('p1');
  });

  it('returns photos in manualSortIndex order in manual mode', () => {
    const p1 = makePhoto({ id: 'p1', dateTaken: '2026-01-01T00:00:00.000Z', manualSortIndex: 1 });
    const p2 = makePhoto({ id: 'p2', dateTaken: '2026-03-01T00:00:00.000Z', manualSortIndex: 0 });
    const album = makeAlbum({ photoIds: ['p1', 'p2'], photoSortMode: 'manual' });
    const state: AppState = {
      ...initialState,
      albums: { 'album-1': album },
      photos: { p1, p2 },
    };
    const sorted = getSortedPhotos(state, 'album-1');
    expect(sorted[0]!.id).toBe('p2'); // manualSortIndex 0 first
    expect(sorted[1]!.id).toBe('p1');
  });
});

// ─── getOrderedAlbums ─────────────────────────────────────────────────────────

describe('getOrderedAlbums', () => {
  it('sorts by latest photo date descending when isCustomOrdered is false', () => {
    const pOld = makePhoto({ id: 'pOld', albumId: 'a1', dateTaken: '2024-01-01T00:00:00.000Z' });
    const pNew = makePhoto({ id: 'pNew', albumId: 'a2', dateTaken: '2026-01-01T00:00:00.000Z' });
    const a1 = makeAlbum({ id: 'a1', photoIds: ['pOld'] });
    const a2 = makeAlbum({ id: 'a2', photoIds: ['pNew'] });
    const state: AppState = {
      ...initialState,
      albums: { a1, a2 },
      photos: { pOld, pNew },
      albumOrder: ['a1', 'a2'],
      isCustomOrdered: false,
    };
    const ordered = getOrderedAlbums(state);
    expect(ordered[0]!.id).toBe('a2'); // most recent first
    expect(ordered[1]!.id).toBe('a1');
  });

  it('uses albumOrder sequence when isCustomOrdered is true', () => {
    const a1 = makeAlbum({ id: 'a1' });
    const a2 = makeAlbum({ id: 'a2' });
    const state: AppState = {
      ...initialState,
      albums: { a1, a2 },
      albumOrder: ['a2', 'a1'], // user placed a2 first
      isCustomOrdered: true,
    };
    const ordered = getOrderedAlbums(state);
    expect(ordered[0]!.id).toBe('a2');
    expect(ordered[1]!.id).toBe('a1');
  });
});
