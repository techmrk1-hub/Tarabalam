# Bramha.org — Stage 2 Merge

This package converts Bramha.org into the umbrella homepage while preserving the existing Tarabalam app at `/tarabalam/`.

## What changes
- Root `index.html` becomes the new Bramha.org homepage.
- Existing Tarabalam source is copied to `tarabalam/index.html`.
- Dharma Sūtra, Gṛhya Sūtra, Vedic Mantras, Articles and Search remain as Stage‑1 routes.
- All Śāstra readers use the Supabase publishable key and rely on RLS plus `Verified + Publish YES` filters.

## IMPORTANT — keep these existing repository files
Do NOT delete the existing root guide images:
- `1.jpg`
- `2.jpg`
- `3.jpg`
- `4.jpg`
- `5.jpg`
- `6.jpg`

The moved Tarabalam page references them as `../1.jpg` … `../6.jpg`.

Also keep any existing `CNAME` file or custom-domain configuration unchanged.

## Expected routes after deployment
- `/` — Bramha.org homepage
- `/tarabalam/` — existing Tarabalam application
- `/dharma-sutra/`
- `/gruhya-sutra/`
- `/vedic-mantras/`
- `/articles/`
- `/search/`

## Safety
The package does not change Tarabalam calculation logic or its multilingual rules. It only changes the six guide-image paths because the app moves one directory deeper.
