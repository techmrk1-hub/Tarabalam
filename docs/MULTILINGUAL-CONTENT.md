# Multilingual content

Telugu is the editorial master. The site chrome — header, navigation, footer, and buttons — stays in English. Only the content inside a record is translated.

## Workflow

```
Telugu original
    → Google Cloud Translation LLM
    → English, Hindi, Kannada, Tamil
    → Needs Review
    → human verification
    → publish
```

Language codes are `te`, `en`, `hi`, `kn`, and `ta`. A change of script is not a translation.

## Two controls

Content Language chooses a reviewed semantic translation: తెలుగు, English, हिन्दी, ಕನ್ನಡ, தமிழ்.

Script chooses how Sanskrit source text is displayed: Devanagari, Telugu, Kannada, Tamil, IAST. That control calls the `aksharamukha` Edge Function. It does not call Aksharamukha from the browser, and it does not translate meaning.

On a sūtra page the script control affects the original text only. Meaning, explanation, commentary, Prayoga, and notes follow Content Language.

## Publication

A public visitor can read a translation only when `review_status` is `Verified` and `publish` is true, and the stored `source_hash` still matches the Telugu fields. Otherwise the page keeps the Telugu original and says that the selected translation is not yet verified.

Generate never verifies and never publishes. A database trigger rejects a published row that is not Verified, and forces every new row to Needs Review.

If the Telugu master changes, its hash changes. Older rows are marked Outdated and are not shown as the translation of the new text. A failed Google request leaves the stored translation text in place and marks the job failed. Visitors do not see the provider error.

## Tables

`content_translations` holds one row per entity and target language. Fields stay in a JSON object with the same keys as the Telugu source. `translation_method` is `machine` and `provider` is `google-translation-llm` for generated drafts.

`translation_jobs` records queued, processing, needs_review, approved, and failed work. `error_message` is not readable by anonymous visitors.

`script_renderings` caches Aksharamukha output. The cache key is source script, target script, SHA-256 of the source text, and `nativize`. The default for śāstra text is `nativize=false`.

`translation_terms` is the glossary. It starts empty. The content team enters a Telugu term and the approved target term. During generation those terms are masked and restored, so Google does not invent a rendering. The table is not a public dictionary and is not seeded with guessed equivalences.

## What is sent to Google

The Edge Function `translate-content` masks, before translation:

- Devanagari and danda-marked source quotations
- sūtra references and stable ids
- URLs
- HTML tags
- IAST words that use diacritics
- approved glossary terms

Telugu prose is translated. The masks are restored afterwards. Source scripture is not sent for semantic translation. Sanskrit written in Telugu script should be kept in Devanagari, or entered as a glossary term, when it must remain untouched.

## Google provider

The function calls Cloud Translation Basic REST v2:

`POST https://translation.googleapis.com/language/translate/v2`

The model path is `projects/{GOOGLE_CLOUD_PROJECT_ID}/locations/{GOOGLE_TRANSLATION_LOCATION}/models/{GOOGLE_TRANSLATION_MODEL}`.

Recommended secrets:

```
GOOGLE_TRANSLATION_LOCATION=us-central1
GOOGLE_TRANSLATION_MODEL=general/translation-llm
```

`GOOGLE_TRANSLATE_API_KEY`, `GOOGLE_CLOUD_PROJECT_ID`, and `TRANSLATION_ADMIN_SECRET` live only in Supabase Edge Function secrets. See `supabase/functions/.env.example`. They are not placed in the browser, in `config.js`, or in Git.

## Admin

`/internal/translations.html` is the review desk. The editor supplies `TRANSLATION_ADMIN_SECRET` for that browser tab. From there they can generate all languages or a selection, preview, verify, reject, publish, unpublish, regenerate, mark outdated, and save a glossary term.

Anonymous visitors cannot generate, verify, publish, edit, or delete translations. Row level security allows them to select only Verified, published translation rows.

## Articles

A Telugu Google Doc stays the master inside the Telugu reader. English, Hindi, Kannada, and Tamil readers show the stored reviewed fields. The Doc iframe is not machine-translated for each visit.

## Search

Search covers the Telugu canonical text and Verified, published translations whose hash still matches. Needs Review text is not indexed. A translation hit is labelled with its language, `Source: Telugu Original`, and `Translation: Verified`.

## Failure

If Google fails, the job is `failed` and the existing translation row is not replaced. If Aksharamukha fails, the reader keeps the canonical source script.
