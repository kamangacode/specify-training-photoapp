import type { AppState, Album, Photo } from '../models/types';

export function getAlbumById(state: AppState, albumId: string): Album | undefined {
  return state.albums[albumId];
}

export function getPhotosByAlbum(state: AppState, albumId: string): Photo[] {
  return Object.values(state.photos).filter(
    (p) => p.status === 'active' && p.albumId === albumId
  );
}

export function getTrashedPhotos(state: AppState): Photo[] {
  return Object.values(state.photos).filter((p) => p.status === 'trashed');
}

export function getDerivedDateRange(
  state: AppState,
  albumId: string
): { earliest: Date; latest: Date } | null {
  const album = state.albums[albumId];
  if (!album || album.photoIds.length === 0) return null;

  const dates: Date[] = [];
  for (const photoId of album.photoIds) {
    const photo = state.photos[photoId];
    if (photo && photo.status === 'active') {
      dates.push(new Date(photo.dateTaken));
    }
  }

  if (dates.length === 0) return null;

  const sorted = dates.slice().sort((a, b) => a.getTime() - b.getTime());
  return { earliest: sorted[0]!, latest: sorted[sorted.length - 1]! };
}

export function getPhotoCount(state: AppState, albumId: string): number {
  const album = state.albums[albumId];
  if (!album) return 0;
  return album.photoIds.filter((id) => {
    const photo = state.photos[id];
    return photo && photo.status === 'active';
  }).length;
}

export function getSortedPhotos(state: AppState, albumId: string): Photo[] {
  const album = state.albums[albumId];
  if (!album) return [];

  const photos = album.photoIds
    .map((id) => state.photos[id])
    .filter((p): p is Photo => !!p && p.status === 'active');

  if (album.photoSortMode === 'manual') {
    return photos.slice().sort((a, b) => a.manualSortIndex - b.manualSortIndex);
  }

  // date mode: oldest first
  return photos.slice().sort(
    (a, b) => new Date(a.dateTaken).getTime() - new Date(b.dateTaken).getTime()
  );
}

/** Returns albums sorted by latest photo date (most recent first) when the user hasn't
 *  custom-ordered yet; returns albumOrder sequence when isCustomOrdered is true. */
export function getOrderedAlbums(state: AppState): Album[] {
  if (state.isCustomOrdered) {
    return state.albumOrder
      .map((id) => state.albums[id])
      .filter((a): a is Album => !!a);
  }

  // Default: sort by latest photo date, most recent first
  const albums = Object.values(state.albums);
  return albums.slice().sort((a, b) => {
    const rangeA = getDerivedDateRange(state, a.id);
    const rangeB = getDerivedDateRange(state, b.id);
    const timeA = rangeA ? rangeA.latest.getTime() : 0;
    const timeB = rangeB ? rangeB.latest.getTime() : 0;
    return timeB - timeA; // most recent first
  });
}
