(function () {
  const FIELD_ALIASES = {
    unique_id: ['unique_id', 'unique id', 'uniqueid', 'id', 'record id', 'record_id'],
    text_type: ['text_type', 'text type', 'type', 'classification', 'sutra type'],
    prashna: ['prashna', 'praśna', 'prasna', 'prashna number'],
    patala: ['patala', 'paṭala', 'paatala', 'patala number'],
    khanda: ['khanda', 'khāṇḍa', 'khaṇḍa', 'khanda number'],
    section_number: ['section_number', 'section number', 'section', 'khandika', 'khaṇḍikā'],
    sutra_number: ['sutra_number', 'sūtra number', 'sutra number', 'sutra no', 'sūtra no', 'sutra #'],
    display_name: ['display_name', 'display name', 'dropdown display name', 'title', 'name'],
    sanskrit_devanagari: ['sanskrit_devanagari', 'sanskrit devanagari', 'sanskrit (devanagari)', 'devanagari', 'sanskrit', 'sanskrit text', 'mula', 'mūla'],
    sanskrit_transliteration: [
      'sanskrit_transliteration', 'sanskrit transliteration', 'sanskrit transliteration sutra',
      'sanskrit / transliteration sūtra', 'sanskrit / transliteration sutra', 'transliteration',
      'sutra', 'sūtra', 'iast', 'roman'
    ],
    telugu_script: ['telugu_script', 'telugu script', 'telugu'],
    english_translation: ['english_translation', 'english translation', 'translation'],
    word_meaning: ['word_meaning', 'word meaning', 'word-by-word', 'word by word', 'padartha', 'padārtha'],
    simple_meaning: ['simple_meaning', 'simple meaning', 'layered meaning', 'layered meanings', 'meaning'],
    commentary: [
      'commentary', 'commentary explanation', 'commentary / explanation',
      'bhashya', 'bhāṣya', 'explanation', 'explanations'
    ],
    prayoga: ['prayoga', 'context'],
    notes: ['notes', 'note', 'additional context'],
    cross_references: ['cross_references', 'cross references', 'references', 'reference'],
    source: ['source'],
    source_page: ['source_page', 'source page', 'page'],
    source_url: ['source_url', 'source url', 'url'],
    topic_tags: ['topic_tags', 'topic tags', 'tags'],
    verification_status: ['verification_status', 'verification status', 'verified', 'status'],
    publish: ['publish', 'published', 'public'],
    last_updated: ['last_updated', 'last updated', 'updated', 'updated at'],
    audio_url: ['audio_url', 'audio url', 'audio'],
    slug: ['slug'],
    article_id: ['article_id', 'article id'],
    title: ['title'],
    language: ['language'],
    author_id: ['author_id', 'author id', 'author'],
    category_id: ['category_id', 'category id', 'category'],
    summary: ['summary'],
    content: ['content'],
    featured_image_url: ['featured_image_url', 'featured image url', 'featured image', 'image url'],
    source_references: ['source_references', 'source references', 'button text'],
    featured: ['featured'],
    published_date: ['published_date', 'published date']
  };

  const KIND_FIELDS = {
    dharma: [
      'unique_id', 'text_type', 'prashna', 'patala', 'khanda', 'sutra_number', 'display_name',
      'sanskrit_devanagari', 'sanskrit_transliteration', 'telugu_script', 'english_translation',
      'word_meaning', 'simple_meaning', 'commentary', 'prayoga', 'cross_references',
      'source', 'source_page', 'source_url', 'topic_tags', 'verification_status', 'publish',
      'last_updated', 'audio_url', 'slug'
    ],
    gruhya: [
      'unique_id', 'text_type', 'prashna', 'patala', 'section_number', 'sutra_number', 'display_name',
      'sanskrit_devanagari', 'sanskrit_transliteration', 'telugu_script', 'english_translation',
      'word_meaning', 'simple_meaning', 'commentary', 'prayoga', 'notes', 'cross_references',
      'source', 'source_page', 'source_url', 'topic_tags', 'verification_status', 'publish',
      'last_updated', 'audio_url', 'slug'
    ],
    articles: [
      'article_id', 'title', 'slug', 'language', 'author_id', 'category_id', 'summary', 'content',
      'featured_image_url', 'source_references', 'topic_tags', 'verification_status', 'publish',
      'featured', 'published_date', 'last_updated'
    ]
  };

  const REQUIRED = {
    dharma: ['prashna', 'patala', 'khanda', 'sutra_number'],
    gruhya: ['patala', 'section_number', 'sutra_number'],
    articles: []
  };

  const NUMERIC = new Set(['prashna', 'patala', 'khanda', 'section_number', 'sutra_number']);

  const status = {
    connection: 'idle',
    lastSuccessAt: null,
    lastError: null,
    counts: { dharma: 0, gruhya: 0, articles: 0 },
    tabs: {},
    source: null,
    sheetName: null,
    sheetId: null
  };

  function sheetCfg() {
    return window.BRAMHA_CONFIG?.googleSheet || {};
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function fold(value) {
    return String(value || '')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function aliasMap() {
    const map = new Map();
    Object.entries(FIELD_ALIASES).forEach(([field, aliases]) => {
      aliases.forEach((alias) => map.set(fold(alias), field));
    });
    return map;
  }

  const ALIASES = aliasMap();

  function mapHeader(header, kind) {
    const field = ALIASES.get(fold(header)) || null;
    if (kind === 'gruhya' && field === 'khanda') return 'section_number';
    return field;
  }

  function blank(value) {
    return value === null || value === undefined || String(value).trim() === '';
  }

  function asBoolean(value) {
    const t = String(value ?? '').trim().toLowerCase();
    return t === 'yes' || t === 'y' || t === 'true' || t === '1' || t === 'publish';
  }

  function asVerified(value) {
    const t = String(value ?? '').trim().toLowerCase();
    return t === 'verified' || t === 'yes' || t === 'y' || t === 'true' || t === '1';
  }

  function asNumber(value) {
    if (blank(value)) return null;
    const s = String(value).trim();
    if (/^-?\d+$/.test(s)) return Number(s);
    return s;
  }

  function composeId(kind, row) {
    if (kind === 'dharma') {
      return `DS-P${row.prashna}-Pa${row.patala}-K${row.khanda}-S${row.sutra_number}`;
    }
    if (kind === 'gruhya') {
      return `GS-Pa${row.patala}-Sec${row.section_number}-S${row.sutra_number}`;
    }
    return row.article_id || '';
  }

  function defaultDisplay(kind, row) {
    if (kind === 'dharma') {
      return `Dharma Sūtra – Praśna ${row.prashna}, Paṭala ${row.patala}, Khāṇḍa ${row.khanda}, Sūtra ${row.sutra_number}`;
    }
    if (kind === 'gruhya') {
      return `Gṛhya Sūtra – Paṭala ${row.patala}, Section ${row.section_number}, Sūtra ${row.sutra_number}`;
    }
    return row.title || row.article_id || '';
  }

  function defaultSlug(kind, row) {
    if (kind === 'dharma') return `apastamba-dharma-sutra/${row.prashna}/${row.patala}/${row.khanda}/${row.sutra_number}`;
    if (kind === 'gruhya') return `apastamba-gruhya-sutra/${row.patala}/${row.section_number}/${row.sutra_number}`;
    return row.slug || '';
  }

  function normalizeRow(kind, raw) {
    const row = {};
    KIND_FIELDS[kind].forEach((field) => {
      const value = raw[field] ?? null;
      row[field] = String(value || '').trim() === '#ERROR!' ? null : value;
    });
    NUMERIC.forEach((field) => {
      if (field in row) row[field] = asNumber(row[field]);
    });
    if (blank(row.unique_id) && kind !== 'articles') row.unique_id = composeId(kind, row);
    if (blank(row.display_name)) row.display_name = defaultDisplay(kind, row);
    if (blank(row.slug)) row.slug = defaultSlug(kind, row);
    if (blank(row.text_type)) {
      row.text_type = kind === 'dharma' ? 'Dharma Sūtra' : kind === 'gruhya' ? 'Gruhya Sūtra' : row.language || '';
    }
    if (typeof row.publish === 'string' || typeof row.publish === 'number') row.publish = asBoolean(row.publish);
    if (typeof row.featured === 'string' || typeof row.featured === 'number') row.featured = asBoolean(row.featured);
    if (!blank(row.verification_status) && asVerified(row.verification_status)) {
      row.verification_status = 'Verified';
    }
    return row;
  }

  function isPublic(row) {
    const published = row.publish === true || asBoolean(row.publish);
    const verified = String(row.verification_status || '') === 'Verified' || asVerified(row.verification_status);
    return published && verified;
  }

  function objectsFromTable(headers, rows, kind) {
    const mapped = headers.map((header) => mapHeader(header, kind));
    return rows.map((cells) => {
      const raw = {};
      mapped.forEach((field, i) => {
        if (!field) return;
        if (!blank(raw[field])) return;
        const value = cells[i];
        raw[field] = value === undefined || value === null ? '' : String(value);
      });
      return raw;
    });
  }

  function parseCsv(text) {
    const rows = [];
    let cell = '';
    let row = [];
    let inQuotes = false;
    const input = String(text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    for (let i = 0; i < input.length; i++) {
      const ch = input[i];
      if (inQuotes) {
        if (ch === '"') {
          if (input[i + 1] === '"') { cell += '"'; i++; }
          else inQuotes = false;
        } else cell += ch;
      } else if (ch === '"') inQuotes = true;
      else if (ch === ',') { row.push(cell); cell = ''; }
      else if (ch === '\n') { row.push(cell); rows.push(row); cell = ''; row = []; }
      else cell += ch;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    return rows.filter((r) => r.some((c) => String(c).trim() !== ''));
  }

  function parseGviz(text) {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start < 0 || end < 0) throw new Error('gviz response was not JSON');
    const payload = JSON.parse(text.slice(start, end + 1));
    if (payload.status === 'error') {
      const msg = payload.errors?.map((e) => e.detailed_message || e.message).join('; ') || 'gviz query failed';
      throw new Error(msg);
    }
    const table = payload.table;
    if (!table) throw new Error('gviz JSON had no table');
    const headers = (table.cols || []).map((c) => c.label || c.id || '');
    const rows = (table.rows || []).map((r) => (r.c || []).map((c) => {
      if (!c) return '';
      if (c.f !== undefined && c.f !== null && c.f !== '') return c.f;
      return c.v === null || c.v === undefined ? '' : c.v;
    }));
    return { headers, rows };
  }

  function looksLikeHtml(text) {
    const head = String(text || '').slice(0, 200).toLowerCase();
    return head.includes('<html') || head.includes('<!doctype') || head.includes('sign in') || head.includes('accounts.google');
  }

  async function fetchText(url, label) {
    const response = await fetch(url, { cache: 'no-store' });
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`${label} HTTP ${response.status} for ${url}`);
    }
    if (looksLikeHtml(text)) {
      throw new Error(`${label} returned a Google sign-in page. Share the Sheet as Anyone with the link → Viewer, or deploy the Apps Script web app.`);
    }
    return text;
  }

  function cacheKey(kind) {
    const cfg = sheetCfg();
    return `bramha.sheet.${cfg.id || cfg.webAppUrl || 'none'}.${kind}`;
  }

  function readCache(kind) {
    try {
      const raw = sessionStorage.getItem(cacheKey(kind));
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const ttl = Number(sheetCfg().cacheTtlMs || 45000);
      if (!parsed?.at || Date.now() - parsed.at > ttl) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  function writeCache(kind, payload) {
    try {
      sessionStorage.setItem(cacheKey(kind), JSON.stringify({ at: Date.now(), ...payload }));
    } catch {
      /* private mode */
    }
  }

  function clearCache() {
    try {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('bramha.sheet.')) sessionStorage.removeItem(key);
      });
    } catch {
      /* ignore */
    }
  }

  function missingRequired(kind, headers) {
    const mapped = new Set(headers.map((header) => mapHeader(header, kind)).filter(Boolean));
    return (REQUIRED[kind] || []).filter((field) => !mapped.has(field));
  }

  function finalize(kind, rawRows, meta) {
    const missing = missingRequired(kind, meta.headers || []);
    if (missing.length) {
      throw new Error(`Missing required column(s) on tab "${meta.tab}": ${missing.join(', ')}`);
    }
    const rows = rawRows
      .map((raw) => normalizeRow(kind, raw))
      .filter((row) => {
        if (kind === 'articles') return !blank(row.article_id) || !blank(row.title);
        return !blank(row.unique_id) && REQUIRED[kind].every((field) => !blank(row[field]));
      });
    const publicRows = rows.filter(isPublic);
    status.counts[kind] = publicRows.length;
    status.tabs[kind] = { tab: meta.tab, loaded: rows.length, public: publicRows.length, endpoint: meta.endpoint };
    status.connection = 'connected';
    status.lastSuccessAt = nowIso();
    status.lastError = null;
    status.source = meta.source;
    status.sheetName = sheetCfg().name || 'Bramha.org - Sutra Database';
    status.sheetId = sheetCfg().id || null;
    return { rows: publicRows, allRows: rows, ...meta, syncedAt: status.lastSuccessAt };
  }

  function fail(error, extra) {
    const err = error instanceof Error ? error : new Error(String(error));
    status.connection = 'error';
    status.lastError = {
      message: err.message,
      at: nowIso(),
      ...extra
    };
    console.error('[Bramha Sheet sync]', status.lastError);
    return err;
  }

  function wantLocalFeed() {
    try {
      return new URLSearchParams(location.search).has('localfeed');
    } catch {
      return false;
    }
  }

  function localFeedUrl() {
    const configured = String(sheetCfg().webAppUrl || '').trim();
    if (configured) return configured;
    if (wantLocalFeed()) return '/cms/sheet-feed.json';
    return '';
  }

  async function loadFromWebApp(kind) {
    const url = localFeedUrl();
    if (!url) return null;
    const bust = `${url}${url.includes('?') ? '&' : '?'}_=${Date.now()}`;
    const text = await fetchText(bust, 'Apps Script web app');
    let json;
    try { json = JSON.parse(text); }
    catch { throw new Error(`Apps Script web app returned non-JSON from ${url}`); }
    const pack = json.dharma || json.gruhya || json.articles ? json : json.data || json;
    const list = pack[kind] || pack[`${kind}_sutras`] || [];
    if (!Array.isArray(list)) throw new Error(`Apps Script JSON missing array for ${kind}`);
    const headers = list[0] ? Object.keys(list[0]) : KIND_FIELDS[kind];
    return finalize(kind, list, { source: 'apps-script', tab: kind, headers, endpoint: url });
  }

  async function loadTab(kind, tab) {
    const id = String(sheetCfg().id || '').trim();
    const gviz = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(tab)}&headers=1&tq=${encodeURIComponent('select *')}&_=${Date.now()}`;
    try {
      const text = await fetchText(gviz, `gviz:${tab}`);
      const { headers, rows } = parseGviz(text);
      const objects = objectsFromTable(headers, rows, kind);
      return finalize(kind, objects, { source: 'gviz', tab, headers, endpoint: gviz });
    } catch (gvizError) {
      const csvUrl = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tab)}&headers=1&_=${Date.now()}`;
      try {
        const csv = await fetchText(csvUrl, `csv:${tab}`);
        const table = parseCsv(csv);
        if (!table.length) throw new Error(`CSV for tab "${tab}" was empty`);
        const [headers, ...rows] = table;
        const objects = objectsFromTable(headers, rows, kind);
        return finalize(kind, objects, { source: 'csv', tab, headers, endpoint: csvUrl });
      } catch (csvError) {
        throw new Error(`Tab "${tab}" failed. gviz: ${gvizError.message} | csv: ${csvError.message}`);
      }
    }
  }

  async function loadFromSheet(kind) {
    const id = String(sheetCfg().id || '').trim();
    if (!id) return null;
    const names = sheetCfg().tabs?.[kind] || [kind];
    const errors = [];
    for (const tab of names) {
      try {
        return await loadTab(kind, tab);
      } catch (error) {
        errors.push(`${tab}: ${error.message}`);
      }
    }
    throw new Error(`No readable ${kind} tab in spreadsheet ${id}. Tried ${names.join(', ')}. ${errors.join(' | ')}`);
  }

  async function load(kind, options = {}) {
    const refresh = options.refresh || new URLSearchParams(location.search).has('refresh');
    if (refresh) clearCache();
    else {
      const cached = readCache(kind);
      if (cached?.rows) {
        status.counts[kind] = cached.rows.length;
        status.connection = 'connected';
        status.source = `${cached.source} (cache)`;
        status.lastSuccessAt = cached.syncedAt || nowIso();
        return cached;
      }
    }

    try {
      const fromSheet = await loadFromSheet(kind);
      if (fromSheet) { writeCache(kind, fromSheet); return fromSheet; }
      const fromApp = await loadFromWebApp(kind);
      if (fromApp) { writeCache(kind, fromApp); return fromApp; }
      throw new Error('Google Sheet is not configured. Add the spreadsheet ID (Anyone with the link → Viewer) or an Apps Script web app URL in js/config.js.');
    } catch (error) {
      throw fail(error, { kind, endpoint: sheetCfg().id || sheetCfg().webAppUrl || '(none)' });
    }
  }

  window.BramhaSheets = {
    load,
    clearCache,
    mapHeader,
    normalizeRow,
    isPublic,
    parseCsv,
    parseGviz,
    objectsFromTable,
    composeId,
    status: () => ({ ...status, counts: { ...status.counts }, tabs: { ...status.tabs }, lastError: status.lastError ? { ...status.lastError } : null }),
    FIELD_ALIASES,
    KIND_FIELDS
  };
})();
