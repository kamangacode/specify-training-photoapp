import { useState, useCallback } from 'react';

export interface UseLightboxResult {
  isOpen: boolean;
  activePhotoId: string | null;
  open: (photoId: string) => void;
  close: () => void;
  next: () => void;
  prev: () => void;
}

export function useLightbox(photoIds: string[]): UseLightboxResult {
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null);
  const isOpen = activePhotoId !== null;

  const open = useCallback((photoId: string) => setActivePhotoId(photoId), []);
  const close = useCallback(() => setActivePhotoId(null), []);

  const next = useCallback(() => {
    setActivePhotoId((current) => {
      if (!current || photoIds.length === 0) return current;
      const idx = photoIds.indexOf(current);
      return photoIds[(idx + 1) % photoIds.length] ?? current;
    });
  }, [photoIds]);

  const prev = useCallback(() => {
    setActivePhotoId((current) => {
      if (!current || photoIds.length === 0) return current;
      const idx = photoIds.indexOf(current);
      return photoIds[(idx - 1 + photoIds.length) % photoIds.length] ?? current;
    });
  }, [photoIds]);

  return { isOpen, activePhotoId, open, close, next, prev };
}
