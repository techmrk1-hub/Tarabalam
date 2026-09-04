# Bramha.org

Static site from [techmrk1-hub/Tarabalam](https://github.com/techmrk1-hub/Tarabalam): the **Bramha.org** digital Śāstra knowledge library plus the **Tarabalam** traditional timing dashboard. Tarabalam calculation logic is unchanged.

The live site is [https://bramha.org/](https://bramha.org/).

Brand marks and favicons use files at the site root:

- `/favicon.png` — tab icon and Apple touch icon
- `/brand-seal.png` — header mark
- `/bramha-logo-trim.png` — footer and About

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
