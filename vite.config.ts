import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    exclude: ['tests/e2e/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
      exclude: [
        // Entry point and config files
        'src/main.tsx',
        'src/test-setup.ts',
        'src/models/types.ts',
        'eslint.config.js',
        'vite.config.ts',
        'playwright.config.ts',
        '**/*.d.ts',
        // E2E tests (run separately via Playwright)
        'tests/e2e/**',
        // React UI components and views: tested via Playwright E2E, not unit tests
        'src/App.tsx',
        'src/views/**',
        'src/components/**',
      ],
    },
  },
});
