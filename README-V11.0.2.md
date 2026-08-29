# Bramha.org V11.0.2 — Clean Reader Patch

This patch removes the **Announcements ticker** from the scripture reader pages and removes the **Verified Reference** sidebar from Dharma Sūtra and Gṛhya Sūtra.

## Replace these files in the repository
- `dharma-sutra/index.html`
- `gruhya-sutra/index.html`
- `vedic-mantras/index.html`
- `assets/bramha.css`

No database, Supabase, verification, content, or Tarabalam logic is changed. The database still exposes only records that are `Verified` and `Publish = YES`; this patch only removes the visible reference panel from the reader UI.
