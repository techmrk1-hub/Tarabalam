# Bramha.org

Static site from [techmrk1-hub/Tarabalam](https://github.com/techmrk1-hub/Tarabalam): the **Bramha.org** digital Śāstra knowledge library plus the **Tarabalam** traditional timing dashboard, presented in a quiet minimalist UI. Tarabalam calculation logic is unchanged.

The homepage hero reads approved slide rows from the **Articles** table (language `Homepage Slide`, Featured + Verified + Publish). If fewer than two CMS slides are public, built-in fallback slides are shown.

Brand files live in `assets/brand/`. Favicons and PWA icons are served from the site root. Runtime scripts (`site.js`, library helpers, homepage slides) are copied to `/js/` so production builds keep working.

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

## Production

```bash
npm run build
npm run preview
```

The production build is the `dist/` folder (gitignored). Host `dist` on any static host after `npm run build`.

Custom domain `bramha.org` is recorded in `public/CNAME`.
