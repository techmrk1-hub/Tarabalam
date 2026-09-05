(function () {
  const PARTS = {
    mark: { mime: 'image/png', n: 13, dir: 'mark' },
    lockup: { mime: 'image/webp', n: 16, dir: 'lockup' },
  };

  function clearCandidates(img) {
    img.removeAttribute('srcset');
    img.removeAttribute('sizes');
  }

  window.brandPack = function (img) {
    if (!(img instanceof HTMLImageElement) || img.dataset.brandPacked === '2') {
      img?.remove();
      return;
    }
    if (img.dataset.brandPacked === '1') {
      assemble(img);
      return;
    }
    img.dataset.brandPacked = '1';
    const kind = img.dataset.brand;
    const next = {
      mark: '/assets/brand/bramha-icon-master.png',
      lockup: '/assets/brand/bramha-logo-480w.webp',
      about: '/assets/brand/bramha-logo-full.webp',
    }[kind];
    clearCandidates(img);
    if (next && !img.src.includes(next)) {
      img.src = next;
      return;
    }
    assemble(img);
  };

  async function assemble(img) {
    img.dataset.brandPacked = '2';
    const spec = PARTS[img.dataset.brand === 'about' ? 'lockup' : img.dataset.brand];
    if (!spec || !spec.n) {
      img.remove();
      return;
    }
    try {
      const texts = await Promise.all(Array.from({ length: spec.n }, (_, i) => {
        const name = spec.dir + '-' + String(i).padStart(2, '0') + '.b64';
        return fetch('/assets/brand-parts/' + name).then((r) => {
          if (!r.ok) throw new Error(String(r.status));
          return r.text();
        });
      }));
      clearCandidates(img);
      img.src = 'data:' + spec.mime + ';base64,' + texts.join('');
    } catch {
      img.remove();
    }
  }
})();
