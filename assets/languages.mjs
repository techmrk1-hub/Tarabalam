import {
  LANGUAGES,
  SCRIPTS,
  explanatoryFields,
  sourceHash,
  chooseTranslation,
  detectScript,
  isSourceScriptRole
} from './content-protect.mjs';

const LANG_KEY = 'bramha.contentLanguage';
const SCRIPT_KEY = 'bramha.script';

function remembered(key, fallback) {
  try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
}

function remember(key, value) {
  try { localStorage.setItem(key, value); } catch { /* private mode */ }
}

function bar(id, label, buttons, pressed, onPick) {
  let host = document.getElementById(id);
  if (!host) {
    host = document.createElement('div');
    host.id = id;
    host.className = id === 'scriptBar' ? 'script-bar' : 'lang-bar';
  }
  host.innerHTML = '';
  const name = document.createElement('span');
  name.className = 'kicker';
  name.textContent = label;
  host.appendChild(name);
  buttons.forEach((item) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = item.label;
    button.dataset.value = item.code || item.id;
    button.setAttribute('aria-pressed', (item.code || item.id) === pressed ? 'true' : 'false');
    button.addEventListener('click', () => onPick(item.code || item.id));
    host.appendChild(button);
  });
  return host;
}

function notice(host, text) {
  let node = document.getElementById('languageNotice');
  if (!text) {
    node?.remove();
    return;
  }
  if (!node) {
    node = document.createElement('p');
    node.id = 'languageNotice';
    node.className = 'notice';
  }
  node.textContent = text;
  host.prepend(node);
}

function originals(section) {
  section.querySelectorAll('p, .deva, .telugu, .translit').forEach((node) => {
    if (!node.dataset.original) node.dataset.original = node.textContent;
  });
}

function setBody(section, text) {
  const node = section.querySelector('p');
  if (!node) return;
  node.textContent = text;
}

async function publicTranslations(entityType, entityId) {
  if (!entityType || !entityId || typeof window.sbFetch !== 'function') return [];
  const path = `content_translations?select=language,fields,source_hash,review_status,publish&entity_type=eq.${encodeURIComponent(entityType)}&entity_id=eq.${encodeURIComponent(entityId)}&publish=eq.true&review_status=eq.Verified`;
  try {
    const rows = await window.sbFetch(path);
    return Array.isArray(rows) ? rows : [];
  } catch (error) {
    console.warn(error);
    return [];
  }
}

function applyLanguage(scope, choice) {
  scope.querySelectorAll('[data-explain="1"]').forEach((section) => {
    originals(section);
    const key = section.dataset.heading || '';
    const original = section.querySelector('p')?.dataset.original ?? '';
    if (choice.mode === 'translation' && Object.prototype.hasOwnProperty.call(choice.fields, key)) {
      setBody(section, String(choice.fields[key] ?? ''));
      section.hidden = !String(choice.fields[key] ?? '').trim();
      return;
    }
    setBody(section, original);
  });
  scope.querySelectorAll('#commentaryList .commentary').forEach((article) => {
    const heading = article.querySelector('h3')?.textContent || '';
    const body = article.querySelector('p:not(.meta)');
    if (!body) return;
    if (!body.dataset.original) body.dataset.original = body.textContent;
    if (choice.mode === 'translation' && Object.prototype.hasOwnProperty.call(choice.fields, heading)) {
      body.textContent = String(choice.fields[heading] ?? '');
    } else if (choice.mode !== 'translation') {
      body.textContent = body.dataset.original;
    }
  });
}

async function convertScript(text, source, target) {
  if (!text || source === target) return text;
  const hash = await sourceHash({ text });
  const cacheKey = `bramha.script.${source}.${target}.${hash}.false`;
  try {
    const hit = sessionStorage.getItem(cacheKey);
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
  if (!payload?.text) throw new Error('script');
  try { sessionStorage.setItem(cacheKey, payload.text); } catch { /* ignore */ }
  return payload.text;
}

async function applyScript(scope, scriptId) {
  const sections = [...scope.querySelectorAll('[data-script-source="1"]')];
  await Promise.all(sections.map(async (section) => {
    const node = section.querySelector('p');
    if (!node) return;
    if (!node.dataset.canonical) node.dataset.canonical = node.dataset.original || node.textContent;
    const canonical = node.dataset.canonical;
    const source = detectScript(canonical);
    if (source === scriptId) {
      node.textContent = canonical;
      return;
    }
    try {
      node.textContent = await convertScript(canonical, source, scriptId);
    } catch {
      node.textContent = canonical;
      section.dataset.scriptError = '1';
    }
  }));
  const failed = sections.some((section) => section.dataset.scriptError === '1');
  sections.forEach((section) => { delete section.dataset.scriptError; });
  return failed;
}

export async function applyReader(record, identity) {
  const scope = document.getElementById('reader') || document;
  const fieldsHost = document.getElementById('readerFields');
  if (!fieldsHost) return;
  const explain = explanatoryFields(record);
  const hash = await sourceHash(explain);
  const rows = await publicTranslations(identity.entityType, identity.entityId);
  let language = remembered(LANG_KEY, 'te');
  if (!LANGUAGES.some((item) => item.code === language)) language = 'te';
  let script = remembered(SCRIPT_KEY, 'Telugu');
  if (!SCRIPTS.some((item) => item.id === script)) script = 'Telugu';

  const sourceSection = fieldsHost.querySelector('[data-script-source="1"]');
  const explainSection = fieldsHost.querySelector('[data-explain="1"]') || document.getElementById('commentaryPanel');

  async function paint() {
    const choice = chooseTranslation({ language, translations: rows, hash });
    const langBar = bar('contentLanguage', 'Content Language', LANGUAGES, language, async (code) => {
      language = code;
      remember(LANG_KEY, code);
      await paint();
    });
    const scriptBar = bar('scriptBar', 'Script', SCRIPTS, script, async (code) => {
      script = code;
      remember(SCRIPT_KEY, code);
      await paint();
    });
    if (sourceSection) sourceSection.before(scriptBar);
    else fieldsHost.prepend(scriptBar);
    if (explainSection) explainSection.before(langBar);
    else fieldsHost.append(langBar);
    notice(fieldsHost, choice.mode === 'fallback' ? choice.notice : '');
    applyLanguage(scope, choice);
    const scriptFailed = await applyScript(scope, script);
    if (scriptFailed) {
      const existing = document.getElementById('languageNotice');
      const line = 'Script conversion is unavailable. Showing the source script.';
      if (existing) existing.textContent = `${existing.textContent} ${line}`;
      else notice(fieldsHost, line);
    }
  }

  await paint();
  return { hash, count: rows.length };
}

export async function applyArticle(row) {
  const host = document.getElementById('articleBody');
  if (!host || !row) return;
  const fields = {};
  if (row.title) fields.title = String(row.title);
  if (row.summary) fields.summary = String(row.summary);
  if (row.content) fields.content = String(row.content);
  const hash = await sourceHash(fields);
  const entityId = row.article_id || row.unique_id || '';
  const translations = await publicTranslations('article', entityId);
  let language = remembered(LANG_KEY, 'te');
  if (!LANGUAGES.some((item) => item.code === language)) language = 'te';
  const mount = document.getElementById('contentLanguageMount') || host.parentElement;
  const telugu = host.dataset.teluguHtml || host.innerHTML;
  host.dataset.teluguHtml = telugu;
  const heading = document.getElementById('pageHeading');
  const lede = document.querySelector('main .lede');
  if (heading && !heading.dataset.original) heading.dataset.original = heading.textContent;
  if (lede && !lede.dataset.original) lede.dataset.original = lede.textContent;

  async function paint() {
    const choice = chooseTranslation({ language, translations, hash });
    const langBar = bar('contentLanguage', 'Content Language', LANGUAGES, language, async (code) => {
      language = code;
      remember(LANG_KEY, code);
      await paint();
    });
    if (mount.id === 'contentLanguageMount') mount.replaceChildren(langBar);
    else mount.insertBefore(langBar, host);
    if (choice.mode !== 'translation') {
      notice(mount.id === 'contentLanguageMount' ? mount : host.parentElement, choice.mode === 'fallback' ? choice.notice : '');
      host.innerHTML = telugu;
      if (heading) heading.textContent = heading.dataset.original;
      if (lede) lede.textContent = lede.dataset.original;
      return;
    }
    notice(mount, '');
    if (heading && choice.fields.title) heading.textContent = String(choice.fields.title);
    if (lede && choice.fields.summary) lede.textContent = String(choice.fields.summary);
    const content = String(choice.fields.content || '').trim();
    const title = String(choice.fields.title || heading?.dataset.original || '');
    const summary = String(choice.fields.summary || '');
    host.innerHTML = '';
    const article = document.createElement('article');
    article.className = 'reader';
    if (summary && !lede) {
      const p = document.createElement('p');
      p.textContent = summary;
      article.appendChild(p);
    }
    if (content) {
      const p = document.createElement('p');
      p.textContent = content;
      article.appendChild(p);
    } else {
      const p = document.createElement('p');
      p.className = 'empty';
      p.textContent = 'A reviewed translation of the document body is not stored yet. The Telugu document remains the editorial master.';
      article.appendChild(p);
      const back = document.createElement('button');
      back.type = 'button';
      back.className = 'btn secondary';
      back.textContent = 'Show the Telugu document';
      back.addEventListener('click', async () => {
        language = 'te';
        remember(LANG_KEY, 'te');
        await paint();
      });
      article.appendChild(back);
    }
    article.dataset.title = title;
    host.appendChild(article);
  }

  await paint();
}

export { isSourceScriptRole };
