(function () {
  const SYSTEM_RULES = [
    { role: 'id', patterns: ['unique id', 'uniqueid', 'sutra id', 'sutra_id', 'record id', 'record_id', 'mantra id', 'mantra_id', 'id'] },
    { role: 'article_id', patterns: ['article id', 'article_id'] },
    { role: 'slug', patterns: ['slug'] },
    { role: 'sort', patterns: ['sort order', 'sort_order', 'sort'] },
    { role: 'type', patterns: ['text type', 'text_type', 'classification', 'sutra type'] },
    { role: 'status', patterns: ['verification status', 'verification_status', 'verified', 'status'] },
    { role: 'publish', patterns: ['publish', 'published', 'visibility', 'public'] },
    { role: 'internal', patterns: ['internal notes', 'internal_notes', 'internal note'] },
    { role: 'updated', patterns: ['last updated', 'last_updated', 'updated at', 'updated'] },
    { role: 'category', patterns: ['category id', 'category_id', 'category'] },
    { role: 'author', patterns: ['author id', 'author_id', 'author'] },
    { role: 'featured', patterns: ['featured'] },
    { role: 'language', patterns: ['language'] },
    { role: 'published_date', patterns: ['published date', 'published_date'] },
    { role: 'display_name', patterns: ['dropdown display name', 'display name', 'display_name'] },
    { role: 'prashna', patterns: ['prashna', 'prasna', 'prashna number'] },
    { role: 'patala', patterns: ['patala', 'paatala', 'patala number'] },
    { role: 'khanda', patterns: ['khanda', 'khanda number'] },
    { role: 'section', patterns: ['section number', 'section_number', 'section', 'khandika'] },
    { role: 'sutra_number', patterns: ['sutra number', 'sutra_number', 'sutra no', 'sutra #'] }
  ];

  const CONTENT_HINTS = [
    { role: 'deva', patterns: ['sanskrit devanagari', 'sanskrit (devanagari)', 'devanagari', 'sanskrit text', 'mula'] },
    { role: 'translit', patterns: ['sanskrit transliteration', 'sanskrit transliteration sutra', 'transliteration', 'iast', 'roman', 'sutra'] },
    { role: 'telugu', patterns: ['telugu script', 'telugu'] },
    { role: 'translation', patterns: ['english translation', 'translation'] },
    { role: 'audio', patterns: ['audio url', 'audio_url', 'audio'] },
    { role: 'image', patterns: ['featured image url', 'featured image', 'image url', 'image'] },
    { role: 'url', patterns: ['source url', 'source_url', 'website url', 'url'] }
  ];

  const NUMERIC_ROLES = new Set(['prashna', 'patala', 'khanda', 'section', 'sutra_number', 'sort']);

  const status = {
    connection: 'idle',
    lastSuccessAt: null,
    lastError: null,
    counts: { dharma: 0, gruhya: 0, articles: 0, mantras: 0 },
    tabs: {},
    source: null,
    sheetName: null,
    sheetId: null,
    diagnostics: {}
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

  function blank(value) {
    return value === null || value === undefined || String(value).trim() === '' || String(value).trim() === '#ERROR!';
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
    if (s.length <= 24) {
      const matches = s.match(/-?\d+/g);
      if (matches && matches.length === 1) return Number(matches[0]);
    }
    return s;
  }

  function extraSystemFolds() {
    return new Set((sheetCfg().systemHeaders || []).map(fold).filter(Boolean));
  }

  function matchRule(folded, rules) {
    for (const rule of rules) {
      if (rule.patterns.some((pattern) => folded === pattern)) return rule.role;
    }
    return null;
  }

  function classifyHeader(header, kind) {
    const heading = String(header || '').trim();
    const folded = fold(heading);
    if (!folded) return { heading, folded, role: 'blank', system: true, display: false };
    if (extraSystemFolds().has(folded)) {
      return { heading, folded, role: 'system', system: true, display: false };
    }
    let role = matchRule(folded, SYSTEM_RULES);
    if (kind === 'gruhya' && role === 'khanda') role = 'section';
    if (role === 'type' && kind === 'articles') role = 'type';
    if (role) {
      return { heading, folded, role, system: true, display: false };
    }
    const contentRole = matchRule(folded, CONTENT_HINTS) || 'content';
    return { heading, folded, role: contentRole, system: false, display: true };
  }

  function layerFor(col) {
    const folded = col.folded;
    if (/\b(commentar|bhashya|bhasya|explanation|vyakhya)\b/.test(folded)) return 'deep';
    if (folded === 'context' || folded.startsWith('context ') || /\b(prayoga|viniyoga)\b/.test(folded)) return 'context';
    return 'basic';
  }

  function schemaFingerprint(headers) {
    return headers.map((header) => String(header || '').trim()).join('\u001f');
  }

  function inspectSchema(headers, kind) {
    const diagnostics = { blankHeadings: 0, duplicateHeadings: [], columns: [] };
    const seen = new Map();
    const columns = headers.map((header, index) => {
      const col = { ...classifyHeader(header, kind), index };
      col.layer = col.display ? layerFor(col) : null;
      if (col.role === 'blank') {
        diagnostics.blankHeadings += 1;
        col.display = false;
        col.system = true;
      } else if (seen.has(col.folded)) {
        diagnostics.duplicateHeadings.push(col.heading);
        col.key = `${col.folded}#${index}`;
      } else {
        seen.set(col.folded, index);
        col.key = col.folded;
      }
      return col;
    });
    diagnostics.columns = columns
      .filter((col) => col.role !== 'blank')
      .map((col) => ({ heading: col.heading, role: col.role, system: col.system, display: col.display }));
    return { columns, diagnostics, fingerprint: schemaFingerprint(headers) };
  }

  function parseStableId(id) {
    const value = String(id || '').trim();
    const ds = value.match(/^DS-P(\d+)-Pa(\d+)-K(\d+)-S(-?\d+)$/i);
    if (ds) return { prashna: Number(ds[1]), patala: Number(ds[2]), khanda: Number(ds[3]), sutra_number: Number(ds[4]) };
    const gs = value.match(/^GS-Pa(\d+)-Sec(\d+)-S(-?\d+)$/i);
    if (gs) return { patala: Number(gs[1]), section_number: Number(gs[2]), sutra_number: Number(gs[3]) };
    return null;
  }

  function composeId(kind, row) {
    if (kind === 'dharma' && row.prashna != null && row.patala != null && row.khanda != null && row.sutra_number != null) {
      return `DS-P${row.prashna}-Pa${row.patala}-K${row.khanda}-S${row.sutra_number}`;
    }
    if (kind === 'gruhya' && row.patala != null && row.section_number != null && row.sutra_number != null) {
      return `GS-Pa${row.patala}-Sec${row.section_number}-S${row.sutra_number}`;
    }
    return row.article_id || row.unique_id || '';
  }

  function defaultDisplay(kind, row) {
    if (kind === 'dharma') return `Dharma Sūtra – Praśna ${row.prashna}, Paṭala ${row.patala}, Khāṇḍa ${row.khanda}, Sūtra ${row.sutra_number}`;
    if (kind === 'gruhya') return `Gṛhya Sūtra – Paṭala ${row.patala}, Section ${row.section_number}, Sūtra ${row.sutra_number}`;
    return row.title || row.article_id || row.unique_id || '';
  }

  function defaultSlug(kind, row) {
    if (kind === 'dharma') return `prasna-${row.prashna}-patala-${row.patala}-khanda-${row.khanda}-sutra-${row.sutra_number}`;
    if (kind === 'gruhya') return `patala-${row.patala}-khanda-${row.section_number}-sutra-${row.sutra_number}`;
    if (kind === 'mantras') {
      return String(row.title || row.unique_id || 'mantra')
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80) || 'mantra';
    }
    return row.slug || '';
  }

  function looksLikeUrl(value) {
    return /^https?:\/\/\S+$/i.test(String(value || '').trim());
  }

  function invalidUrl(value) {
    const s = String(value || '').trim();
    if (!/^https?:\/\//i.test(s)) return false;
    try { new URL(s); return false; } catch { return true; }
  }

  function rowFromCells(kind, columns, cells) {
    const values = {};
    const displayFields = [];
    const row = {
      unique_id: '',
      article_id: '',
      title: '',
      prashna: null,
      patala: null,
      khanda: null,
      section_number: null,
      sutra_number: null,
      display_name: '',
      publish: false,
      verification_status: '',
      slug: '',
      audio_url: '',
      source_url: '',
      sanskrit_transliteration: '',
      telugu_script: '',
      english_translation: '',
      text_type: '',
      featured: false,
      language: '',
      summary: '',
      content: '',
      featured_image_url: '',
      source_references: '',
      author: '',
      published_date: '',
      updated_at: '',
      category: ''
    };

    columns.forEach((col) => {
      if (col.role === 'blank') return;
      let value = cells[col.index];
      if (value === undefined || value === null) value = '';
      value = String(value);
      if (value.trim() === '#ERROR!') value = '';
      values[col.heading] = value;
      values[col.key] = value;

      if (NUMERIC_ROLES.has(col.role)) value = asNumber(value);

      if (col.role === 'id' && blank(row.unique_id)) row.unique_id = String(value || '').trim();
      if (col.role === 'article_id' && blank(row.article_id)) row.article_id = String(value || '').trim();
      if (col.role === 'display_name' && blank(row.display_name)) row.display_name = String(value || '').trim();
      if (col.role === 'prashna' && row.prashna == null) row.prashna = value;
      if (col.role === 'patala' && row.patala == null) row.patala = value;
      if (col.role === 'khanda' && row.khanda == null) row.khanda = value;
      if (col.role === 'section' && row.section_number == null) row.section_number = value;
      if (col.role === 'sutra_number' && row.sutra_number == null) row.sutra_number = value;
      if (col.role === 'status' && blank(row.verification_status)) row.verification_status = String(value || '').trim();
      if (col.role === 'publish') row.publish = asBoolean(value);
      if (col.role === 'slug' && blank(row.slug)) row.slug = String(value || '').trim();
      if (col.role === 'type' && blank(row.text_type)) row.text_type = String(value || '').trim();
      if (col.role === 'audio' && blank(row.audio_url)) row.audio_url = String(value || '').trim();
      if (col.role === 'url' && blank(row.source_url)) row.source_url = String(value || '').trim();
      if (col.role === 'translit' && blank(row.sanskrit_transliteration)) row.sanskrit_transliteration = String(value || '');
      if (col.role === 'telugu' && blank(row.telugu_script)) row.telugu_script = String(value || '');
      if (col.role === 'translation' && blank(row.english_translation)) row.english_translation = String(value || '');
      if (col.role === 'language' && blank(row.language)) row.language = String(value || '').trim();
      if (col.role === 'author' && blank(row.author)) row.author = String(value || '').trim();
      if (col.role === 'published_date' && blank(row.published_date)) row.published_date = String(value || '').trim();
      if (col.role === 'updated' && blank(row.updated_at)) row.updated_at = String(value || '').trim();
      if (col.role === 'category' && blank(row.category)) row.category = String(value || '').trim();
      if (col.role === 'featured') row.featured = asBoolean(value);
      if (col.role === 'image' && blank(row.featured_image_url)) row.featured_image_url = String(value || '').trim();
      if (col.folded === 'title' && blank(row.title)) row.title = String(value || '').trim();
      if (col.folded === 'summary' && blank(row.summary)) row.summary = String(value || '').trim();
      if (col.folded === 'content' && blank(row.content)) row.content = String(value || '').trim();
      if (col.folded === 'source references' && blank(row.source_references)) row.source_references = String(value || '').trim();

      if (col.display && !blank(value)) {
        const renderRole = col.role === 'url' || looksLikeUrl(value) ? (col.role === 'audio' ? 'audio' : 'url') : col.role;
        displayFields.push({
          heading: col.heading,
          value: String(cells[col.index] ?? '').trim() === '#ERROR!' ? '' : String(cells[col.index] ?? ''),
          role: renderRole,
          layer: col.layer,
          index: col.index
        });
      }
    });

    const parsed = parseStableId(row.unique_id);
    if (parsed) {
      Object.entries(parsed).forEach(([key, val]) => {
        if (row[key] == null || row[key] === '') row[key] = val;
      });
    }
    if (blank(row.unique_id) && kind !== 'articles') row.unique_id = composeId(kind, row);
    if (blank(row.article_id) && kind === 'articles') row.article_id = row.unique_id;
    if (blank(row.display_name)) row.display_name = defaultDisplay(kind, row);
    if (blank(row.slug)) row.slug = defaultSlug(kind, row);
    if (blank(row.text_type)) {
      row.text_type = kind === 'dharma' ? 'Dharma Sūtra' : kind === 'gruhya' ? 'Gruhya Sūtra' : row.language || '';
    }
    if (asVerified(row.verification_status)) row.verification_status = 'Verified';
    row.values = values;
    row.displayFields = displayFields.filter((field) => !blank(field.value));
    row.searchText = [row.display_name, row.unique_id, ...row.displayFields.map((field) => field.value)].filter(Boolean).join(' ').toLowerCase();
    return row;
  }

  function objectsFromTable(headers, rows, kind) {
    const schema = inspectSchema(headers, kind);
    return rows.map((cells) => rowFromCells(kind, schema.columns, cells));
  }

  function isPublic(row) {
    if (!row) return false;
    if (row.publish !== true && !asBoolean(row.publish)) return false;
    return row.verification_status === 'Verified' || asVerified(row.verification_status);
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
    if (!response.ok) throw new Error(`${label} HTTP ${response.status} for ${url}`);
    if (looksLikeHtml(text)) {
      throw new Error(`${label} returned a Google sign-in page. Share the Sheet as Anyone with the link → Viewer.`);
    }
    return text;
  }

  function cacheKey(kind) {
    const cfg = sheetCfg();
    return `bramha.sheet.v2.${cfg.id || cfg.webAppUrl || 'none'}.${kind}`;
  }

  function readCache(kind) {
    try {
      const raw = sessionStorage.getItem(cacheKey(kind));
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const ttl = Number(sheetCfg().cacheTtlMs || 45000);
      if (!parsed?.at || Date.now() - parsed.at > ttl) return null;
      if (!parsed.schema?.fingerprint || !Array.isArray(parsed.schema?.headers)) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  function writeCache(kind, payload) {
    try {
      sessionStorage.setItem(cacheKey(kind), JSON.stringify({ at: Date.now(), ...payload }));
    } catch {
      /* private mode or quota */
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

  function analyzeRows(kind, rows) {
    const ids = new Map();
    let missingIds = 0;
    let invalidUrls = 0;
    const duplicateIds = [];
    rows.forEach((row) => {
      const id = row.unique_id || row.article_id;
      if (!id) missingIds += 1;
      else if (ids.has(id)) duplicateIds.push(id);
      else ids.set(id, true);
      (row.displayFields || []).forEach((field) => {
        if (invalidUrl(field.value)) invalidUrls += 1;
      });
    });
    return { missingIds, duplicateIds: [...new Set(duplicateIds)], invalidUrls };
  }

  function finalize(kind, rawRows, meta) {
    const schema = inspectSchema(meta.headers || [], kind);
    const built = (rawRows || []).map((entry) => {
      if (entry && Array.isArray(entry) === false && entry.displayFields) return entry;
      if (entry && !Array.isArray(entry) && entry.values) return entry;
      return rowFromCells(kind, schema.columns, Array.isArray(entry) ? entry : schema.columns.map((col) => entry[col.heading] ?? entry[col.role] ?? ''));
    });
    const rows = built.filter((row) => {
      if (kind === 'articles') return !blank(row.article_id) || !blank(row.title);
      return !blank(row.unique_id);
    });
    const rowIssues = analyzeRows(kind, rows);
    const publicRows = rows.filter(isPublic);
    const usedIndexes = new Set();
    rows.forEach((row) => (row.displayFields || []).forEach((field) => usedIndexes.add(field.index)));
    const emptyColumns = schema.columns
      .filter((col) => col.display && !usedIndexes.has(col.index))
      .map((col) => col.heading);
    const diagnostics = {
      ...schema.diagnostics,
      ...rowIssues,
      emptyColumns,
      fingerprint: schema.fingerprint,
      headerCount: (meta.headers || []).filter((header) => String(header || '').trim()).length,
      displayHeadings: schema.columns.filter((col) => col.display && usedIndexes.has(col.index)).map((col) => col.heading)
    };
    status.counts[kind] = publicRows.length;
    status.tabs[kind] = {
      tab: meta.tab,
      loaded: rows.length,
      public: publicRows.length,
      endpoint: meta.endpoint,
      headers: diagnostics.displayHeadings,
      fingerprint: schema.fingerprint
    };
    status.diagnostics[kind] = diagnostics;
    status.connection = 'connected';
    status.lastSuccessAt = nowIso();
    status.lastError = null;
    status.source = meta.source;
    status.sheetName = sheetCfg().name || 'Bramha.org - Sutra Database';
    status.sheetId = sheetCfg().id || null;
    return {
      rows: publicRows,
      allRows: rows,
      schema: { headers: meta.headers || [], fingerprint: schema.fingerprint, columns: diagnostics.columns },
      diagnostics,
      ...meta,
      syncedAt: status.lastSuccessAt
    };
  }

  function fail(error, extra) {
    const err = error instanceof Error ? error : new Error(String(error));
    status.connection = 'error';
    status.lastError = { message: err.message, at: nowIso(), ...extra };
    console.error('[Bramha Sheet sync]', status.lastError);
    return err;
  }

  function wantLocalFeed() {
    try { return new URLSearchParams(location.search).has('localfeed'); } catch { return false; }
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
    try { json = JSON.parse(text); } catch { throw new Error(`Apps Script web app returned non-JSON from ${url}`); }
    const pack = json.dharma || json.gruhya || json.articles || json.mantras ? json : json.data || json;
    const list = pack[kind] || pack[`${kind}_sutras`] || pack.vedic_mantras || [];
    if (!Array.isArray(list)) throw new Error(`Apps Script JSON missing array for ${kind}`);
    const headers = pack.headers?.[kind] || (list[0] ? Object.keys(list[0]) : []);
    const rows = list.map((item) => (Array.isArray(item) ? item : headers.map((header) => item[header] ?? '')));
    return finalize(kind, objectsFromTable(headers, rows, kind), { source: 'apps-script', tab: kind, headers, endpoint: url });
  }

  async function loadTab(kind, tab) {
    const id = String(sheetCfg().id || '').trim();
    const gviz = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(tab)}&headers=1&tq=${encodeURIComponent('select *')}&_=${Date.now()}`;
    try {
      const text = await fetchText(gviz, `gviz:${tab}`);
      const { headers, rows } = parseGviz(text);
      return finalize(kind, objectsFromTable(headers, rows, kind), { source: 'gviz', tab, headers, endpoint: gviz });
    } catch (gvizError) {
      const csvUrl = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tab)}&headers=1&_=${Date.now()}`;
      try {
        const csv = await fetchText(csvUrl, `csv:${tab}`);
        const table = parseCsv(csv);
        if (!table.length) throw new Error(`CSV for tab "${tab}" was empty`);
        const [headers, ...rows] = table;
        return finalize(kind, objectsFromTable(headers, rows, kind), { source: 'csv', tab, headers, endpoint: csvUrl });
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
      try { return await loadTab(kind, tab); } catch (error) { errors.push(`${tab}: ${error.message}`); }
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
        status.diagnostics[kind] = cached.diagnostics || {};
        status.tabs[kind] = cached.tabsSnapshot || status.tabs[kind];
        return cached;
      }
    }

    try {
      const fromSheet = await loadFromSheet(kind);
      if (fromSheet) {
        writeCache(kind, { ...fromSheet, tabsSnapshot: status.tabs[kind] });
        return fromSheet;
      }
      const fromApp = await loadFromWebApp(kind);
      if (fromApp) {
        writeCache(kind, { ...fromApp, tabsSnapshot: status.tabs[kind] });
        return fromApp;
      }
      throw new Error('Google Sheet is not configured.');
    } catch (error) {
      throw fail(error, { kind, endpoint: sheetCfg().id || sheetCfg().webAppUrl || '(none)' });
    }
  }

  window.BramhaSheets = {
    load,
    clearCache,
    fold,
    classifyHeader,
    inspectSchema,
    objectsFromTable,
    rowFromCells,
    isPublic,
    parseCsv,
    parseGviz,
    parseStableId,
    composeId,
    schemaFingerprint,
    status: () => ({
      ...status,
      counts: { ...status.counts },
      tabs: { ...status.tabs },
      diagnostics: { ...status.diagnostics },
      lastError: status.lastError ? { ...status.lastError } : null
    })
  };
})();
