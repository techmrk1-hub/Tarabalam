import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import { root } from './lib/load-sheet.mjs';
import { clip, uniqueDescription, uniqueTitle, routes, sitemapXml, robotsTxt } from './lib/seo.mjs';

const require = createRequire(import.meta.url);
const clientRoutes = require('../assets/seo-routes.js');

const dharma = { prashna: 1, patala: 1, khanda: 1, sutra_number: 1, displayFields: [
  { heading: 'Sūtra', value: 'athātas-sāmayācārikān', role: 'translit', layer: 'basic' },
  { heading: 'Translation', value: 'Now, therefore, the conventions of righteous conduct.', role: 'translation', layer: 'basic' },
  { heading: 'Commentary / Explanation', value: 'A commentary line.', role: 'content', layer: 'deep' }
] };
const gruhya = { patala: 1, section_number: 1, sutra_number: 3, displayFields: [
  { heading: 'Sanskrit / Transliteration Sūtra', value: 'Karmanyacharadyani', role: 'translit', layer: 'basic' }
] };

assert.equal(routes.dharmaPath(dharma), '/dharma-sutra/prasna-1/patala-1/khanda-1/sutra-1/');
assert.equal(routes.gruhyaPath(gruhya), '/gruhya-sutra/patala-1/khanda-1/sutra-3/');
assert.equal(routes.parsePath('/dharma-sutra/prasna-1/patala-1/khanda-1/sutra-1/').sutra, 1);
assert.equal(routes.parsePath('/gruhya-sutra/patala-1/khanda-1/sutra-3/').khanda, 1);
assert.equal(clientRoutes.dharmaPath(dharma), routes.dharmaPath(dharma));
assert.equal(routes.canonical('/about.html'), 'https://bramha.org/about.html');
assert.equal(routes.namedSlug('Sri Rudram'), 'sri-rudram');
assert.match(uniqueTitle('dharma', dharma), /1\.1\.1\.1 – Text, Meaning & Bhāṣyam/);
assert.match(uniqueTitle('gruhya', gruhya), /1\.1\.3 – Text \|/);
assert.notEqual(uniqueDescription('dharma', dharma), uniqueDescription('gruhya', gruhya));
assert.ok(clip('word '.repeat(80), 160).length <= 161);

const xml = sitemapXml([{ path: '/dharma-sutra/prasna-1/patala-1/khanda-1/sutra-1/' }]);
assert.match(xml, /xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9"/);
assert.match(xml, /https:\/\/bramha.org\/dharma-sutra\/prasna-1\/patala-1\/khanda-1\/sutra-1\//);
assert.match(robotsTxt(), /Sitemap: https:\/\/bramha.org\/sitemap.xml/);
assert.match(robotsTxt(), /Disallow: \/internal\//);
assert.match(robotsTxt(), /Disallow: \/\*\?id=/);

const samples = [
  'dharma-sutra/index.html',
  'dharma-sutra/prasna-1/index.html',
  'dharma-sutra/prasna-1/patala-1/index.html',
  'dharma-sutra/prasna-1/patala-1/khanda-1/index.html',
  'dharma-sutra/prasna-1/patala-1/khanda-1/sutra-1/index.html',
  'dharma-sutra/prasna-1/patala-1/khanda-1/sutra-2/index.html',
  'dharma-sutra/prasna-1/patala-1/khanda-1/sutra-3/index.html',
  'gruhya-sutra/index.html',
  'gruhya-sutra/patala-1/khanda-1/sutra-1/index.html',
  'gruhya-sutra/patala-1/khanda-1/sutra-2/index.html',
  'gruhya-sutra/patala-1/khanda-1/sutra-3/index.html',
  'vedic-mantras/index.html',
  'articles/index.html',
  'robots.txt',
  'sitemap.xml',
  '404.html'
];

for (const rel of samples) {
  const file = resolve(root, rel);
  assert.ok(existsSync(file), `missing ${rel}`);
}

const leaf = readFileSync(resolve(root, 'dharma-sutra/prasna-1/patala-1/khanda-1/sutra-1/index.html'), 'utf8');
assert.match(leaf, /<title>.*1\.1\.1\.1/);
assert.match(leaf, /<meta name="description"/);
assert.match(leaf, /rel="canonical" href="https:\/\/bramha.org\/dharma-sutra\/prasna-1\/patala-1\/khanda-1\/sutra-1\/"/);
assert.match(leaf, /<h1>Āpastamba Dharma Sūtra 1\.1\.1\.1<\/h1>/);
assert.match(leaf, /athātas-sāmayācārikān/);
assert.match(leaf, /BreadcrumbList/);
assert.match(leaf, /<a href="\/dharma-sutra\/prasna-1\/patala-1\/khanda-1\/sutra-2\/"/);
assert.doesNotMatch(leaf, /noindex/);

const prasna = readFileSync(resolve(root, 'dharma-sutra/prasna-1/index.html'), 'utf8');
assert.match(prasna, /href="\/dharma-sutra\/prasna-1\/patala-1\/"/);

const sitemap = readFileSync(resolve(root, 'sitemap.xml'), 'utf8');
assert.match(sitemap, /dharma-sutra\/prasna-1\/patala-1\/khanda-1\/sutra-1\//);
assert.match(sitemap, /gruhya-sutra\/patala-1\/khanda-1\/sutra-1\//);
assert.doesNotMatch(sitemap, /\/search\//);
assert.doesNotMatch(sitemap, /\/internal\//);

const search = readFileSync(resolve(root, 'search/index.html'), 'utf8');
assert.match(search, /noindex,follow/);

const home = readFileSync(resolve(root, 'index.html'), 'utf8');
assert.match(home, /href="dharma-sutra\/"/);
assert.match(home, /href="bhashyam\/"/);
assert.match(home, /href="prayoga\/"/);
assert.match(home, /rel="canonical" href="https:\/\/bramha.org\/"/);

assert.equal(existsSync(resolve(root, 'dharma-sutra/prasna-9/patala-1/khanda-1/sutra-1/index.html')), false);

console.log('seo tests passed');
