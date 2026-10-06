-- Cached public Google Doc HTML for Script View.
-- This is a display derivative. It does not replace the canonical document.

create table if not exists public.article_doc_sources (
  doc_id text primary key,
  article_id text not null default '',
  content_hash text not null,
  html text not null,
  fetched_at timestamptz not null default now()
);

comment on table public.article_doc_sources is
  'Cached public Google Doc HTML used only to render Script View. It does not replace the canonical document.';

alter table public.article_doc_sources enable row level security;

revoke all on table public.article_doc_sources from anon, authenticated;
