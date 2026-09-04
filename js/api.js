const cfg = window.BRAMHA_CONFIG;
if (!cfg?.supabaseUrl || !cfg?.supabasePublishableKey) throw new Error('Bramha Supabase config missing');

async function sbFetch(path) {
  const r = await fetch(`${cfg.supabaseUrl}/rest/v1/${path}`, {
    headers: {
      apikey: cfg.supabasePublishableKey,
      Accept: 'application/json'
    }
  });
  if (!r.ok) throw new Error(`Supabase request failed (${r.status})`);
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
