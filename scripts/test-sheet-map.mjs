import assert from 'node:assert/strict';
import { loadSheetsApi } from './lib/load-sheet.mjs';

const api = loadSheetsApi();
const doc = api.classifyHeader('Google Doc URL', 'articles');
assert.equal(doc.role, 'doc');
assert.equal(doc.display, false);

const sutra = api.classifyHeader('Sūtra', 'dharma');
assert.equal(sutra.role, 'translit');
assert.equal(sutra.display, true);

const commentary = api.classifyHeader('Commentary / Explanation', 'dharma');
assert.equal(commentary.display, true);
const schema = api.inspectSchema(['Sūtra', 'Simple Explanation', 'Commentary / Explanation', 'Source'], 'dharma');
const byHeading = Object.fromEntries(schema.columns.map((col) => [col.heading, col.layer]));
assert.equal(byHeading['Commentary / Explanation'], 'deep');
assert.equal(byHeading['Simple Explanation'], 'basic');
assert.equal(byHeading.Source, 'context');

const row = api.rowFromCells('articles', [
  { heading: 'Article ID', role: 'article_id', folded: 'article id', system: true, display: false, index: 0, key: 'article id' },
  { heading: 'Title', role: 'content', folded: 'title', system: false, display: true, layer: 'basic', index: 1, key: 'title' },
  { heading: 'Verification Status', role: 'status', folded: 'verification status', system: true, display: false, index: 2, key: 'verification status' },
  { heading: 'Publish', role: 'publish', folded: 'publish', system: true, display: false, index: 3, key: 'publish' },
  { heading: 'Google Doc URL', role: 'doc', folded: 'google doc url', system: true, display: false, index: 4, key: 'google doc url' }
], ['ART-001', 'Upakarma', 'Verified', 'YES', 'https://docs.google.com/document/d/abc/edit']);
assert.equal(api.isPublic(row), true);
assert.equal(row.google_doc_url, 'https://docs.google.com/document/d/abc/edit');
assert.equal(api.isPublic({ ...row, publish: false }), false);
assert.equal(api.isPublic({ ...row, verification_status: 'Draft', publish: true }), false);
const parsed = api.parseStableId('DS-P1-Pa1-K1-S1');
assert.equal(parsed.prashna, 1);
assert.equal(parsed.patala, 1);
assert.equal(parsed.khanda, 1);
assert.equal(parsed.sutra_number, 1);
console.log('sheet map tests passed');
