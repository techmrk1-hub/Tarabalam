import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { loadKind, loadSheetsApi, root } from './lib/load-sheet.mjs';
import { browsePage, articlePage, sutraPage } from './lib/pages.mjs';
import { routes, sitemapXml, robotsTxt } from './lib/seo.mjs';

const api = loadSheetsApi();
const urls = new Set(['/', '/about.html', '/dharma-sutra/', '/gruhya-sutra/', '/vedic-mantras/', '/articles/', '/topics/', '/tarabalam/', '/bhashyam/', '/prayoga/', '/account/']);

function write(rel, html) {
  const file = resolve(root, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html.startsWith('<!--') ? html : `<!-- bramha-seo-generated -->\n${html}`);
}

function clearChildren(dir) {
  const abs = resolve(root, dir);
  for (const entry of readdirSync(abs, { withFileTypes: true })) {
    if (entry.isDirectory()) rmSync(resolve(abs, entry.name), { recursive: true, force: true });
  }
}

function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

const dharmaSpec = "window.READER_SPEC={table:'dharma_sutras',key:'unique_id',order:'prashna.asc,patala.asc,khanda.asc,sutra_number.asc',filters:[{id:'f1',field:'prashna',label:'Praśna'},{id:'f2',field:'patala',label:'Paṭala'},{id:'f3',field:'khanda',label:'Khāṇḍa'},{id:'f4',field:'sutra_number',label:'Sūtra'}],kicker:r=>`Praśna ${r.prashna} · Paṭala ${r.patala} · Khāṇḍa ${r.khanda} · Sūtra ${r.sutra_number}`};";
const gruhyaSpec = "window.READER_SPEC={table:'gruhya_sutras',key:'unique_id',order:'patala.asc,section_number.asc,sutra_number.asc',filters:[{id:'f1',field:'patala',label:'Paṭala'},{id:'f2',field:'section_number',label:'Khaṇḍa'},{id:'f3',field:'sutra_number',label:'Sūtra'}],kicker:r=>`Paṭala ${r.patala} · Khaṇḍa ${r.section_number} · Sūtra ${r.sutra_number}`};";

function writeSutras(kind, rows) {
  const spec = kind === 'dharma' ? dharmaSpec : gruhyaSpec;
  rows.forEach((row, index) => {
    const prev = index > 0 ? routes.pathFor(kind, rows[index - 1]) : '';
    const next = index < rows.length - 1 ? routes.pathFor(kind, rows[index + 1]) : '';
    const path = routes.pathFor(kind, row);
    urls.add(path);
    write(`${path.slice(1)}index.html`, sutraPage({ kind, row, prev, next, specScript: spec }));
  });
}

function groupCount(rows, keyFn) {
  const map = new Map();
  rows.forEach((row) => {
    const key = keyFn(row);
    map.set(key, (map.get(key) || 0) + 1);
  });
  return map;
}

const dharma = await loadKind(api, 'Dharma Sutra', 'dharma');
const gruhya = await loadKind(api, 'Gruhya Sutra', 'gruhya');
const articles = await loadKind(api, 'Articles', 'articles');
let mantras = { publicRows: [] };
try { mantras = await loadKind(api, 'Vedic Mantras', 'mantras'); } catch { /* empty tab is acceptable */ }

const dharmaRows = dharma.publicRows.slice().sort((a, b) => num(a.prashna) - num(b.prashna) || num(a.patala) - num(b.patala) || num(a.khanda) - num(b.khanda) || num(a.sutra_number) - num(b.sutra_number));
const gruhyaRows = gruhya.publicRows.slice().sort((a, b) => num(a.patala) - num(b.patala) || num(a.section_number) - num(b.section_number) || num(a.sutra_number) - num(b.sutra_number));
const articleRows = articles.publicRows.filter((row) => String(row.language || '') !== 'Homepage Slide' && row.slug && !String(row.slug).startsWith('/'));

clearChildren('dharma-sutra');
clearChildren('gruhya-sutra');
clearChildren('articles');
clearChildren('vedic-mantras');

writeSutras('dharma', dharmaRows);
writeSutras('gruhya', gruhyaRows);

const prasnas = [...groupCount(dharmaRows, (row) => row.prashna).entries()];
for (const [prashna, count] of prasnas) {
  const inPrasna = dharmaRows.filter((row) => num(row.prashna) === num(prashna));
  const patalas = [...groupCount(inPrasna, (row) => row.patala).entries()];
  const prasnaPath = `/dharma-sutra/prasna-${prashna}/`;
  urls.add(prasnaPath);
  write(`${prasnaPath.slice(1)}index.html`, browsePage({
    title: `Praśna ${prashna} | Āpastamba Dharma Sūtra | Bramha.org`,
    description: `${count} verified public Sūtras in Praśna ${prashna} of the Āpastamba Dharma Sūtra.`,
    canonical: `https://bramha.org${prasnaPath}`,
    nav: 'dharma',
    heading: `Praśna ${prashna}`,
    intro: `${count} public Sūtras in this Praśna.`,
    label: `Praśna ${prashna}`,
    crumb: [{ name: 'Home', href: '/' }, { name: 'Dharma Sūtra', href: '/dharma-sutra/' }, { name: `Praśna ${prashna}` }],
    items: patalas.map(([patala, n]) => ({ href: `/dharma-sutra/prasna-${prashna}/patala-${patala}/`, title: `Paṭala ${patala}`, meta: `${n} Sūtras` }))
  }));
  for (const [patala, pCount] of patalas) {
    const inPatala = inPrasna.filter((row) => num(row.patala) === num(patala));
    const khandas = [...groupCount(inPatala, (row) => row.khanda).entries()];
    const patalaPath = `/dharma-sutra/prasna-${prashna}/patala-${patala}/`;
    urls.add(patalaPath);
    write(`${patalaPath.slice(1)}index.html`, browsePage({
      title: `Praśna ${prashna}, Paṭala ${patala} | Āpastamba Dharma Sūtra | Bramha.org`,
      description: `${pCount} verified public Sūtras in Praśna ${prashna}, Paṭala ${patala}.`,
      canonical: `https://bramha.org${patalaPath}`,
      nav: 'dharma',
      heading: `Paṭala ${patala}`,
      intro: `${pCount} public Sūtras in this Paṭala.`,
      label: `Paṭala ${patala}`,
      crumb: [{ name: 'Home', href: '/' }, { name: 'Dharma Sūtra', href: '/dharma-sutra/' }, { name: `Praśna ${prashna}`, href: prasnaPath }, { name: `Paṭala ${patala}` }],
      items: khandas.map(([khanda, n]) => ({ href: `/dharma-sutra/prasna-${prashna}/patala-${patala}/khanda-${khanda}/`, title: `Khāṇḍa ${khanda}`, meta: `${n} Sūtras` }))
    }));
    for (const [khanda, kCount] of khandas) {
      const inKhanda = inPatala.filter((row) => num(row.khanda) === num(khanda));
      const khandaPath = `/dharma-sutra/prasna-${prashna}/patala-${patala}/khanda-${khanda}/`;
      urls.add(khandaPath);
      write(`${khandaPath.slice(1)}index.html`, browsePage({
        title: `Khāṇḍa ${khanda} | Āpastamba Dharma Sūtra | Bramha.org`,
        description: `${kCount} verified public Sūtras in Praśna ${prashna}, Paṭala ${patala}, Khāṇḍa ${khanda}.`,
        canonical: `https://bramha.org${khandaPath}`,
        nav: 'dharma',
        heading: `Khāṇḍa ${khanda}`,
        intro: `${kCount} public Sūtras in this Khāṇḍa.`,
        label: `Khāṇḍa ${khanda}`,
        crumb: [{ name: 'Home', href: '/' }, { name: 'Dharma Sūtra', href: '/dharma-sutra/' }, { name: `Praśna ${prashna}`, href: prasnaPath }, { name: `Paṭala ${patala}`, href: patalaPath }, { name: `Khāṇḍa ${khanda}` }],
        items: inKhanda.map((row) => ({ href: routes.pathFor('dharma', row), title: `Sūtra ${row.sutra_number}`, meta: '' }))
      }));
    }
  }
}

const gPatalas = [...groupCount(gruhyaRows, (row) => row.patala).entries()];
for (const [patala, count] of gPatalas) {
  const inPatala = gruhyaRows.filter((row) => num(row.patala) === num(patala));
  const khandas = [...groupCount(inPatala, (row) => row.section_number).entries()];
  const patalaPath = `/gruhya-sutra/patala-${patala}/`;
  urls.add(patalaPath);
  write(`${patalaPath.slice(1)}index.html`, browsePage({
    title: `Paṭala ${patala} | Āpastamba Gṛhya Sūtra | Bramha.org`,
    description: `${count} verified public Sūtras in Paṭala ${patala} of the Āpastamba Gṛhya Sūtra.`,
    canonical: `https://bramha.org${patalaPath}`,
    nav: 'gruhya',
    heading: `Paṭala ${patala}`,
    intro: `${count} public Sūtras in this Paṭala.`,
    label: `Paṭala ${patala}`,
    crumb: [{ name: 'Home', href: '/' }, { name: 'Gṛhya Sūtra', href: '/gruhya-sutra/' }, { name: `Paṭala ${patala}` }],
    items: khandas.map(([khanda, n]) => ({ href: `/gruhya-sutra/patala-${patala}/khanda-${khanda}/`, title: `Khāṇḍa ${khanda}`, meta: `${n} Sūtras` }))
  }));
  for (const [khanda, kCount] of khandas) {
    const inKhanda = inPatala.filter((row) => num(row.section_number) === num(khanda));
    const khandaPath = `/gruhya-sutra/patala-${patala}/khanda-${khanda}/`;
    urls.add(khandaPath);
    write(`${khandaPath.slice(1)}index.html`, browsePage({
      title: `Khāṇḍa ${khanda} | Āpastamba Gṛhya Sūtra | Bramha.org`,
      description: `${kCount} verified public Sūtras in Paṭala ${patala}, Khāṇḍa ${khanda}.`,
      canonical: `https://bramha.org${khandaPath}`,
      nav: 'gruhya',
      heading: `Khāṇḍa ${khanda}`,
      intro: `${kCount} public Sūtras in this Khāṇḍa.`,
      label: `Khāṇḍa ${khanda}`,
      crumb: [{ name: 'Home', href: '/' }, { name: 'Gṛhya Sūtra', href: '/gruhya-sutra/' }, { name: `Paṭala ${patala}`, href: patalaPath }, { name: `Khāṇḍa ${khanda}` }],
      items: inKhanda.map((row) => ({ href: routes.pathFor('gruhya', row), title: `Sūtra ${row.sutra_number}`, meta: '' }))
    }));
  }
}

articleRows.forEach((row) => {
  const path = routes.articlePath(row);
  urls.add(path);
  write(`${path.slice(1)}index.html`, articlePage(row));
});

const commentaryRows = [...dharmaRows, ...gruhyaRows].filter((row) => (row.displayFields || []).some((field) => field.layer === 'deep' && String(field.value || '').trim()));
const prayogaRows = [...dharmaRows, ...gruhyaRows].filter((row) => (row.displayFields || []).some((field) => field.layer === 'context' && /prayoga|viniyoga/i.test(field.heading || '') && String(field.value || '').trim()));

function kindOf(row) {
  return String(row.unique_id || '').startsWith('GS-') ? 'gruhya' : 'dharma';
}

write('bhashyam/index.html', browsePage({
  title: 'Commentaries | Bramha.org',
  description: 'Public Sūtras on Bramha.org that include commentary in the verified source record.',
  canonical: 'https://bramha.org/bhashyam/',
  nav: 'articles',
  heading: 'Commentaries',
  intro: 'Passages whose verified source record includes a commentary field. No commentary text is added here.',
  label: 'Commentaries',
  crumb: [{ name: 'Home', href: '/' }, { name: 'Commentaries' }],
  items: commentaryRows.map((row) => ({ href: routes.pathFor(kindOf(row), row), title: row.display_name || routes.pageTitle(kindOf(row), row), meta: kindOf(row) === 'dharma' ? 'Dharma Sūtra' : 'Gṛhya Sūtra' }))
}));
write('prayoga/index.html', browsePage({
  title: 'Prayoga | Bramha.org',
  description: 'Public Śāstra entries on Bramha.org that include Prayoga or Viniyoga notes in the verified source record.',
  canonical: 'https://bramha.org/prayoga/',
  nav: 'articles',
  heading: 'Prayoga',
  intro: 'Passages whose verified source record includes a Prayoga or Viniyoga note.',
  label: 'Prayoga',
  crumb: [{ name: 'Home', href: '/' }, { name: 'Prayoga' }],
  items: prayogaRows.map((row) => ({ href: routes.pathFor(kindOf(row), row), title: row.display_name || routes.pageTitle(kindOf(row), row), meta: 'Prayoga' }))
}));

const tree = prasnas.map(([prashna, count]) => `<li><a href="/dharma-sutra/prasna-${prashna}/">Praśna ${prashna}</a><span>${count} Sūtras</span></li>`).join('');
const gTree = gPatalas.map(([patala, count]) => `<li><a href="/gruhya-sutra/patala-${patala}/">Paṭala ${patala}</a><span>${count} Sūtras</span></li>`).join('');
const aTree = articleRows.map((row) => `<li><a href="${routes.articlePath(row)}">${row.title}</a></li>`).join('');

const manifest = {
  generatedAt: new Date().toISOString(),
  counts: {
    urls: urls.size + dharmaRows.length + gruhyaRows.length + articleRows.length,
    dharma: dharmaRows.length,
    gruhya: gruhyaRows.length,
    mantras: mantras.publicRows.length,
    articles: articleRows.length,
    commentary: commentaryRows.length,
    prayoga: prayogaRows.length
  },
  sample: ['/', '/about.html', '/dharma-sutra/', '/gruhya-sutra/', '/vedic-mantras/', '/articles/', '/tarabalam/', '/bhashyam/', '/prayoga/'].concat(dharmaRows.slice(0, 2).map((row) => routes.pathFor('dharma', row)))
};
mkdirSync(resolve(root, 'cms'), { recursive: true });
writeFileSync(resolve(root, 'cms/seo-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

const staticUrls = [...urls];
dharmaRows.forEach((row) => staticUrls.push(routes.pathFor('dharma', row)));
gruhyaRows.forEach((row) => staticUrls.push(routes.pathFor('gruhya', row)));
articleRows.forEach((row) => staticUrls.push(routes.articlePath(row)));
const uniqueUrls = [...new Set(staticUrls)].filter((path) => path !== '/search/' && !path.startsWith('/internal'));
const xml = sitemapXml(uniqueUrls.map((path) => ({ path })));
const robots = robotsTxt();
writeFileSync(resolve(root, 'sitemap.xml'), xml);
writeFileSync(resolve(root, 'robots.txt'), robots);
function fillTree(file, treeHtml, label) {
  const target = resolve(root, file);
  let html = '';
  try { html = readFileSync(target, 'utf8'); } catch { return; }
  const block = `<!-- SEO_INDEX_START -->\n<nav class="seo-index" aria-label="${label}"><h2>${label}</h2><ul class="seo-tree">${treeHtml}</ul></nav>\n<!-- SEO_INDEX_END -->`;
  if (html.includes('<!-- SEO_INDEX_START -->')) {
    html = html.replace(/<!-- SEO_INDEX_START -->[\s\S]*?<!-- SEO_INDEX_END -->/, block);
  }
  writeFileSync(target, html);
}
fillTree('dharma-sutra/index.html', tree, 'Browse by Praśna');
fillTree('gruhya-sutra/index.html', gTree, 'Browse by Paṭala');
fillTree('articles/index.html', aTree, 'Articles');

console.log(`SEO pages written. Dharma ${dharmaRows.length}, Gṛhya ${gruhyaRows.length}, articles ${articleRows.length}, commentary index ${commentaryRows.length}.`);
