-- A new cleaner revision must not keep serving header and footer HTML.

alter table public.article_doc_sources
  add column if not exists cleaner_version text not null default '';

comment on column public.article_doc_sources.cleaner_version is
  'Cleaner revision. A new revision ignores cached HTML and fetches the document again.';
