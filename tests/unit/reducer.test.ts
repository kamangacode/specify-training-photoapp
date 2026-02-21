import { describe, it, expect } from 'vitest';
import { reducer, initialState } from '../../src/store/reducer';
import type { AppState, Photo, Album } from '../../src/models/types';

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
    dateTaken: '2026-01-01T00:00:00.000Z',
    dateImported: '2026-01-01T00:00:00.000Z',
    dateTrashed: null,
    status: 'active',
    manualSortIndex: 0,
    ...overrides,
  };
}

function stateWithAlbum(album: Album): AppState {
  return {
    ...initialState,
    albums: { [album.id]: album },
    albumOrder: [album.id],
  };
}

// ─── CREATE_ALBUM ─────────────────────────────────────────────────────────────

describe('CREATE_ALBUM', () => {
  it('creates a new album and appends its ID to albumOrder', () => {
    const state = reducer(initialState, { type: 'CREATE_ALBUM', payload: { name: 'Vacation' } });
    const albumIds = Object.keys(state.albums);
    expect(albumIds).toHaveLength(1);
    expect(state.albums[albumIds[0]!]!.name).toBe('Vacation');
    expect(state.albumOrder).toContain(albumIds[0]);
    expect(state.albumOrder[state.albumOrder.length - 1]).toBe(albumIds[0]);
  });

  it('leaves isCustomOrdered as false after creation', () => {
    const state = reducer(initialState, { type: 'CREATE_ALBUM', payload: { name: 'A' } });
    expect(state.isCustomOrdered).toBe(false);
  });

  it('appends to end of existing albumOrder, not inserting by date', () => {
    const existing = makeAlbum({ id: 'existing' });
    const base: AppState = {
      ...initialState,
      albums: { existing },
      albumOrder: ['existing'],
      isCustomOrdered: true,
    };
    const state = reducer(base, { type: 'CREATE_ALBUM', payload: { name: 'New' } });
    expect(state.albumOrder[0]).toBe('existing');
    expect(state.albumOrder[1]).toBe(Object.keys(state.albums).find((id) => id !== 'existing'));
  });

  it('sets hasUnsavedChanges to true', () => {
    const state = reducer(initialState, { type: 'CREATE_ALBUM', payload: { name: 'A' } });
    expect(state.hasUnsavedChanges).toBe(true);
  });
});

// ─── ADD_PHOTOS ───────────────────────────────────────────────────────────────

describe('ADD_PHOTOS', () => {
  it('adds photos to the state and merges blobs', () => {
    const album = makeAlbum();
    const base = stateWithAlbum(album);
    const photo = makePhoto();
    const blob = new Blob(['data'], { type: 'image/jpeg' });
    const blobs = new Map([['photo-1', blob]]);

    const state = reducer(base, { type: 'ADD_PHOTOS', payload: { photos: [photo], blobs } });

    expect(state.photos['photo-1']).toEqual(photo);
    expect(state.photoBlobs.get('photo-1')).toBe(blob);
    expect(state.albums['album-1']!.photoIds).toContain('photo-1');
  });

  it('sets the cover photo if album was empty', () => {
    const album = makeAlbum();
    const base = stateWithAlbum(album);
    const photo = makePhoto();
    const blobs = new Map([['photo-1', new Blob()]]);

    const state = reducer(base, { type: 'ADD_PHOTOS', payload: { photos: [photo], blobs } });

    expect(state.albums['album-1']!.coverPhotoId).toBe('photo-1');
  });

  it('sets hasUnsavedChanges to true', () => {
    const album = makeAlbum();
    const base = stateWithAlbum(album);
    const photo = makePhoto();
    const blobs = new Map([['photo-1', new Blob()]]);

    const state = reducer(base, { type: 'ADD_PHOTOS', payload: { photos: [photo], blobs } });
    expect(state.hasUnsavedChanges).toBe(true);
  });
});

// ─── SET_PHOTO_SORT_MODE ──────────────────────────────────────────────────────

describe('SET_PHOTO_SORT_MODE', () => {
  it('updates the album photoSortMode', () => {
    const album = makeAlbum({ photoSortMode: 'date' });
    const base = stateWithAlbum(album);

    const state = reducer(base, {
      type: 'SET_PHOTO_SORT_MODE',
      payload: { albumId: 'album-1', mode: 'manual' },
    });

    expect(state.albums['album-1']!.photoSortMode).toBe('manual');
    expect(state.hasUnsavedChanges).toBe(true);
  });
});

// ─── REORDER_PHOTOS ───────────────────────────────────────────────────────────

describe('REORDER_PHOTOS', () => {
  it('replaces album.photoIds with the new order and updates manualSortIndex', () => {
    const album = makeAlbum({ photoIds: ['p1', 'p2', 'p3'] });
    const p1 = makePhoto({ id: 'p1', manualSortIndex: 0 });
    const p2 = makePhoto({ id: 'p2', manualSortIndex: 1 });
    const p3 = makePhoto({ id: 'p3', manualSortIndex: 2 });
    const base: AppState = {
      ...initialState,
      albums: { 'album-1': album },
      photos: { p1, p2, p3 },
      albumOrder: ['album-1'],
    };

    const state = reducer(base, {
      type: 'REORDER_PHOTOS',
      payload: { albumId: 'album-1', photoIds: ['p3', 'p1', 'p2'] },
    });

    expect(state.albums['album-1']!.photoIds).toEqual(['p3', 'p1', 'p2']);
    expect(state.photos['p3']!.manualSortIndex).toBe(0);
    expect(state.photos['p1']!.manualSortIndex).toBe(1);
    expect(state.photos['p2']!.manualSortIndex).toBe(2);
    expect(state.hasUnsavedChanges).toBe(true);
  });
});

// ─── RENAME_ALBUM (T046 — additive) ──────────────────────────────────────────

describe('RENAME_ALBUM', () => {
  it('updates the album name', () => {
    const album = makeAlbum({ id: 'a1', name: 'Old Name' });
    const base: AppState = { ...initialState, albums: { a1: album }, albumOrder: ['a1'] };
    const state = reducer(base, { type: 'RENAME_ALBUM', payload: { albumId: 'a1', name: 'New Name' } });
    expect(state.albums['a1']!.name).toBe('New Name');
    expect(state.hasUnsavedChanges).toBe(true);
  });
});

describe('DELETE_ALBUM', () => {
  it('removes the album and moves its active photos to Trash', () => {
    const photo = makePhoto({ id: 'p1', albumId: 'a1' });
    const album = makeAlbum({ id: 'a1', photoIds: ['p1'] });
    const base: AppState = {
      ...initialState,
      albums: { a1: album },
      photos: { p1: photo },
      albumOrder: ['a1'],
    };
    const state = reducer(base, { type: 'DELETE_ALBUM', payload: { albumId: 'a1' } });
    expect(state.albums['a1']).toBeUndefined();
    expect(state.albumOrder).not.toContain('a1');
    expect(state.photos['p1']!.status).toBe('trashed');
    expect(state.photos['p1']!.albumId).toBe('');
    expect(state.hasUnsavedChanges).toBe(true);
  });
});

describe('TRASH_PHOTO', () => {
  it('moves photo to Trash and removes from album.photoIds', () => {
    const photo = makePhoto({ id: 'p1', albumId: 'a1' });
    const album = makeAlbum({ id: 'a1', photoIds: ['p1'] });
    const base: AppState = { ...initialState, albums: { a1: album }, photos: { p1: photo }, albumOrder: ['a1'] };
    const state = reducer(base, { type: 'TRASH_PHOTO', payload: { photoId: 'p1' } });
    expect(state.photos['p1']!.status).toBe('trashed');
    expect(state.photos['p1']!.albumId).toBe('');
    expect(state.albums['a1']!.photoIds).not.toContain('p1');
    expect(state.hasUnsavedChanges).toBe(true);
  });
});

describe('RESTORE_PHOTO', () => {
  it('restores photo to target album', () => {
    const photo = makePhoto({ id: 'p1', albumId: '', originalAlbumId: 'a1', status: 'trashed', dateTrashed: '2026-01-01T00:00:00.000Z' });
    const album = makeAlbum({ id: 'a1', photoIds: [] });
    const base: AppState = { ...initialState, albums: { a1: album }, photos: { p1: photo }, albumOrder: ['a1'] };
    const state = reducer(base, { type: 'RESTORE_PHOTO', payload: { photoId: 'p1', targetAlbumId: 'a1' } });
    expect(state.photos['p1']!.status).toBe('active');
    expect(state.photos['p1']!.albumId).toBe('a1');
    expect(state.photos['p1']!.dateTrashed).toBeNull();
    expect(state.albums['a1']!.photoIds).toContain('p1');
    expect(state.hasUnsavedChanges).toBe(true);
  });
});

describe('DELETE_PHOTO', () => {
  it('removes the photo from state and its blob', () => {
    const photo = makePhoto({ id: 'p1', status: 'trashed', albumId: '' });
    const base: AppState = { ...initialState, photos: { p1: photo } };
    const state = reducer(base, { type: 'DELETE_PHOTO', payload: { photoId: 'p1' } });
    expect(state.photos['p1']).toBeUndefined();
    expect(state.hasUnsavedChanges).toBe(true);
  });
});

// ─── IMPORT_STATE ─────────────────────────────────────────────────────────────

describe('IMPORT_STATE', () => {
  it('replaces the entire state and does NOT set hasUnsavedChanges', () => {
    const dirtyState: AppState = { ...initialState, hasUnsavedChanges: true };
    const imported: AppState = { ...initialState, albumOrder: ['x'] };
    const blobs = new Map<string, Blob>();

    const state = reducer(dirtyState, {
      type: 'IMPORT_STATE',
      payload: { state: imported, blobs },
    });

    expect(state.albumOrder).toEqual(['x']);
    expect(state.hasUnsavedChanges).toBe(false);
  });
});

// ─── REORDER_ALBUMS (T041 — additive) ────────────────────────────────────────

describe('REORDER_ALBUMS', () => {
  it('stores the new albumOrder', () => {
    const base: AppState = { ...initialState, albumOrder: ['a', 'b', 'c'] };
    const state = reducer(base, {
      type: 'REORDER_ALBUMS',
      payload: { albumOrder: ['c', 'a', 'b'] },
    });
    expect(state.albumOrder).toEqual(['c', 'a', 'b']);
  });

  it('sets isCustomOrdered to true', () => {
    const base: AppState = { ...initialState, albumOrder: ['a', 'b'] };
    expect(base.isCustomOrdered).toBe(false);
    const state = reducer(base, {
      type: 'REORDER_ALBUMS',
      payload: { albumOrder: ['b', 'a'] },
    });
    expect(state.isCustomOrdered).toBe(true);
  });

  it('sets hasUnsavedChanges to true', () => {
    const base: AppState = { ...initialState, albumOrder: ['a', 'b'] };
    const state = reducer(base, {
      type: 'REORDER_ALBUMS',
      payload: { albumOrder: ['b', 'a'] },
    });
    expect(state.hasUnsavedChanges).toBe(true);
  });

  it('subsequent CREATE_ALBUM appends to end of custom order', () => {
    const base: AppState = {
      ...initialState,
      albums: { a: makeAlbum({ id: 'a' }), b: makeAlbum({ id: 'b' }) },
      albumOrder: ['b', 'a'],
      isCustomOrdered: true,
    };
    const state = reducer(base, { type: 'CREATE_ALBUM', payload: { name: 'New' } });
    expect(state.albumOrder[0]).toBe('b');
    expect(state.albumOrder[1]).toBe('a');
    // new album is last
    const newId = state.albumOrder[2];
    expect(newId).toBeDefined();
    expect(state.albums[newId!]!.name).toBe('New');
  });
});

// ─── MARK_EXPORTED ────────────────────────────────────────────────────────────

describe('MARK_EXPORTED', () => {
  it('sets lastExportedAt and clears hasUnsavedChanges', () => {
    const dirtyState: AppState = { ...initialState, hasUnsavedChanges: true };
    const ts = '2026-02-21T12:00:00.000Z';

    const state = reducer(dirtyState, { type: 'MARK_EXPORTED', payload: { exportedAt: ts } });

    expect(state.lastExportedAt).toBe(ts);
    expect(state.hasUnsavedChanges).toBe(false);
  });
});
