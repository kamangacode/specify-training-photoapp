import { useState } from 'react';
import type { Album } from '../../models/types';
import { useAppContext } from '../../store/AppContext';
import { getDerivedDateRange, getPhotoCount } from '../../store/selectors';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useAlbums } from '../../hooks/useAlbums';
import styles from './AlbumCard.module.css';

interface AlbumCardProps {
  album: Album;
  onClick: (albumId: string) => void;
  isLoading?: boolean;
  isSelected?: boolean;
}

function formatDateRange(range: { earliest: Date; latest: Date } | null): string {
  if (!range) return 'No photos yet';
  const fmt = (d: Date) =>
    d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  if (range.earliest.getTime() === range.latest.getTime()) return fmt(range.earliest);
  return `${fmt(range.earliest)} – ${fmt(range.latest)}`;
}

export function AlbumCard({ album, onClick, isLoading = false, isSelected = false }: AlbumCardProps) {
  const { state } = useAppContext();
  const { renameAlbum, deleteAlbum } = useAlbums();
  const dateRange = getDerivedDateRange(state, album.id);
  const photoCount = getPhotoCount(state, album.id);
  const coverBlobUrl = album.coverPhotoId ? state.photoBlobs.get(album.coverPhotoId) : undefined;
  const coverSrc = coverBlobUrl ? URL.createObjectURL(coverBlobUrl) : undefined;

  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(album.name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imgError, setImgError] = useState(false);

  function handleRenameSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = renameValue.trim();
    if (trimmed) renameAlbum(album.id, trimmed);
    setIsRenaming(false);
  }

  function handleCardClick(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest('button, input')) return;
    onClick(album.id);
  }

  if (isLoading) {
    return (
      <div className={styles.card} aria-busy="true" aria-label="Loading album">
        <div className={styles.skeletonImage} />
        <div className={styles.text}>
          <div className={styles.skeletonTitle} />
          <div className={styles.skeletonMeta} />
        </div>
      </div>
    );
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
        className={`${styles.card}${isSelected ? ` ${styles.isSelected}` : ''}`}
      >
        <div data-testid="album-cover" className={styles.imageWrapper} aria-hidden="true">
          {coverSrc && !imgError ? (
            <>
              <img
                src={coverSrc}
                alt=""
                className={styles.img}
                onError={() => setImgError(true)}
              />
              <div className={styles.overlay} />
            </>
          ) : (
            <div className={styles.overlay} />
          )}
        </div>

        <div className={styles.text}>
          {isRenaming ? (
            <form onSubmit={handleRenameSubmit}>
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                aria-label="Rename album"
                autoFocus
                onBlur={() => setIsRenaming(false)}
                className={styles.renameInput}
              />
            </form>
          ) : (
            <h2 className={styles.title}>{album.name}</h2>
          )}

          <p className={styles.meta}>
            {photoCount} {photoCount === 1 ? 'photo' : 'photos'}
          </p>
          <p className={styles.meta}>{formatDateRange(dateRange)}</p>

          <div className={styles.actions}>
            <button
              type="button"
              aria-label={`Rename album ${album.name}`}
              onClick={(e) => {
                e.stopPropagation();
                setRenameValue(album.name);
                setIsRenaming(true);
              }}
              className={styles.actionButton}
            >
              Rename
            </button>
            <button
              type="button"
              aria-label={`Delete album ${album.name}`}
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(true);
              }}
              className={styles.actionButton}
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
          onConfirm={() => {
            deleteAlbum(album.id);
            setShowDeleteConfirm(false);
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </>
  );
}
