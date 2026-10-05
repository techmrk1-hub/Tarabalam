(function () {
  const spec = window.READER_SPEC;
  if (!spec) return;
  let rows = [];
  let currentIndex = -1;
  let mode = 'text';
  let commentaries = [];
  const $ = (id) => document.getElementById(id);
  const routes = window.BramhaRoutes;

  function kind() {
    if (spec.table === 'dharma_sutras') return 'dharma';
    if (spec.table === 'gruhya_sutras') return 'gruhya';
    if (spec.table === 'vedic_mantras') return 'mantras';
    if (spec.table === 'articles') return 'articles';
    return spec.table;
  }

  function entityType() {
    if (kind() === 'dharma') return 'dharma_sutra';
    if (kind() === 'gruhya') return 'gruhya_sutra';
    if (kind() === 'mantras') return 'vedic_mantra';
    return 'article';
  }

  function banner(html, tone) {
    window.showCmsBanner?.(document.querySelector('main') || document.body, { html, tone: tone || 'warn' });
  }

  function fieldNodes(field) {
    const value = String(field.value || '').trim();
    const block = document.createElement('div');
    block.className = 'section';
    block.dataset.layer = field.layer || 'basic';
    const heading = document.createElement('h2');
    heading.textContent = field.heading;
    block.appendChild(heading);
    if (field.role === 'audio' || /\.(mp3|m4a|wav|ogg)(\?|$)/i.test(value)) {
      const audio = document.createElement('audio');
      audio.controls = true;
      audio.preload = 'none';
      audio.src = value;
      block.appendChild(audio);
      return block;
    }
    if (field.role === 'image' || /\.(png|jpe?g|webp|gif|svg)(\?|$)/i.test(value)) {
      const img = document.createElement('img');
      img.src = value;
      img.alt = field.heading;
      img.loading = 'lazy';
      block.appendChild(img);
      return block;
    }
    if ((field.role === 'url' || /^https?:\/\/\S+$/i.test(value)) && value.length < 500) {
      const a = document.createElement('a');
      a.href = value;
      a.textContent = value;
      a.rel = 'noopener noreferrer';
      a.target = '_blank';
      block.appendChild(a);
      return block;
    }
    const p = document.createElement('p');
    const role = field.role || '';
    const folded = String(field.heading || '').toLowerCase();
    if (role === 'deva') { p.className = 'deva'; p.lang = 'sa'; }
    else if (role === 'telugu') { p.className = 'telugu'; p.lang = 'te'; }
    else if (role === 'telugu_meaning') { p.className = 'telugu'; p.lang = 'te'; }
    else if (role === 'translit') { p.className = 'translit'; p.lang = 'sa-Latn'; }
    else if (role === 'padaccheda' || /padaccheda|padapatha/.test(folded)) p.className = 'padaccheda';
    p.textContent = field.value;
    p.dataset.original = field.value;
    block.dataset.heading = field.heading || '';
    block.dataset.role = role;
    const sourceScript = role === 'deva' || role === 'telugu' || role === 'translit' || role === 'padaccheda' || p.classList.contains('padaccheda');
    if (sourceScript) block.dataset.scriptSource = '1';
    else if (!/^(source|source page|source url|source references)$/i.test(field.heading || '')) block.dataset.explain = '1';
    block.appendChild(p);
    return block;
  }

  function enhancePassage(record) {
    const id = record.unique_id || record.mantra_id || record.article_id || '';
    import('/assets/languages.mjs').then((lang) => lang.applyReader(record, {
      entityType: entityType(),
      entityId: id
    })).catch((error) => console.warn(error));
  }

  function sourceCommentaries(record) {
    const fields = Array.isArray(record.displayFields) ? record.displayFields : [];
    return fields.filter((field) => field.layer === 'deep' && String(field.value || '').trim()).map((field, index) => ({
      commentary_id: `source:${record.unique_id || record.mantra_id || index}:${field.heading}`,
      commentary_type: 'Source record',
      title: field.heading,
      author: '',
      tradition: '',
      language: '',
      text: field.value,
      source_title: record.source || record.values?.Source || '',
      source_page: record.source_page || '',
      source_url: record.source_url || '',
      verification_status: 'Verified',
      publish: true,
      sort_order: index
    }));
  }

  async function extraCommentaries(record) {
    const id = record.unique_id || record.mantra_id || record.article_id;
    if (!id || typeof window.sbFetch !== 'function') return [];
    try {
      const data = await window.sbFetch(
        `commentaries?select=commentary_id,entity_type,entity_id,commentary_type,title,author,tradition,language,text,source_title,source_page,source_url,verification_status,publish,sort_order&entity_type=eq.${encodeURIComponent(entityType())}&entity_id=eq.${encodeURIComponent(id)}&publish=eq.true&verification_status=eq.Verified&order=sort_order.asc`
      );
      return Array.isArray(data) ? data.filter((row) => row && String(row.text || '').trim()) : [];
    } catch {
      return [];
    }
  }

  function renderCommentaries() {
    const host = $('commentaryList');
    const panel = $('commentaryPanel');
    const compare = $('compareToggle');
    if (!host || !panel) return;
    const show = mode === 'commentary' || mode === 'all';
    panel.hidden = !show;
    if (!show) return;
    host.innerHTML = '';
    if (!commentaries.length) {
      host.innerHTML = '<p class="empty">No verified commentary is currently available for this passage.</p>';
      if (compare) compare.hidden = true;
      return;
    }
    if (compare) compare.hidden = commentaries.length < 2;
    const tabs = $('commentaryTabs');
    if (tabs) {
      tabs.innerHTML = '';
      tabs.hidden = window.innerWidth > 800 || !host.classList.contains('is-compare');
    }
    commentaries.forEach((item, index) => {
      const article = document.createElement('article');
      article.className = 'commentary';
      article.dataset.index = String(index);
      const type = document.createElement('div');
      type.className = 'kicker';
      type.textContent = item.commentary_type || 'Commentary';
      const title = document.createElement('h3');
      title.textContent = item.title || item.commentary_type || 'Commentary';
      article.append(type, title);
      const bits = [item.author, item.tradition, item.language].filter(Boolean);
      if (bits.length) {
        const meta = document.createElement('p');
        meta.className = 'meta';
        meta.textContent = bits.join(' · ');
        article.appendChild(meta);
      }
      const body = document.createElement('p');
      body.textContent = item.text;
      if (/[\u0C00-\u0C7F]/.test(item.text) && !/[\u0900-\u097F]/.test(item.text)) { body.className = 'telugu'; body.lang = 'te'; }
      else if (/[\u0900-\u097F]/.test(item.text)) { body.className = 'deva'; body.lang = 'sa'; }
      article.appendChild(body);
      const sourceBits = [item.source_title, item.source_page].filter(Boolean);
      if (sourceBits.length || item.source_url) {
        const source = document.createElement('p');
        source.className = 'meta';
        source.textContent = sourceBits.join(', ');
        if (item.source_url) {
          source.append(sourceBits.length ? ' · ' : '');
          const a = document.createElement('a');
          a.href = item.source_url;
          a.textContent = 'Source link';
          a.rel = 'noopener noreferrer';
          a.target = '_blank';
          source.appendChild(a);
        }
        article.appendChild(source);
      }
      host.appendChild(article);
    });
    if (window.innerWidth <= 800 && host.classList.contains('is-compare')) showMobileTabs();
  }

  function showMobileTabs() {
    const tabs = $('commentaryTabs');
    const host = $('commentaryList');
    if (!tabs || !host) return;
    tabs.hidden = false;
    tabs.innerHTML = '';
    commentaries.forEach((item, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = item.title || `Commentary ${index + 1}`;
      button.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
      button.addEventListener('click', () => {
        tabs.querySelectorAll('button').forEach((node) => node.setAttribute('aria-pressed', 'false'));
        button.setAttribute('aria-pressed', 'true');
        host.querySelectorAll('.commentary').forEach((node) => {
          node.hidden = node.dataset.index !== String(index);
        });
      });
      tabs.appendChild(button);
    });
    host.querySelectorAll('.commentary').forEach((node, index) => { node.hidden = index !== 0; });
  }

  function applyMode() {
    document.querySelectorAll('#readerFields .section').forEach((section) => {
      const layer = section.dataset.layer || 'basic';
      const visible = mode === 'all'
        || (mode === 'text' && layer === 'basic')
        || (mode === 'prayoga' && layer === 'context');
      section.hidden = !visible;
    });
    const fields = $('readerFields');
    const visibleCount = fields ? [...fields.querySelectorAll('.section')].filter((node) => !node.hidden).length : 0;
    const gap = $('layerEmpty');
    if (gap) {
      if (!visibleCount && mode !== 'commentary') {
        gap.hidden = false;
        gap.textContent = mode === 'prayoga'
          ? 'No verified Prayoga or context is currently available for this passage.'
          : 'No verified text is currently available for this passage.';
      } else gap.hidden = true;
    }
    document.querySelectorAll('#readerViewbar button').forEach((button) => {
      button.setAttribute('aria-pressed', button.dataset.mode === mode ? 'true' : 'false');
    });
    renderCommentaries();
  }

  function setMode(next) {
    mode = next;
    try { sessionStorage.setItem('bramha.reader.mode', next); } catch { /* ignore */ }
    applyMode();
  }

  function render(record) {
    const reader = $('reader');
    if (reader) reader.hidden = false;
    const title = $('readerTitle');
    const label = record.display_name || record.title || record.unique_id || '';
    if (title) title.textContent = label;
    const kicker = $('readerKicker');
    if (kicker) kicker.textContent = spec.kicker(record);
    const heading = $('pageHeading');
    if (heading && document.body.dataset.seoLeaf === '1' && routes) heading.textContent = routes.pageTitle(kind(), record);
    const verify = $('verifyNote');
    if (verify) {
      const source = record.source || record.values?.Source || record.values?.['Source'] || '';
      verify.textContent = source ? `Verified · ${source}` : 'Verified';
    }
    const host = $('readerFields');
    if (host && !record._keepStatic) {
      host.innerHTML = '';
      const fields = (record.displayFields || []).filter((field) => field.layer !== 'deep' && String(field.value || '').trim());
      fields.forEach((field) => host.appendChild(fieldNodes(field)));
    }
    const crumb = $('crumbCurrent');
    if (crumb && routes) crumb.textContent = kind() === 'dharma' || kind() === 'gruhya' ? `Sūtra ${record.sutra_number}` : (record.title || label);
    if (routes && document.body.dataset.seoLeaf !== '1') {
      document.title = `${routes.pageTitle(kind(), record)} | Bramha.org`;
    }
    applyMode();
    enhancePassage(record);
    document.dispatchEvent(new CustomEvent('bramha:passage', {
      detail: {
        contentType: entityType(),
        contentId: record.unique_id || record.mantra_id || record.article_id || '',
        title: label,
        path: routes ? routes.pathFor(kind(), record) : location.pathname
      }
    }));
  }

  function syncFilters(row) {
    const filters = spec.filters || [];
    filters.forEach((filter, index) => {
      const select = $(filter.id);
      if (!select) return;
      const pred = (candidate) => filters.slice(0, index).every((prev) => String(candidate[prev.field]) === String(row[prev.field]));
      fillSelect(filter.id, unique(filter.field, index === 0 ? () => true : pred), filter.label);
      select.value = row[filter.field];
    });
  }

  function unique(field, predicate) {
    return [...new Set(rows.filter(predicate).map((row) => row[field]).filter((value) => value !== null && value !== undefined && String(value).trim() !== ''))]
      .sort((a, b) => Number(a) - Number(b) || String(a).localeCompare(String(b)));
  }

  function fillSelect(id, values, label) {
    const el = $(id);
    if (!el) return;
    el.innerHTML = '';
    values.forEach((value) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = `${label} ${value}`;
      el.appendChild(option);
    });
  }

  function cascadeFrom(level) {
    const filters = spec.filters || [];
    for (let i = Math.max(1, level + 1); i < filters.length; i += 1) {
      const pred = (row) => filters.slice(0, i).every((filter) => String(row[filter.field]) === String($(filter.id).value));
      fillSelect(filters[i].id, unique(filters[i].field, pred), filters[i].label);
    }
    const target = rows.findIndex((row) => filters.every((filter) => String(row[filter.field]) === String($(filter.id).value)));
    if (target >= 0) openIndex(target, 'user');
  }

  function pathFor(row) {
    return routes ? routes.pathFor(kind(), row) : location.pathname;
  }

  function syncNav() {
    const prev = $('prev');
    const next = $('next');
    if (prev) {
      const ok = currentIndex > 0;
      prev.hidden = !ok;
      if (ok) prev.href = pathFor(rows[currentIndex - 1]);
    }
    if (next) {
      const ok = currentIndex >= 0 && currentIndex < rows.length - 1;
      next.hidden = !ok;
      if (ok) next.href = pathFor(rows[currentIndex + 1]);
    }
  }

  function resolveIndex() {
    const wanted = new URLSearchParams(location.search).get('id');
    const parsed = routes?.parsePath(location.pathname) || null;
    if (routes) {
      const index = routes.findRow(kind(), rows, parsed, wanted);
      if (index >= 0) return index;
    }
    if (wanted) {
      const index = rows.findIndex((row) => row[spec.key] === wanted);
      if (index >= 0) return index;
    }
    return rows.length ? 0 : -1;
  }

  async function openIndex(index, source) {
    if (index < 0 || index >= rows.length) return;
    currentIndex = index;
    const row = rows[index];
    syncFilters(row);
    syncNav();
    const path = pathFor(row);
    if (source === 'user' && location.pathname !== path) history.pushState({ id: row[spec.key] }, '', path);
    if (source === 'init' && new URLSearchParams(location.search).get('id')) history.replaceState({ id: row[spec.key] }, '', path);
    commentaries = sourceCommentaries(row);
    render(row);
    const extra = await extraCommentaries(row);
    if (currentIndex === index && extra.length) {
      commentaries = commentaries.concat(extra);
      renderCommentaries();
      enhancePassage(row);
    }
  }

  function keepStatic(message) {
    const state = $('readerState');
    if (state) state.innerHTML = `<div class="notice">${message}</div>`;
    const reader = $('reader');
    if (reader) reader.hidden = false;
    mode = 'all';
    document.querySelectorAll('#readerFields .section').forEach((section) => { section.hidden = false; });
    const panel = $('commentaryPanel');
    if (panel) panel.hidden = false;
    const gap = $('layerEmpty');
    if (gap) gap.hidden = true;
    document.querySelectorAll('#readerViewbar button').forEach((button) => {
      button.setAttribute('aria-pressed', button.dataset.mode === 'all' ? 'true' : 'false');
    });
  }

  async function loadIndex() {
    const state = $('readerState');
    if (state) state.textContent = 'Loading verified content…';
    try {
      let loaded;
      try {
        loaded = await window.loadCmsTable(spec.table, { order: spec.order });
      } catch (sheetError) {
        banner(`<strong>Unable to reach the Google Sheet.</strong> ${window.escapeHtml?.(sheetError.message) || ''} Showing the Supabase snapshot when one is available.`, 'error');
        const data = await window.sbFetch(`${spec.table}?select=*&publish=eq.true&verification_status=eq.Verified&order=${spec.order}&limit=5000`);
        loaded = { rows: data };
      }
      rows = loaded.rows || [];
      if (!rows.length) {
        if (document.body.dataset.seoLeaf === '1' && $('readerFields')?.childElementCount) {
          keepStatic('Live library refresh is unavailable. This page is showing the published text.');
          return;
        }
        if (state) state.innerHTML = '<div class="empty">No verified content is currently available.</div>';
        const controls = document.querySelector('.controls');
        if (controls) controls.hidden = true;
        return;
      }
      const parsed = routes?.parsePath(location.pathname);
      if (parsed?.leaf && resolveIndex() < 0) {
        if (state) state.innerHTML = '<div class="empty">This passage is not in the public verified library.</div>';
        return;
      }
      if (state) state.textContent = '';
      (spec.filters || []).forEach((filter, index) => {
        $(filter.id)?.addEventListener('change', () => cascadeFrom(index));
      });
      try {
        const saved = sessionStorage.getItem('bramha.reader.mode');
        if (saved) mode = saved;
      } catch { /* ignore */ }
      await openIndex(resolveIndex(), 'init');
    } catch (error) {
      if (document.body.dataset.seoLeaf === '1' && $('readerFields')?.childElementCount) {
        keepStatic('Unable to load the library. Please try again. The published text on this page is still shown below.');
        return;
      }
      if (state) state.innerHTML = `<div class="error">Unable to load the library. Please try again.</div>`;
      console.error(error);
    }
  }

  $('readerViewbar')?.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-mode]');
    if (button) setMode(button.dataset.mode);
  });
  $('compareToggle')?.addEventListener('click', () => {
    const host = $('commentaryList');
    if (!host) return;
    host.classList.toggle('is-compare');
    $('compareToggle').setAttribute('aria-pressed', host.classList.contains('is-compare') ? 'true' : 'false');
    renderCommentaries();
  });
  function navClick(step) {
    return (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      openIndex(currentIndex + step, 'user');
    };
  }
  $('prev')?.addEventListener('click', navClick(-1));
  $('next')?.addEventListener('click', navClick(1));
  window.addEventListener('popstate', () => { if (rows.length) openIndex(resolveIndex(), 'pop'); });
  loadIndex();
})();
