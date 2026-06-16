import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'node',
    // Node is the default env for unit tests (some read the filesystem).
    // Component render tests opt into jsdom per-file via `// @vitest-environment jsdom`.
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'server/**/*.test.ts', 'tests/**/*.test.ts'],
  },
});
