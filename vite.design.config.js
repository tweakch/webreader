import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 6500,
  },
  server: {
    port: 5174,
    open: '/design.html',
  },
  css: {
    postcss: './postcss.config.js',
  },
});
