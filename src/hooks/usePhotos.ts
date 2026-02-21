import { useCallback } from 'react';
import { useAppContext } from '../store/AppContext';
import { getPhotosByAlbum, getSortedPhotos } from '../store/selectors';
import type { Photo, PhotoSortMode } from '../models/types';

export interface UsePhotosResult {
  photos: Photo[];
  sortedPhotos: Photo[];
  trashPhoto: (photoId: string) => void;
  setSortMode: (albumId: string, mode: PhotoSortMode) => void;
  reorderPhotos: (albumId: string, photoIds: string[]) => void;
}

export function usePhotos(albumId: string): UsePhotosResult {
  const { state, dispatch } = useAppContext();

  const photos = getPhotosByAlbum(state, albumId);
  const sortedPhotos = getSortedPhotos(state, albumId);

  const trashPhoto = useCallback(
    (photoId: string) => dispatch({ type: 'TRASH_PHOTO', payload: { photoId } }),
    [dispatch]
  );

  const setSortMode = useCallback(
    (aid: string, mode: PhotoSortMode) =>
      dispatch({ type: 'SET_PHOTO_SORT_MODE', payload: { albumId: aid, mode } }),
    [dispatch]
  );

  const reorderPhotos = useCallback(
    (aid: string, photoIds: string[]) =>
      dispatch({ type: 'REORDER_PHOTOS', payload: { albumId: aid, photoIds } }),
    [dispatch]
  );

  return { photos, sortedPhotos, trashPhoto, setSortMode, reorderPhotos };
}
