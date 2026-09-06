# Bramha.org Sūtra CMS

The Google Sheet **Bramha.org - Sutra Database** is the live schema and content source. The website reads the public Sheet in the browser. No Apps Script deploy or extra Google authorization is required while the spreadsheet stays **Anyone with the link → Viewer**.

## How schema detection works

1. The first row of each tab is the schema.
2. Every later row becomes `{ heading → cell value }`.
3. A small rule set marks technical columns as **system fields**.
4. Every other non-blank heading is a **display field**.
5. The Sūtra page renders those headings and values in Sheet column order.
6. Empty cells do not create sections on that record.
7. Completely blank heading cells are ignored.
8. Dharma and Gṛhya tabs are parsed independently.

## System fields (not shown as content headings)

Matched by folded header name, plus any extras in `BRAMHA_CONFIG.googleSheet.systemHeaders`:

- Identity: Unique ID / Sutra ID / Article ID / slug
- Hierarchy: Praśna, Paṭala, Khāṇḍa, Section, Sūtra Number
- Visibility: Publish / visibility, Verification Status
- Metadata: sort, type/classification, category, author, featured, language, published date, last updated
- Internal: internal notes
- Display name (used as the page title, not a body heading)

Audio, image, and URL columns are **display** fields with specialized players/links.

## Display fields

Any other heading is rendered automatically: Meaning, Commentary, a renamed heading, Ācārya Notes, Modern Application, Cross References, and any future column.

Specialized rendering (still using the live heading text):

- Sanskrit Devanagari / Telugu / transliteration styling
- Whole-cell `http(s)` links
- Audio and image URLs
- JSON string arrays as lists

## Rows, IDs, and cache

- A new public record appears when its Unique ID is present and **Verified + Publish = YES**.
- Routes use Unique ID (`DS-P1-Pa1-K1-S1`), not row number.
- Browser `sessionStorage` cache is **45 seconds** and stores the header fingerprint. `?refresh=1` bypasses it.
- Diagnostics: `/internal/sutra-sync.html`

## Public SEO pages

`npm run generate:seo` reads the same public Sheet rows and writes crawlable HTML for every verified Sūtra, mantra, and article. Re-run it after publishing new rows, or enable `.github/workflows/generate-seo.yml` on GitHub. Unpublished rows are never written to public URLs.
