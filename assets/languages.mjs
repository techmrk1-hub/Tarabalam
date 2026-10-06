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

function articleNodes() {
  const nodes = [];
  const heading = document.getElementById('pageHeading');
  const lede = document.getElementById('articleLede') || document.querySelector('main .lede');
  if (heading) nodes.push(heading);
  if (lede) nodes.push(lede);
  document.querySelectorAll('#articleBody p').forEach((node) => nodes.push(node));
  return nodes;
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

export async function applyArticle() {
  const host = document.getElementById('articleBody');
  if (!host) return;
  const mount = document.getElementById('contentLanguageMount') || host.parentElement;
  let script = rememberedScript();
  let ticket = 0;

  async function paint() {
    const current = ++ticket;
    const bar = scriptBar(script, async (next) => {
      script = next;
      rememberScript(next);
      await paint();
    });
    if (mount.id === 'contentLanguageMount') mount.replaceChildren(bar);
    else mount.insertBefore(bar, host);
    const failed = await paintNodes(articleNodes(), script, () => current === ticket);
    if (current !== ticket) return;
    const embedded = Boolean(host.querySelector('iframe'));
    let message = '';
    if (failed) message = 'Script conversion is unavailable. Showing the Telugu text.';
    else if (embedded && script !== 'Telugu') message = 'The embedded document stays in its original script.';
    notice(bar, message);
  }

  await paint();
}

window.BramhaScripts = { refresh: refreshScript };
