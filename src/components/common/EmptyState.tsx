import styles from './EmptyState.module.css';

interface EmptyStateProps {
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <div role="status" aria-label={message} className={styles.container}>
      <p className={styles.message}>{message}</p>
      {action && (
        <button type="button" onClick={action.onClick} className={styles.actionButton}>
          {action.label}
        </button>
      )}
    </div>
  );
}
