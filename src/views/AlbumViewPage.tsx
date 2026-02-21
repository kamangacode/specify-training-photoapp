import { AlbumView } from '../components/albums/AlbumView';

interface AlbumViewPageProps {
  albumId: string;
  onBack: () => void;
}

export function AlbumViewPage({ albumId, onBack }: AlbumViewPageProps) {
  return <AlbumView albumId={albumId} onBack={onBack} />;
}
