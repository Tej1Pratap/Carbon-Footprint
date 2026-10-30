import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = env.VITE_API_URL || 'https://carbon-footprint-syb5.onrender.com';

  return {
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl)
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg'],
        devOptions: {
          enabled: true
        },
        manifest: {
          name: 'Carbon Footprint Monitoring',
          short_name: 'EcoTrack',
          description: 'Web Platform for Carbon Footprint Monitoring and Sustainability Analytics',
          theme_color: '#ffffff',
          orientation: 'portrait',
          display: 'standalone',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 5000000 // 5MB
        }
      })
    ],
    server: {
      allowedHosts: true
    }
  };
});
