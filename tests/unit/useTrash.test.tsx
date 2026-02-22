import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';
import { AppProvider, useAppContext } from '../../src/store/AppContext';
import { useTrash } from '../../src/hooks/useTrash';
import { initialState } from '../../src/store/reducer';
import type { AppState, Photo } from '../../src/models/types';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppProvider>{children}</AppProvider>
);

function makeTrashedPhoto(overrides: Partial<Photo> = {}): Photo {
  return {
    id: 'p1',
    albumId: 'a1',
    originalAlbumId: 'a1',
    fileName: 'test.jpg',
    mimeType: 'image/jpeg',
    dateTaken: '2024-01-01T00:00:00.000Z',
    dateImported: '2024-01-01T00:00:00.000Z',
    dateTrashed: '2024-06-01T00:00:00.000Z',
    status: 'trashed',
    manualSortIndex: 0,
    ...overrides,
  };
}

function makeSeededHook(seeded: AppState) {
  return function useComposite() {
    const { dispatch } = useAppContext();
    React.useEffect(() => {
      dispatch({ type: 'IMPORT_STATE', payload: { state: seeded, blobs: new Map() } });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    return useTrash();
  };
}

describe('useTrash', () => {
  it('returns empty array when no photos are trashed', () => {
    const { result } = renderHook(() => useTrash(), { wrapper });
    expect(result.current.trashedPhotos).toEqual([]);
  });

  it('returns trashed photos from seeded state', async () => {
    const photo = makeTrashedPhoto();
    const seeded: AppState = {
      ...initialState,
      photos: { p1: photo },
    };

    const { result } = renderHook(makeSeededHook(seeded), { wrapper });
    await act(async () => {});

    expect(result.current.trashedPhotos).toHaveLength(1);
    expect(result.current.trashedPhotos[0]?.id).toBe('p1');
  });

  it('restorePhoto dispatches RESTORE_PHOTO and removes photo from trash', async () => {
    const photo = makeTrashedPhoto();
    const seeded: AppState = {
      ...initialState,
      albums: {
        a1: {
          id: 'a1',
          name: 'Album',
          photoIds: [],
          photoSortMode: 'date',
          coverPhotoId: null,
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      },
      photos: { p1: photo },
      albumOrder: ['a1'],
    };

    const { result } = renderHook(makeSeededHook(seeded), { wrapper });
    await act(async () => {});
    expect(result.current.trashedPhotos).toHaveLength(1);

    act(() => {
      result.current.restorePhoto('p1', 'a1');
    });

    expect(result.current.trashedPhotos).toHaveLength(0);
  });

  it('deletePhoto dispatches DELETE_PHOTO and removes photo entirely', async () => {
    const photo = makeTrashedPhoto();
    const seeded: AppState = {
      ...initialState,
      photos: { p1: photo },
    };

    const { result } = renderHook(makeSeededHook(seeded), { wrapper });
    await act(async () => {});
    expect(result.current.trashedPhotos).toHaveLength(1);

    act(() => {
      result.current.deletePhoto('p1');
    });

    expect(result.current.trashedPhotos).toHaveLength(0);
  });
});
