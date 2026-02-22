import { useState } from 'react';
import { AlbumGrid } from '../components/albums/AlbumGrid';
import { AlbumForm } from '../components/albums/AlbumForm';

interface MainPageProps {
  onOpenAlbum: (albumId: string) => void;
}

export function MainPage({ onOpenAlbum }: MainPageProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div data-testid="main-page">
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1rem',
          borderBottom: '1px solid #eee',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '1.25rem' }}>Photo Albums</h1>
        <button type="button" onClick={() => setShowCreateForm(true)}>
          Create Album
        </button>
      </header>

      {showCreateForm && <AlbumForm onClose={() => setShowCreateForm(false)} />}

      <main>
        <AlbumGrid onOpenAlbum={onOpenAlbum} onCreateAlbum={() => setShowCreateForm(true)} />
      </main>
    </div>
  );
}
