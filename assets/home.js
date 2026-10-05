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
      if (input) input.value = button.dataset.query || '';
      input?.focus();
    });
  });

  const featured = document.getElementById('featuredSlides');
  const topics = document.getElementById('homeTopics');

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

  async function loadTopics() {
    if (!topics || !window.BramhaTopics) return;
    try {
      const found = await window.BramhaTopics.list();
      if (!found.length) {
        topics.innerHTML = '<p class="empty">No verified topic pages are currently available. A topic appears here when a verified record carries a topic tag, or when a verified topic is published in the library database.</p>';
        return;
      }
      topics.innerHTML = found.slice(0, 12).map((topic) => `<a class="topic-card" href="${topic.href}"><h3>${window.escapeHtml(topic.title)}</h3><p>${topic.count} verified record${topic.count === 1 ? '' : 's'}</p></a>`).join('');
    } catch (error) {
      topics.innerHTML = '<p class="error">Unable to load topics. Please try again.</p>';
      console.warn(error);
    }
  }

  loadFeatured();
  loadTopics();
})();
