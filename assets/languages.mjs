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

function scriptBar(pressed, onPick) {
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

function showDocFrame(host, visible) {
  const frame = host.querySelector('iframe.doc-frame');
  const local = host.querySelector('#articleScriptBody');
  if (!frame) {
    if (local) local.hidden = false;
    return;
  }
  frame.hidden = !visible;
  if (local) local.hidden = visible;
}

function restoreText(nodes) {
  nodes.forEach((node) => { node.nodeValue = canonicalText(node); });
}

async function localArticle(host, row) {
  const existing = host.querySelector('#articleScriptBody');
  const docUrl = articleDocUrl(row, host);
  if (!docUrl) {
    const stored = existing || host.querySelector('article.reader');
    if (!stored) return null;
    stored.id = 'articleScriptBody';
    stored.classList.add('transliterable-content');
    markContent(stored);
    return stored;
  }
  const articleId = row?.article_id || row?.unique_id || '';
  const loaded = await fetchArticleHtml(docUrl, articleId);
  let local = existing;
  if (!local) {
    local = document.createElement('article');
    local.id = 'articleScriptBody';
    local.className = 'transliterable-content';
    markContent(local);
    host.appendChild(local);
  }
  if (local.dataset.sourceHash !== loaded.hash) {
    local.innerHTML = loaded.html;
    local.dataset.sourceHash = loaded.hash;
  }
  return local;
}

async function convertScript(text, target) {
  const source = conversionSource(text);
  if (!shouldRequestScript(text, target)) return text;
  const hash = await sha256Hex(text);
  const cacheKey = scriptCacheKey({ source, target, hash, nativize: false });
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
    body: JSON.stringify({ text, source, target, nativize: false })
  });
  if (!response.ok) throw new Error('script');
  const payload = await response.json();
  const rendered = String(payload?.text || '');
  if (!rendered.trim()) throw new Error('script');
  try { sessionStorage.setItem(`bramha.script.${cacheKey}`, rendered); } catch { /* ignore */ }
  return rendered;
}

async function paintTextNodes(nodes, script, current = () => true) {
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
        const rendered = await convertScript(canonical, script);
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
      const rendered = await convertScript(canonical, script);
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

export async function applyArticle(row) {
  const host = document.getElementById('articleBody');
  if (!host) return;
  if (row) host._article = row;
  const article = host._article || null;
  const mount = document.getElementById('contentLanguageMount') || host.parentElement;
  let script = rememberedScript();
  let ticket = 0;
  const unavailable = 'This script view is temporarily unavailable. Showing the Telugu original.';

  async function paint() {
    const current = ++ticket;
    const bar = scriptBar(script, async (next) => {
      script = next;
      rememberScript(next);
      await paint();
    });
    if (mount.id === 'contentLanguageMount') mount.replaceChildren(bar);
    else if (!bar.parentElement) mount.insertBefore(bar, host);
    const chrome = articleChrome();
    chrome.forEach(markContent);
    chrome.forEach((node) => face(node, script));
    if (script === 'Telugu') {
      articleStatus(host, '');
      showDocFrame(host, true);
      const local = host.querySelector('#articleScriptBody');
      const frame = host.querySelector('iframe.doc-frame');
      if (local && !frame) face(local, 'Telugu');
      const body = local && !frame ? contentTextNodes(local) : [];
      const failed = await paintNodes(chrome, 'Telugu', () => current === ticket);
      const bodyFailed = await paintTextNodes(body, 'Telugu', () => current === ticket);
      if (current === ticket) notice(bar, failed || bodyFailed ? unavailable : '');
      return;
    }
    articleStatus(host, 'Preparing this script view...');
    host.setAttribute('aria-busy', 'true');
    let local = null;
    try {
      local = await localArticle(host, article);
    } catch { /* show the Telugu document below */ }
    if (current !== ticket) return;
    if (!local) {
      articleStatus(host, '');
      host.removeAttribute('aria-busy');
      showDocFrame(host, true);
      await paintNodes(chrome, 'Telugu', () => current === ticket);
      notice(bar, unavailable);
      return;
    }
    face(local, script);
    showDocFrame(host, false);
    const chromeFailed = await paintNodes(chrome, script, () => current === ticket);
    const bodyFailed = await paintTextNodes(contentTextNodes(local), script, () => current === ticket);
    if (current !== ticket) return;
    articleStatus(host, '');
    host.removeAttribute('aria-busy');
    if (chromeFailed || bodyFailed) {
      restoreText(contentTextNodes(local));
      chrome.forEach((node) => face(node, 'Telugu'));
      await paintNodes(chrome, 'Telugu', () => current === ticket);
      if (local && !host.querySelector('iframe.doc-frame')) face(local, 'Telugu');
      showDocFrame(host, true);
      notice(bar, unavailable);
      return;
    }
    notice(bar, '');
  }

  await paint();
}

window.BramhaScripts = { refresh: refreshScript };
