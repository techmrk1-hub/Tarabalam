import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
export const routes = require('../../assets/seo-routes.js');

export function clip(text, max = 160) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

function hasDeep(row) {
  return (row.displayFields || []).some((field) => field.layer === 'deep' && String(field.value || '').trim());
}

function hasMeaning(row) {
  return (row.displayFields || []).some((field) => {
    if (field.layer !== 'basic' || !String(field.value || '').trim()) return false;
    if (['translit', 'deva', 'telugu', 'padaccheda'].includes(field.role)) return false;
    return ['translation', 'word', 'simple', 'telugu_meaning'].includes(field.role)
      || /meaning|translation/i.test(field.heading || '');
  });
}

export function uniqueTitle(kind, row) {
  if (kind === 'dharma' || kind === 'gruhya') {
    const suffix = hasDeep(row) ? 'Text, Meaning & Bhāṣyam' : hasMeaning(row) ? 'Text & Meaning' : 'Text';
    return `${routes.workTitle(kind)} ${routes.citation(kind, row)} – ${suffix} | Bramha.org`;
  }
  return `${row.title || row.display_name || routes.workTitle(kind)} | Bramha.org`;
}

export function uniqueDescription(kind, row) {
  const fields = row.displayFields || [];
  const excerpt = fields.find((field) => field.role === 'translation')?.value
    || fields.find((field) => /translation|meaning/i.test(field.heading || ''))?.value
    || fields.find((field) => field.role === 'translit')?.value
    || row.summary
    || '';
  const lead = kind === 'dharma' || kind === 'gruhya'
    ? `Read ${routes.pageTitle(kind, row)} on Bramha.org.`
    : `${row.title || row.display_name || 'Bramha.org'}.`;
  return clip(`${lead} ${String(excerpt).replace(/\s+/g, ' ').trim()}`.trim(), 160);
}

export function sitemapXml(entries) {
  const body = entries.map((entry) => `  <url><loc>https://bramha.org${entry.path}</loc></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

export function robotsTxt() {
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /internal/',
    'Disallow: /cms/',
    'Disallow: /scripts/',
    'Disallow: /*?id=',
    '',
    'Sitemap: https://bramha.org/sitemap.xml',
    ''
  ].join('\n');
}
