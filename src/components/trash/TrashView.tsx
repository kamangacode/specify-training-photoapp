import { TrashItem } from './TrashItem';
import { EmptyState } from '../common/EmptyState';
import { useTrash } from '../../hooks/useTrash';
import styles from './TrashView.module.css';

export function TrashView() {
  const { trashedPhotos, restorePhoto, deletePhoto } = useTrash();

  if (trashedPhotos.length === 0) {
    return (
      <div data-testid="trash-view-empty">
        <EmptyState message="Trash is empty." />
      </div>
    );
  }

  return (
    <div data-testid="trash-view" className={styles.container}>
      <h2 className={styles.heading}>Trash</h2>
      <p className={styles.count}>
        {trashedPhotos.length} {trashedPhotos.length === 1 ? 'photo' : 'photos'}
      </p>
      {trashedPhotos.map((photo) => (
        <TrashItem key={photo.id} photo={photo} onRestore={restorePhoto} onDelete={deletePhoto} />
      ))}
    </div>
  );
}
