import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'admin-rewrite',
        configureServer(server) {
          server.middlewares.use((req, _res, next) => {
            if (req.url === '/admin' || req.url === '/admin/') {
              req.url = '/admin.html';
            }
            next();
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname || __dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(import.meta.dirname || __dirname, 'index.html'),
          admin: path.resolve(import.meta.dirname || __dirname, 'admin.html'),
        },
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
