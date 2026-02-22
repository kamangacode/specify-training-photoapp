import { useAppContext } from '../../store/AppContext';
import { getSortedPhotos } from '../../store/selectors';
import { PhotoGrid } from '../photos/PhotoGrid';
import { Lightbox } from '../photos/Lightbox';
import { SortToggle } from '../common/SortToggle';
import { AddPhotosButton } from './AddPhotosButton';
import { EmptyState } from '../common/EmptyState';
import { useLightbox } from '../../hooks/useLightbox';
import { usePhotos } from '../../hooks/usePhotos';
import styles from './AlbumView.module.css';

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
      <div data-testid="album-view" className={styles.view}>
        <EmptyState message="Album not found." action={{ label: 'Back', onClick: onBack }} />
      </div>
    );
  }

  const allPhotos = getSortedPhotos(state, albumId);

  return (
    <div data-testid="album-view" className={styles.view}>
      <header className={styles.header}>
        <button type="button" onClick={onBack} aria-label="Back to albums" className={styles.backButton}>
          ← Back
        </button>
        <h1 className={styles.albumTitle}>{album.name}</h1>
        <SortToggle albumId={albumId} currentMode={album.photoSortMode} onToggle={setSortMode} />
        <AddPhotosButton albumId={albumId} />
      </header>

      <main className={styles.body}>
        <PhotoGrid
          albumId={albumId}
          photos={allPhotos}
          photoSortMode={album.photoSortMode}
          onOpen={lightbox.open}
          onTrash={trashPhoto}
          onReorder={reorderPhotos}
        />
      </main>

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
