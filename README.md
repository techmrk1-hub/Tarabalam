# Bramha.org

Static site from [techmrk1-hub/Tarabalam](https://github.com/techmrk1-hub/Tarabalam): the **Bramha.org** digital Śāstra knowledge library plus the **Tarabalam** traditional timing dashboard. Tarabalam calculation logic is unchanged.

The live site is [https://bramha.org/](https://bramha.org/).

Branding comes from the uploaded 18-file Bramha.org logo pack in `assets/brand/`. Pages reuse those files through shared header, footer, and About markup. When a pack binary is not on GitHub Pages yet, `js/brand.js` reassembles the original pack files from `assets/brand-parts/`.

| Location | Asset |
| --- | --- |
| Header emblem | `/assets/brand/android-chrome-192x192.png` (512px for 3× displays) |
| Footer lockup (cream background) | `/assets/brand/bramha-logo-full.webp` (srcset 320 / 480 / 1160) |
| About lockup | `/assets/brand/bramha-logo-full-transparent.png` |
| Favicon / Apple / PWA | `/favicon.ico`, `/favicon-16x16.png`, `/favicon-32x32.png`, `/apple-touch-icon.png`, `/android-chrome-192x192.png`, `/android-chrome-512x512.png` |
| Social preview | `https://bramha.org/android-chrome-512x512.png` |

Runtime scripts are served from `/js/`. The homepage hero reads approved slide rows from the Articles table (language `Homepage Slide`, Featured + Verified + Publish). If fewer than two CMS slides are public, built-in fallback slides are shown.

## Pages

- **Home** — `index.html`
- **Tarabalam** — `tarabalam/`
- **Śāstra readers** — `dharma-sutra/`, `gruhya-sutra/`
- **Permanent Sūtra URLs** — `/dharma-sutra/prasna-1/patala-1/khanda-1/sutra-1/`, `/gruhya-sutra/patala-1/khanda-1/sutra-1/`
- **Vedic mantras, articles, search** — `vedic-mantras/`, `articles/`, `search/`
- **About** — `about.html`

The existing dropdown readers stay in place. Selecting a Sūtra updates the browser to the permanent URL. Opening that URL loads the same record and prerenders the public text for search engines.

Regenerate crawlable pages from the live public Sheet:

```bash
npm run generate:seo
```

Only **Verified + Publish = YES** rows are written. Search stays `noindex,follow`. After publishing new rows, run the generator again or use the GitHub Action `.github/workflows/generate-seo.yml`.

Set Google Search Console verification or GA4 later in `assets/config.js` → `seo.googleSiteVerification` / `seo.ga4MeasurementId`. Do not invent tokens.

Sūtra and article data is managed in the Google Sheet **Bramha.org - Sutra Database**. Row 1 is the live field list: readers render those headings and values in Sheet order. Only rows marked **Verified** and **Publish = YES** are public. The browser cache is 45 seconds and includes the header row, so renamed or added columns are not kept forever. If the Sheet is unreachable, the page shows a visible error and a dated Supabase snapshot.

See `cms/README.md` for the connection path and `/internal/sutra-sync.html` for diagnostics.

## Run locally

```bash
npm install
npm run dev
```

Then open [http://127.0.0.1:43147](http://127.0.0.1:43147). The Tarabalam tool is at `/tarabalam/`.

Requires Node.js 20+.

## GitHub Pages (no Vercel)

1. Open [Tarabalam Settings → Pages](https://github.com/techmrk1-hub/Tarabalam/settings/pages)
2. Set **Source** to **Deploy from a branch**
3. Branch **main**, folder **/ (root)**
4. Save

Custom domain `bramha.org` is already in the root `CNAME` file.

## Repository

https://github.com/techmrk1-hub/Tarabalam
