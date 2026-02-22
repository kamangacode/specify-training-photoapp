import { useEffect, useRef } from 'react';
import styles from './ConfirmDialog.module.css';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
    cancelBtnRef.current?.focus();

    const dialog = dialogRef.current;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };
    dialog?.addEventListener('keydown', handleKeyDown);
    return () => dialog?.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="confirm-title"
      aria-describedby="confirm-message"
      onClose={onCancel}
      className={styles.dialog}
    >
      <h2 id="confirm-title" className={styles.title}>{title}</h2>
      <p id="confirm-message" className={styles.message}>{message}</p>
      <div className={styles.actions}>
        <button ref={cancelBtnRef} type="button" onClick={onCancel} className={styles.cancelButton}>
          {cancelLabel}
        </button>
        <button type="button" onClick={onConfirm} className={styles.confirmButton}>
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
