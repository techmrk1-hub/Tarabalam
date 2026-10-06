export const SEARCH_PLACEHOLDER = 'Search Śāstra, Vedic texts, articles, or Astro tools';

/** Tools that are not rows in the Sheet. Add the next Astro utility here. */
export const ASTRO_TOOLS = [
  {
    type: 'Astro Tool',
    id: 'tarabalam',
    title: 'Tarabalam',
    description: 'Check birth-star and current-star relationship',
    keywords: ['tarabalam', 'tara balam', 'nakshatra', 'janma nakshatra', 'muhurta'],
    url: '/tarabalam/'
  }
];

const ALIASES = [
  ['upakarma', 'upakarman', 'upakarmam'],
  ['ashaucha', 'asaucha', 'asauca', 'ashauca'],
  ['gruhya', 'grihya', 'grhya'],
  ['sandhyavandanam', 'sandhyavandan', 'sandhyavandana'],
  ['tarabalam', 'tarabala']
];

const STOP = new Set(['during', 'the', 'and', 'of', 'for', 'in', 'on', 'to', 'with', 'a', 'an', 'or']);

export function fold(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function compact(value) {
  return fold(value).replace(/ /g, '');
}

export function isSearchable(row) {
  if (!row || typeof row !== 'object') return false;
  const status = String(row.verification_status || '').trim().toLowerCase();
  const verified = status === 'verified' || status === 'yes' || status === 'y' || status === 'true' || status === '1';
  const publish = row.publish === true || ['yes', 'y', 'true', '1', 'publish'].includes(String(row.publish ?? '').trim().toLowerCase());
  return verified && publish;
}

function aliasSet(token) {
  const folded = fold(token);
  const group = ALIASES.find((items) => items.includes(folded));
  return group ? group.slice() : [folded];
}

function phraseForms(query) {
  const words = fold(query).split(' ').filter(Boolean);
  if (!words.length) return [];
  let forms = [''];
  for (const word of words) {
    const next = [];
    for (const form of forms) {
      for (const alt of aliasSet(word)) next.push(form ? `${form} ${alt}` : alt);
    }
    forms = next;
    if (forms.length > 48) break;
  }
  return forms;
}

function wordHit(word, alt) {
  if (!word || !alt || alt.length < 4 || word.length < 4) return false;
  if (word === alt || word.startsWith(alt)) return true;
  return word.length >= 5 && alt.startsWith(word);
}

export function astroRecords() {
  return ASTRO_TOOLS.map((tool) => ({
    type: tool.type || 'Astro Tool',
    id: tool.id || tool.url,
    title: tool.title,
    summary: tool.description || '',
    text: [tool.description, ...(tool.keywords || []), tool.url].filter(Boolean).join('\n'),
    tags: tool.keywords || [],
    url: tool.url,
    citation: ''
  }));
}

export function scoreRecord(record, query) {
  const qFold = fold(query);
  if (qFold.length < 2) return 0;
  const qCompact = compact(query);
  const qCite = String(query || '').trim().toLowerCase().replace(/\s+/g, '');
  const words = qFold.split(' ').filter(Boolean);
  const forms = phraseForms(query);
  const titleFold = fold(record.title);
  const titleCompact = compact(record.title);
  const idFold = fold(record.id);
  const cite = String(record.citation || '').trim().toLowerCase().replace(/\s+/g, '');
  const tags = (record.tags || [])
    .flatMap((tag) => String(tag).split(/[,;|]/))
    .map((tag) => fold(tag))
    .filter(Boolean);
  const summaryFold = fold(record.summary);
  const textFold = fold(`${record.summary || ''} ${record.text || ''}`);
  const packed = compact(`${record.title || ''} ${record.summary || ''} ${record.text || ''} ${tags.join(' ')}`);

  let score = 0;
  const compactTitle = qCompact.length >= 5 && /[a-z]/.test(qCompact) && titleCompact === qCompact;
  if ((titleFold && titleFold === qFold) || compactTitle) score = 100;

  const idHit = (idFold && idFold === qFold) || (cite && qCite.includes('.') && cite === qCite);
  if (idHit) score = Math.max(score, 90);

  if (tags.some((tag) => tag === qFold || forms.includes(tag))) score = Math.max(score, 80);

  const inTitle = forms.some((form) => form.length >= 3 && titleFold.includes(form));
  const inBody = forms.some((form) => form.length >= 3 && (summaryFold.includes(form) || textFold.includes(form)));
  if (inTitle) score = Math.max(score, 70);
  else if (inBody) score = Math.max(score, 60);

  if (/[a-z]/.test(qCompact) && qCompact.length >= 5 && packed.includes(qCompact)) {
    score = Math.max(score, titleCompact.includes(qCompact) ? 70 : 55);
  }

  const contentWords = words.filter((word) => word.length >= 3 && !STOP.has(word));
  if (contentWords.length) {
    const blobWords = fold(`${record.title} ${record.id} ${record.summary} ${record.text} ${(record.tags || []).join(' ')}`).split(' ').filter(Boolean);
    const all = contentWords.every((word) => aliasSet(word).some((alt) => blobWords.some((bw) => wordHit(bw, alt))));
    if (all) score = Math.max(score, 40);
  }
  return score;
}

export function excerptFor(record, query) {
  const summary = String(record.summary || '').replace(/\s+/g, ' ').trim();
  const body = String(record.excerptSource || '').replace(/\s+/g, ' ').trim();
  const fallback = String(record.text || '').replace(/\s+/g, ' ').trim();
  const titleHit = fold(record.title) === fold(query)
    || (compact(query).length >= 5 && compact(record.title) === compact(query));
  const needle = String(query || '').trim().toLowerCase();
  let raw = titleHit && summary ? summary : '';
  if (!raw && needle.length >= 2) {
    raw = [summary, body].find((part) => part && part.toLowerCase().includes(needle)) || '';
  }
  if (!raw) raw = summary || body || fallback;
  if (!raw) return '';
  const at = needle.length >= 2 ? raw.toLowerCase().indexOf(needle) : -1;
  const start = at < 0 ? 0 : Math.max(0, at - 80);
  const slice = raw.slice(start, start + 240);
  return (start > 0 ? '…' : '') + slice + (raw.length > start + 240 ? '…' : '');
}

export function searchIndex(records, query, limit = 60) {
  const ranked = [];
  for (const record of records || []) {
    const score = scoreRecord(record, query);
    if (score <= 0) continue;
    ranked.push({ ...record, score, excerpt: excerptFor(record, query) });
  }
  ranked.sort((a, b) => b.score - a.score || String(a.title).localeCompare(String(b.title)));
  return ranked.slice(0, limit);
}
