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
    if (!src.includes('/media/')) return;
    img.dataset.fallbackApplied = '1';
    img.src = src.replace('/media/', '/');
  }, true);
})();
