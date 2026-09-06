(function(){
  const spec = window.READER_SPEC;
  let rows = [];
  let fullRows = [];
  let currentIndex = -1;
  const $ = id => document.getElementById(id);
  const routes = window.BramhaRoutes;

  function kindFromSpec() {
    if (spec.table === 'dharma_sutras') return 'dharma';
    if (spec.table === 'gruhya_sutras') return 'gruhya';
    if (spec.table === 'vedic_mantras') return 'mantras';
    if (spec.table === 'articles') return 'articles';
    return spec.table;
  }

  function prettyPath(row) {
    if (!routes || !row) return location.pathname;
    return routes.pathFor(kindFromSpec(), row);
  }

  function bannerHost() {
    return document.querySelector('main.inner-wrap') || document.body;
  }

  function showLiveOk() {
    const bar = document.getElementById('cmsBanner');
    if (bar) bar.remove();
  }

  function showSheetFailure(error) {
    const sync = window.BramhaSheets?.status?.() || {};
    const detail = sync.lastError || {};
    window.showCmsBanner(bannerHost(), {
      tone: 'error',
      html: `<strong>Google Sheet CMS is not connected.</strong> ${escapeHtml(error.message)} ` +
        `This page is showing the last Supabase snapshot, not a live Sheet update. ` +
        `Endpoint: ${escapeHtml(detail.endpoint || '(none)')}. ` +
        `Time: ${escapeHtml(detail.at || new Date().toISOString())}.`
    });
  }

  function snapshotFields(record) {
    const pairs = [
      ['Sanskrit (Devanagari)', record.sanskrit_devanagari, 'deva', 'basic'],
      ['Sanskrit / Transliteration', record.sanskrit_transliteration, 'translit', 'basic'],
      ['Telugu', record.telugu_script, 'telugu', 'basic'],
      ['English Translation', record.english_translation, 'translation', 'basic'],
      ['Word Meaning', record.word_meaning, 'content', 'basic'],
      ['Simple Meaning', record.simple_meaning, 'content', 'basic'],
      ['Commentary / Explanation', record.commentary, 'content', 'deep'],
      ['Prayoga', record.prayoga, 'content', 'context'],
      ['Notes', record.notes, 'content', 'context'],
      ['Cross References', record.cross_references, 'content', 'context'],
      ['Source', record.source, 'content', 'context']
    ];
    return pairs
      .filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== '')
      .map(([heading, value, role, layer]) => ({ heading, value, role, layer }));
  }

  async function loadFromSheet() {
    const loaded = await loadCmsTable(spec.table, { order: spec.order });
    fullRows = loaded.rows;
    rows = loaded.rows;
    showLiveOk();
  }

  async function loadSnapshot() {
    rows = await sbFetch(`${spec.table}?select=${spec.indexFields.join(',')}&publish=eq.true&verification_status=eq.Verified&order=${spec.order}&limit=5000`);
    fullRows = [];
  }

  function resolveIndex() {
    const wanted = new URLSearchParams(location.search).get('id');
    const parsed = routes?.parsePath(location.pathname) || null;
    if (routes) {
      const i = routes.findRow(kindFromSpec(), rows, parsed, wanted);
      if (i >= 0) return i;
    }
    if (wanted) {
      const i = rows.findIndex(r => r[spec.key] === wanted);
      if (i >= 0) return i;
    }
    return 0;
  }

  async function loadIndex(){
    $('readerState').textContent = 'Loading verified content…';
    try {
      try {
        await loadFromSheet();
      } catch (sheetError) {
        showSheetFailure(sheetError);
        await loadSnapshot();
      }
      if (!rows.length) {
        $('readerState').innerHTML = '<div class="empty">No verified Sūtras are public yet. Content will appear automatically after a row is marked <strong>Verified</strong> and <strong>Publish = YES</strong> in Bramha.org - Sutra Database.</div>';
        document.querySelector('.controls').style.display='none';
        return;
      }
      const parsed = routes?.parsePath(location.pathname);
      if (parsed?.leaf) {
        const i = resolveIndex();
        if (i < 0) {
          $('readerState').innerHTML = '<div class="notice">This Sūtra is not in the public verified library.</div>';
          document.querySelector('.controls').style.display='none';
          return;
        }
      }
      $('readerState').textContent = '';
      buildFilters();
      openIndex(resolveIndex(), { source: 'init' });
    } catch(e){
      $('readerState').innerHTML = `<div class="notice">Unable to load the reader: ${escapeHtml(e.message)}</div>`;
    }
  }

  function unique(field, predicate=()=>true){
    return [...new Set(rows.filter(predicate).map(r => r[field]).filter(v => v!==null && v!==undefined && String(v).trim()!==''))].sort((a,b)=>Number(a)-Number(b));
  }
  function fillSelect(id, values, label){
    const el=$(id); if(!el) return; el.innerHTML='';
    values.forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=`${label} ${v}`; el.appendChild(o); });
  }
  function buildFilters(){
    const f=spec.filters;
    fillSelect('f1',unique(f[0].field),f[0].label);
    spec.filters.forEach((filter,i)=>$(filter.id)?.addEventListener('change',()=>cascadeFrom(i)));
    cascadeFrom(0, { skipOpen: true });
  }
  function cascadeFrom(level, options = {}){
    const f=spec.filters;
    for(let i=Math.max(1,level+1); i<f.length;i++){
      const pred = r => f.slice(0,i).every((ff)=> String(r[ff.field])===String($(ff.id).value));
      fillSelect(f[i].id,unique(f[i].field,pred),f[i].label);
    }
    if (options.skipOpen) return;
    const target = rows.findIndex(r => f.every(ff => String(r[ff.field])===String($(ff.id).value)));
    if(target>=0) openIndex(target, { source: 'user' });
  }
  function syncFilters(row){
    spec.filters.forEach((f,i)=>{
      const el=$(f.id); if(!el) return;
      if(i===0){ el.value=row[f.field]; }
      else {
        const pred = r => spec.filters.slice(0,i).every(ff => String(r[ff.field])===String(row[ff.field]));
        fillSelect(f.id, unique(f.field,pred), f.label);
        el.value=row[f.field];
      }
    });
  }

  function structuredList(value) {
    const trimmed = String(value || '').trim();
    if (!trimmed.startsWith('[')) return null;
    try {
      const parsed = JSON.parse(trimmed);
      if (!Array.isArray(parsed) || !parsed.length) return null;
      if (!parsed.every((item) => ['string', 'number'].includes(typeof item))) return null;
      const ul = document.createElement('ul');
      parsed.forEach((item) => {
        const li = document.createElement('li');
        li.textContent = String(item);
        ul.appendChild(li);
      });
      return ul;
    } catch {
      return null;
    }
  }

  function fieldBody(field) {
    const value = String(field.value || '').trim();
    if (field.role === 'audio' || /\.(mp3|m4a|wav|ogg)(\?|$)/i.test(value)) {
      const audio = document.createElement('audio');
      audio.controls = true;
      audio.src = value;
      audio.preload = 'none';
      return audio;
    }
    if (field.role === 'image' || /\.(png|jpe?g|webp|gif|svg)(\?|$)/i.test(value)) {
      const img = document.createElement('img');
      img.src = value;
      img.alt = field.heading;
      img.loading = 'lazy';
      return img;
    }
    if (field.role === 'url' || /^https?:\/\/\S+$/i.test(value)) {
      const a = document.createElement('a');
      a.href = value;
      a.textContent = value;
      a.rel = 'noopener noreferrer';
      a.target = '_blank';
      return a;
    }
    const list = structuredList(value);
    if (list) return list;
    const p = document.createElement('p');
    if (field.role === 'deva') { p.className = 'deva'; p.lang = 'sa'; }
    if (field.role === 'telugu') { p.className = 'telugu'; p.lang = 'te'; }
    if (field.role === 'translit') { p.className = 'translit'; p.lang = 'sa'; }
    p.textContent = field.value;
    return p;
  }

  function renderFields(record) {
    const host = $('readerFields');
    if (!host) return;
    host.innerHTML = '';
    const fields = Array.isArray(record.displayFields) && record.displayFields.length
      ? record.displayFields
      : snapshotFields(record);
    const headingTag = document.body.dataset.seoLeaf ? 'h2' : 'h3';
    fields.forEach((field) => {
      if (!String(field.value || '').trim()) return;
      const section = document.createElement('div');
      section.className = 'section';
      section.dataset.layer = field.layer || 'basic';
      const heading = document.createElement(headingTag);
      heading.textContent = field.heading;
      section.appendChild(heading);
      section.appendChild(fieldBody(field));
      host.appendChild(section);
    });
  }

  function syncUrl(row, source) {
    if (!routes || !row) return;
    const path = prettyPath(row);
    const wanted = new URLSearchParams(location.search).get('id');
    if (wanted) {
      history.replaceState({ id: row[spec.key] }, '', path);
      return;
    }
    if (source === 'pop') return;
    if (source === 'init') {
      const parsed = routes.parsePath(location.pathname);
      if (parsed?.leaf && location.pathname !== path) history.replaceState({ id: row[spec.key] }, '', path);
      return;
    }
    if (location.pathname !== path) history.pushState({ id: row[spec.key] }, '', path);
  }

  function syncNavLinks() {
    const prev = $('prev');
    const next = $('next');
    if (prev) {
      if (currentIndex > 0) {
        prev.href = prettyPath(rows[currentIndex - 1]);
        prev.hidden = false;
        prev.removeAttribute('aria-disabled');
      } else {
        prev.href = '#';
        prev.hidden = true;
        prev.setAttribute('aria-disabled', 'true');
      }
    }
    if (next) {
      if (currentIndex >= 0 && currentIndex < rows.length - 1) {
        next.href = prettyPath(rows[currentIndex + 1]);
        next.hidden = false;
        next.removeAttribute('aria-disabled');
      } else {
        next.href = '#';
        next.hidden = true;
        next.setAttribute('aria-disabled', 'true');
      }
    }
  }

  async function openIndex(index, options = {}){
    if(index<0 || index>=rows.length) return;
    currentIndex=index;
    const row=rows[index];
    syncFilters(row);
    syncUrl(row, options.source || 'user');
    syncNavLinks();
    try {
      let record = fullRows.find(r => r[spec.key] === row[spec.key]);
      if (!record) {
        const data=await sbFetch(`${spec.table}?select=*&${spec.key}=eq.${encodeURIComponent(row[spec.key])}&limit=1`);
        record = data[0];
      }
      render(record);
    } catch(e){ $('readerState').innerHTML=`<div class="notice">Unable to load this record: ${escapeHtml(e.message)}</div>`; }
  }

  function render(r){
    $('reader').style.display='block';
    const title = $('readerTitle');
    if (title) title.textContent=r.display_name || r.title || r[spec.key];
    $('readerKicker').textContent=spec.kicker(r);
    renderFields(r);
  }

  function navClick(handler) {
    return (event) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      handler();
    };
  }

  $('prev')?.addEventListener('click', navClick(()=>openIndex(currentIndex-1, { source: 'user' })));
  $('next')?.addEventListener('click', navClick(()=>openIndex(currentIndex+1, { source: 'user' })));
  window.addEventListener('popstate', () => {
    if (!rows.length) return;
    openIndex(resolveIndex(), { source: 'pop' });
  });
  loadIndex();
})();
