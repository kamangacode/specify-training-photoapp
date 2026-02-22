import { TrashView } from '../components/trash/TrashView';
import styles from './TrashPage.module.css';

interface TrashPageProps {
  onBack: () => void;
}

export function TrashPage({ onBack }: TrashPageProps) {
  return (
    <div data-testid="trash-page" className={styles.page}>
      <header className={styles.header}>
        <button type="button" onClick={onBack} aria-label="Back to albums" className={styles.backButton}>
          ← Back
        </button>
        <h1 className={styles.pageTitle}>Trash</h1>
      </header>
      <main className={styles.main}>
        <TrashView />
      </main>
    </div>
  );
}
