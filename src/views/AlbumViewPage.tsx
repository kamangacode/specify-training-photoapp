import { AlbumView } from '../components/albums/AlbumView';
import styles from './AlbumViewPage.module.css';

interface AlbumViewPageProps {
  albumId: string;
  onBack: () => void;
}

export function AlbumViewPage({ albumId, onBack }: AlbumViewPageProps) {
  return (
    <div className={styles.page}>
      <AlbumView albumId={albumId} onBack={onBack} />
    </div>
  );
}
