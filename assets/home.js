(function () {
  const form = document.getElementById('librarySearch');
  const input = document.getElementById('q');
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const term = input?.value.trim() || '';
    location.href = term ? `/search/?q=${encodeURIComponent(term)}` : '/search/';
  });
  document.querySelectorAll('[data-query]').forEach((button) => {
    button.addEventListener('click', () => {
      const term = button.dataset.query || '';
      location.href = term ? `/search/?q=${encodeURIComponent(term)}` : '/search/';
    });
  });

  const featured = document.getElementById('featuredSlides');

  function imageUrl(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    const file = raw.match(/drive\.google\.com\/file\/d\/([^/]+)/i);
    const id = file?.[1] || raw.match(/[?&]id=([^&]+)/i)?.[1];
    if (id) return `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w1200`;
    return raw;
  }

  async function loadFeatured() {
    if (!featured) return;
    try {
      const loaded = await window.loadCmsTable('articles', { order: 'article_id.asc' });
      const slides = (loaded.rows || []).filter((row) => String(row.language || '') === 'Homepage Slide' && row.featured);
      if (!slides.length) {
        featured.hidden = true;
        return;
      }
      featured.hidden = false;
      featured.innerHTML = slides.slice(0, 3).map((row) => {
        const href = row.slug && row.slug.startsWith('/') ? row.slug : '/dharma-sutra/';
        const img = imageUrl(row.featured_image_url);
        return `<a class="paper-card featured" href="${href}">
          ${img ? `<img src="${window.escapeHtml(img)}" alt="">` : ''}
          <div><div class="kicker">Featured</div><h3>${window.escapeHtml(row.title || '')}</h3><p>${window.escapeHtml(row.summary || '')}</p></div>
        </a>`;
      }).join('');
    } catch (error) {
      featured.hidden = true;
      console.warn(error);
    }
  }

  loadFeatured();
})();
