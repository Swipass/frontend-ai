// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      selfDestroying: true,   // ✅ add this line
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
      },
      manifest: {
        name: 'Swipass',
        short_name: 'Swipass',
        description: 'Universal Cross-Chain Intent & Execution Platform',
        theme_color: '#0a0a0a',
        background_color: '#0a0a0a',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
          { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
        ]
      }
    })
  ],
  build: {
    chunkSizeWarningLimit: 3000,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  },
  server: {
    port: 5173,
    proxy: {
      // Backend origin for the dev proxy. Defaults to :8000; override with
      // BACKEND_URL when that port is taken by another local service.
      '/v1': process.env.BACKEND_URL || 'http://localhost:8000',
      '/platform': process.env.BACKEND_URL || 'http://localhost:8000',
      '/admin': process.env.BACKEND_URL || 'http://localhost:8000',
      // Proxy only the backend auth API subpaths. The bare "/auth" route is the
      // frontend sign-in page and must be served by Vite, so it is NOT matched.
      '^/auth/(login|callback|me|logout|providers)': process.env.BACKEND_URL || 'http://localhost:8000',
      '/health': process.env.BACKEND_URL || 'http://localhost:8000',
    }
  }
})