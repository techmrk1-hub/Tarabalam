import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  SCRIPTS,
  conversionSource,
  shouldRequestScript,
  scriptCacheKey
} from '../assets/content-protect.mjs';

assert.deepEqual(SCRIPTS.map((item) => item.id), ['Telugu', 'Devanagari', 'Kannada', 'Tamil', 'IAST']);
assert.deepEqual(SCRIPTS.map((item) => item.label), ['తెలుగు', 'देवनागरी', 'ಕನ್ನಡ', 'தமிழ்', 'IAST']);

const telugu = 'ధర్మః';
assert.equal(conversionSource(telugu), 'Telugu');
assert.equal(conversionSource('धर्मः'), 'Devanagari');
assert.equal(conversionSource('ಧರ್ಮಃ'), 'Kannada');
assert.equal(conversionSource('தர்ம'), 'Tamil');
assert.equal(conversionSource('dharmaḥ'), 'IAST');
assert.equal(conversionSource('English meaning'), '');
assert.equal(shouldRequestScript(telugu, 'Telugu'), false);
assert.equal(shouldRequestScript(telugu, 'Kannada'), true);
assert.equal(shouldRequestScript('English meaning', 'Kannada'), false);
assert.equal(shouldRequestScript('धर्मः', 'Telugu'), false);
assert.equal(scriptCacheKey({ source: 'Telugu', target: 'Devanagari', hash: 'abc', nativize: false }), 'Telugu|Devanagari|abc|false');

const languages = fs.readFileSync(new URL('../assets/languages.mjs', import.meta.url), 'utf8');
assert.match(languages, /Script View/);
assert.match(languages, /bramha_script_view/);
assert.match(languages, /\/functions\/v1\/aksharamukha/);
assert.match(languages, /nativize = false/);
assert.match(languages, /ARTICLE_NATIVIZE = true/);
assert.match(languages, /replaceChildren\(element\)/);
assert.match(languages, /data-article-body/);
assert.doesNotMatch(languages, /host\.appendChild\(local\)/);
assert.doesNotMatch(languages, /aksharamukha-plugin\.appspot\.com/);
assert.doesNotMatch(languages, /content_translations/);
assert.doesNotMatch(languages, /Content Language/);
assert.doesNotMatch(languages, /translate-content/);
assert.match(languages, /\/functions\/v1\/article-doc-content/);
assert.match(languages, /data-bramha-content/);
assert.match(languages, /transliterable-content/);
assert.match(languages, /articleScriptBody/);
assert.doesNotMatch(languages, /embedded document stays/);
assert.doesNotMatch(languages, /document\.body/);

const cleaner = await import('../supabase/functions/article-doc-content/clean-doc.mjs');
const cleaned = cleaner.cleanDocHtml(`<html><head><style>.c1{font-weight:700}.c3{text-align:center}</style></head><body><div><p><a href="https://bramha.org/">Bramha.org</a> |</p><hr></div><p class="c3"><span class="c1">&#3111;&#3120;&#3149;&#3118;&#3075;</span> &mdash; note</p><p><a href="https://www.google.com/url?q=https://bramha.org/about.html&amp;sa=D">link</a></p><ul><li>one</li></ul><blockquote>quoted</blockquote><script>alert(1)</script><p>English only</p><div><hr><p>person@example.com</p></div></body></html>`);
assert.equal(cleaned.includes('<script'), false);
assert.equal(cleaned.includes('style='), false);
assert.equal(cleaned.includes('Bramha.org'), false);
assert.equal(cleaned.includes('person@example.com'), false);
assert.equal(cleaned.includes('&mdash;'), false);
assert.equal(cleaned.includes('<div'), false);
assert.match(cleaned, /<p class="doc-center"><strong>ధర్మః<\/strong> — note<\/p>/);
assert.match(cleaned, /href="https:\/\/bramha.org\/about.html"/);
assert.match(cleaned, /<ul><li>one<\/li><\/ul>/);
assert.match(cleaned, /<blockquote>quoted<\/blockquote>/);
assert.match(cleaned, /<p>English only<\/p>/);

const docCache = fs.readFileSync(new URL('../supabase/migrations/20261006193000_article_doc_sources.sql', import.meta.url), 'utf8');
assert.match(docCache, /article_doc_sources/);
assert.match(docCache, /content_hash/);
assert.doesNotMatch(docCache, /^\s*drop table/im);
const cleanerVersion = fs.readFileSync(new URL('../supabase/migrations/20261006200000_article_doc_cleaner_version.sql', import.meta.url), 'utf8');
assert.match(cleanerVersion, /cleaner_version/);
assert.doesNotMatch(cleanerVersion, /^\s*drop table/im);

const reader = fs.readFileSync(new URL('../assets/reader.js', import.meta.url), 'utf8');
assert.match(reader, /dataset\.canonical/);
assert.doesNotMatch(reader, /data-explain/);

const search = fs.readFileSync(new URL('../assets/search-page.js', import.meta.url), 'utf8');
assert.doesNotMatch(search, /content_translations/);

const retiredPage = fs.readFileSync(new URL('../internal/translations.html', import.meta.url), 'utf8');
assert.doesNotMatch(retiredPage, /Generate All/);
assert.doesNotMatch(retiredPage, /translation-admin/);

const retiredFunction = fs.readFileSync(new URL('../supabase/functions/translate-content/index.ts', import.meta.url), 'utf8');
assert.match(retiredFunction, /Semantic translation has been removed/);
assert.doesNotMatch(retiredFunction, /translation\.googleapis\.com/);
assert.equal(fs.existsSync(new URL('../assets/translation-admin.js', import.meta.url)), false);

const akshara = fs.readFileSync(new URL('../supabase/functions/aksharamukha/index.ts', import.meta.url), 'utf8');
assert.match(akshara, /script_renderings/);
assert.match(akshara, /source_script/);
assert.match(akshara, /target_script/);
assert.match(akshara, /source_hash/);
assert.match(akshara, /nativize/);
assert.match(akshara, /TamilRemoveNumbers/);
assert.match(akshara, /TamilRemoveApostrophe/);
assert.match(akshara, /aksharamukha-plugin\.appspot\.com/);
assert.match(akshara, /Telugu/);
assert.match(akshara, /IAST/);

const cleanup = fs.readFileSync(new URL('../supabase/migrations/20261006180000_retire_semantic_translation.sql', import.meta.url), 'utf8');
assert.match(cleanup, /content_translations/);
assert.match(cleanup, /translation_jobs/);
assert.doesNotMatch(cleanup, /^\s*drop table/im);

const scriptSamples = [
  ['Devanagari', 'धर्मः'],
  ['Kannada', 'ಧರ್ಮಃ'],
  ['Tamil', 'த'],
  ['IAST', 'dharmaḥ']
];
for (const [target, needle] of scriptSamples) {
  const response = await fetch(`https://aksharamukha-plugin.appspot.com/api/public?${new URLSearchParams({
    source: 'Telugu',
    target,
    text: telugu,
    nativize: 'false'
  })}`);
  assert.equal(response.ok, true, target);
  const rendered = await response.text();
  assert.equal(telugu, 'ధర్మః');
  assert.ok(rendered.includes(needle), `${target} rendered ${rendered}`);
}

console.log('script view tests passed');
