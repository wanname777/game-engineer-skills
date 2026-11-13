import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import type { ViteDevServer } from 'vite';

function serveDemoIndexes(server: Pick<ViteDevServer, 'middlewares'>) {
  server.middlewares.use((request, _response, next) => {
    const [pathname, query] = (request.url || '').split('?');
    if (/^\/reuse\/(moon-greenhouse|moon-garden)\/?$/.test(pathname)) {
      request.url = `${pathname.replace(/\/$/, '')}/index.html${query ? `?${query}` : ''}`;
    }
    next();
  });
}

export default defineConfig({
  plugins: [react(), { name: 'static-demo-indexes', configureServer: serveDemoIndexes, configurePreviewServer: serveDemoIndexes }],
  base: './',
  test: { include: ['src/**/*.test.ts', 'tests/**/*.test.ts'], environment: 'node' },
});
