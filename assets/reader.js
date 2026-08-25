(function(){
  const spec = window.READER_SPEC;
  let rows = [];
  let currentIndex = -1;
  const $ = id => document.getElementById(id);

  async function loadIndex(){
    $('readerState').textContent = 'Loading verified content…';
    try {
      rows = await sbFetch(`${spec.table}?select=${spec.indexFields.join(',')}&publish=eq.true&verification_status=eq.Verified&order=${spec.order}&limit=5000`);
      if (!rows.length) {
        $('readerState').innerHTML = '<div class="empty">No verified Sūtras are public yet. Content will appear automatically after a row is marked <strong>Verified</strong> and <strong>Publish = YES</strong> in the Bramha.org CMS.</div>';
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
    return [...new Set(rows.filter(predicate).map(r => r[field]).filter(v => v!==null && v!==undefined))].sort((a,b)=>Number(a)-Number(b));
  }
  function fillSelect(id, values, label){
    const el=$(id); el.innerHTML='';
    values.forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=`${label} ${v}`; el.appendChild(o); });
  }
  function buildFilters(){
    const f=spec.filters;
    fillSelect('f1',unique(f[0].field),f[0].label);
    cascadeFrom(0);
    ['f1','f2','f3','f4'].forEach((id,i)=>$(id)?.addEventListener('change',()=>cascadeFrom(i)));
  }
  function cascadeFrom(level){
    const f=spec.filters;
    const selected = [];
    for(let i=0;i<f.length;i++) selected[i]=$(f[i].id)?.value;
    for(let i=Math.max(1,level+1); i<f.length;i++){
      const pred = r => f.slice(0,i).every((ff,j)=> String(r[ff.field])===String($(ff.id).value));
      const vals=unique(f[i].field,pred);
      fillSelect(f[i].id,vals,f[i].label);
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
        f.id && ($(f.id).value=row[f.field]);
      }
    });
  }
  async function openIndex(index){
    if(index<0 || index>=rows.length) return;
    currentIndex=index;
    const row=rows[index]; syncFilters(row);
    history.replaceState({},'',`${location.pathname}?id=${encodeURIComponent(row[spec.key])}`);
    $('prev').disabled=index===0; $('next').disabled=index===rows.length-1;
    try {
      const data=await sbFetch(`${spec.table}?select=*&${spec.key}=eq.${encodeURIComponent(row[spec.key])}&limit=1`);
      render(data[0]);
    } catch(e){ $('readerState').innerHTML=`<div class="notice">Unable to load this record: ${escapeHtml(e.message)}</div>`; }
  }
  function render(r){
    $('reader').style.display='block';
    $('readerTitle').textContent=r.display_name || r.title || r[spec.key];
    $('readerKicker').textContent=spec.kicker(r);
    spec.fields.forEach(x=>textOrHide($(x.id),r[x.field]));
    const src=$('sourceLink');
    if(src){ if(r.source_url){ src.href=r.source_url; src.style.display='inline'; } else src.style.display='none'; }
  }
  $('prev')?.addEventListener('click',()=>openIndex(currentIndex-1));
  $('next')?.addEventListener('click',()=>openIndex(currentIndex+1));
  loadIndex();
})();
