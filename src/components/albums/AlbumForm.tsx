import { useState } from 'react';
import { MAX_ALBUM_NAME_LENGTH } from '../../constants';
import { useAlbums } from '../../hooks/useAlbums';
import styles from './AlbumForm.module.css';

interface AlbumFormProps {
  onClose: () => void;
}

export function AlbumForm({ onClose }: AlbumFormProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { createAlbum } = useAlbums();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Album name cannot be empty.');
      return;
    }
    createAlbum(trimmed);
    onClose();
  }

  return (
    <div role="dialog" aria-labelledby="album-form-title" aria-modal="true">
      <h2 id="album-form-title">Create Album</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label htmlFor="album-name-input" className={styles.label}>
          Album name
          <input
            id="album-name-input"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            maxLength={MAX_ALBUM_NAME_LENGTH}
            aria-describedby={error ? 'album-name-error' : undefined}
            autoFocus
            className={styles.input}
          />
        </label>
        {error && (
          <p id="album-name-error" role="alert" className={styles.errorMessage}>
            {error}
          </p>
        )}
        <div className={styles.actions}>
          <button type="button" onClick={onClose} className={styles.cancelButton}>
            Cancel
          </button>
          <button type="submit" className={styles.submitButton}>Create</button>
        </div>
      </form>
    </div>
  );
}
