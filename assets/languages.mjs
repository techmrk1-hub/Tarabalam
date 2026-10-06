import { SCRIPTS, conversionSource, scriptCacheKey, sha256Hex, shouldRequestScript } from './content-protect.mjs';

const SCRIPT_KEY = 'bramha_script_view';

function rememberedScript() {
  try {
    const stored = localStorage.getItem(SCRIPT_KEY);
    if (SCRIPTS.some((item) => item.id === stored)) return stored;
  } catch { /* private mode */ }
  return 'Telugu';
}

function rememberScript(value) {
  try { localStorage.setItem(SCRIPT_KEY, value); } catch { /* private mode */ }
}

function scriptBar(pressed, onPick, pending = '') {
  let host = document.getElementById('scriptView');
  if (!host) {
    host = document.createElement('div');
    host.id = 'scriptView';
    host.className = 'script-bar';
    host.setAttribute('role', 'group');
    host.setAttribute('aria-label', 'Script View');
  }
  host.innerHTML = '';
  const name = document.createElement('span');
  name.className = 'kicker';
  name.textContent = 'Script View';
  host.appendChild(name);
  SCRIPTS.forEach((item) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = item.label;
    button.dataset.value = item.id;
    button.setAttribute('aria-pressed', item.id === pressed ? 'true' : 'false');
    if (item.id === pending) button.dataset.pending = 'true';
    button.addEventListener('click', () => onPick(item.id));
    host.appendChild(button);
  });
  return host;
}

function notice(host, text) {
  let node = document.getElementById('scriptNotice');
  if (!text) {
    node?.remove();
    return;
  }
  if (!node) {
    node = document.createElement('p');
    node.id = 'scriptNotice';
    node.className = 'notice';
  }
  node.textContent = text;
  if (host) host.appendChild(node);
}

function canonicalOf(node) {
  if (!node.dataset.canonical) node.dataset.canonical = node.textContent;
  return node.dataset.canonical;
}

function readerNodes() {
  return [
    ...document.querySelectorAll('#readerFields .section > p'),
    ...document.querySelectorAll('#commentaryList .commentary > p:not(.meta)')
  ];
}

const SCRIPT_LANG = {
  Telugu: 'te',
  Devanagari: 'sa',
  Kannada: 'kn',
  Tamil: 'ta',
  IAST: 'sa-Latn'
};
const textCanonical = new WeakMap();

function articleChrome() {
  const heading = document.getElementById('pageHeading');
  const lede = document.getElementById('articleLede') || document.querySelector('main .lede');
  const crumb = document.querySelector('nav.crumb [aria-current="page"]');
  return [heading, lede, crumb].filter(Boolean);
}

function markContent(node) {
  if (!node) return;
  node.setAttribute('data-bramha-content', 'true');
  node.classList.add('script-text');
}

function face(node, script) {
  if (!node) return;
  node.dataset.script = script;
  node.lang = SCRIPT_LANG[script] || '';
}

function articleDocUrl(row, host) {
  const direct = row?.google_doc_url || row?.values?.['Google Doc URL'] || '';
  if (direct) return direct;
  const src = host?.querySelector('iframe.doc-frame')?.getAttribute('src') || '';
  return src.includes('/document/d/') ? src : '';
}

function contentTextNodes(root) {
  if (!root) return [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) {
    if (walker.currentNode.nodeValue.trim()) nodes.push(walker.currentNode);
  }
  return nodes;
}

function canonicalText(node) {
  if (!textCanonical.has(node)) textCanonical.set(node, node.nodeValue);
  return textCanonical.get(node);
}

async function fetchArticleHtml(docUrl, articleId) {
  const cfg = window.BRAMHA_CONFIG || {};
  const response = await fetch(`${cfg.supabaseUrl}/functions/v1/article-doc-content`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      apikey: cfg.supabasePublishableKey,
      authorization: `Bearer ${cfg.supabasePublishableKey}`
    },
    body: JSON.stringify({ google_doc_url: docUrl, article_id: articleId || '' })
  });
  if (!response.ok) throw new Error('doc');
  const payload = await response.json();
  const html = String(payload?.html || '');
  if (!html.trim()) throw new Error('doc');
  return { html, hash: String(payload.content_hash || '') };
}

function articleStatus(host, text) {
  let node = host.querySelector(':scope > .script-status');
  if (!text) {
    node?.remove();
    return;
  }
  if (!node) {
    node = document.createElement('p');
    node.className = 'notice script-status';
    host.prepend(node);
  }
  node.textContent = text;
}

function buildArticle(html) {
  const local = document.createElement('article');
  local.id = 'articleScriptBody';
  local.className = 'transliterable-content';
  local.setAttribute('data-bramha-content', 'true');
  local.setAttribute('data-article-body', 'true');
  local.innerHTML = html;
  return local;
}

function commitArticle(host, element) {
  const status = host.querySelector(':scope > .script-status');
  host.replaceChildren(element);
  if (status) host.prepend(status);
}

async function articleSource(host, row) {
  const docUrl = articleDocUrl(row, host);
  if (host._docSource?.html && host._docSource.url === docUrl) return host._docSource;
  if (!docUrl) {
    const stored = host.querySelector('article.reader');
    const html = stored?.innerHTML || '';
    if (!html.trim()) throw new Error('doc');
    host._docSource = { url: '', html, hash: 'stored' };
    return host._docSource;
  }
  const articleId = row?.article_id || row?.unique_id || '';
  const loaded = await fetchArticleHtml(docUrl, articleId);
  const html = stripDocumentChrome(loaded.html);
  host._docSource = { url: docUrl, html, hash: loaded.hash };
  return host._docSource;
}

function stripDocumentChrome(html) {
  const doc = new DOMParser().parseFromString(`<div id="bramha-doc">${html}</div>`, 'text/html');
  const root = doc.getElementById('bramha-doc');
  if (!root) return html;
  trimChromeEdge(root, true);
  trimChromeEdge(root, false);
  const named = {
    mdash: '\u2014', ndash: '\u2013', hellip: '\u2026',
    lsquo: '\u2018', rsquo: '\u2019', ldquo: '\u201c', rdquo: '\u201d',
    amp: '&', nbsp: ' ', quot: '"', apos: "'"
  };
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    walker.currentNode.nodeValue = walker.currentNode.nodeValue.replace(/&([a-zA-Z]+);/g, (entity, name) => {
      const decoded = named[name.toLowerCase()];
      return decoded === undefined ? entity : decoded;
    });
  }
  return root.innerHTML;
}

function trimChromeEdge(root, fromStart) {
  const indic = /[\u0900-\u097F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF]/;
  const nodes = fromStart ? [...root.children] : [...root.children].reverse();
  const edge = [];
  for (const node of nodes) {
    if (node.tagName === 'HR') {
      edge.push(node);
      continue;
    }
    if (node.querySelector && node.querySelector('h1,h2,h3,h4,h5,h6')) break;
    const text = (node.textContent || '').replace(/\s+/g, ' ').trim();
    if (!text || text.length >= 80 || indic.test(text)) break;
    edge.push(node);
  }
  if (!edge.some((node) => node.tagName === 'HR')) return;
  edge.forEach((node) => node.remove());
}

async function convertScript(text, target, nativize = false) {
  const source = conversionSource(text);
  if (!shouldRequestScript(text, target)) return text;
  const hash = await sha256Hex(text);
  const cacheKey = scriptCacheKey({ source, target, hash, nativize });
  try {
    const hit = sessionStorage.getItem(`bramha.script.${cacheKey}`);
    if (hit) return hit;
  } catch { /* ignore */ }
  const cfg = window.BRAMHA_CONFIG || {};
  const response = await fetch(`${cfg.supabaseUrl}/functions/v1/aksharamukha`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      apikey: cfg.supabasePublishableKey,
      authorization: `Bearer ${cfg.supabasePublishableKey}`
    },
    body: JSON.stringify({ text, source, target, nativize })
  });
  if (!response.ok) throw new Error('script');
  const payload = await response.json();
  const rendered = String(payload?.text || '');
  if (!rendered.trim()) throw new Error('script');
  try { sessionStorage.setItem(`bramha.script.${cacheKey}`, rendered); } catch { /* ignore */ }
  return rendered;
}

async function paintTextNodes(nodes, script, current = () => true, nativize = false) {
  let failed = false;
  const groups = new Map();
  nodes.forEach((node) => {
    const canonical = canonicalText(node);
    if (!groups.has(canonical)) groups.set(canonical, []);
    groups.get(canonical).push(node);
  });
  const entries = [...groups.entries()];
  let cursor = 0;
  async function worker() {
    while (cursor < entries.length) {
      const [canonical, group] = entries[cursor++];
      if (!current()) return;
      if (!shouldRequestScript(canonical, script)) {
        group.forEach((node) => { node.nodeValue = canonical; });
        continue;
      }
      try {
        const rendered = await convertScript(canonical, script, nativize);
        if (!current()) return;
        group.forEach((node) => {
          if (canonicalText(node) === canonical) node.nodeValue = rendered;
        });
      } catch {
        group.forEach((node) => { node.nodeValue = canonical; });
        failed = true;
      }
    }
  }
  const width = Math.min(6, entries.length);
  if (width) await Promise.all(Array.from({ length: width }, worker));
  return failed;
}

async function paintNodes(nodes, script, current = () => true) {
  let failed = false;
  await Promise.all(nodes.map(async (node) => {
    const canonical = canonicalOf(node);
    if (!current()) return;
    if (!shouldRequestScript(canonical, script)) {
      if (current()) node.textContent = canonical;
      return;
    }
    try {
      const rendered = await convertScript(canonical, script, false);
      if (current() && node.dataset.canonical === canonical) node.textContent = rendered;
    } catch {
      if (current()) node.textContent = canonical;
      failed = true;
    }
  }));
  return failed;
}

let readerTicket = 0;

async function paintReader(script) {
  const ticket = ++readerTicket;
  const fieldsHost = document.getElementById('readerFields');
  if (!fieldsHost) return;
  const bar = scriptBar(script, async (next) => {
    rememberScript(next);
    await paintReader(next);
  });
  fieldsHost.before(bar);
  const failed = await paintNodes(readerNodes(), script, () => ticket === readerTicket);
  if (ticket !== readerTicket) return;
  notice(bar, failed ? 'Script conversion is unavailable. Showing the Telugu text.' : '');
}

export async function refreshScript() {
  await paintReader(rememberedScript());
}

export async function applyReader() {
  await paintReader(rememberedScript());
}

const ARTICLE_NATIVIZE = true;
let articleShown = 'Telugu';
let articleTicket = 0;

export async function applyArticle(row) {
  const host = document.getElementById('articleBody');
  if (!host) return;
  if (row) host._article = row;
  const article = host._article || null;
  const mount = document.getElementById('contentLanguageMount') || host.parentElement;
  const unavailable = 'This script view is temporarily unavailable. Showing the Telugu original.';

  function placeBar(pressed, pending) {
    const bar = scriptBar(pressed, (next) => { paint(next); }, pending);
    if (mount.id === 'contentLanguageMount') mount.replaceChildren(bar);
    else if (!bar.parentElement) mount.insertBefore(bar, host);
    return bar;
  }

  async function planChrome(script, alive) {
    const nodes = articleChrome();
    nodes.forEach(markContent);
    const plan = [];
    let failed = false;
    await Promise.all(nodes.map(async (node) => {
      const canonical = canonicalOf(node);
      if (!alive()) return;
      try {
        const rendered = shouldRequestScript(canonical, script)
          ? await convertScript(canonical, script, ARTICLE_NATIVIZE)
          : canonical;
        if (!alive()) return;
        plan.push({ node, rendered });
      } catch {
        failed = true;
      }
    }));
    return { plan, failed };
  }

  function applyChrome(plan, script) {
    plan.forEach(({ node, rendered }) => {
      node.textContent = rendered;
      face(node, script);
    });
  }

  function restoreChrome() {
    articleChrome().forEach((node) => {
      if (!node.dataset.canonical) return;
      node.textContent = node.dataset.canonical;
      face(node, 'Telugu');
    });
  }

  function fail(html) {
    articleStatus(host, '');
    host.removeAttribute('aria-busy');
    restoreChrome();
    if (html) {
      const draft = buildArticle(html);
      face(draft, 'Telugu');
      commitArticle(host, draft);
    } else {
      host.querySelectorAll('#articleScriptBody').forEach((node) => node.remove());
      const frame = host.querySelector('iframe.doc-frame');
      if (frame) frame.hidden = false;
    }
    articleShown = 'Telugu';
    rememberScript('Telugu');
    notice(placeBar('Telugu', ''), unavailable);
  }

  async function paint(requested) {
    const ready = host.querySelector('#articleScriptBody');
    if (requested === articleShown && ready && !host.querySelector('iframe.doc-frame')) return;
    const current = ++articleTicket;
    const pending = requested === articleShown ? '' : requested;
    placeBar(articleShown, pending);
    articleStatus(host, 'Preparing this script view...');
    host.setAttribute('aria-busy', 'true');
    let source = null;
    try {
      source = await articleSource(host, article);
    } catch { /* the embedded document remains until this fails closed */ }
    if (current !== articleTicket) return;
    if (!source?.html) {
      fail('');
      return;
    }
    const draft = buildArticle(source.html);
    const bodyFailed = await paintTextNodes(
      contentTextNodes(draft),
      requested,
      () => current === articleTicket,
      ARTICLE_NATIVIZE
    );
    if (current !== articleTicket) return;
    const chrome = await planChrome(requested, () => current === articleTicket);
    if (current !== articleTicket) return;
    if (bodyFailed || chrome.failed || chrome.plan.length !== articleChrome().length) {
      fail(source.html);
      return;
    }
    face(draft, requested);
    commitArticle(host, draft);
    applyChrome(chrome.plan, requested);
    articleShown = requested;
    rememberScript(requested);
    articleStatus(host, '');
    host.removeAttribute('aria-busy');
    notice(placeBar(articleShown, ''), '');
  }

  await paint(rememberedScript());
}

window.BramhaScripts = { refresh: refreshScript };
