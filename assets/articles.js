(function () {
  function docEmbed(url) {
    const raw = String(url || '').trim();
    const id = raw.match(/\/document\/d\/([^/]+)/i)?.[1];
    if (id) return `https://docs.google.com/document/d/${id}/preview`;
    if (/docs\.google\.com\/document\/.+\/pub/i.test(raw)) return raw;
    return '';
  }

  function articleHref(row) {
    return window.BramhaRoutes.articlePath(row);
  }

  async function publicArticles() {
    const loaded = await window.loadCmsTable('articles', { order: 'published_date.desc' });
    return (loaded.rows || []).filter((row) => String(row.language || '') !== 'Homepage Slide' && row.title);
  }

  async function renderList(host) {
    const params = new URLSearchParams(location.search);
    const slug = params.get('slug');
    if (slug && window.BramhaRoutes.usableNamedSlug(slug)) {
      location.replace(`/articles/${window.BramhaRoutes.usableNamedSlug(slug)}/`);
      return;
    }
    host.innerHTML = '<p class="notice">Loading articles…</p>';
    try {
      const rows = await publicArticles();
      if (!rows.length) {
        host.innerHTML = '<p class="empty">No verified articles are currently available.</p>';
        return;
      }
      host.innerHTML = `<div class="card-list">${rows.map((row) => `<a class="article-card" href="${articleHref(row)}">
        <div class="kicker">${window.escapeHtml([row.language, row.category].filter(Boolean).join(' · ') || 'Article')}</div>
        <h2>${window.escapeHtml(row.title)}</h2>
        <p>${window.escapeHtml(row.summary || 'Open the article.')}</p>
      </a>`).join('')}</div>`;
    } catch (error) {
      console.error(error);
      host.innerHTML = '<p class="error">Unable to load the library. Please try again.</p>';
    }
  }

  async function renderDoc(host, slug) {
    host.innerHTML = '<p class="notice">Loading article…</p>';
    try {
      let rows = [];
      try { rows = await publicArticles(); } catch (error) { console.warn(error); }
      let row = rows.find((item) => window.BramhaRoutes.articlePath(item) === `/articles/${slug}/`);
      if (!row) {
        const data = await window.sbFetch(`articles?select=article_id,title,slug,summary,language,content,author_id&slug=eq.${encodeURIComponent(slug)}&publish=eq.true&verification_status=eq.Verified&limit=1`);
        row = data?.[0];
      }
      if (!row) {
        host.innerHTML = '<p class="empty">No verified article is currently available at this address.</p>';
        return;
      }
      const heading = document.getElementById('pageHeading');
      if (heading) heading.textContent = row.title;
      document.title = `${row.title} | Bramha.org`;
      const embed = docEmbed(row.google_doc_url || row.values?.['Google Doc URL'] || '');
      const meta = [row.language, row.category, row.author, row.published_date].filter(Boolean).join(' · ');
      const summary = row.summary ? `<p class="lede">${window.escapeHtml(row.summary)}</p>` : '';
      const frame = embed
        ? `<iframe class="doc-frame" title="${window.escapeHtml(row.title)}" src="${window.escapeHtml(embed)}" loading="lazy"></iframe>`
        : (row.content
          ? `<article class="reader"><p>${window.escapeHtml(row.content)}</p></article>`
          : '<p class="empty">Article document is unavailable.</p>');
      host.innerHTML = `${meta ? `<p class="kicker">${window.escapeHtml(meta)}</p>` : ''}${summary}${frame}`;
    } catch (error) {
      console.error(error);
      host.innerHTML = '<p class="error">Unable to load the library. Please try again.</p>';
    }
  }

  window.BramhaArticles = { renderList, renderDoc, docEmbed };
})();
