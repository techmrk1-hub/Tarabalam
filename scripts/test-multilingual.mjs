import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  TARGETS,
  explanatoryFields,
  sourceHash,
  protectText,
  restoreText,
  prepareFields,
  rebuildFields,
  translationRequestBody,
  textsFromProvider,
  chooseTranslation,
  reviewPatch,
  publicSearchHit,
  scriptCacheKey,
  detectScript
} from '../assets/content-protect.mjs';

const deva = 'धर्मज्ञसमयः प्रमाणम् ।';
const telugu = 'ఆపస్తంబుడు ఇలా చెప్పారు —';
const sample = `${telugu}\n${deva}\nదీనికి భావము ఇది.`;

function mockTranslate(text, target) {
  return text.replace(/[\u0C00-\u0C7F]+/g, (word) => `${target}:${word}`);
}

async function roundTrip(fields, target, terms = [], mutate = (value) => value) {
  const items = prepareFields(fields, terms);
  const translated = items.map((item) => (item.skip ? item.original : mutate(mockTranslate(item.protectedText, target))));
  return rebuildFields(items, translated);
}

const plain = await roundTrip({ summary: 'ఉపాకర్మ అవశ్యం కర్మ' }, 'en');
assert.equal(plain.summary, 'en:ఉపాకర్మ en:అవశ్యం en:కర్మ');

for (const target of TARGETS) {
  const fields = await roundTrip({ summary: 'తెలుగు వాక్యం' }, target);
  assert.ok(fields.summary.startsWith(`${target}:`), target);
}

const html = await roundTrip({ content: '<p>తెలుగు వాక్యం</p>' }, 'hi');
assert.ok(html.content.includes('<p>'), 'html tag preserved');
assert.ok(html.content.includes('hi:తెలుగు'), 'html prose translated');

const quoted = await roundTrip({ content: sample }, 'kn');
assert.ok(quoted.content.includes(deva), 'devanagari quotation restored');
assert.ok(quoted.content.includes('kn:ఆపస్తంబుడు'), 'telugu prose translated');
assert.equal(sample.includes(deva), true);

const terms = [{ source_term: 'ఉపాకర్మ', target_term: 'Upākarman', active: true }];
const termed = await roundTrip({ title: 'ఉపాకర్మ యొక్క ప్రాముఖ్యత' }, 'en', terms);
assert.ok(termed.title.includes('Upākarman'), termed.title);
assert.ok(!termed.title.includes('en:ఉపాకర్మ'));

const linked = await roundTrip({
  notes: 'చూడండి https://bramha.org/dharma-sutra/prasna-1/patala-1/khanda-1/sutra-1/ మరియు Praśna 1.'
}, 'ta');
assert.ok(linked.notes.includes('https://bramha.org/dharma-sutra/prasna-1/patala-1/khanda-1/sutra-1/'));
assert.ok(linked.notes.includes('Praśna 1'));
assert.ok(linked.notes.includes('ta:చూడండి'));

const empty = await roundTrip({ title: '', summary: '   ', content: 'వాక్యం' }, 'en');
assert.equal(empty.title, '');
assert.equal(empty.summary, '   ');
assert.ok(empty.content.startsWith('en:'));

const large = Array.from({ length: 40 }, (_, index) => `<p>పేరా ${index} ధర్మం ${deva}</p>`).join('');
const largeOut = await roundTrip({ content: large }, 'en');
assert.equal(largeOut.content.split(deva).length, 41);
assert.ok(largeOut.content.includes('<p>'));

const encoded = await roundTrip({ content: sample }, 'en', [], (value) => value
  .replaceAll('[', '&#91;')
  .replaceAll(']', '&#93;'));
assert.ok(encoded.content.includes(deva));

assert.throws(() => restoreText('[[BRAMHA_PROTECTED_001]] leftover', []), /PLACEHOLDER_LOST/);

const record = {
  displayFields: [
    { heading: 'Sanskrit (Devanagari)', role: 'deva', value: deva },
    { heading: 'Simple Explanation', role: 'simple', value: 'సరళమైన భావం' },
    { heading: 'Source', role: 'content', value: 'Āpastamba' }
  ]
};
const explain = explanatoryFields(record);
assert.deepEqual(Object.keys(explain), ['Simple Explanation']);
assert.equal(detectScript(deva), 'Devanagari');
assert.equal(detectScript('ధర్మం'), 'Telugu');

const hashA = await sourceHash(explain);
const hashB = await sourceHash({ 'Simple Explanation': 'సరళమైన భావం' });
const hashC = await sourceHash({ 'Simple Explanation': 'మారిన భావం' });
assert.equal(hashA, hashB);
assert.notEqual(hashA, hashC);

const translations = [
  { language: 'kn', review_status: 'Needs Review', publish: false, source_hash: hashA, fields: { 'Simple Explanation': 'draft' } },
  { language: 'en', review_status: 'Verified', publish: true, source_hash: hashA, fields: { 'Simple Explanation': 'A plain meaning' } },
  { language: 'hi', review_status: 'Verified', publish: true, source_hash: 'stale', fields: { 'Simple Explanation': 'old' } }
];
assert.equal(chooseTranslation({ language: 'te', translations, hash: hashA }).mode, 'original');
assert.equal(chooseTranslation({ language: 'kn', translations, hash: hashA }).mode, 'fallback');
assert.match(chooseTranslation({ language: 'kn', translations, hash: hashA }).notice, /Kannada translation is not yet verified/);
assert.equal(chooseTranslation({ language: 'en', translations, hash: hashA }).fields['Simple Explanation'], 'A plain meaning');
assert.equal(chooseTranslation({ language: 'hi', translations, hash: hashA }).mode, 'fallback');

assert.equal(reviewPatch('verify', { review_status: 'Needs Review' }).review_status, 'Verified');
assert.equal(reviewPatch('reject', {}).publish, false);
assert.throws(() => reviewPatch('publish', { review_status: 'Needs Review' }), /Verify the translation/);
assert.deepEqual(reviewPatch('publish', { review_status: 'Verified' }), { publish: true });
assert.equal(reviewPatch('unpublish', {}).publish, false);
assert.equal(reviewPatch('outdated', {}).review_status, 'Outdated');

const hit = publicSearchHit(translations[1], {
  sourceHash: hashA,
  href: '/dharma-sutra/prasna-1/patala-1/khanda-1/sutra-1/',
  title: '1.1.1.1',
  where: '1.1.1.1',
  type: 'Dharma Sūtra'
}, 'plain');
assert.equal(hit.language, 'English');
assert.equal(hit.source, 'Telugu Original');
assert.equal(hit.translation, 'Verified');
assert.equal(publicSearchHit(translations[0], { sourceHash: hashA }, 'draft'), null);
assert.equal(publicSearchHit(translations[2], { sourceHash: hashA }, 'old'), null);

const body = translationRequestBody({
  texts: ['తెలుగు'],
  target: 'en',
  format: 'text',
  projectId: 'demo-project',
  location: 'us-central1',
  model: 'general/translation-llm'
});
assert.equal(body.source, 'te');
assert.equal(body.target, 'en');
assert.equal(body.model, 'projects/demo-project/locations/us-central1/models/general/translation-llm');
assert.deepEqual(textsFromProvider({ data: { translations: [{ translatedText: 'Telugu' }] } }, 1), ['Telugu']);
assert.throws(() => textsFromProvider({ data: { translations: [] } }, 1), /TRANSLATION_PROVIDER_FAILED/);

assert.equal(scriptCacheKey({ source: 'Telugu', target: 'Devanagari', hash: 'abc', nativize: false }), 'Telugu|Devanagari|abc|false');

const edge = fs.readFileSync(new URL('../supabase/functions/translate-content/index.ts', import.meta.url), 'utf8');
assert.match(edge, /google-translation-llm/);
assert.match(edge, /translation\.googleapis\.com\/language\/translate\/v2/);
assert.match(edge, /review_status: 'Needs Review'/);
assert.match(edge, /publish: false/);
assert.doesNotMatch(edge, /GOOGLE_TRANSLATE_API_KEY\s*=\s*['"][A-Za-z0-9]/);
assert.equal(
  fs.readFileSync(new URL('../assets/content-protect.mjs', import.meta.url), 'utf8'),
  fs.readFileSync(new URL('../supabase/functions/translate-content/content-protect.mjs', import.meta.url), 'utf8')
);

const protectedSample = protectText(sample, terms);
assert.ok(protectedSample.text.includes('[[BRAMHA_PROTECTED_'));
assert.ok(!protectedSample.text.includes(deva));
assert.equal(restoreText(protectedSample.text, protectedSample.tokens), sample);

const scriptSamples = [
  ['Devanagari', 'धर्मः'],
  ['Kannada', 'ಧರ್ಮಃ'],
  ['Tamil', 'த'],
  ['IAST', 'dharmaḥ']
];
const teluguSource = 'ధర్మః';
for (const [target, needle] of scriptSamples) {
  const untouched = teluguSource;
  const response = await fetch(`https://aksharamukha-plugin.appspot.com/api/public?${new URLSearchParams({
    source: 'Telugu',
    target,
    text: teluguSource,
    nativize: 'false'
  })}`);
  assert.equal(response.ok, true, target);
  const rendered = await response.text();
  assert.equal(teluguSource, untouched);
  assert.ok(rendered.includes(needle), `${target} rendered ${rendered}`);
}

console.log('multilingual content tests passed');
