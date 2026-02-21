import { useState } from 'react';
import type { Photo } from '../../models/types';
import { useAppContext } from '../../store/AppContext';
import { ConfirmDialog } from '../common/ConfirmDialog';

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
      <div
        data-testid="trash-item"
        style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.5rem 0' }}
      >
        {src ? (
          <img
            src={src}
            alt={photo.fileName}
            style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
          />
        ) : (
          <div style={{ width: '60px', height: '60px', background: '#ddd', borderRadius: '4px' }} />
        )}

        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{photo.fileName}</p>
          <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#666' }}>
            Original album: {originalAlbumName}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#666' }}>
            Trashed: {trashedDate}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button type="button" onClick={handleRestore} aria-label={`Restore ${photo.fileName}`}>
            Restore
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            aria-label={`Delete ${photo.fileName} permanently`}
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
          onConfirm={() => { onDelete(photo.id); setShowDeleteConfirm(false); }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {showAlbumPicker && (
        <div role="dialog" aria-label="Select destination album">
          <p>Original album was deleted. Choose a destination:</p>
          {availableAlbums.length === 0 ? (
            <p>No albums available. Create an album first.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {availableAlbums.map((album) => (
                <li key={album.id}>
                  <button
                    type="button"
                    onClick={() => { onRestore(photo.id, album.id); setShowAlbumPicker(false); }}
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
