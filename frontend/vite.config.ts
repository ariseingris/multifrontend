import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  publicDir: '../assets',
  server: {
    port: 5173,
    proxy: { '/api/firescout': 'http://127.0.0.1:8766' },
    host: '0.0.0.0',
  },
  preview: { proxy: { '/api/firescout': 'http://127.0.0.1:8766' } },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
