import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'TRACE',
        short_name: 'TRACE',
        description: 'Save and organise links from anywhere',
        theme_color: '#003135',
        background_color: '#003135',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
        share_target: {
          action: '/save',
          method: 'GET',
          params: { url: 'url' },
        },
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /\/api\/links/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-links-cache',
              networkTimeoutSeconds: 5,
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
