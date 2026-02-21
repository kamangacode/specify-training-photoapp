import { useRef, useEffect, useState } from 'react';
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
import { PhotoTile } from './PhotoTile';
import type { Photo } from '../../models/types';

interface SortablePhotoTileProps {
  photo: Photo;
  visible: boolean;
  onOpen: (photoId: string) => void;
  onTrash?: (photoId: string) => void;
}

function SortablePhotoTile({ photo, visible, onOpen, onTrash }: SortablePhotoTileProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: photo.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {visible ? (
        <PhotoTile photo={photo} onOpen={onOpen} onTrash={onTrash} />
      ) : (
        <div
          data-testid="photo-skeleton"
          aria-hidden="true"
          style={{ aspectRatio: '1', background: '#ddd', borderRadius: '4px' }}
        />
      )}
    </div>
  );
}

interface PhotoGridProps {
  albumId: string;
  photos: Photo[];
  photoSortMode: 'date' | 'manual';
  onOpen: (photoId: string) => void;
  onTrash?: (photoId: string) => void;
  onReorder?: (albumId: string, photoIds: string[]) => void;
  onCreateAlbum?: () => void;
}

export function PhotoGrid({
  albumId,
  photos,
  photoSortMode,
  onOpen,
  onTrash,
  onReorder,
}: PhotoGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // IntersectionObserver for lazy tile visibility
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const tiles = containerRef.current?.querySelectorAll<HTMLElement>('[data-photo-id]');
    if (!tiles) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleIds((prev) => {
          const next = new Set(prev);
          entries.forEach((entry) => {
            const id = (entry.target as HTMLElement).dataset['photoId'];
            if (id && entry.isIntersecting) next.add(id);
          });
          return next;
        });
      },
      { threshold: 0.1 }
    );

    tiles.forEach((tile) => observer.observe(tile));
    return () => observer.disconnect();
  }, [photos]);

  if (photos.length === 0) {
    return (
      <div data-testid="photo-grid-empty">
        <EmptyState message="No photos in this album yet." />
      </div>
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = photos.findIndex((p) => p.id === active.id);
    const newIndex = photos.findIndex((p) => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(photos, oldIndex, newIndex).map((p) => p.id);
    onReorder?.(albumId, newOrder);
  }

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '0.5rem',
    padding: '1rem',
  };

  if (photoSortMode === 'manual') {
    return (
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={photos.map((p) => p.id)} strategy={rectSortingStrategy}>
          <div ref={containerRef} data-testid="photo-grid" style={gridStyle}>
            {photos.map((photo) => (
              <div key={photo.id} data-photo-id={photo.id}>
                <SortablePhotoTile
                  photo={photo}
                  visible={visibleIds.has(photo.id)}
                  onOpen={onOpen}
                  onTrash={onTrash}
                />
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    );
  }

  return (
    <div ref={containerRef} data-testid="photo-grid" style={gridStyle}>
      {photos.map((photo) => (
        <div key={photo.id} data-photo-id={photo.id}>
          {visibleIds.has(photo.id) ? (
            <PhotoTile photo={photo} onOpen={onOpen} onTrash={onTrash} />
          ) : (
            <div
              data-testid="photo-skeleton"
              aria-hidden="true"
              style={{ aspectRatio: '1', background: '#ddd', borderRadius: '4px' }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
