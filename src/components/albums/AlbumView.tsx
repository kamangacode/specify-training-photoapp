import { useAppContext } from '../../store/AppContext';
import { getSortedPhotos } from '../../store/selectors';
import { PhotoGrid } from '../photos/PhotoGrid';
import { Lightbox } from '../photos/Lightbox';
import { SortToggle } from '../common/SortToggle';
import { AddPhotosButton } from './AddPhotosButton';
import { EmptyState } from '../common/EmptyState';
import { useLightbox } from '../../hooks/useLightbox';
import { usePhotos } from '../../hooks/usePhotos';

interface AlbumViewProps {
  albumId: string;
  onBack: () => void;
}

export function AlbumView({ albumId, onBack }: AlbumViewProps) {
  const { state } = useAppContext();
  const album = state.albums[albumId];
  const { sortedPhotos, trashPhoto, setSortMode, reorderPhotos } = usePhotos(albumId);
  const photoIds = sortedPhotos.map((p) => p.id);
  const lightbox = useLightbox(photoIds);

  if (!album) {
    return (
      <div data-testid="album-view">
        <EmptyState message="Album not found." action={{ label: 'Back', onClick: onBack }} />
      </div>
    );
  }

  const allPhotos = getSortedPhotos(state, albumId);

  return (
    <div data-testid="album-view">
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem 1rem',
          borderBottom: '1px solid #eee',
        }}
      >
        <button type="button" onClick={onBack} aria-label="Back to albums">
          ← Back
        </button>
        <h1 style={{ margin: 0, fontSize: '1.25rem', flex: 1 }}>{album.name}</h1>
        <SortToggle albumId={albumId} currentMode={album.photoSortMode} onToggle={setSortMode} />
        <AddPhotosButton albumId={albumId} />
      </header>

      <PhotoGrid
        albumId={albumId}
        photos={allPhotos}
        photoSortMode={album.photoSortMode}
        onOpen={lightbox.open}
        onTrash={trashPhoto}
        onReorder={reorderPhotos}
      />

      {lightbox.isOpen && lightbox.activePhotoId && (
        <Lightbox
          photoId={lightbox.activePhotoId}
          onClose={lightbox.close}
          onNext={lightbox.next}
          onPrev={lightbox.prev}
        />
      )}
    </div>
  );
}
