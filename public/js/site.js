(function () {
  const header = document.querySelector('.m-header');
  const btn = document.querySelector('.m-menu');
  btn?.addEventListener('click', () => {
    const open = header.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });
})();
