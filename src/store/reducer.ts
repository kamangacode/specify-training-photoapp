import type { AppState, AppAction, Album, Photo } from '../models/types';

function generateId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

export const initialState: AppState = {
  albums: {},
  photos: {},
  photoBlobs: new Map(),
  albumOrder: [],
  isCustomOrdered: false,
  lastExportedAt: null,
  hasUnsavedChanges: false,
};

export function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'CREATE_ALBUM': {
      const id = generateId();
      const album: Album = {
        id,
        name: action.payload.name,
        photoIds: [],
        photoSortMode: 'date',
        coverPhotoId: null,
        createdAt: now(),
      };
      return {
        ...state,
        albums: { ...state.albums, [id]: album },
        albumOrder: [...state.albumOrder, id],
        hasUnsavedChanges: true,
      };
    }

    case 'RENAME_ALBUM': {
      const { albumId, name } = action.payload;
      const album = state.albums[albumId];
      if (!album) return state;
      return {
        ...state,
        albums: { ...state.albums, [albumId]: { ...album, name } },
        hasUnsavedChanges: true,
      };
    }

    case 'DELETE_ALBUM': {
      const { albumId } = action.payload;
      const album = state.albums[albumId];
      if (!album) return state;

      const trashedAt = now();
      const updatedPhotos = { ...state.photos };
      for (const photoId of album.photoIds) {
        const photo = updatedPhotos[photoId];
        if (photo && photo.status === 'active') {
          updatedPhotos[photoId] = {
            ...photo,
            status: 'trashed',
            albumId: '',
            originalAlbumId: albumId,
            dateTrashed: trashedAt,
          };
        }
      }

      const updatedAlbums = { ...state.albums };
      delete updatedAlbums[albumId];

      return {
        ...state,
        albums: updatedAlbums,
        photos: updatedPhotos,
        albumOrder: state.albumOrder.filter((id) => id !== albumId),
        hasUnsavedChanges: true,
      };
    }

    case 'REORDER_ALBUMS': {
      return {
        ...state,
        albumOrder: action.payload.albumOrder,
        isCustomOrdered: true,
        hasUnsavedChanges: true,
      };
    }

    case 'ADD_PHOTOS': {
      const { photos, blobs } = action.payload;
      const updatedAlbums = { ...state.albums };
      const updatedPhotos = { ...state.photos };
      const updatedBlobs = new Map(state.photoBlobs);

      for (const photo of photos) {
        updatedPhotos[photo.id] = photo;
        const blob = blobs.get(photo.id);
        if (blob) updatedBlobs.set(photo.id, blob);

        const album = updatedAlbums[photo.albumId];
        if (album) {
          const newPhotoIds = [...album.photoIds, photo.id];
          updatedAlbums[photo.albumId] = {
            ...album,
            photoIds: newPhotoIds,
            coverPhotoId: album.coverPhotoId ?? photo.id,
          };
        }
      }

      return {
        ...state,
        albums: updatedAlbums,
        photos: updatedPhotos,
        photoBlobs: updatedBlobs,
        hasUnsavedChanges: true,
      };
    }

    case 'TRASH_PHOTO': {
      const { photoId } = action.payload;
      const photo = state.photos[photoId];
      if (!photo || photo.status !== 'active') return state;

      const album = state.albums[photo.albumId];
      const updatedPhotos = {
        ...state.photos,
        [photoId]: {
          ...photo,
          status: 'trashed' as const,
          originalAlbumId: photo.albumId,
          albumId: '',
          dateTrashed: now(),
        },
      };

      const updatedAlbums = album
        ? {
            ...state.albums,
            [album.id]: {
              ...album,
              photoIds: album.photoIds.filter((id) => id !== photoId),
              coverPhotoId:
                album.coverPhotoId === photoId
                  ? album.photoIds.find((id) => id !== photoId) ?? null
                  : album.coverPhotoId,
            },
          }
        : state.albums;

      return {
        ...state,
        albums: updatedAlbums,
        photos: updatedPhotos,
        hasUnsavedChanges: true,
      };
    }

    case 'RESTORE_PHOTO': {
      const { photoId, targetAlbumId } = action.payload;
      const photo = state.photos[photoId];
      if (!photo || photo.status !== 'trashed') return state;

      const targetAlbum = state.albums[targetAlbumId];
      if (!targetAlbum) return state;

      const updatedPhotos = {
        ...state.photos,
        [photoId]: {
          ...photo,
          status: 'active' as const,
          albumId: targetAlbumId,
          dateTrashed: null,
        },
      };

      const updatedAlbums = {
        ...state.albums,
        [targetAlbumId]: {
          ...targetAlbum,
          photoIds: [...targetAlbum.photoIds, photoId],
          coverPhotoId: targetAlbum.coverPhotoId ?? photoId,
        },
      };

      return {
        ...state,
        albums: updatedAlbums,
        photos: updatedPhotos,
        hasUnsavedChanges: true,
      };
    }

    case 'DELETE_PHOTO': {
      const { photoId } = action.payload;
      const photo = state.photos[photoId];
      if (!photo) return state;

      const blobUrl = state.photoBlobs.get(photoId);
      if (blobUrl) {
        // Revoke the object URL to free memory
        const urlStr = URL.createObjectURL(blobUrl);
        URL.revokeObjectURL(urlStr);
      }

      const updatedPhotos = { ...state.photos };
      delete updatedPhotos[photoId];

      const updatedBlobs = new Map(state.photoBlobs);
      updatedBlobs.delete(photoId);

      return {
        ...state,
        photos: updatedPhotos,
        photoBlobs: updatedBlobs,
        hasUnsavedChanges: true,
      };
    }

    case 'SET_PHOTO_SORT_MODE': {
      const { albumId, mode } = action.payload;
      const album = state.albums[albumId];
      if (!album) return state;
      return {
        ...state,
        albums: { ...state.albums, [albumId]: { ...album, photoSortMode: mode } },
        hasUnsavedChanges: true,
      };
    }

    case 'REORDER_PHOTOS': {
      const { albumId, photoIds } = action.payload;
      const album = state.albums[albumId];
      if (!album) return state;

      const updatedPhotos = { ...state.photos };
      photoIds.forEach((photoId, index) => {
        const photo = updatedPhotos[photoId];
        if (photo) {
          updatedPhotos[photoId] = { ...photo, manualSortIndex: index };
        }
      });

      return {
        ...state,
        albums: { ...state.albums, [albumId]: { ...album, photoIds } },
        photos: updatedPhotos,
        hasUnsavedChanges: true,
      };
    }

    case 'IMPORT_STATE': {
      return {
        ...action.payload.state,
        photoBlobs: action.payload.blobs,
        hasUnsavedChanges: false,
      };
    }

    case 'MARK_EXPORTED': {
      return {
        ...state,
        lastExportedAt: action.payload.exportedAt,
        hasUnsavedChanges: false,
      };
    }

    default:
      return state;
  }
}
