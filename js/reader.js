(function(){
  const spec = window.READER_SPEC;
  let rows = [];
  let fullRows = [];
  let currentIndex = -1;
  const $ = id => document.getElementById(id);

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
      $('readerState').textContent = '';
      buildFilters();
      const params = new URLSearchParams(location.search);
      const wanted = params.get('id');
      const i = wanted ? rows.findIndex(r => r[spec.key] === wanted) : 0;
      openIndex(i >= 0 ? i : 0);
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
    cascadeFrom(0);
    spec.filters.forEach((filter,i)=>$(filter.id)?.addEventListener('change',()=>cascadeFrom(i)));
  }
  function cascadeFrom(level){
    const f=spec.filters;
    for(let i=Math.max(1,level+1); i<f.length;i++){
      const pred = r => f.slice(0,i).every((ff)=> String(r[ff.field])===String($(ff.id).value));
      fillSelect(f[i].id,unique(f[i].field,pred),f[i].label);
    }
    const target = rows.findIndex(r => f.every(ff => String(r[ff.field])===String($(ff.id).value)));
    if(target>=0) openIndex(target);
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
    if (field.role === 'deva') p.className = 'deva';
    if (field.role === 'telugu') p.className = 'telugu';
    if (field.role === 'translit') p.className = 'translit';
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
    fields.forEach((field) => {
      if (!String(field.value || '').trim()) return;
      const section = document.createElement('div');
      section.className = 'section';
      section.dataset.layer = field.layer || 'basic';
      const heading = document.createElement('h3');
      heading.textContent = field.heading;
      section.appendChild(heading);
      section.appendChild(fieldBody(field));
      host.appendChild(section);
    });
  }

  async function openIndex(index){
    if(index<0 || index>=rows.length) return;
    currentIndex=index;
    const row=rows[index]; syncFilters(row);
    history.replaceState({},'',`${location.pathname}?id=${encodeURIComponent(row[spec.key])}`);
    $('prev').disabled=index===0; $('next').disabled=index===rows.length-1;
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
    $('readerTitle').textContent=r.display_name || r.title || r[spec.key];
    $('readerKicker').textContent=spec.kicker(r);
    renderFields(r);
  }

  $('prev')?.addEventListener('click',()=>openIndex(currentIndex-1));
  $('next')?.addEventListener('click',()=>openIndex(currentIndex+1));
  loadIndex();
})();
