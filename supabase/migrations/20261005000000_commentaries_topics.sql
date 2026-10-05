-- Additive schema for commentaries, topics, and the article document address.
-- No Śāstra rows are inserted by this migration.

alter table public.articles
  add column if not exists google_doc_url text;

create table if not exists public.commentaries (
  commentary_id text primary key,
  entity_type text not null,
  entity_id text not null,
  commentary_type text,
  title text,
  author text,
  tradition text,
  language text,
  text text,
  source_title text,
  source_page text,
  source_url text,
  verification_status text not null default 'Needs Review',
  publish boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint commentaries_verification_status_check
    check (verification_status = any (array['Draft','Needs Review','Reviewed','Verified'])),
  constraint commentaries_entity_type_check
    check (entity_type = any (array['dharma_sutra','gruhya_sutra','vedic_mantra','article']))
);

create index if not exists commentaries_entity_idx
  on public.commentaries (entity_type, entity_id);

create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  language text,
  summary text,
  description text,
  publish boolean not null default false,
  verification_status text not null default 'Needs Review',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint topics_verification_status_check
    check (verification_status = any (array['Draft','Needs Review','Reviewed','Verified']))
);

create table if not exists public.topic_links (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics (id) on delete cascade,
  entity_type text not null,
  entity_id text not null,
  relationship_type text,
  sort_order integer not null default 0,
  unique (topic_id, entity_type, entity_id, relationship_type)
);

alter table public.commentaries enable row level security;
alter table public.topics enable row level security;
alter table public.topic_links enable row level security;

drop policy if exists public_read_verified_commentaries on public.commentaries;
create policy public_read_verified_commentaries
  on public.commentaries for select to anon, authenticated
  using (publish = true and verification_status = 'Verified');

drop policy if exists public_read_verified_topics on public.topics;
create policy public_read_verified_topics
  on public.topics for select to anon, authenticated
  using (publish = true and verification_status = 'Verified');

drop policy if exists public_read_topic_links on public.topic_links;
create policy public_read_topic_links
  on public.topic_links for select to anon, authenticated
  using (exists (
    select 1 from public.topics t
    where t.id = topic_links.topic_id
      and t.publish = true
      and t.verification_status = 'Verified'
  ));

grant select on public.commentaries, public.topics, public.topic_links to anon, authenticated;
grant select, insert, update, delete on public.commentaries, public.topics, public.topic_links to service_role;

do $$
declare r record;
begin
  for r in
    select conrelid::regclass as table_name, conname
    from pg_constraint
    where contype = 'c'
      and conrelid in ('public.bookmarks'::regclass, 'public.personal_notes'::regclass, 'public.reading_history'::regclass)
      and pg_get_constraintdef(oid) ilike '%content_type%'
  loop
    execute format('alter table %s drop constraint %I', r.table_name, r.conname);
  end loop;
end $$;

alter table public.bookmarks
  add constraint bookmarks_content_type_check
  check (content_type = any (array['dharma_sutra','gruhya_sutra','vedic_mantra','article','topic','commentary']));

alter table public.personal_notes
  add constraint personal_notes_content_type_check
  check (content_type = any (array['dharma_sutra','gruhya_sutra','vedic_mantra','article','topic','commentary']));

alter table public.reading_history
  add constraint reading_history_content_type_check
  check (content_type = any (array['dharma_sutra','gruhya_sutra','vedic_mantra','article','topic','commentary']));

create unique index if not exists bookmarks_user_content_idx
  on public.bookmarks (user_id, content_type, content_id);

create unique index if not exists reading_history_user_content_idx
  on public.reading_history (user_id, content_type, content_id);
