import { cpSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const root = dirname(fileURLToPath(import.meta.url));

const CLASSIC_SCRIPTS = ['site.js', 'config.js', 'api.js', 'reader.js', 'home-slides.js'];

const ROOT_ICONS = [
  'favicon.ico',
  'favicon-16x16.png',
  'favicon-32x32.png',
  'apple-touch-icon.png',
  'android-chrome-192x192.png',
  'android-chrome-512x512.png',
];

function copyClassicRuntime() {
  const destDir = resolve(root, 'public/js');
  mkdirSync(destDir, { recursive: true });
  for (const file of CLASSIC_SCRIPTS) {
    cpSync(resolve(root, 'assets', file), resolve(destDir, file));
  }
  cpSync(resolve(root, 'js', 'tarabalam-engine.js'), resolve(destDir, 'tarabalam-engine.js'));
}

function copyBrandPack() {
  const srcDir = resolve(root, 'assets/brand');
  const destDir = resolve(root, 'public/assets/brand');
  mkdirSync(destDir, { recursive: true });
  for (const name of readdirSync(srcDir)) {
    if (name.startsWith('lockup-') || name.startsWith('mark-')) continue;
    cpSync(resolve(srcDir, name), resolve(destDir, name));
  }
  for (const name of ROOT_ICONS) {
    const fromBrand = resolve(srcDir, name);
    const fromRoot = resolve(root, name);
    const source = name === 'favicon.ico' ? fromRoot : fromBrand;
    cpSync(source, resolve(root, 'public', name));
  }
  cpSync(resolve(root, 'site.webmanifest'), resolve(root, 'public/site.webmanifest'));
}

function classicRuntimePlugin() {
  return {
    name: 'copy-classic-runtime',
    buildStart() {
      copyClassicRuntime();
      copyBrandPack();
    },
    configureServer() {
      copyClassicRuntime();
      copyBrandPack();
    },
  };
}

export default defineConfig({
  appType: 'mpa',
  plugins: [classicRuntimePlugin()],
  server: {
    host: '127.0.0.1',
    port: 43147,
    strictPort: true,
  },
  preview: {
    host: '127.0.0.1',
    port: 43147,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        about: resolve(root, 'about.html'),
        tarabalam: resolve(root, 'tarabalam/index.html'),
        search: resolve(root, 'search/index.html'),
        dharma: resolve(root, 'dharma-sutra/index.html'),
        gruhya: resolve(root, 'gruhya-sutra/index.html'),
        mantras: resolve(root, 'vedic-mantras/index.html'),
        articles: resolve(root, 'articles/index.html'),
      },
    },
  },
});
