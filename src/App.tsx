import { useState } from 'react';
import { AppProvider } from './store/AppContext';
import { Toolbar } from './components/common/Toolbar';
import { MainPage } from './views/MainPage';
import { AlbumViewPage } from './views/AlbumViewPage';
import { TrashPage } from './views/TrashPage';
import styles from './App.module.css';

export type View = { name: 'main' } | { name: 'album'; albumId: string } | { name: 'trash' };

export default function App() {
  const [view, setView] = useState<View>({ name: 'main' });

  return (
    <AppProvider>
      <AppShell view={view} onNavigate={setView} />
    </AppProvider>
  );
}

interface AppShellProps {
  view: View;
  onNavigate: (view: View) => void;
}

function AppShell({ view, onNavigate }: AppShellProps) {
  const openTrash = () => onNavigate({ name: 'trash' });

  return (
    <div className={styles.appShell}>
      <Toolbar onOpenTrash={openTrash} />
      <div className={styles.content}>
        {view.name === 'album' ? (
          <AlbumViewPage albumId={view.albumId} onBack={() => onNavigate({ name: 'main' })} />
        ) : view.name === 'trash' ? (
          <TrashPage onBack={() => onNavigate({ name: 'main' })} />
        ) : (
          <MainPage onOpenAlbum={(albumId) => onNavigate({ name: 'album', albumId })} />
        )}
      </div>
    </div>
  );
}
