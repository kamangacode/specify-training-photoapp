import { useState } from 'react';
import type { Album } from '../../models/types';
import { useAppContext } from '../../store/AppContext';
import { getDerivedDateRange, getPhotoCount } from '../../store/selectors';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useAlbums } from '../../hooks/useAlbums';

interface AlbumCardProps {
  album: Album;
  onClick: (albumId: string) => void;
}

function formatDateRange(range: { earliest: Date; latest: Date } | null): string {
  if (!range) return 'No photos yet';
  const fmt = (d: Date) =>
    d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  if (range.earliest.getTime() === range.latest.getTime()) return fmt(range.earliest);
  return `${fmt(range.earliest)} – ${fmt(range.latest)}`;
}

export function AlbumCard({ album, onClick }: AlbumCardProps) {
  const { state } = useAppContext();
  const { renameAlbum, deleteAlbum } = useAlbums();
  const dateRange = getDerivedDateRange(state, album.id);
  const photoCount = getPhotoCount(state, album.id);
  const coverBlobUrl = album.coverPhotoId ? state.photoBlobs.get(album.coverPhotoId) : undefined;
  const coverSrc = coverBlobUrl ? URL.createObjectURL(coverBlobUrl) : undefined;

  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(album.name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  function handleRenameSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = renameValue.trim();
    if (trimmed) renameAlbum(album.id, trimmed);
    setIsRenaming(false);
  }

  function handleCardClick(e: React.MouseEvent) {
    // Don't navigate when interacting with controls
    if ((e.target as HTMLElement).closest('button, input')) return;
    onClick(album.id);
  }

  return (
    <>
      <article
        data-testid="album-card"
        onClick={handleCardClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            if (!(e.target as HTMLElement).closest('button, input')) onClick(album.id);
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={`Open album ${album.name}`}
        style={{ cursor: 'pointer' }}
      >
        <div
          data-testid="album-cover"
          aria-hidden="true"
          style={{ width: '100%', paddingBottom: '60%', background: '#ccc', position: 'relative' }}
        >
          {coverSrc && (
            <img
              src={coverSrc}
              alt=""
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
        </div>

        <div style={{ padding: '0.5rem' }}>
          {isRenaming ? (
            <form onSubmit={handleRenameSubmit}>
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                aria-label="Rename album"
                autoFocus
                onBlur={() => setIsRenaming(false)}
                style={{ width: '100%', fontSize: '1rem' }}
              />
            </form>
          ) : (
            <h2 style={{ margin: 0, fontSize: '1rem' }}>{album.name}</h2>
          )}

          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#555' }}>
            {photoCount} {photoCount === 1 ? 'photo' : 'photos'}
          </p>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#777' }}>
            {formatDateRange(dateRange)}
          </p>

          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              aria-label={`Rename album ${album.name}`}
              onClick={(e) => { e.stopPropagation(); setRenameValue(album.name); setIsRenaming(true); }}
              style={{ fontSize: '0.75rem' }}
            >
              Rename
            </button>
            <button
              type="button"
              aria-label={`Delete album ${album.name}`}
              onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
              style={{ fontSize: '0.75rem' }}
            >
              Delete
            </button>
          </div>
        </div>
      </article>

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete Album"
          message={`Delete "${album.name}"? All photos will be moved to Trash.`}
          confirmLabel="Delete"
          onConfirm={() => { deleteAlbum(album.id); setShowDeleteConfirm(false); }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </>
  );
}
