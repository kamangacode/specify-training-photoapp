import { useCallback } from 'react';
import { useAppContext } from '../store/AppContext';
import { getOrderedAlbums } from '../store/selectors';
import type { Album } from '../models/types';

export interface UseAlbumsResult {
  albums: Album[];
  createAlbum: (name: string) => void;
  renameAlbum: (albumId: string, name: string) => void;
  deleteAlbum: (albumId: string) => void;
}

export function useAlbums(): UseAlbumsResult {
  const { state, dispatch } = useAppContext();

  const albums = getOrderedAlbums(state);

  const createAlbum = useCallback(
    (name: string) => dispatch({ type: 'CREATE_ALBUM', payload: { name } }),
    [dispatch]
  );

  const renameAlbum = useCallback(
    (albumId: string, name: string) =>
      dispatch({ type: 'RENAME_ALBUM', payload: { albumId, name } }),
    [dispatch]
  );

  const deleteAlbum = useCallback(
    (albumId: string) => dispatch({ type: 'DELETE_ALBUM', payload: { albumId } }),
    [dispatch]
  );

  return { albums, createAlbum, renameAlbum, deleteAlbum };
}
