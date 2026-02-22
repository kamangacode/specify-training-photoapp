import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';
import { AppProvider, useAppContext } from '../../src/store/AppContext';
import { usePhotos } from '../../src/hooks/usePhotos';
import { initialState } from '../../src/store/reducer';
import type { Album, AppState, Photo } from '../../src/models/types';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppProvider>{children}</AppProvider>
);

function makePhoto(overrides: Partial<Photo> = {}): Photo {
  return {
    id: 'p1',
    albumId: 'a1',
    originalAlbumId: 'a1',
    fileName: 'test.jpg',
    mimeType: 'image/jpeg',
    dateTaken: '2024-01-01T00:00:00.000Z',
    dateImported: '2024-01-01T00:00:00.000Z',
    dateTrashed: null,
    status: 'active',
    manualSortIndex: 0,
    ...overrides,
  };
}

function makeAlbum(overrides: Partial<Album> = {}): Album {
  return {
    id: 'a1',
    name: 'Test Album',
    photoIds: [],
    photoSortMode: 'date',
    coverPhotoId: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function makeSeededHook(albumId: string, seeded: AppState) {
  return function useComposite() {
    const { dispatch } = useAppContext();
    React.useEffect(() => {
      dispatch({ type: 'IMPORT_STATE', payload: { state: seeded, blobs: new Map() } });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    return usePhotos(albumId);
  };
}

describe('usePhotos', () => {
  it('returns empty arrays for album with no photos', () => {
    const { result } = renderHook(() => usePhotos('a1'), { wrapper });
    expect(result.current.photos).toEqual([]);
    expect(result.current.sortedPhotos).toEqual([]);
  });

  it('returns active photos for album after state is seeded', async () => {
    const photo = makePhoto();
    const album = makeAlbum({ photoIds: ['p1'] });
    const seeded: AppState = {
      ...initialState,
      albums: { a1: album },
      photos: { p1: photo },
      albumOrder: ['a1'],
    };

    const { result } = renderHook(makeSeededHook('a1', seeded), { wrapper });
    await act(async () => {});

    expect(result.current.photos).toHaveLength(1);
    expect(result.current.photos[0]?.id).toBe('p1');
  });

  it('trashPhoto dispatches TRASH_PHOTO and photo leaves active list', async () => {
    const photo = makePhoto();
    const album = makeAlbum({ photoIds: ['p1'] });
    const seeded: AppState = {
      ...initialState,
      albums: { a1: album },
      photos: { p1: photo },
      albumOrder: ['a1'],
    };

    const { result } = renderHook(makeSeededHook('a1', seeded), { wrapper });
    await act(async () => {});
    expect(result.current.photos).toHaveLength(1);

    act(() => {
      result.current.trashPhoto('p1');
    });

    expect(result.current.photos).toHaveLength(0);
  });

  it('setSortMode dispatches SET_PHOTO_SORT_MODE', async () => {
    const album = makeAlbum({ photoIds: [] });
    const seeded: AppState = {
      ...initialState,
      albums: { a1: album },
      albumOrder: ['a1'],
    };

    const { result } = renderHook(makeSeededHook('a1', seeded), { wrapper });
    await act(async () => {});

    // Should not throw; sortedPhotos remains empty for empty album
    act(() => {
      result.current.setSortMode('a1', 'manual');
    });

    expect(result.current.sortedPhotos).toEqual([]);
  });

  it('reorderPhotos dispatches REORDER_PHOTOS and updates sorted order', async () => {
    const p1 = makePhoto({ id: 'p1', manualSortIndex: 0 });
    const p2 = makePhoto({ id: 'p2', albumId: 'a1', originalAlbumId: 'a1', manualSortIndex: 1 });
    const album = makeAlbum({ photoIds: ['p1', 'p2'], photoSortMode: 'manual' });
    const seeded: AppState = {
      ...initialState,
      albums: { a1: album },
      photos: { p1, p2 },
      albumOrder: ['a1'],
    };

    const { result } = renderHook(makeSeededHook('a1', seeded), { wrapper });
    await act(async () => {});

    act(() => {
      result.current.reorderPhotos('a1', ['p2', 'p1']);
    });

    expect(result.current.sortedPhotos[0]?.id).toBe('p2');
    expect(result.current.sortedPhotos[1]?.id).toBe('p1');
  });
});
