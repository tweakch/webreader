import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Current app bundle is intentionally larger than Vite's default warning threshold.
    chunkSizeWarningLimit: 6500,
  },
  server: {
    port: 5173,
    open: false,
    middlewareMode: false
  },
  css: {
    postcss: './postcss.config.js'
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/unit/setup.js',
    include: ['tests/unit/**/*.test.{js,jsx}'],
  },
})
