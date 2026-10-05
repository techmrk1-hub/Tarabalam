-- Glossary architecture for Telugu-master terminology.
-- Rows are entered by the content team. This migration inserts none.

create table if not exists public.translation_terms (
  id uuid primary key default gen_random_uuid(),
  source_language text not null default 'te' check (source_language = 'te'),
  source_term text not null,
  target_language text not null check (target_language in ('en', 'hi', 'kn', 'ta')),
  target_term text not null,
  preserve_exact boolean not null default false,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_language, source_term, target_language)
);

comment on table public.translation_terms is
  'Approved Telugu terminology restored after machine translation. Empty until the content team enters terms.';

alter table public.translation_terms enable row level security;

revoke all on table public.translation_terms from anon, authenticated;

create or replace function public.enforce_translation_review()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    new.review_status := 'Needs Review';
    new.publish := false;
  end if;
  if new.publish is true and new.review_status is distinct from 'Verified' then
    raise exception 'A translation can be published only after it is Verified';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists content_translations_review_guard on public.content_translations;
create trigger content_translations_review_guard
  before insert or update on public.content_translations
  for each row execute function public.enforce_translation_review();

revoke all on function public.enforce_translation_review() from public, anon, authenticated;
