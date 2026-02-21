import type { PhotoSortMode } from '../../models/types';

interface SortToggleProps {
  albumId: string;
  currentMode: PhotoSortMode;
  onToggle: (albumId: string, mode: PhotoSortMode) => void;
}

export function SortToggle({ albumId, currentMode, onToggle }: SortToggleProps) {
  const isManual = currentMode === 'manual';

  return (
    <button
      type="button"
      aria-pressed={isManual}
      aria-label={isManual ? 'Switch to date sort' : 'Switch to manual sort'}
      onClick={() => onToggle(albumId, isManual ? 'date' : 'manual')}
    >
      {isManual ? 'Manual Sort' : 'Date Sort'}
    </button>
  );
}
