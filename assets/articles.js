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
      const index = document.querySelector('main .seo-index');
      if (index) index.hidden = true;
      if (!rows.length) {
        host.innerHTML = '<p class="empty">No verified articles are currently available.</p>';
        return;
      }
      host.innerHTML = `<div class="card-list">${rows.map((row) => `<a class="article-card" href="${articleHref(row)}">
        <div class="kicker">${window.escapeHtml([row.language, row.category].filter(Boolean).join(' · ') || 'Article')}</div>
        <h2>${window.escapeHtml(row.title)}</h2>
        <p>${window.escapeHtml(row.summary || 'Open the article.')}</p>
      </a>`).join('')}</div>`;
    } catch {
      console.warn('Unable to load the library');
      host.innerHTML = '<p class="error">Unable to load the library. Please try again.</p>';
    }
  }

  async function loadPublicArticle(slug) {
    const wanted = window.BramhaRoutes.usableNamedSlug(slug);
    if (!wanted) return null;
    const rows = await publicArticles();
    return rows.find((item) => window.BramhaRoutes.articlePath(item) === `/articles/${wanted}/`) || null;
  }

  function upsertText(id, className, text, anchor) {
    let node = document.getElementById(id);
    if (!String(text || '').trim()) {
      if (node && node.id === id) node.remove();
      return;
    }
    if (!node) {
      node = document.createElement('p');
      node.id = id;
      node.className = className;
      anchor.before(node);
    }
    node.hidden = false;
    node.textContent = text;
  }

  function paintArticle(host, row) {
    const main = host.closest('main') || document.getElementById('content');
    let crumb = main.querySelector('nav.crumb');
    if (!crumb) {
      crumb = document.createElement('nav');
      crumb.className = 'crumb';
      crumb.setAttribute('aria-label', 'Breadcrumb');
      main.prepend(crumb);
    }
    if (!crumb.querySelector('[aria-current="page"]')) {
      crumb.innerHTML = '<a href="/">Home</a> <span aria-hidden="true">›</span> <a href="/articles/">Articles &amp; Research</a> <span aria-hidden="true">›</span> <span aria-current="page"></span>';
    }
    const current = crumb.querySelector('[aria-current="page"]');
    if (current) current.textContent = row.title || '';

    let heading = document.getElementById('pageHeading');
    if (!heading) {
      heading = document.createElement('h1');
      heading.id = 'pageHeading';
      host.before(heading);
    }
    heading.textContent = row.title || '';
    document.title = `${row.title || 'Article'} | Bramha.org`;

    const meta = [row.language, row.category, row.author, row.published_date].filter(Boolean).join(' · ');
    upsertText('articleKicker', 'kicker', meta, heading);
    upsertText('articleLede', 'lede', row.summary || '', host);

    let mount = document.getElementById('contentLanguageMount');
    if (!mount) {
      mount = document.createElement('div');
      mount.id = 'contentLanguageMount';
      host.before(mount);
    }

    const embed = docEmbed(row.google_doc_url || row.values?.['Google Doc URL'] || '');
    host.innerHTML = embed
      ? `<iframe class="doc-frame" title="${window.escapeHtml(row.title)}" src="${window.escapeHtml(embed)}" loading="lazy"></iframe>`
      : (row.content
        ? `<article class="reader"><p>${window.escapeHtml(row.content)}</p></article>`
        : '<p class="empty">Article document is unavailable.</p>');
  }

  async function renderDoc(host, slug, knownRow) {
    host.innerHTML = '<p class="notice">Loading article…</p>';
    try {
      let row = knownRow || null;
      if (!row) {
        try { row = await loadPublicArticle(slug); } catch (error) { console.warn(error); }
      }
      if (!row) {
        const wanted = window.BramhaRoutes.usableNamedSlug(slug);
        const data = wanted
          ? await window.sbFetch(`articles?select=article_id,title,slug,summary,language,content,author_id&slug=eq.${encodeURIComponent(wanted)}&publish=eq.true&verification_status=eq.Verified&limit=1`)
          : [];
        row = data?.[0];
      }
      if (!row) {
        host.innerHTML = '<p class="empty">No verified article is currently available at this address.</p>';
        return null;
      }
      paintArticle(host, row);
      const languages = await import('/assets/languages.mjs');
      await languages.applyArticle(row);
      return row;
    } catch {
      console.warn('Unable to load the library');
      host.innerHTML = '<p class="error">Unable to load the library. Please try again.</p>';
      return null;
    }
  }

  async function recoverRoute() {
    const raw = decodeURIComponent(location.pathname || '/');
    const articleRequest = raw.match(/^\/articles\/([^/]+)\/?$/i);
    if (!articleRequest) return false;
    const slug = window.BramhaRoutes.usableNamedSlug(articleRequest[1]);
    if (!slug) return false;
    const path = `/articles/${slug}/`;
    const parsed = window.BramhaRoutes.parsePath(path);
    if (!parsed || parsed.kind !== 'articles' || !parsed.leaf) return false;
    document.body.dataset.nav = 'articles';
    if (location.pathname !== path) history.replaceState(null, '', path);
    const notFound = document.getElementById('notFound');
    try {
      const row = await loadPublicArticle(parsed.slug);
      if (!row) return false;
      if (notFound) notFound.hidden = true;
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = `https://bramha.org${path}`;
      const main = document.getElementById('content');
      let host = document.getElementById('articleBody');
      if (!host) {
        const shell = document.createElement('div');
        shell.id = 'recoveredArticle';
        shell.innerHTML = '<h1 id="pageHeading"></h1><div id="contentLanguageMount"></div><div id="articleBody"></div>';
        main.appendChild(shell);
        host = shell.querySelector('#articleBody');
      }
      document.body.dataset.nav = 'articles';
      await renderDoc(host, parsed.slug, row);
      return true;
    } catch {
      console.warn('Article route recovery failed');
      if (notFound) {
        const lede = notFound.querySelector('.lede');
        if (lede) lede.textContent = 'The library could not be loaded just now. Please try again.';
      }
      return false;
    }
  }

  async function mountLeaf() {
    const host = document.getElementById('articleBody');
    if (!host || !window.BramhaRoutes) return;
    const slug = window.BramhaRoutes.parsePath(location.pathname)?.slug;
    if (!slug) return;
    try {
      const rows = await publicArticles();
      const row = rows.find((item) => window.BramhaRoutes.articlePath(item) === `/articles/${slug}/`);
      if (!row) return;
      const languages = await import('/assets/languages.mjs');
      await languages.applyArticle(row);
    } catch (error) {
      console.warn(error);
    }
  }

  window.BramhaArticles = { renderList, renderDoc, docEmbed, mountLeaf, publicArticles, loadPublicArticle, recoverRoute };
  if (document.getElementById('articleBody') && !document.getElementById('articleList')) mountLeaf();
})();
