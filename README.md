# Bramha.org

Static site from [techmrk1-hub/Tarabalam](https://github.com/techmrk1-hub/Tarabalam): the **Bramha.org** digital Śāstra knowledge library plus the **Tarabalam** traditional timing dashboard, presented in a quiet minimalist UI. Tarabalam calculation logic is unchanged.

The homepage hero reads approved slide rows from the **Articles** table (language `Homepage Slide`, Featured + Verified + Publish). If fewer than two CMS slides are public, built-in fallback slides are shown.

Brand marks and favicons use files already published at the site root: `/favicon.png` (tab icon and Apple touch icon), `/brand-seal.png` (header mark), and `/bramha-logo-trim.png` (footer and About). Runtime scripts (`site.js`, library helpers, homepage slides, Tarabalam engine) are served from `/js/`.

Slides autoplay every 7 seconds and support arrows and dots.

## What’s here

- **Home** — knowledge library landing page (`index.html`)
- **Tarabalam** — multilingual Tarabalam calculator (`tarabalam/`)
- **Śāstra readers** — Āpastamba Dharma Sūtra and Gṛhya Sūtra (`dharma-sutra/`, `gruhya-sutra/`)
- **Vedic mantras, articles, search** — additional library sections
- **About** — `about.html`

Sūtra/article data is loaded from Supabase using the public (publishable) key in `assets/config.js`.

## Run locally

```bash
npm install
npm run dev
```

Then open [http://127.0.0.1:43147](http://127.0.0.1:43147). The Tarabalam tool is at `/tarabalam/`.

Requires Node.js 20+.

## Production build

```bash
npm run build
npm run preview
```

The production build is the `dist/` folder (gitignored). Point any static host at `dist/`.

## GitHub Pages (no Vercel)

The site is a static multi-page app. To serve it from this repository:

1. Open [Tarabalam Settings → Pages](https://github.com/techmrk1-hub/Tarabalam/settings/pages)
2. Set **Source** to **Deploy from a branch**
3. Branch **main**, folder **/ (root)**
4. Save

Custom domain `bramha.org` is already in the root `CNAME` file. After Pages is on, attach that domain in the same settings page if you want the site on bramha.org.

## Repository

https://github.com/techmrk1-hub/Tarabalam
