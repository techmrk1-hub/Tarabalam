/**
 * Telugu-master content protection, hashing, and publication rules.
 * Script conversion is not handled here. This module never calls Google.
 */

export const LANGUAGES = [
  { code: 'te', label: 'తెలుగు', name: 'Telugu', master: true },
  { code: 'en', label: 'English', name: 'English' },
  { code: 'hi', label: 'हिन्दी', name: 'Hindi' },
  { code: 'kn', label: 'ಕನ್ನಡ', name: 'Kannada' },
  { code: 'ta', label: 'தமிழ்', name: 'Tamil' }
];

export const TARGETS = ['en', 'hi', 'kn', 'ta'];

export const SCRIPTS = [
  { id: 'Devanagari', label: 'Devanagari' },
  { id: 'Telugu', label: 'Telugu' },
  { id: 'Kannada', label: 'Kannada' },
  { id: 'Tamil', label: 'Tamil' },
  { id: 'IAST', label: 'IAST' }
];

const SOURCE_ROLES = new Set(['deva', 'telugu', 'translit', 'padaccheda']);
const SKIP_HEADINGS = /^(source|source page|source url|source references|audio url|featured image url|image|url)$/i;

export function languageByCode(code) {
  return LANGUAGES.find((item) => item.code === code) || null;
}

export function stableJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  const obj = value;
  return `{${Object.keys(obj).sort().map((key) => `${JSON.stringify(key)}:${stableJson(obj[key])}`).join(',')}}`;
}

export async function sha256Hex(text) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function sourceHash(fields) {
  return sha256Hex(stableJson(fields || {}));
}

export function explanatoryFields(record) {
  const fields = {};
  const list = Array.isArray(record?.displayFields) ? record.displayFields : [];
  list.forEach((field) => {
    if (!field || SOURCE_ROLES.has(field.role)) return;
    if (SKIP_HEADINGS.test(String(field.heading || '').trim())) return;
    const value = String(field.value || '');
    if (!value.trim()) return;
    fields[field.heading] = value;
  });
  if (record?.title && !fields.Title && !fields.title) {
    const title = String(record.title).trim();
    if (title) fields.title = title;
  }
  ['summary', 'content'].forEach((key) => {
    if (record?.[key] && !fields[key]) {
      const value = String(record[key]);
      if (value.trim()) fields[key] = value;
    }
  });
  return fields;
}

export function isSourceScriptRole(role) {
  return SOURCE_ROLES.has(role);
}

export function detectScript(text) {
  const value = String(text || '');
  if (/[\u0900-\u097F]/.test(value)) return 'Devanagari';
  if (/[\u0C00-\u0C7F]/.test(value)) return 'Telugu';
  if (/[\u0C80-\u0CFF]/.test(value)) return 'Kannada';
  if (/[\u0B80-\u0BFF]/.test(value)) return 'Tamil';
  return 'IAST';
}

function tokenFor(index) {
  return `[[BRAMHA_PROTECTED_${String(index).padStart(3, '0')}]]`;
}

function pushToken(bucket, value) {
  const token = tokenFor(bucket.length + 1);
  bucket.push({ token, value });
  return token;
}

function maskPattern(text, pattern, bucket) {
  return text.replace(pattern, (match) => pushToken(bucket, match));
}

export function protectText(input, terms = []) {
  const bucket = [];
  let text = String(input ?? '');
  if (!text) return { text, tokens: bucket };

  text = maskPattern(text, /https?:\/\/[^\s<>"']+/g, bucket);
  text = maskPattern(text, /<\/?[a-zA-Z][^>]*>/g, bucket);
  text = maskPattern(text, /[\u0900-\u097F]+(?:[\s\u200c\u200d\u0964\u0965]+[\u0900-\u097F]+)*/g, bucket);
  text = text.replace(/[^\n।॥]{1,240}[।॥]+/g, (match) => {
    if (/[\u0C00-\u0C7F]/.test(match)) return match;
    return pushToken(bucket, match);
  });
  text = maskPattern(
    text,
    /\b(?:DS-P\d+-Pa\d+-K\d+-S-?\d+|GS-Pa\d+-Sec\d+-S-?\d+|(?:Praśna|Prasna|Paṭala|Patala|Khāṇḍa|Khanda|Khaṇḍa|Sūtra|Sutra)\s+\d+|\d+\.\d+\.\d+(?:\.\d+)?)\b/g,
    bucket
  );
  text = maskPattern(
    text,
    /\b[\p{L}]*[āīūṛṝḷṅñṭḍṇśṣḥṃĀĪŪṚṜḶṄÑṬḌṆŚṢḤṂ][\p{L}āīūṛṝḷṅñṭḍṇśṣḥṃĀĪŪṚṜḶṄÑṬḌṆŚṢḤṂ]*\b/gu,
    bucket
  );

  const ordered = [...terms]
    .filter((term) => term && term.active !== false && String(term.source_term || '').trim())
    .sort((a, b) => String(b.source_term).length - String(a.source_term).length);

  ordered.forEach((term) => {
    const source = String(term.source_term);
    const replacement = term.preserve_exact ? source : String(term.target_term || source);
    const parts = text.split(/(\[\[BRAMHA_PROTECTED_\d{3}\]\])/);
    text = parts.map((part) => {
      if (/^\[\[BRAMHA_PROTECTED_\d{3}\]\]$/.test(part) || !part.includes(source)) return part;
      return part.split(source).join(pushToken(bucket, replacement));
    }).join('');
  });

  return { text, tokens: bucket };
}

export function decodeEntities(value) {
  return String(value ?? '')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, num) => String.fromCodePoint(Number(num)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

export function normalizePlaceholders(value) {
  return decodeEntities(value).replace(
    /\[\s*\[\s*BRAMHA_PROTECTED_(\d+)\s*\]\s*\]/g,
    (_, num) => tokenFor(Number(num))
  );
}

export function restoreText(value, tokens) {
  let text = normalizePlaceholders(value);
  const list = [...(tokens || [])].sort((a, b) => b.token.length - a.token.length);
  list.forEach((item) => {
    text = text.split(item.token).join(item.value);
  });
  const missing = text.match(/\[\[BRAMHA_PROTECTED_\d{3}\]\]/);
  if (missing) {
    const error = new Error('PLACEHOLDER_LOST');
    error.token = missing[0];
    throw error;
  }
  return text;
}

export function prepareFields(fields, terms = []) {
  const items = [];
  Object.keys(fields || {}).forEach((key) => {
    const original = fields[key] == null ? '' : String(fields[key]);
    const format = /<[a-z][^>]*>/i.test(original) ? 'html' : 'text';
    if (!original.trim()) {
      items.push({ key, format, skip: true, original, protectedText: '', tokens: [] });
      return;
    }
    const protectedField = protectText(original, terms);
    items.push({
      key,
      format,
      skip: false,
      original,
      protectedText: protectedField.text,
      tokens: protectedField.tokens
    });
  });
  return items;
}

export function rebuildFields(items, translatedByIndex) {
  const fields = {};
  items.forEach((item, index) => {
    if (item.skip) {
      fields[item.key] = item.original;
      return;
    }
    fields[item.key] = restoreText(translatedByIndex[index], item.tokens);
  });
  return fields;
}

export function translationModel(projectId, location = 'us-central1', model = 'general/translation-llm') {
  return `projects/${projectId}/locations/${location}/models/${model}`;
}

export function translationRequestBody({ texts, target, format, projectId, location, model }) {
  return {
    q: texts,
    source: 'te',
    target,
    format: format === 'html' ? 'html' : 'text',
    model: translationModel(projectId, location, model)
  };
}

export function textsFromProvider(payload, expected) {
  const rows = payload?.data?.translations;
  if (!Array.isArray(rows) || rows.length !== expected) {
    throw new Error('TRANSLATION_PROVIDER_FAILED');
  }
  return rows.map((row) => String(row?.translatedText ?? ''));
}

export function chooseTranslation({ language, translations, hash }) {
  if (!language || language === 'te') return { mode: 'original' };
  const name = languageByCode(language)?.name || language;
  const row = (translations || []).find((item) => item
    && item.language === language
    && item.review_status === 'Verified'
    && item.publish === true
    && item.source_hash === hash
    && item.fields
    && typeof item.fields === 'object');
  if (row) return { mode: 'translation', fields: row.fields, language };
  return {
    mode: 'fallback',
    notice: `${name} translation is not yet verified. Showing the Telugu original.`
  };
}

export function reviewPatch(decision, row) {
  const current = row || {};
  if (decision === 'verify') {
    return { review_status: 'Verified', reviewed_at: new Date().toISOString() };
  }
  if (decision === 'reject') return { review_status: 'Rejected', publish: false };
  if (decision === 'publish') {
    if (current.review_status !== 'Verified') {
      const error = new Error('Verify the translation before publishing it.');
      error.status = 409;
      throw error;
    }
    return { publish: true };
  }
  if (decision === 'unpublish') return { publish: false };
  if (decision === 'outdated') return { review_status: 'Outdated', publish: false };
  const error = new Error('Unknown review decision');
  error.status = 400;
  throw error;
}

export function publicSearchHit(translation, record, needle) {
  if (!translation || translation.review_status !== 'Verified' || translation.publish !== true) return null;
  if (!record || translation.source_hash !== record.sourceHash) return null;
  const fields = translation.fields || {};
  const hay = Object.values(fields).join(' ').toLowerCase();
  if (!hay.includes(String(needle || '').toLowerCase())) return null;
  const excerptSource = Object.values(fields).find((value) => String(value).toLowerCase().includes(String(needle).toLowerCase())) || '';
  return {
    type: record.type || 'Translation',
    title: fields.title || fields.Title || record.title || record.entityId,
    href: record.href,
    where: record.where || '',
    language: languageByCode(translation.language)?.name || translation.language,
    source: 'Telugu Original',
    translation: 'Verified',
    heading: 'Verified translation',
    excerpt: String(excerptSource).replace(/\s+/g, ' ').trim().slice(0, 240)
  };
}

export function scriptCacheKey({ source, target, hash, nativize }) {
  return `${source}|${target}|${hash}|${nativize === true}`;
}

export function chunk(list, size) {
  const out = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}
