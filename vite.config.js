import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const root = dirname(fileURLToPath(import.meta.url));
const types = {
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json; charset=utf-8'
};

function staticRoot() {
  return {
    name: 'bramha-static-root',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        try {
          const url = decodeURIComponent((req.url || '/').split('?')[0]);
          const rel = url.endsWith('/') ? `${url}index.html` : url;
          const file = normalize(join(root, rel));
          if (!file.startsWith(root) || !existsSync(file) || !statSync(file).isFile()) {
            if (url.startsWith('/@') || url.startsWith('/node_modules') || url.startsWith('/__vite')) return next();
            const ext = extname(url);
            if (ext && ext !== '.html') return next();
            const missing = readFileSync(join(root, '404.html'));
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.setHeader('Content-Length', missing.length);
            res.end(missing);
            return;
          }
          res.setHeader('Content-Type', types[extname(file)] || 'application/octet-stream');
          createReadStream(file).pipe(res);
        } catch {
          next();
        }
      });
    }
  };
}

export default defineConfig({
  appType: 'mpa',
  publicDir: false,
  plugins: [staticRoot()],
  server: { host: '0.0.0.0', port: 43147, strictPort: true },
  preview: { host: '0.0.0.0', port: 43147, strictPort: true }
});
