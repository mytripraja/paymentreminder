import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Capacitor needs a relative base path and a fixed output dir it can copy into the native shell.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  server: {
    port: 5173
  }
});
