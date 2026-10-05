# Bramha.org

Bramha.org is a digital Śāstra knowledge library. It preserves, organizes, searches and reads traditional texts. It is not a school, a course catalogue, or an enrolment site.

The public site shows a record only when **verification status is Verified** and **Publish is YES**. Missing commentary stays missing. The library does not invent sūtras, mantras, or bhāṣya.

Live reading comes from the Google Sheet **Bramha.org - Sutra Database**. Supabase holds structured application data and a snapshot used when the Sheet cannot be reached. Tarabalam is a separate application. This repository only links to it.

## Main pages

| Page | Address |
| --- | --- |
| Home | `/` |
| Āpastamba Dharma Sūtra | `/dharma-sutra/` |
| Āpastamba Gṛhya Sūtra | `/gruhya-sutra/` |
| Vedic texts | `/vedic-mantras/` |
| Articles | `/articles/` and `/articles/<slug>/` |
| Older article links | `/view.html?slug=<slug>` and `/articles/?slug=<slug>` |
| Topics | `/topics/` |
| Search | `/search/` |
| Tarabalam entrance | `/tarabalam/` |
| About | `/about.html` |
| Personal study | `/account/` |
| Sheet diagnostics | `/internal/sutra-sync.html` |

A Dharma passage keeps a permanent address such as `/dharma-sutra/prasna-1/patala-1/khanda-1/sutra-1/`. A Gṛhya passage keeps `/gruhya-sutra/patala-1/khanda-1/sutra-1/`.

## Folder structure

Runtime JavaScript and CSS live only in `assets/`. Generated sūtra and article pages live beside the hand-written indexes. GitHub Pages serves this repository root. There is no second copy under `js/` or `public/`.

```
assets/            shared chrome, reader, search, Sheet mapper, styles
articles/          article index and /articles/<slug>/
cms/               Sheet notes and the generated SEO manifest
dharma-sutra/      permanent Dharma pages
gruhya-sutra/      permanent Gṛhya pages
vedic-mantras/     mantra index
search/            unified search
topics/            topic index and /topics/<slug>/
tarabalam/         launcher only; no calculation engine
bhashyam/          index of passages that already include commentary
prayoga/           index of passages that already include Prayoga
account/           optional personal study
internal/          Sheet diagnostics, omitted from the sitemap
scripts/           SEO generator and tests
supabase/          SQL migrations
```

The production site is [https://bramha.org/](https://bramha.org/). The root `CNAME` file is `bramha.org`. Renaming the Git repository does not change that domain.

This repository is the Bramha.org library. Tarabalam is an external Traditional Tool. Set `tarabalamAppUrl` in `assets/config.js` when that application has its own public address. Do not copy its calculation engine here.

## Technology

- Static HTML, CSS and JavaScript, suitable for GitHub Pages
- Vite as the local static server
- Google Sheets as the editorial source
- Supabase Postgres for structured data, optional sign-in, bookmarks, notes and reading history
- A Node generator for crawlable pages

## Run locally

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43147](http://127.0.0.1:43147).

```bash
npm test
npm run build
```

`npm test` regenerates the public pages from the live Sheet, then checks the sheet map, the live rows, and the SEO files. `npm run build` only regenerates those pages. Production is the repository root. There is no application server to deploy.

## How content is published

1. Edit the Google Sheet. Row 1 of each tab is the schema.
2. Mark a row **Verified** and **Publish = YES** when it is ready.
3. The site reads the public Sheet in the browser. Unpublished rows are dropped before display.
4. Run `npm run generate:seo` (or the GitHub Action `.github/workflows/generate-seo.yml`) so permanent HTML pages contain the verified text for search engines.

The Sheet must stay shared as **Anyone with the link → Viewer**. The browser cache is 45 seconds. `?refresh=1` bypasses it.

### Articles

Write the article in Google Docs. Paste the document URL into the Articles tab, with title, slug, language, summary and the same Verified + Publish rule. The site opens that document inside `/articles/<slug>/`, keeping the document’s own formatting. Homepage slides are rows whose language is `Homepage Slide`; they are not articles.

### Verification

Public queries, the reader, search, topic lists and the page generator all require both conditions:

- `verification_status = Verified`
- `publish = true` in Supabase, or `YES` in the Sheet

## Google Sheets and Supabase

Sheet and Supabase settings live in `assets/config.js`. Only the publishable Supabase key belongs there. Do not put a service-role key, database password, or sync secret in this repository.

`assets/sheets.js` is the schema mapper. `assets/api.js` loads a public table from the Sheet and falls back to Supabase. Optional personal study uses Supabase Auth. Notes and bookmarks are readable only by their owner.

New tables for multiple commentaries and topics are in `supabase/migrations/`. They start empty. Do not insert composed Śāstra text to make a page look full.

Set `tarabalamAppUrl` in `assets/config.js` when the separate Tarabalam application has a public address.

## Deploy

GitHub Pages, from the `main` branch, folder `/` (root). The root `CNAME` file is `bramha.org`.

Search pages stay `noindex,follow`. The sitemap lists permanent public URLs and omits search and internal tools.

## Further reading

- [ARCHITECTURE.md](ARCHITECTURE.md) — data flow and page structure
- [CONTRIBUTING.md](CONTRIBUTING.md) — review rules
- [cms/README.md](cms/README.md) — Sheet columns
