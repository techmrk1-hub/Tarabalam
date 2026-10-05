(function () {
  function splitTags(value) {
    return String(value || '').split(/[,;|]/).map((part) => part.trim()).filter(Boolean);
  }

  function slugify(value) {
    return window.BramhaRoutes?.namedSlug(value, 'topic') || String(value || 'topic').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }

  async function safeRows(table) {
    try {
      const loaded = await window.loadCmsTable(table);
      return loaded.rows || [];
    } catch (error) {
      console.warn(table, error);
      return [];
    }
  }

  function entityHref(link) {
    const id = String(link.entity_id || '');
    const parsed = window.BramhaSheets?.parseStableId?.(id);
    if (parsed && window.BramhaRoutes) {
      if (/^DS-/i.test(id)) return window.BramhaRoutes.dharmaPath(parsed);
      if (/^GS-/i.test(id)) return window.BramhaRoutes.gruhyaPath(parsed);
    }
    if (String(link.entity_type || '') === 'article' && window.BramhaRoutes?.usableNamedSlug(id)) {
      return window.BramhaRoutes.articlePath({ slug: id });
    }
    return '';
  }

  function addLink(map, tag, link) {
    const slug = slugify(tag);
    if (!map.has(slug)) map.set(slug, { slug, title: tag, summary: '', description: '', href: `/topics/${slug}/`, count: 0, links: [] });
    const topic = map.get(slug);
    topic.count += 1;
    topic.links.push(link);
  }

  async function list() {
    const [dharma, gruhya, mantras, articles] = await Promise.all([
      safeRows('dharma_sutras'),
      safeRows('gruhya_sutras'),
      safeRows('vedic_mantras'),
      safeRows('articles')
    ]);
    const map = new Map();
    const take = (rows, type, label) => {
      rows.forEach((row) => {
        if (String(row.language || '') === 'Homepage Slide') return;
        splitTags(row.topic_tags).forEach((tag) => {
          addLink(map, tag, {
            type: label,
            title: row.display_name || row.title || row.unique_id || '',
            href: window.BramhaRoutes.pathFor(type, row),
            excerpt: (row.displayFields || []).find((field) => field.layer === 'basic')?.value || row.summary || ''
          });
        });
      });
    };
    take(dharma, 'dharma', 'Dharma Sūtra');
    take(gruhya, 'gruhya', 'Gṛhya Sūtra');
    take(mantras, 'mantras', 'Vedic mantra');
    take(articles.filter((row) => String(row.language || '') !== 'Homepage Slide'), 'articles', 'Article');

    try {
      const published = await window.sbFetch('topics?select=id,slug,title,language,summary,description,publish,verification_status&publish=eq.true&verification_status=eq.Verified&order=title.asc');
      const links = await window.sbFetch('topic_links?select=topic_id,entity_type,entity_id,relationship_type,sort_order&order=sort_order.asc');
      (published || []).forEach((topic) => {
        const slug = slugify(topic.slug || topic.title);
        if (!map.has(slug)) map.set(slug, { slug, title: topic.title, summary: topic.summary || '', description: topic.description || '', href: `/topics/${slug}/`, count: 0, links: [] });
        const current = map.get(slug);
        if (topic.summary) current.summary = topic.summary;
        if (topic.description) current.description = topic.description;
        current.id = topic.id;
        (links || []).filter((link) => link.topic_id === topic.id).forEach((link) => {
          current.links.push({
            type: link.entity_type,
            title: link.entity_id,
            href: entityHref(link),
            excerpt: link.relationship_type || '',
            entityType: link.entity_type,
            entityId: link.entity_id
          });
          current.count = current.links.length;
        });
      });
    } catch {
      /* topics tables are optional until the migration is applied */
    }
    return [...map.values()].sort((a, b) => a.title.localeCompare(b.title));
  }

  async function renderIndex(host) {
    host.innerHTML = '<p class="notice">Loading topics…</p>';
    try {
      const topics = await list();
      if (!topics.length) {
        host.innerHTML = '<p class="empty">No verified topic pages are currently available. Topics appear when a verified record carries a topic tag, or when a verified topic is published in the library database.</p>';
        return;
      }
      host.innerHTML = `<div class="topic-list">${topics.map((topic) => `<a class="topic-card" href="${topic.href}"><div class="kicker">${topic.count} record${topic.count === 1 ? '' : 's'}</div><h2>${window.escapeHtml(topic.title)}</h2><p>${window.escapeHtml(topic.summary || 'Verified records gathered under this topic.')}</p></a>`).join('')}</div>`;
    } catch (error) {
      host.innerHTML = '<p class="error">Unable to load the library. Please try again.</p>';
      console.error(error);
    }
  }

  async function renderTopic(host, slug) {
    host.innerHTML = '<p class="notice">Loading topic…</p>';
    try {
      const topics = await list();
      const topic = topics.find((item) => item.slug === slug);
      if (!topic) {
        host.innerHTML = '<p class="empty">No verified content is currently available for this topic.</p>';
        return;
      }
      const heading = document.getElementById('pageHeading');
      if (heading) heading.textContent = topic.title;
      document.title = `${topic.title} | Topics | Bramha.org`;
      const intro = topic.description || topic.summary || 'Verified records gathered under this topic. Nothing on this page is generated beyond the stored library.';
      const cards = topic.links.map((link) => {
        const title = window.escapeHtml(link.title);
        const heading = link.href ? `<a href="${window.escapeHtml(link.href)}">${title}</a>` : title;
        return `<article class="result"><div class="badge">${window.escapeHtml(link.type)}</div><h3>${heading}</h3><p>${window.escapeHtml(String(link.excerpt || '').slice(0, 280))}</p></article>`;
      }).join('');
      host.innerHTML = `<p class="lede">${window.escapeHtml(intro)}</p><div class="result-list">${cards || '<p class="empty">No verified records are linked to this topic yet.</p>'}</div>`;
    } catch (error) {
      host.innerHTML = '<p class="error">Unable to load the library. Please try again.</p>';
      console.error(error);
    }
  }

  window.BramhaTopics = { list, renderIndex, renderTopic, slugify };
})();
