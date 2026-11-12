import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const configuredServerUrl = env.VITE_SERVER_URL?.trim();
  const validServerUrl =
    configuredServerUrl &&
    configuredServerUrl !== 'undefined' &&
    configuredServerUrl !== 'null';
  const apiBase = validServerUrl
    ? configuredServerUrl.replace(/\/+$/, '')
    : '/api';
  const normalizedApiBase =
    apiBase === '/api' || apiBase.endsWith('/api') ? apiBase : `${apiBase}/api`;

  return {
    // The frontend and API share a Vercel Services domain. Default to its
    // same-origin API path when Vercel or a local build omits this variable.
    define: {
      'import.meta.env.VITE_SERVER_URL': JSON.stringify(normalizedApiBase),
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'prompt',
        includeAssets: ['favicon.svg', 'logo.svg'],
        manifest: {
          name: 'KaDpinozz | Healthy Pizza & Snacks',
          short_name: 'KaDpinozz',
          description:
            'Wholesome, nutrient-packed healthy pizzas and artisanal snacks made with fresh organic ingredients.',
          icons: [
            {
              src: '/android-chrome-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/android-chrome-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/apple-touch-icon.png',
              sizes: '180x180',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/favicon-32x32.png',
              sizes: '32x32',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/favicon-16x16.png',
              sizes: '16x16',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/favicon.ico',
              sizes: '32x32 16x16',
              type: 'image/x-icon',
              purpose: 'any',
            },
          ],
          screenshots: [
            {
              src: '/images/screen1.png',
              sizes: '2880x1800',
              type: 'image/png',
            },
          ],
          theme_color: '#16a34a',
          background_color: '#ffffff',
          display: 'standalone',
          scope: '/',
          start_url: '/',
          orientation: 'portrait',
        },
      }),
    ],
  };
});
