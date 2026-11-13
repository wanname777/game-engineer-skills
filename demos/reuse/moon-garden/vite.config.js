import { defineConfig } from 'vite';
// Keep optimizer output inside the temporary project when node_modules is reused.
export default defineConfig({ cacheDir: '.vite-cache' });
