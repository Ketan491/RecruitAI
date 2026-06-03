import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    // FIX 9: proxy /api calls to backend in dev
    // This is the correct way — vite.config uses loadEnv, not process.env for VITE_ vars
    // Since api.ts uses the full BASE_URL directly, the proxy is a safety net only
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
