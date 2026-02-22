import { useState } from 'react';
import type { Photo } from '../../models/types';
import { useAppContext } from '../../store/AppContext';
import styles from './PhotoTile.module.css';

interface PhotoTileProps {
  photo: Photo;
  onOpen: (photoId: string) => void;
  onTrash?: (photoId: string) => void;
  isLoading?: boolean;
}

export function PhotoTile({ photo, onOpen, onTrash, isLoading }: PhotoTileProps) {
  const { state } = useAppContext();
  const blob = state.photoBlobs.get(photo.id);
  const src = blob ? URL.createObjectURL(blob) : undefined;
  const [imgError, setImgError] = useState(false);

  if (isLoading) {
    return (
      <div className={styles.skeletonWrapper} aria-busy="true" aria-label="Loading photo">
        <div className={styles.skeleton} />
      </div>
    );
  }

  return (
    <div data-testid="photo-tile" className={styles.tile}>
      <div className={styles.imageWrapper}>
        <button
          type="button"
          onClick={() => onOpen(photo.id)}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen(photo.id)}
          aria-label={`View photo ${photo.fileName}`}
          style={{ display: 'block', width: '100%', height: '100%', border: 'none', padding: 0, background: 'none', cursor: 'pointer' }}
        >
          {src && !imgError ? (
            <img
              src={src}
              alt={photo.fileName}
              loading="lazy"
              className={styles.img}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className={styles.errorPlaceholder} aria-label="Image unavailable">
              ✕
            </div>
          )}
        </button>
        <div className={styles.overlay} aria-hidden="true" />
      </div>

      {onTrash && (
        <button
          type="button"
          onClick={() => onTrash(photo.id)}
          aria-label={`Move ${photo.fileName} to trash`}
          className={styles.trashButton}
        >
          Trash
        </button>
      )}
    </div>
  );
}
