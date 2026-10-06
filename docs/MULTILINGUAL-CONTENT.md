# Script view

Telugu is the canonical content. Bramha.org does not translate its meaning.

Visitors can display that same text in another writing system. The site chrome — header, navigation, menus, buttons, and footer — stays in English.

## Flow

```
Telugu master content
        ↓
Supabase aksharamukha Edge Function
        ↓
script_renderings cache
        ↓
Selected script
```

The browser calls `POST /functions/v1/aksharamukha`. It does not call Aksharamukha itself.

```json
{
  "text": "...",
  "source": "Telugu",
  "target": "Kannada",
  "nativize": false
}
```

Targets are Telugu, Devanagari, Kannada, Tamil, and IAST. Telugu is the default. Choosing Telugu shows the stored text and does not call the function.

The function looks up `script_renderings` by `source_script`, `target_script`, `source_hash`, and `nativize`. A hit returns the cached rendering. A miss calls Aksharamukha once and stores the result.

Two profiles share that function:

- Śāstra and Vedic text (sūtra reader) sends `nativize: false`. Tamil keeps Aksharamukha’s phonetic number markers so Sanskrit sounds are not collapsed.
- Article prose sends `nativize: true`. For Tamil, the function also applies `TamilRemoveNumbers` and `TamilRemoveApostrophe`, so a Tamil reader does not see superscript pronunciation markers. Devanagari, Kannada, and IAST stay the same writing of the Telugu source. This does not change the source and it is not used for the sūtra reader.

Generated text is display-only. The function writes the cache table and never updates the Telugu source.

## Script View

The control is:

Script View — తెలుగు, देवनागरी, ಕನ್ನಡ, தமிழ், IAST

The choice is stored in `localStorage` as `bramha_script_view` and follows the reader through the session.

It applies to Dharma Sūtra text, Gṛhya Sūtra text, Vedic text, Sanskrit quotations, Telugu explanations, commentary text, and an article title, summary, breadcrumb title, and body. An article asks `POST /functions/v1/article-doc-content` for cleaned HTML, then converts text nodes inside that article only. The same local article is used for Telugu and for every other script, so the page never shows the Google Doc embed and a second copy together. Headers, footers, and running contact lines from the document export are left out. HTML tags are not converted. The selected script stays on the previous button until the title, summary, and body are replaced together. English interface labels and stored English-only fields are left as written.

## Failure

If conversion fails, the page shows the Telugu original. An article says “This script view is temporarily unavailable. Showing the Telugu original.” The visitor does not see the provider error, and the field is not left blank.

## Retired semantic translation

`content_translations`, `translation_jobs`, and `translation_terms` are no longer read or written by the site. Their rows are retained. `supabase/migrations/20261006180000_retire_semantic_translation.sql` revokes anonymous and signed-in access and does not drop the tables. `/internal/translations.html` no longer generates or reviews translations.
