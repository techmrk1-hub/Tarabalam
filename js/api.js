const cfg = window.BRAMHA_CONFIG;
if (!cfg?.supabaseUrl || !cfg?.supabasePublishableKey) throw new Error('Bramha Supabase config missing');

async function sbFetch(path) {
  const r = await fetch(`${cfg.supabaseUrl}/rest/v1/${path}`, {
    headers: {
      apikey: cfg.supabasePublishableKey,
      Accept: 'application/json'
    }
  });
  if (!r.ok) throw new Error(`Supabase request failed (${r.status}) for ${path}`);
  return r.json();
}
window.sbFetch = sbFetch;

window.escapeHtml = function(value='') {
  return String(value).replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
};

window.textOrHide = function(el, value) {
  if (!el) return;
  const section = el.closest('.section');
  if (value === null || value === undefined || String(value).trim() === '') {
    if (section) section.style.display = 'none';
    return;
  }
  if (section) section.style.display = '';
  el.textContent = value;
};

function kindFromTable(table) {
  if (table === 'dharma_sutras') return 'dharma';
  if (table === 'gruhya_sutras') return 'gruhya';
  if (table === 'articles') return 'articles';
  return table;
}

function orderRows(rows, order) {
  if (!order || !rows) return rows;
  const keys = String(order).split(',').map((part) => {
    const [field, dir] = part.trim().split('.');
    return { field, dir: dir === 'desc' ? -1 : 1 };
  });
  return rows.slice().sort((a, b) => {
    for (const { field, dir } of keys) {
      const av = a[field];
      const bv = b[field];
      if (av === bv) continue;
      if (av === null || av === undefined) return 1;
      if (bv === null || bv === undefined) return -1;
      const an = Number(av);
      const bn = Number(bv);
      if (Number.isFinite(an) && Number.isFinite(bn) && an !== bn) return (an - bn) * dir;
      return String(av).localeCompare(String(bv), undefined, { numeric: true }) * dir;
    }
    return 0;
  });
}

window.loadCmsTable = async function(table, options = {}) {
  const kind = kindFromTable(table);
  const result = await window.BramhaSheets.load(kind, options);
  return {
    rows: orderRows(result.rows, options.order),
    source: result.source,
    syncedAt: result.syncedAt,
    tab: result.tab,
    live: true
  };
};

window.showCmsBanner = function(host, info) {
  if (!host) return;
  let bar = document.getElementById('cmsBanner');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'cmsBanner';
    host.prepend(bar);
  }
  bar.className = `cms-banner ${info.tone || 'warn'}`;
  bar.innerHTML = info.html;
};
