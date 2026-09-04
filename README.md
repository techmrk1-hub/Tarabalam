# Bramha.org

Static site from [techmrk1-hub/Tarabalam](https://github.com/techmrk1-hub/Tarabalam): the **Bramha.org** digital Śāstra knowledge library plus the **Tarabalam** traditional timing dashboard. Tarabalam calculation logic is unchanged.

The live site is [https://bramha.org/](https://bramha.org/).

Branding comes from the uploaded 18-file Bramha.org logo pack in `assets/brand/`. Pages reuse those files through shared paths. Header, footer, and the tab icon also embed the matching pack files so GitHub Pages still shows the brand if a binary path is not on `main` yet.

| Location | Asset |
| --- | --- |
| Header emblem | `/assets/brand/bramha-icon-circle.png` |
| Footer lockup (cream background) | `/assets/brand/bramha-logo-480w.webp` |
| About lockup | `/assets/brand/bramha-logo-full-transparent.png` |
| Favicon / Apple / PWA | `/favicon.ico`, `/favicon-16x16.png`, `/favicon-32x32.png`, `/apple-touch-icon.png`, `/android-chrome-192x192.png`, `/android-chrome-512x512.png` |
| Social preview | `https://bramha.org/android-chrome-512x512.png` |

Runtime scripts are served from `/js/`. The homepage hero reads approved slide rows from the Articles table (language `Homepage Slide`, Featured + Verified + Publish). If fewer than two CMS slides are public, built-in fallback slides are shown.

## Pages

- **Home** — `index.html`
- **Tarabalam** — `tarabalam/`
- **Śāstra readers** — `dharma-sutra/`, `gruhya-sutra/`
- **Vedic mantras, articles, search** — `vedic-mantras/`, `articles/`, `search/`
- **About** — `about.html`

Sūtra and article data loads from Supabase using the public key in `assets/config.js`.

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
