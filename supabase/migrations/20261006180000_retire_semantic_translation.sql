-- Semantic translation is unused by the site.
-- These statements keep every existing row. They do not drop tables.

comment on table public.content_translations is
  'Retired. Semantic translation is unused. Rows are retained and this migration does not drop the table.';

comment on table public.translation_jobs is
  'Retired. Semantic translation is unused. Rows are retained and this migration does not drop the table.';

comment on table public.translation_terms is
  'Retired glossary for semantic translation. Rows are retained and this migration does not drop the table.';

revoke all on table public.content_translations from anon, authenticated;
revoke all on table public.translation_jobs from anon, authenticated;
revoke all on table public.translation_terms from anon, authenticated;
