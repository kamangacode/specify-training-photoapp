import { useEffect, useRef } from 'react';
import { useAppContext } from '../../store/AppContext';
import styles from './Lightbox.module.css';

interface LightboxProps {
  photoId: string;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export function Lightbox({ photoId, onClose, onNext, onPrev }: LightboxProps) {
  const { state } = useAppContext();
  const photo = state.photos[photoId];
  const blob = photo ? state.photoBlobs.get(photoId) : undefined;
  const src = blob ? URL.createObjectURL(blob) : undefined;

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Focus trap: focus close button on mount
  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        onNext();
      } else if (e.key === 'ArrowLeft') {
        onPrev();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev]);

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  if (!photo) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Viewing photo: ${photo.fileName}`}
      onClick={handleOverlayClick}
      className={styles.overlay}
    >
      <button
        ref={closeButtonRef}
        type="button"
        onClick={onClose}
        aria-label="Close lightbox"
        className={styles.closeButton}
      >
        ✕
      </button>

      <button
        type="button"
        onClick={onPrev}
        aria-label="Previous photo"
        className={styles.prevButton}
      >
        ‹
      </button>

      {src && (
        <img
          src={src}
          alt={photo.fileName}
          className={styles.image}
        />
      )}

      <button
        type="button"
        onClick={onNext}
        aria-label="Next photo"
        className={styles.nextButton}
      >
        ›
      </button>
    </div>
  );
}
