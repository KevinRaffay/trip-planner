import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base by default so a local build, a file:// copy and the Pages
// sub-path all resolve assets. The deploy workflow sets TRIP_BASE to
// '/trip-planner/'. Hash routing means no SPA 404 fallback is needed.
export default defineConfig({
  base: process.env.TRIP_BASE || './',
  plugins: [react()],
  server: { port: 5190, strictPort: true },
  preview: { port: 5191, strictPort: true },
  build: { outDir: 'dist', emptyOutDir: true },
});
