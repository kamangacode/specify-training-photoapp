import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { EmptyState } from '../common/EmptyState';
import { AlbumCard } from './AlbumCard';
import { useAlbums } from '../../hooks/useAlbums';
import { useAppContext } from '../../store/AppContext';
import type { Album } from '../../models/types';

interface SortableAlbumCardProps {
  album: Album;
  onOpenAlbum: (albumId: string) => void;
}

function SortableAlbumCard({ album, onOpenAlbum }: SortableAlbumCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: album.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} role="listitem">
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        aria-label={`Drag to reorder ${album.name}`}
        style={{ cursor: 'grab', padding: '4px', textAlign: 'center', userSelect: 'none' }}
      >
        ⠿
      </div>
      <AlbumCard album={album} onClick={onOpenAlbum} />
    </div>
  );
}

interface AlbumGridProps {
  onOpenAlbum: (albumId: string) => void;
  onCreateAlbum: () => void;
}

export function AlbumGrid({ onOpenAlbum, onCreateAlbum }: AlbumGridProps) {
  const { albums } = useAlbums();
  const { state, dispatch } = useAppContext();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  if (albums.length === 0) {
    return (
      <div data-testid="album-grid-empty">
        <EmptyState
          message="No albums yet. Create your first album to get started."
          action={{ label: 'Create Album', onClick: onCreateAlbum }}
        />
      </div>
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = albums.findIndex((a) => a.id === active.id);
    const newIndex = albums.findIndex((a) => a.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(albums, oldIndex, newIndex).map((a) => a.id);
    dispatch({ type: 'REORDER_ALBUMS', payload: { albumOrder: newOrder } });
  }

  // Use state.albumOrder as the canonical order for SortableContext IDs
  const orderedIds = state.isCustomOrdered
    ? state.albumOrder
    : albums.map((a) => a.id);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={orderedIds} strategy={rectSortingStrategy}>
        <div
          data-testid="album-grid"
          role="list"
          aria-label="Photo albums"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1rem',
            padding: '1rem',
          }}
        >
          {albums.map((album) => (
            <SortableAlbumCard key={album.id} album={album} onOpenAlbum={onOpenAlbum} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
