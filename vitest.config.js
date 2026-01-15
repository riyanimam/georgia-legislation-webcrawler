import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['frontend/**/*.js'],
      exclude: ['frontend/**/*.test.js', 'node_modules/'],
    },
  },
});
