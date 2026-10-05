(function () {
  const input = document.getElementById('q');
  const out = document.getElementById('results');
  const form = document.getElementById('searchForm');

  function snippet(row, needle) {
    const fields = row.displayFields || [];
    const hit = fields.find((field) => String(field.value || '').toLowerCase().includes(needle));
    const source = hit?.value || row.summary || row.english_translation || row.title || '';
    const text = String(source).replace(/\s+/g, ' ').trim();
    const at = text.toLowerCase().indexOf(needle);
    const start = at < 0 ? 0 : Math.max(0, at - 80);
    const excerpt = (start > 0 ? '\u2026' : '') + text.slice(start, start + 240) + (text.length > start + 240 ? '\u2026' : '');
    return { heading: hit?.heading || 'Match', excerpt };
  }

  function commentaryHref(note) {
    const id = String(note.entity_id || '');
    const parsed = window.BramhaSheets?.parseStableId?.(id);
    if (!parsed || !window.BramhaRoutes) return '';
    if (/^DS-/i.test(id)) return window.BramhaRoutes.dharmaPath(parsed);
    if (/^GS-/i.test(id)) return window.BramhaRoutes.gruhyaPath(parsed);
    return '';
  }

  function locationLabel(kind, row) {
    if (!window.BramhaRoutes) return row.unique_id || '';
    if (kind === 'dharma' || kind === 'gruhya') return window.BramhaRoutes.citation(kind, row);
    return row.slug || row.unique_id || '';
  }

  async function rowsFor(table) {
    try {
      const loaded = await window.loadCmsTable(table);
      return loaded.rows || [];
    } catch (error) {
      console.warn(table, error);
      return null;
    }
  }

  async function run() {
    const term = input.value.trim();
    if (term.length < 2) {
      out.innerHTML = '<p class="notice">Enter at least 2 characters.</p>';
      return;
    }
    const needle = term.toLowerCase();
    const url = new URL(location.href);
    url.searchParams.set('q', term);
    history.replaceState(null, '', url);
    out.innerHTML = '<p class="notice">Searching verified records\u2026</p>';
    try {
      const [dharma, gruhya, mantras, articles] = await Promise.all([
        rowsFor('dharma_sutras'),
        rowsFor('gruhya_sutras'),
        rowsFor('vedic_mantras'),
        rowsFor('articles')
      ]);
      if ([dharma, gruhya, mantras, articles].every((rows) => rows === null)) {
        out.innerHTML = '<p class="error">Unable to load the library. Please try again.</p>';
        return;
      }
      const packs = [
        { kind: 'dharma', label: 'Dharma S\u016btra', rows: dharma || [] },
        { kind: 'gruhya', label: 'G\u1e5bhya S\u016btra', rows: gruhya || [] },
        { kind: 'mantras', label: 'Vedic mantra', rows: mantras || [] },
        { kind: 'articles', label: 'Article', rows: (articles || []).filter((row) => String(row.language || '') !== 'Homepage Slide') }
      ];
      const matches = [];
      packs.forEach((pack) => {
        pack.rows.forEach((row) => {
          const hay = String(row.searchText || '').toLowerCase();
          if (!hay.includes(needle)) return;
          const found = snippet(row, needle);
          matches.push({
            type: pack.label,
            title: row.display_name || row.title || row.unique_id || 'Record',
            href: window.BramhaRoutes.pathFor(pack.kind, row),
            where: locationLabel(pack.kind, row),
            language: row.language || '',
            source: row.source || row.values?.Source || '',
            heading: found.heading,
            excerpt: found.excerpt
          });
        });
      });
      try {
        const notes = await window.sbFetch(`commentaries?select=commentary_id,title,author,text,entity_type,entity_id,source_title,language&publish=eq.true&verification_status=eq.Verified&text=ilike.*${encodeURIComponent(term)}*&limit=20`);
        (notes || []).forEach((note) => {
          const href = commentaryHref(note);
          if (!href) return;
          matches.push({
            type: 'Commentary',
            title: note.title || 'Commentary',
            href,
            where: note.entity_id || '',
            language: note.language || '',
            source: note.source_title || note.author || '',
            heading: 'Commentary',
            excerpt: String(note.text || '').slice(0, 240)
          });
        });
      } catch { /* commentary table may not be present */ }
      try {
        const protect = await import('/assets/content-protect.mjs');
        const translated = await window.sbFetch('content_translations?select=entity_type,entity_id,language,fields,source_hash,review_status,publish&publish=eq.true&review_status=eq.Verified&limit=1000');
        const byId = new Map();
        packs.forEach((pack) => {
          pack.rows.forEach((row) => {
            const entityId = row.unique_id || row.article_id || row.mantra_id;
            const entityType = pack.kind === 'dharma' ? 'dharma_sutra' : pack.kind === 'gruhya' ? 'gruhya_sutra' : pack.kind === 'mantras' ? 'vedic_mantra' : 'article';
            byId.set(`${entityType}:${entityId}`, {
              entityId,
              sourceHash: null,
              fields: protect.explanatoryFields(row),
              href: window.BramhaRoutes.pathFor(pack.kind, row),
              title: row.display_name || row.title || entityId,
              where: locationLabel(pack.kind, row),
              type: pack.label
            });
          });
        });
        await Promise.all([...byId.values()].map(async (record) => {
          record.sourceHash = await protect.sourceHash(record.fields);
        }));
        (translated || []).forEach((item) => {
          const record = byId.get(`${item.entity_type}:${item.entity_id}`);
          const hit = protect.publicSearchHit(item, record, needle);
          if (hit) matches.push(hit);
        });
      } catch (error) {
        console.warn(error);
      }
      if (window.BramhaTopics) {
        try {
          const topics = await window.BramhaTopics.list();
          topics.forEach((topic) => {
            const hay = `${topic.title} ${topic.summary || ''} ${topic.description || ''}`.toLowerCase();
            if (!hay.includes(needle)) return;
            matches.push({
              type: 'Topic',
              title: topic.title,
              href: topic.href,
              where: 'Topic',
              language: '',
              source: '',
              heading: 'Topic',
              excerpt: topic.summary || topic.description || `${topic.count} verified record${topic.count === 1 ? '' : 's'}`
            });
          });
        } catch { /* topics stay out of the result list when they cannot be loaded */ }
      }

      if (!matches.length) {
        out.innerHTML = '<p class="empty">No verified content matched that search.</p>';
        return;
      }
      out.innerHTML = `<p class="lede">${matches.length} verified match${matches.length === 1 ? '' : 'es'}.</p>` + matches.slice(0, 60).map((item) => `<article class="result">
        <div class="badge">${window.escapeHtml(item.type)}</div>
        <h2><a href="${window.escapeHtml(item.href)}">${window.escapeHtml(item.title)}</a></h2>
        <p class="where">${window.escapeHtml([item.where, item.language ? `Language: ${item.language}` : '', item.source ? `Source: ${item.source}` : '', item.translation ? `Translation: ${item.translation}` : ''].filter(Boolean).join(' \u00b7 '))}</p>
        <p><strong>${window.escapeHtml(item.heading)}.</strong> ${window.escapeHtml(item.excerpt)}</p>
        <p><a href="${window.escapeHtml(item.href)}">Open result</a></p>
      </article>`).join('');
    } catch (error) {
      out.innerHTML = '<p class="error">Unable to load the library. Please try again.</p>';
      console.error(error);
    }
  }

  form?.addEventListener('submit', (event) => { event.preventDefault(); run(); });
  const initial = new URLSearchParams(location.search).get('q');
  if (initial) { input.value = initial; run(); }
})();
