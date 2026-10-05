# Architecture

Bramha.org is a static library. The browser talks to Google Sheets and to Supabase. A Node script writes permanent HTML for verified rows. GitHub Pages serves the repository root at https://bramha.org/. The `CNAME` file stays `bramha.org`.

This repository is not the Tarabalam application. `/tarabalam/` is only an entrance. The calculator lives in its own project.

## Frontend

Shared chrome is `assets/chrome.mjs`, mounted by `assets/shell.js`. Visual rules are `assets/library.css`. Pages are multi-page HTML, not a single bundled application.

| Module | Role |
| --- | --- |
| `assets/config.js` | Public Sheet id, publishable Supabase key, Tarabalam address |
| `assets/sheets.js` | Sheet fetch, header classification, Verified + Publish filter |
| `assets/api.js` | `loadCmsTable` and `sbFetch` |
| `assets/seo-routes.js` | Permanent paths for sūtras, mantras, articles and topics |
| `assets/reader.js` | Śāstra reader, layers, commentaries, passage navigation |
| `assets/search-page.js` | Unified search over verified rows |
| `assets/articles.js` | Article list and Google Doc shell |
| `assets/topics.js` | Topic aggregation |
| `assets/study.js` | Optional bookmarks, notes and reading history |
| `assets/home.js` | Homepage search, featured slides, topic strip |

The reader modes Text & Meaning, Commentary, Prayoga & Context, and All Layers only show or hide fields already stored on the record.

## CMS

Google Sheets is the editorial source. Each tab’s first row is the schema. System columns (identity, hierarchy, verification, publish, slug, Google Doc URL, topic tags) are not printed as body sections. Every other non-empty cell becomes a layer:

- basic — text, script, transliteration, word meaning, translation, simple explanation
- deep — commentary
- context — Prayoga, notes, cross references, source

`/internal/sutra-sync.html` reports the live connection. It is disallowed in `robots.txt`.

## Supabase

Supabase stores `dharma_sutras`, `gruhya_sutras`, `vedic_mantras`, `articles`, `authors`, `categories`, `profiles`, `bookmarks`, `personal_notes` and `reading_history`. Public read policies allow only Verified rows with `publish = true`.

`commentaries`, `topics` and `topic_links` are added by migration and start empty. A commentary row can store:

`commentary_id`, `entity_type`, `entity_id`, `commentary_type`, `title`, `author`, `tradition`, `language`, `text`, `source_title`, `source_page`, `source_url`, `verification_status`, `publish`, `sort_order`.

The reader shows a commentary column from the sūtra record as “Source record”, then any extra verified commentary rows for that passage. Compare mode is available when two or more of those records exist. It does not compose commentary.

Topic pages prefer verified `topics` rows and `topic_links`. They also group Sheet `Topic Tags` when those cells are filled. Empty tags produce an empty topic index, not example pages.

## Google Sheets

The spreadsheet id is in `assets/config.js`. Tabs are Dharma Sutra, Gruhya Sutra, Vedic Mantras and Articles. The browser uses the public gviz endpoint, then CSV. There is no service account in the client.

## Search

Search loads the public rows and matches the stored text. Each result names the field that matched. Commentary search also queries verified `commentaries` rows when that table is reachable. Search does not ask a model to write a scriptural answer. `/search/` is `noindex,follow`.

## Reader

Dharma navigation is Praśna, Paṭala, Khāṇḍa, Sūtra. Gṛhya navigation is Paṭala, Khaṇḍa, Sūtra. Choosing a passage updates the permanent URL. Opening that URL selects the same row. If the Sheet and Supabase are both unavailable, a generated leaf page keeps the published HTML.

## Articles

`/articles/` lists verified articles that are not homepage slides. `/articles/<slug>/` is the shareable page. The Google Doc is embedded with its preview address so fonts, tables, images and Indian scripts stay in the document. `/view.html?slug=` and `/articles/?slug=` remain for older links.

## Auth

Sign-in is optional and uses the publishable key with Supabase Auth. Bookmarks, notes and reading history are limited by row-level security to `auth.uid()`. Public pages do not require a session.

## SEO

`scripts/generate-seo.mjs` reads the same public Sheet and writes:

- one HTML file per verified sūtra and article
- contents pages for Praśna, Paṭala and Khāṇḍa
- commentary and Prayoga indexes that only link to rows which already have those fields
- `sitemap.xml` and `robots.txt`

Pages without a verified row are not created. Search is omitted from the sitemap.

## Data flow

```
Google Sheet  →  browser (sheets.js)  →  reader, search, articles, topics
            ↘
              npm run generate:seo  →  permanent HTML, sitemap
Supabase      →  snapshot, commentaries, topics, personal study
```

Secrets never go in the frontend. If a layer is empty, the page says so.
