import { TrashView } from '../components/trash/TrashView';

interface TrashPageProps {
  onBack: () => void;
}

export function TrashPage({ onBack }: TrashPageProps) {
  return (
    <div data-testid="trash-page">
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem 1rem',
          borderBottom: '1px solid #eee',
        }}
      >
        <button type="button" onClick={onBack} aria-label="Back to albums">
          ← Back
        </button>
        <h1 style={{ margin: 0, fontSize: '1.25rem' }}>Trash</h1>
      </header>
      <main>
        <TrashView />
      </main>
    </div>
  );
}
