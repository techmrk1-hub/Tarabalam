import { headerHtml, footerHtml } from '../../assets/chrome.mjs';
import { clip, routes, uniqueDescription, uniqueTitle } from './seo.mjs';

const SITE = 'https://bramha.org';

export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

function jsonScript(data) {
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
}

export function head({ title, description, canonical, robots = 'index,follow', jsonLd = [] }) {
  const desc = esc(clip(description, 160));
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${desc}">
  <meta name="robots" content="${robots}">
  <link rel="canonical" href="${esc(canonical)}">
  <meta property="og:site_name" content="Bramha.org">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${desc}">
  <meta property="og:url" content="${esc(canonical)}">
  <meta property="og:image" content="${SITE}/favicon.png">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${desc}">
  <meta name="twitter:image" content="${SITE}/favicon.png">
  <link rel="icon" href="/favicon.png" type="image/png">
  <link rel="apple-touch-icon" href="/favicon.png">
  <link rel="manifest" href="/site.webmanifest">
  <meta name="theme-color" content="#4a1520">
  <link rel="stylesheet" href="/assets/library.css">
  ${jsonLd.map(jsonScript).join('\n  ')}
</head>`;
}

function fieldHtml(field) {
  const role = field.role || '';
  const klass = role === 'deva' ? ' class="deva" lang="sa"'
    : role === 'telugu' || role === 'telugu_meaning' ? ' class="telugu" lang="te"'
    : role === 'translit' ? ' class="translit" lang="sa-Latn"'
    : role === 'padaccheda' ? ' class="padaccheda"' : '';
  return `<section class="section" data-layer="${esc(field.layer || 'basic')}">
      <h2>${esc(field.heading)}</h2>
      <p${klass}>${esc(field.value)}</p>
    </section>`;
}

export function browsePage({ title, description, canonical, nav, crumb, heading, intro, items, label }) {
  const list = items.length
    ? `<ul class="seo-tree">${items.map((item) => `<li><a href="${esc(item.href)}">${esc(item.title)}</a><span>${esc(item.meta || '')}</span></li>`).join('')}</ul>`
    : '<p class="empty">No verified public entries are available at this level yet.</p>';
  return `${head({ title, description, canonical, jsonLd: [crumbJson(crumb, canonical)] })}
<body data-nav="${esc(nav)}">
<div id="site-header">${headerHtml(nav)}</div>
<main id="content" class="page">
  <nav class="crumb" aria-label="Breadcrumb">${crumb.map((part, index) => part.href ? `<a href="${esc(part.href)}">${esc(part.name)}</a>` : `<span aria-current="page">${esc(part.name)}</span>`).join('<span aria-hidden="true"> › </span>')}</nav>
  <h1>${esc(heading)}</h1>
  <p>${esc(intro)}</p>
  <nav class="seo-index" aria-label="${esc(label)}"><h2>Contents</h2>${list}</nav>
</main>
<div id="site-footer">${footerHtml()}</div>
<script type="module" src="/assets/shell.js"></script>
</body>
</html>
`;
}

function crumbJson(crumb, canonical) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumb.map((part, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: part.name,
      item: part.href ? `${SITE}${part.href}` : canonical
    }))
  };
}

export function sutraPage({ kind, row, prev, next, specScript }) {
  const path = routes.pathFor(kind, row);
  const canonical = `${SITE}${path}`;
  const title = uniqueTitle(kind, row);
  const description = uniqueDescription(kind, row);
  const basic = (row.displayFields || []).filter((field) => field.layer !== 'deep');
  const deep = (row.displayFields || []).filter((field) => field.layer === 'deep');
  const crumb = kind === 'dharma'
    ? [
      { name: 'Home', href: '/' },
      { name: 'Dharma Sūtra', href: '/dharma-sutra/' },
      { name: `Praśna ${row.prashna}`, href: `/dharma-sutra/prasna-${row.prashna}/` },
      { name: `Paṭala ${row.patala}`, href: `/dharma-sutra/prasna-${row.prashna}/patala-${row.patala}/` },
      { name: `Khāṇḍa ${row.khanda}`, href: `/dharma-sutra/prasna-${row.prashna}/patala-${row.patala}/khanda-${row.khanda}/` },
      { name: `Sūtra ${row.sutra_number}` }
    ]
    : [
      { name: 'Home', href: '/' },
      { name: 'Gṛhya Sūtra', href: '/gruhya-sutra/' },
      { name: `Paṭala ${row.patala}`, href: `/gruhya-sutra/patala-${row.patala}/` },
      { name: `Khāṇḍa ${row.section_number}`, href: `/gruhya-sutra/patala-${row.patala}/khanda-${row.section_number}/` },
      { name: `Sūtra ${row.sutra_number}` }
    ];
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    headline: routes.pageTitle(kind, row),
    description,
    url: canonical,
    inLanguage: ['en', 'sa', 'te'],
    isPartOf: { '@type': 'Book', name: routes.workTitle(kind) },
    publisher: { '@type': 'Organization', name: 'Bramha.org', url: `${SITE}/` }
  };
  const nav = kind === 'dharma' ? 'dharma' : 'gruhya';
  const commentary = deep.length
    ? deep.map((field) => `<article class="commentary"><div class="kicker">Source record</div><h3>${esc(field.heading)}</h3><p>${esc(field.value)}</p></article>`).join('')
    : '<p class="empty">No verified commentary is currently available for this passage.</p>';
  return `${head({ title, description, canonical, jsonLd: [crumbJson(crumb, canonical), articleLd] })}
<body data-nav="${nav}" data-seo-leaf="1">
<div id="site-header">${headerHtml(nav)}</div>
<main id="content" class="page">
  <nav class="crumb" aria-label="Breadcrumb">${crumb.map((part) => part.href ? `<a href="${esc(part.href)}">${esc(part.name)}</a>` : `<span id="crumbCurrent" aria-current="page">${esc(part.name)}</span>`).join('<span aria-hidden="true"> › </span>')}</nav>
  <h1 id="pageHeading">${esc(routes.pageTitle(kind, row))}</h1>
  <p>Verified ${esc(routes.workTitle(kind))} text with the fields present in the source record.</p>
  <div class="mode-bar" id="readerViewbar"><span class="kicker">Reader</span>
    <button type="button" data-mode="text" aria-pressed="true">Text &amp; Meaning</button>
    <button type="button" data-mode="commentary" aria-pressed="false">Commentary</button>
    <button type="button" data-mode="prayoga" aria-pressed="false">Prayoga &amp; Context</button>
    <button type="button" data-mode="all" aria-pressed="false">All Layers</button>
  </div>
  <div class="controls">${kind === 'dharma'
    ? `<div><label for="f1">Praśna</label><select id="f1"></select></div><div><label for="f2">Paṭala</label><select id="f2"></select></div><div><label for="f3">Khāṇḍa</label><select id="f3"></select></div><div><label for="f4">Sūtra</label><select id="f4"></select></div>`
    : `<div><label for="f1">Paṭala</label><select id="f1"></select></div><div><label for="f2">Khaṇḍa</label><select id="f2"></select></div><div><label for="f3">Sūtra</label><select id="f3"></select></div>`}</div>
  <div id="readerState"></div>
  <article id="reader" class="reader">
    <header class="reader-header"><div id="readerKicker" class="kicker">${esc(kind === 'dharma'
      ? `Praśna ${row.prashna} · Paṭala ${row.patala} · Khāṇḍa ${row.khanda} · Sūtra ${row.sutra_number}`
      : `Paṭala ${row.patala} · Khāṇḍa ${row.section_number} · Sūtra ${row.sutra_number}`)}</div>
      <p id="readerTitle" class="reader-title-text">${esc(row.display_name || '')}</p>
      <p id="verifyNote" class="verify-note">Verified</p>
    </header>
    <div id="studyBar" class="study-bar"></div>
    <div id="readerFields">${basic.map(fieldHtml).join('\n')}</div>
    <p id="layerEmpty" class="empty" hidden></p>
    <section id="commentaryPanel">
      <div class="mode-bar"><h2>Commentaries</h2><button type="button" id="compareToggle" hidden>Compare commentaries</button></div>
      <div id="commentaryTabs" class="tabs" hidden></div>
      <div id="commentaryList" class="commentary-list">${commentary}</div>
    </section>
    <div class="reader-nav">${prev ? `<a href="${esc(prev)}" id="prev" class="btn secondary">Previous</a>` : '<a href="#" id="prev" class="btn secondary" hidden>Previous</a>'}${next ? `<a href="${esc(next)}" id="next" class="btn">Next</a>` : '<a href="#" id="next" class="btn" hidden>Next</a>'}</div>
  </article>
</main>
<div id="site-footer">${footerHtml()}</div>
<script src="/assets/config.js"></script>
<script src="/assets/seo-routes.js"></script>
<script src="/assets/seo-boot.js"></script>
<script src="/assets/sheets.js"></script>
<script src="/assets/api.js"></script>
<script>${specScript}</script>
<script src="/assets/reader.js"></script>
<script type="module" src="/assets/shell.js"></script>
<script type="module" src="/assets/study.js"></script>
</body>
</html>
`;
}

export function articlePage(row) {
  const path = routes.articlePath(row);
  const canonical = `${SITE}${path}`;
  const title = `${row.title} | Bramha.org`;
  const description = row.summary || row.title;
  const doc = String(row.google_doc_url || '').trim();
  const id = doc.match(/\/document\/d\/([^/]+)/i)?.[1];
  const embed = id ? `https://docs.google.com/document/d/${id}/preview` : '';
  const body = embed
    ? `<iframe class="doc-frame" title="${esc(row.title)}" src="${esc(embed)}" loading="lazy"></iframe>`
    : '<p class="empty">Article document is unavailable.</p>';
  return `${head({ title, description, canonical })}
<body data-nav="articles">
<div id="site-header">${headerHtml('articles')}</div>
<main id="content" class="page">
  <nav class="crumb" aria-label="Breadcrumb"><a href="/">Home</a> <span aria-hidden="true">›</span> <a href="/articles/">Articles &amp; Research</a> <span aria-hidden="true">›</span> <span aria-current="page">${esc(row.title)}</span></nav>
  <p class="kicker">${esc([row.language, row.category].filter(Boolean).join(' · ') || 'Article')}</p>
  <h1 id="pageHeading">${esc(row.title)}</h1>
  ${row.summary ? `<p class="lede">${esc(row.summary)}</p>` : ''}
  <div id="articleBody">${body}</div>
</main>
<div id="site-footer">${footerHtml()}</div>
<script type="module" src="/assets/shell.js"></script>
</body>
</html>
`;
}

export { routes };
