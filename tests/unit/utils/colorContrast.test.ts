import { describe, it, expect } from 'vitest';
import { hexToRgb, getLuminance, getContrastRatio, isWcagAA } from '../../../src/utils/colorContrast';

describe('hexToRgb', () => {
  it('parses a 6-digit hex color', () => {
    expect(hexToRgb('#FFFFFF')).toEqual([255, 255, 255]);
    expect(hexToRgb('#000000')).toEqual([0, 0, 0]);
    expect(hexToRgb('#FF6B35')).toEqual([255, 107, 53]);
  });

  it('parses without leading #', () => {
    expect(hexToRgb('4A90E2')).toEqual([74, 144, 226]);
  });

  it('throws on invalid hex', () => {
    expect(() => hexToRgb('zzz')).toThrow();
  });
});

describe('getLuminance', () => {
  it('returns 1 for white', () => {
    expect(getLuminance('#FFFFFF')).toBeCloseTo(1, 5);
  });

  it('returns 0 for black', () => {
    expect(getLuminance('#000000')).toBeCloseTo(0, 5);
  });
});

describe('getContrastRatio', () => {
  it('returns 21 for black on white', () => {
    expect(getContrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 0);
  });

  it('returns 1 for identical colors', () => {
    expect(getContrastRatio('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 5);
  });

  // === Text colors on white background (body text standard: ≥4.5:1) ===
  it('primary text #1A1A1A on white passes WCAG AA text (≥4.5:1)', () => {
    expect(getContrastRatio('#1A1A1A', '#FFFFFF')).toBeGreaterThanOrEqual(4.5);
  });

  it('secondary text #4A4A4A on white passes WCAG AA text (≥4.5:1)', () => {
    expect(getContrastRatio('#4A4A4A', '#FFFFFF')).toBeGreaterThanOrEqual(4.5);
  });

  it('tertiary text #757575 on white passes WCAG AA text (≥4.5:1)', () => {
    expect(getContrastRatio('#757575', '#FFFFFF')).toBeGreaterThanOrEqual(4.5);
  });

  // === Button text: dark text on vibrant accent background ===
  // Primary button uses dark text (#1A1A1A) on coral orange (#FF6B35) — 6.1:1 ✓ AA
  it('dark text #1A1A1A on accent primary #FF6B35 passes WCAG AA (≥4.5:1)', () => {
    expect(getContrastRatio('#1A1A1A', '#FF6B35')).toBeGreaterThanOrEqual(4.5);
  });

  // Dark text on secondary accent — also meets AA
  it('dark text #1A1A1A on accent secondary #4A90E2 passes WCAG AA (≥4.5:1)', () => {
    expect(getContrastRatio('#1A1A1A', '#4A90E2')).toBeGreaterThanOrEqual(4.5);
  });

  // === UI component contrast (focus rings, borders: ≥3:1) ===
  // Secondary accent #4A90E2 used for focus rings against white — meets UI component standard
  it('accent secondary #4A90E2 on white meets WCAG AA non-text UI (≥3:1)', () => {
    expect(getContrastRatio('#4A90E2', '#FFFFFF')).toBeGreaterThanOrEqual(3);
  });

  // === Secondary action text: darker blue meets normal text AA ===
  // #2E6DB4 is the secondary color used for text labels on white — meets AA
  it('secondary text variant #2E6DB4 on white meets WCAG AA text (≥4.5:1)', () => {
    expect(getContrastRatio('#2E6DB4', '#FFFFFF')).toBeGreaterThanOrEqual(4.5);
  });
});

describe('isWcagAA', () => {
  it('returns true for primary text on white', () => {
    expect(isWcagAA('#1A1A1A', '#FFFFFF')).toBe(true);
  });

  it('returns true for dark text on accent primary', () => {
    expect(isWcagAA('#1A1A1A', '#FF6B35')).toBe(true);
  });

  it('returns false for very light gray on white', () => {
    expect(isWcagAA('#CCCCCC', '#FFFFFF')).toBe(false);
  });

  it('returns false for coral accent used as text on white', () => {
    // Accent primary must NOT be used as normal text on white (only 2.84:1)
    expect(isWcagAA('#FF6B35', '#FFFFFF')).toBe(false);
  });
});
