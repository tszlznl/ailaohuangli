import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), cloudflare()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: false,
    exclude: ['**/node_modules/**', '**/dist/**', '**/.superpowers/**'],
  },
});