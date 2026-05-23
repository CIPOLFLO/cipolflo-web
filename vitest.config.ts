import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@env': '/src/environments',
    },
  },
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'text', 'html'],
      reportsDirectory: './coverage',
    },
  },
});
