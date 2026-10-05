# Contributing

## Branching

Work on a feature branch. Keep `main` deployable to GitHub Pages at https://bramha.org/. Do not commit `node_modules` or `dist`.

This repository is the Bramha.org library. Do not describe it as the Tarabalam project, and do not add the Tarabalam calculation engine.

## Code style

- Edit runtime scripts in `assets/`. Pages load those files directly.
- Prefer the shared header, footer, reader and empty states over a second copy of the markup.
- Match the existing tone: a library, not a course platform. Do not add enrolment, class, or curriculum language.
- Keep pages usable with the keyboard. Give form controls a label. Do not hide focus.

## No fabricated scripture

Do not add sūtras, mantras, bhāṣya, ṭīkā, translations, page numbers, or traditional interpretations in order to fill a layout.

If a field is empty, leave the empty state. Do not auto-correct Sanskrit. Do not publish a generated sentence as if it were the text.

Commentary and topic tables may be created empty. Insert a row only when it is a real, sourced record, and leave it unpublished until it is verified.

## Verification rule

A public page, search hit, topic link, or generated HTML file requires both:

- verification status `Verified`
- publish `YES` / `true`

Check this in the Sheet mapper, the Supabase policies, and the generator before changing a query.

## Testing

```bash
npm install
npm test
```

`npm test` regenerates SEO pages from the live Sheet and then checks:

- header classification and the Verified + Publish rule
- a known public Dharma row and the Upākarma article document
- permanent URLs, titles, canonical links, sitemap and robots rules

Also open the local site and read a Dharma passage, a Gṛhya passage, search, an article, topics, the Tarabalam entrance and the mobile menu.

## Pull request checklist

- Public output still requires Verified and Publish.
- No service-role key, database password, or sync secret was added.
- Permanent sūtra and article URLs still resolve.
- Search stays `noindex,follow`.
- Empty sections stay empty.
- `npm test` passes.
- Tarabalam’s calculation engine was not copied back into this repository.
