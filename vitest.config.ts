// vitest.config.ts
// Deliberately separate from vite.config.ts: the production build's plugins
// (PWA, SEO head injection) have no business running under the test runner,
// and this keeps `npm run build`'s config untouched by test-only concerns.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    environment: 'jsdom',
    globals: false,
    css: false,
  },
})
