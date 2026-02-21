import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLightbox } from '../../src/hooks/useLightbox';

const photoIds = ['p1', 'p2', 'p3'];

describe('useLightbox', () => {
  it('starts closed', () => {
    const { result } = renderHook(() => useLightbox(photoIds));
    expect(result.current.isOpen).toBe(false);
    expect(result.current.activePhotoId).toBeNull();
  });

  it('opens with the correct photo ID', () => {
    const { result } = renderHook(() => useLightbox(photoIds));
    act(() => result.current.open('p2'));
    expect(result.current.isOpen).toBe(true);
    expect(result.current.activePhotoId).toBe('p2');
  });

  it('closes', () => {
    const { result } = renderHook(() => useLightbox(photoIds));
    act(() => result.current.open('p1'));
    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
  });

  it('navigates to next photo', () => {
    const { result } = renderHook(() => useLightbox(photoIds));
    act(() => result.current.open('p1'));
    act(() => result.current.next());
    expect(result.current.activePhotoId).toBe('p2');
  });

  it('wraps around from last to first on next', () => {
    const { result } = renderHook(() => useLightbox(photoIds));
    act(() => result.current.open('p3'));
    act(() => result.current.next());
    expect(result.current.activePhotoId).toBe('p1');
  });

  it('navigates to previous photo', () => {
    const { result } = renderHook(() => useLightbox(photoIds));
    act(() => result.current.open('p2'));
    act(() => result.current.prev());
    expect(result.current.activePhotoId).toBe('p1');
  });

  it('wraps around from first to last on prev', () => {
    const { result } = renderHook(() => useLightbox(photoIds));
    act(() => result.current.open('p1'));
    act(() => result.current.prev());
    expect(result.current.activePhotoId).toBe('p3');
  });
});
