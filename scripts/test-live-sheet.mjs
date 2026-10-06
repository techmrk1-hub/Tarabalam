import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { loadKind, loadSheetsApi, publicArticles } from './lib/load-sheet.mjs';

const require = createRequire(import.meta.url);
const routes = require('../assets/seo-routes.js');

const api = loadSheetsApi();
const dharma = await loadKind(api, 'Dharma Sutra', 'dharma');
const articles = await loadKind(api, 'Articles', 'articles');
assert.ok(dharma.publicRows.length > 0, 'expected public dharma rows');
const first = dharma.publicRows.find((row) => row.unique_id === 'DS-P1-Pa1-K1-S1');
assert.ok(first, 'missing DS-P1-Pa1-K1-S1');
assert.match(first.sanskrit_transliteration || first.displayFields.map((field) => field.value).join('\n'), /athātas-sāmayācārikān/);
assert.ok(dharma.publicRows.every((row) => row.verification_status === 'Verified' && row.publish === true));
const article = publicArticles(articles.publicRows).find((row) => row.slug === 'upakarma-tithi');
assert.ok(article, 'missing upakarma article');
assert.match(article.google_doc_url, /docs\.google\.com\/document\/d\//);
assert.equal(publicArticles(articles.publicRows).some((row) => row.language === 'Homepage Slide'), false);
const vinayaka = publicArticles(articles.publicRows).find((row) => row.article_id === 'ART-002');
assert.ok(vinayaka, 'missing ART-002');
assert.equal(vinayaka.verification_status, 'Verified');
assert.equal(vinayaka.publish, true);
assert.match(vinayaka.google_doc_url, /docs\.google\.com\/document\/d\//);
assert.equal(routes.articlePath(vinayaka), '/articles/vinayaka-chaviti/');
console.log(`live sheet tests passed (${dharma.publicRows.length} dharma)`);
