import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// in development, requests to /api and /uploads go to the express server
export default defineConfig({
  plugins: [react()],
  // FullCalendar is big, so the bundle is a bit over vite's default warning size
  build: { chunkSizeWarningLimit: 800 },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5001',
      '/uploads': 'http://localhost:5001',
    },
  },
});
