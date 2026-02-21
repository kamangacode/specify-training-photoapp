import { useCallback } from 'react';
import { useAppContext } from '../store/AppContext';
import { getTrashedPhotos } from '../store/selectors';
import type { Photo } from '../models/types';

export interface UseTrashResult {
  trashedPhotos: Photo[];
  restorePhoto: (photoId: string, targetAlbumId: string) => void;
  deletePhoto: (photoId: string) => void;
}

export function useTrash(): UseTrashResult {
  const { state, dispatch } = useAppContext();

  const trashedPhotos = getTrashedPhotos(state);

  const restorePhoto = useCallback(
    (photoId: string, targetAlbumId: string) =>
      dispatch({ type: 'RESTORE_PHOTO', payload: { photoId, targetAlbumId } }),
    [dispatch]
  );

  const deletePhoto = useCallback(
    (photoId: string) => dispatch({ type: 'DELETE_PHOTO', payload: { photoId } }),
    [dispatch]
  );

  return { trashedPhotos, restorePhoto, deletePhoto };
}
