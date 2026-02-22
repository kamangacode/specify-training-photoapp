import { useState } from 'react';
import type { Photo } from '../../models/types';
import { useAppContext } from '../../store/AppContext';
import { ConfirmDialog } from '../common/ConfirmDialog';
import styles from './TrashItem.module.css';

interface TrashItemProps {
  photo: Photo;
  onRestore: (photoId: string, targetAlbumId: string) => void;
  onDelete: (photoId: string) => void;
}

export function TrashItem({ photo, onRestore, onDelete }: TrashItemProps) {
  const { state } = useAppContext();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAlbumPicker, setShowAlbumPicker] = useState(false);

  const blob = state.photoBlobs.get(photo.id);
  const src = blob ? URL.createObjectURL(blob) : undefined;
  const originalAlbum = state.albums[photo.originalAlbumId];
  const originalAlbumName = originalAlbum?.name ?? '(deleted album)';
  const trashedDate = photo.dateTrashed
    ? new Date(photo.dateTrashed).toLocaleDateString()
    : 'Unknown';

  function handleRestore() {
    if (originalAlbum) {
      onRestore(photo.id, photo.originalAlbumId);
    } else {
      setShowAlbumPicker(true);
    }
  }

  const availableAlbums = Object.values(state.albums);

  return (
    <>
      <div data-testid="trash-item" className={styles.item}>
        {src ? (
          <img
            src={src}
            alt={photo.fileName}
            className={styles.thumbnail}
          />
        ) : (
          <div className={styles.thumbnailPlaceholder} />
        )}

        <div className={styles.info}>
          <p className={styles.fileName}>{photo.fileName}</p>
          <p className={styles.meta}>Original album: {originalAlbumName}</p>
          <p className={styles.meta}>Trashed: {trashedDate}</p>
        </div>

        <div className={styles.actionButtons}>
          <button type="button" onClick={handleRestore} aria-label={`Restore ${photo.fileName}`} className={styles.restoreButton}>
            Restore
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            aria-label={`Delete ${photo.fileName} permanently`}
            className={styles.deleteButton}
          >
            Delete Permanently
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete Permanently"
          message={`Permanently delete "${photo.fileName}"? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={() => {
            onDelete(photo.id);
            setShowDeleteConfirm(false);
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {showAlbumPicker && (
        <div role="dialog" aria-label="Select destination album" className={styles.albumPicker}>
          <p>Original album was deleted. Choose a destination:</p>
          {availableAlbums.length === 0 ? (
            <p>No albums available. Create an album first.</p>
          ) : (
            <ul className={styles.albumPickerList}>
              {availableAlbums.map((album) => (
                <li key={album.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onRestore(photo.id, album.id);
                      setShowAlbumPicker(false);
                    }}
                  >
                    {album.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button type="button" onClick={() => setShowAlbumPicker(false)}>
            Cancel
          </button>
        </div>
      )}
    </>
  );
}
