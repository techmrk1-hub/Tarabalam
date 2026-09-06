import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { root } from './lib/load-sheet.mjs';

const pages = [
  {
    file: 'index.html',
    canonical: 'https://bramha.org/',
    robots: 'index,follow',
    title: 'Bramha.org | Digital Śāstra Knowledge Library',
    description: 'A quiet digital library for Dharma Sūtras, Gṛhya Sūtras, Vedic texts, articles, and traditional tools such as Tarabalam.',
    jsonLd: true
  },
  {
    file: 'about.html',
    canonical: 'https://bramha.org/about.html',
    robots: 'index,follow',
    title: 'About Bramha.org',
    description: 'About Bramha.org — a source-grounded digital home for Śāstra, Vedic resources and traditional tools.'
  },
  {
    file: 'dharma-sutra/index.html',
    canonical: 'https://bramha.org/dharma-sutra/',
    robots: 'index,follow',
    title: 'Āpastamba Dharma Sūtra | Bramha.org',
    description: 'Āpastamba Dharma Sūtra reader with scripts, translation, word meaning, and commentary.',
    reader: true,
    indexBlock: true
  },
  {
    file: 'gruhya-sutra/index.html',
    canonical: 'https://bramha.org/gruhya-sutra/',
    robots: 'index,follow',
    title: 'Āpastamba Gṛhya Sūtra | Bramha.org',
    description: 'Āpastamba Gṛhya Sūtra reader with text, meaning, commentary, Prayoga, and related references.',
    reader: true,
    indexBlock: true
  },
  {
    file: 'vedic-mantras/index.html',
    canonical: 'https://bramha.org/vedic-mantras/',
    robots: 'index,follow',
    title: 'Vedic Mantras | Bramha.org',
    description: 'Verified Vedic mantra text, scripts, meanings, Prayoga or Viniyoga, and source references.',
    indexBlock: true
  },
  {
    file: 'articles/index.html',
    canonical: 'https://bramha.org/articles/',
    robots: 'index,follow',
    title: 'Articles & Research | Bramha.org',
    description: 'Source-aware writing on Dharma, Śāstra, and Vedic knowledge, published only after review.',
    indexBlock: true
  },
  {
    file: 'search/index.html',
    canonical: 'https://bramha.org/search/',
    robots: 'noindex,follow',
    title: 'Search Bramha.org',
    description: 'Search the public verified Śāstra corpus across transliteration, Telugu, English, and titles.'
  },
  {
    file: 'tarabalam/index.html',
    canonical: 'https://bramha.org/tarabalam/',
    robots: 'index,follow',
    title: 'Tarabalam | Bramha.org',
    description: 'Tarabalam calculator for Janma Nakshatra and day-star relationship, in Telugu, English, Hindi, Tamil, and Kannada.'
  }
];

function seoBlock(page) {
  const json = page.jsonLd
    ? `
  <script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'Bramha.org',
        url: 'https://bramha.org/',
        logo: 'https://bramha.org/android-chrome-512x512.png'
      },
      {
        '@type': 'WebSite',
        name: 'Bramha.org',
        url: 'https://bramha.org/',
        publisher: { '@type': 'Organization', name: 'Bramha.org', url: 'https://bramha.org/' },
        potentialSearchAction: {
          '@type': 'SearchAction',
          target: 'https://bramha.org/search/?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      }
    ]
  })}</script>`
    : '';
  return `  <meta name="robots" content="${page.robots}">
  <link rel="canonical" href="${page.canonical}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${page.title}">
  <meta property="og:description" content="${page.description}">
  <meta property="og:url" content="${page.canonical}">
  <meta name="twitter:title" content="${page.title}">
  <meta name="twitter:description" content="${page.description}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>${json}`;
}

for (const page of pages) {
  const file = resolve(root, page.file);
  let html = readFileSync(file, 'utf8');
  html = html.replace(/\?v=\d+/g, '?v=36');
  html = html.replace(/href="assets\/minimal\.css\?v=\d+"/g, 'href="assets/minimal.css?v=36"');
  html = html.replace(/href="\.\.\/assets\/minimal\.css\?v=\d+"/g, 'href="../assets/minimal.css?v=36"');

  if (!html.includes('rel="canonical"')) {
    html = html.replace(
      '<meta name="twitter:image" content="https://bramha.org/android-chrome-512x512.png">',
      `<meta name="twitter:image" content="https://bramha.org/android-chrome-512x512.png">\n${seoBlock(page)}`
    );
  }

  if (!html.includes('/js/seo-routes.js')) {
    html = html.replace(
      /<script src="\/js\/config\.js(?:\?v=\d+)?"><\/script>/,
      '<script src="/js/config.js?v=36"></script>\n<script src="/js/seo-routes.js?v=36"></script>\n<script src="/js/seo-boot.js?v=36"></script>'
    );
  }

  if (page.reader) {
    html = html.replace(
      '<div class="reader-nav"><button id="prev" class="btn secondary">Previous</button><button id="next" class="btn">Next</button></div>',
      '<div class="reader-nav"><a id="prev" class="btn secondary" href="#">← Previous Sūtra</a><a id="next" class="btn" href="#">Next Sūtra →</a></div>'
    );
  }

  if (page.indexBlock && !html.includes('SEO_INDEX_START')) {
    html = html.replace('</main>', `  <!-- SEO_INDEX_START -->\n  <!-- SEO_INDEX_END -->\n</main>`);
  }

  if (page.file === 'index.html') {
    if (!html.includes('href="bhashyam/"')) {
      html = html.replace(
        '<a href="articles/"><strong>Articles</strong><span>Topic-based notes connecting Śāstra passages and traditional interpretation.</span><em>Open</em></a>',
        `<a href="articles/"><strong>Articles</strong><span>Topic-based notes connecting Śāstra passages and traditional interpretation.</span><em>Open</em></a>
        <a href="bhashyam/"><strong>Bhāṣyam</strong><span>Public passages that already include commentary in the source record.</span><em>Open</em></a>
        <a href="prayoga/"><strong>Prayoga</strong><span>Public passages that already include Prayoga or Viniyoga notes.</span><em>Open</em></a>`
      );
    }
    html = html.replace(
      '<a href="articles/">Articles</a>\n    </div>',
      '<a href="articles/">Articles</a>\n      <a href="bhashyam/">Bhāṣyam</a>\n      <a href="prayoga/">Prayoga</a>\n    </div>'
    );
  }

  writeFileSync(file, html);
}

console.log('patched static SEO tags');
