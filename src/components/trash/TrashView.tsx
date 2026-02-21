import { TrashItem } from './TrashItem';
import { EmptyState } from '../common/EmptyState';
import { useTrash } from '../../hooks/useTrash';

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
    <div data-testid="trash-view" style={{ padding: '1rem' }}>
      <h2>Trash</h2>
      <p style={{ color: '#666', fontSize: '0.9rem' }}>
        {trashedPhotos.length} {trashedPhotos.length === 1 ? 'photo' : 'photos'}
      </p>
      {trashedPhotos.map((photo) => (
        <TrashItem
          key={photo.id}
          photo={photo}
          onRestore={restorePhoto}
          onDelete={deletePhoto}
        />
      ))}
    </div>
  );
}
