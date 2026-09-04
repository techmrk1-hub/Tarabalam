(function () {
  const header = document.querySelector('.m-header');
  const btn = document.querySelector('.m-menu');
  btn?.addEventListener('click', () => {
    const open = header.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });

  document.addEventListener('error', (event) => {
    const img = event.target;
    if (!(img instanceof HTMLImageElement) || img.dataset.fallbackApplied) return;
    const src = img.getAttribute('src') || '';
    let next = '';
    if (src.includes('bramha-logo') || src.includes('logo-480') || src.includes('logo-320')) {
      next = '/bramha-logo-trim.png';
    } else if (src.includes('assets/brand/') || src.includes('android-chrome')) {
      next = '/favicon.png';
    } else if (src.includes('/media/')) {
      next = src.replace('/media/', '/');
    }
    if (!next || next === src) return;
    img.dataset.fallbackApplied = '1';
    img.src = next;
  }, true);
})();
