# Bramha.org V14 — Digital Śāstra Knowledge Library

This version intentionally removes course/teaching-site language. Bramha.org is presented as a **knowledge repository and reference library** for students and researchers.

## Core purpose
- Dharma Sūtra and Gṛhya Sūtra storage/readers
- Vedic text and mantra knowledge
- Articles and research
- Student-friendly layered reading
- Multiple independent commentary traditions
- Topic knowledge pages that connect texts, commentaries and articles

## Reader views in V14
Dharma/Gṛhya readers now provide: Student View, Commentary, Prayoga & Context, and Show All. Existing database fields are reused.

## Recommended future commentary database
For true multiple-commentary support, add a separate `commentaries` table rather than putting many authors into one `commentary` field. Suggested columns:
`commentary_id, entity_type, entity_id, commentary_type, title, author, tradition, language, text, source_title, source_page, source_url, verification_status, publish, sort_order`.

Possible `commentary_type` values: Bhāṣya, Vṛtti, Ṭīkā, Vivaraṇa, traditional explanation, modern scholarly note. Keep each source separately attributed and verified.

No scripture content was generated or changed by this UI update. Tarabalam logic and the existing Supabase public verification filter remain untouched.
