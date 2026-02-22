import { useState } from 'react';
import { AlbumGrid } from '../components/albums/AlbumGrid';
import { AlbumForm } from '../components/albums/AlbumForm';
import styles from './MainPage.module.css';

interface MainPageProps {
  onOpenAlbum: (albumId: string) => void;
}

export function MainPage({ onOpenAlbum }: MainPageProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div data-testid="main-page" className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Photo Albums</h1>
        <button
          type="button"
          className={styles.createButton}
          onClick={() => setShowCreateForm(true)}
        >
          Create Album
        </button>
      </header>

      {showCreateForm && <AlbumForm onClose={() => setShowCreateForm(false)} />}

      <main className={styles.main}>
        <AlbumGrid onOpenAlbum={onOpenAlbum} onCreateAlbum={() => setShowCreateForm(true)} />
      </main>
    </div>
  );
}
