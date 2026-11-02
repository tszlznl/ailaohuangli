import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  ssr: {
    noExternal: ['lunar-javascript'],
  },
  build: {
    ssr: 'src/entry-server.tsx',
    outDir: '.prerender',
    emptyOutDir: true,
  },
});
