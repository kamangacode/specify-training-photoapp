import { useRef, useState } from 'react';
import { processPhotoFiles } from '../../services/fileImport';
import { useAppContext } from '../../store/AppContext';
import { ACCEPTED_MIME_TYPES } from '../../constants';

interface AddPhotosButtonProps {
  albumId: string;
}

export function AddPhotosButton({ albumId }: AddPhotosButtonProps) {
  const { dispatch } = useAppContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<Array<{ fileName: string; reason: string }>>([]);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const result = await processPhotoFiles(files, albumId);

    if (result.photos.length > 0) {
      dispatch({ type: 'ADD_PHOTOS', payload: { photos: result.photos, blobs: result.blobs } });
    }

    setErrors(result.errors);

    // Reset input so the same file can be re-selected
    if (inputRef.current) inputRef.current.value = '';
  }

  const acceptAttr = ACCEPTED_MIME_TYPES.join(',');

  return (
    <div>
      <input
        ref={inputRef}
        id={`add-photos-${albumId}`}
        type="file"
        accept={acceptAttr}
        multiple
        onChange={handleChange}
        style={{ display: 'none' }}
        aria-label="Select photos to add"
      />
      <label htmlFor={`add-photos-${albumId}`}>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          aria-label="Add photos to album"
        >
          Add Photos
        </button>
      </label>

      {errors.length > 0 && (
        <ul role="list" aria-label="Import errors" style={{ color: 'red', marginTop: '0.5rem' }}>
          {errors.map((err) => (
            <li key={err.fileName}>
              <strong>{err.fileName}</strong>: {err.reason}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
