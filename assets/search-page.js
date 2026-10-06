import { astroRecords, excerptFor, isSearchable, searchIndex } from './search-engine.mjs';

const input = document.getElementById('q');
const out = document.getElementById('results');
const form = document.getElementById('searchForm');

function tagsOf(row) {
  const tags = String(row.topic_tags || '').split(/[,;|]/).map((part) => part.trim()).filter(Boolean);
  if (row.category) tags.push(String(row.category));
  return tags;
}

function rowRecord(kind, type, row) {
  if (!isSearchable(row)) return null;
  if (kind === 'articles' && String(row.language || '') === 'Homepage Slide') return null;
  const routes = window.BramhaRoutes;
  const citation = kind === 'dharma' || kind === 'gruhya' ? (routes?.citation(kind, row) || '') : '';
  const title = kind === 'dharma' || kind === 'gruhya'
    ? (routes?.pageTitle(kind, row) || row.display_name || row.unique_id || 'Record')
    : (row.title || row.display_name || row.unique_id || 'Record');
  const fieldText = (row.displayFields || []).map((field) => `${field.heading}\n${field.value}`).join('\n');
  const excerptSource = (row.displayFields || []).map((field) => String(field.value || '').trim()).filter(Boolean).join(' ');
  return {
    type,
    id: row.unique_id || row.article_id || row.slug || title,
    title,
    summary: row.summary || '',
    excerptSource,
    text: [
      row.summary, row.content, row.author, row.category, row.source_references,
      row.topic_tags, row.slug, row.unique_id, citation, fieldText
    ].filter(Boolean).join('\n'),
    tags: tagsOf(row),
    url: routes?.pathFor(kind, row) || '/',
    citation,
    language: row.language || '',
    source: row.source || row.values?.Source || ''
  };
}

function commentaryHref(note) {
  const id = String(note.entity_id || '');
  const parsed = window.BramhaSheets?.parseStableId?.(id);
  if (!parsed || !window.BramhaRoutes) return '';
  if (/^DS-/i.test(id)) return window.BramhaRoutes.dharmaPath(parsed);
  if (/^GS-/i.test(id)) return window.BramhaRoutes.gruhyaPath(parsed);
  return '';
}

async function rowsFor(table) {
  try {
    const loaded = await window.loadCmsTable(table);
    return loaded.rows || [];
  } catch (error) {
    console.warn(table, error);
    return null;
  }
}

async function commentaryRecords() {
  if (!window.sbFetch) return [];
  try {
    const notes = await window.sbFetch('commentaries?select=commentary_id,title,author,text,entity_type,entity_id,source_title,language,verification_status,publish&publish=eq.true&verification_status=eq.Verified&limit=500');
    return (notes || []).map((note) => {
      if (!isSearchable(note)) return null;
      const url = commentaryHref(note);
      if (!url) return null;
      return {
        type: 'Commentary',
        id: note.commentary_id || note.entity_id || note.title,
        title: note.title || 'Commentary',
        summary: '',
        text: [note.text, note.author, note.source_title, note.entity_id].filter(Boolean).join('\n'),
        tags: [],
        url,
        citation: note.entity_id || '',
        language: note.language || '',
        source: note.source_title || note.author || ''
      };
    }).filter(Boolean);
  } catch {
    return [];
  }
}

function render(matches, term) {
  if (!matches.length) {
    out.innerHTML = '<p class="empty">No verified content matched that search.</p>';
    return;
  }
  out.innerHTML = `<p class="lede">${matches.length} verified match${matches.length === 1 ? '' : 'es'}.</p>` + matches.map((item) => {
    const where = [item.citation && item.type !== 'Astro Tool' ? item.citation : '', item.language ? `Language: ${item.language}` : '', item.source ? `Source: ${item.source}` : ''].filter(Boolean).join(' · ');
    const excerpt = item.excerpt || excerptFor(item, term);
    return `<article class="result">
        <div class="badge">${window.escapeHtml(item.type)}</div>
        <h2><a href="${window.escapeHtml(item.url)}">${window.escapeHtml(item.title)}</a></h2>
        ${where ? `<p class="where">${window.escapeHtml(where)}</p>` : ''}
        ${excerpt ? `<p>${window.escapeHtml(excerpt)}</p>` : ''}
        <p><a href="${window.escapeHtml(item.url)}">Open result</a></p>
      </article>`;
  }).join('');
}

async function run() {
  const term = input.value.trim();
  if (term.length < 2) {
    out.innerHTML = '<p class="notice">Enter at least 2 characters.</p>';
    return;
  }
  const url = new URL(location.href);
  url.searchParams.set('q', term);
  history.replaceState(null, '', url);
  out.innerHTML = '<p class="notice">Searching verified records…</p>';
  try {
    const [dharma, gruhya, mantras, articles] = await Promise.all([
      rowsFor('dharma_sutras'),
      rowsFor('gruhya_sutras'),
      rowsFor('vedic_mantras'),
      rowsFor('articles')
    ]);
    if ([dharma, gruhya, mantras, articles].every((rows) => rows === null)) {
      out.innerHTML = '<p class="error">Unable to load the library. Please try again.</p>';
      return;
    }
    const records = [
      ...(dharma || []).map((row) => rowRecord('dharma', 'Dharma Sūtra', row)),
      ...(gruhya || []).map((row) => rowRecord('gruhya', 'Gṛhya Sūtra', row)),
      ...(mantras || []).map((row) => rowRecord('mantras', 'Vedic Text', row)),
      ...(articles || []).map((row) => rowRecord('articles', 'Article', row)),
      ...astroRecords()
    ].filter(Boolean);
    const notes = await commentaryRecords();
    render(searchIndex([...records, ...notes], term), term);
  } catch (error) {
    out.innerHTML = '<p class="error">Unable to load the library. Please try again.</p>';
    console.error(error);
  }
}

form?.addEventListener('submit', (event) => { event.preventDefault(); run(); });
const initial = new URLSearchParams(location.search).get('q');
if (initial) { input.value = initial; run(); }
