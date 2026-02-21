import type { Photo } from '../../models/types';
import { useAppContext } from '../../store/AppContext';

interface PhotoTileProps {
  photo: Photo;
  onOpen: (photoId: string) => void;
  onTrash?: (photoId: string) => void;
}

export function PhotoTile({ photo, onOpen, onTrash }: PhotoTileProps) {
  const { state } = useAppContext();
  const blob = state.photoBlobs.get(photo.id);
  const src = blob ? URL.createObjectURL(blob) : undefined;

  return (
    <div
      data-testid="photo-tile"
      style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', background: '#eee' }}
    >
      <button
        type="button"
        onClick={() => onOpen(photo.id)}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen(photo.id)}
        aria-label={`View photo ${photo.fileName}`}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          border: 'none',
          padding: 0,
          background: 'none',
          cursor: 'pointer',
        }}
      >
        {src && (
          <img
            src={src}
            alt={photo.fileName}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
      </button>

      {onTrash && (
        <button
          type="button"
          onClick={() => onTrash(photo.id)}
          aria-label={`Move ${photo.fileName} to trash`}
          style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            background: 'rgba(0,0,0,0.6)',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            padding: '2px 6px',
            cursor: 'pointer',
            fontSize: '0.75rem',
          }}
        >
          Trash
        </button>
      )}
    </div>
  );
}
