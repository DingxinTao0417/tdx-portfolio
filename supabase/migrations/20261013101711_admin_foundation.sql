-- Admin foundation: owner allowlist, contact messages, page views, editable site data,
-- posts, projects and a public media bucket. Idempotent so it can be re-applied safely.

-- ---------------------------------------------------------------- admins
create table if not exists public.admins (
  github_id bigint primary key,
  login text not null,
  added_at timestamptz not null default now()
);
alter table public.admins enable row level security;

-- The signed-in user is an admin when their GitHub identity is on the allowlist. Identities are
-- written by Supabase Auth only, so this cannot be spoofed through user-editable metadata.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.identities i
    join public.admins a on a.github_id::text = i.provider_id
    where i.user_id = (select auth.uid()) and i.provider = 'github'
  );
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "admins read allowlist" on public.admins;
create policy "admins read allowlist" on public.admins
  for select to authenticated using ((select public.is_admin()));

insert into public.admins (github_id, login)
values (144394567, 'DingxinTao0417')
on conflict (github_id) do nothing;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------- messages
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) <= 120),
  email text not null check (char_length(email) <= 200),
  company text check (char_length(company) <= 160),
  topic text not null check (char_length(topic) <= 40),
  message text not null check (char_length(message) <= 5000),
  locale text not null default 'en' check (locale in ('en', 'zh')),
  status text not null default 'new' check (status in ('new', 'read', 'archived')),
  delivered boolean not null default false
);
create index if not exists messages_status_created_idx on public.messages (status, created_at desc);
alter table public.messages enable row level security;

-- Inserts come from the server with the secret key (bypasses RLS); visitors never write directly.
drop policy if exists "admins manage messages" on public.messages;
create policy "admins manage messages" on public.messages
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ---------------------------------------------------------------- page views
create table if not exists public.page_views (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  path text not null check (char_length(path) <= 300),
  locale text check (char_length(locale) <= 8),
  referrer_host text check (char_length(referrer_host) <= 120),
  country text check (char_length(country) <= 8),
  device text check (device in ('desktop', 'mobile', 'tablet')),
  -- Random per-tab id from the browser; no IP address or user agent is stored.
  session_id text check (char_length(session_id) <= 40)
);
create index if not exists page_views_created_idx on public.page_views (created_at desc);
create index if not exists page_views_path_idx on public.page_views (path, created_at desc);
alter table public.page_views enable row level security;

drop policy if exists "admins read page views" on public.page_views;
create policy "admins read page views" on public.page_views
  for select to authenticated using ((select public.is_admin()));

create or replace function public.admin_analytics(p_days int default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  since timestamptz := date_trunc('day', now()) - make_interval(days => greatest(1, least(p_days, 365)) - 1);
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  with scoped as (
    select * from public.page_views where created_at >= since
  ),
  days as (
    select generate_series(since::date, now()::date, interval '1 day')::date as day
  ),
  daily as (
    select d.day,
           count(s.id) as views,
           count(distinct s.session_id) as visitors
    from days d
    left join scoped s on s.created_at::date = d.day
    group by d.day
  )
  select jsonb_build_object(
    'since', since,
    'views', (select count(*) from scoped),
    'visitors', (select count(distinct session_id) from scoped),
    'today', (select count(*) from scoped where created_at >= date_trunc('day', now())),
    'daily', (select coalesce(jsonb_agg(jsonb_build_object('day', day, 'views', views, 'visitors', visitors) order by day), '[]'::jsonb) from daily),
    'paths', (select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) from (
      select path, count(*) as views, count(distinct session_id) as visitors
      from scoped group by path order by views desc limit 12) t),
    'referrers', (select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) from (
      select coalesce(nullif(referrer_host, ''), 'direct') as host, count(*) as views
      from scoped group by 1 order by views desc limit 10) t),
    'countries', (select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) from (
      select coalesce(nullif(country, ''), '??') as country, count(*) as views
      from scoped group by 1 order by views desc limit 10) t),
    'devices', (select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) from (
      select coalesce(device, 'desktop') as device, count(*) as views
      from scoped group by 1 order by views desc) t),
    'locales', (select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) from (
      select coalesce(nullif(locale, ''), '??') as locale, count(*) as views
      from scoped group by 1 order by views desc) t)
  ) into result;
  return result;
end;
$$;
revoke all on function public.admin_analytics(int) from public, anon;
grant execute on function public.admin_analytics(int) to authenticated;

-- ---------------------------------------------------------------- site data (small editable values)
create table if not exists public.site_data (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.site_data enable row level security;

drop policy if exists "site data is public" on public.site_data;
create policy "site data is public" on public.site_data for select to anon, authenticated using (true);
drop policy if exists "admins write site data" on public.site_data;
create policy "admins write site data" on public.site_data
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

drop trigger if exists site_data_touch on public.site_data;
create trigger site_data_touch before update on public.site_data
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------- posts
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  locale text not null check (locale in ('en', 'zh')),
  title text not null,
  description text not null default '',
  date date not null default current_date,
  tags text[] not null default '{}',
  hue int not null default 22,
  cover text,
  cover_alt text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  body text not null default '',
  -- Extra front matter (status notes, verification, and so on) kept verbatim.
  meta jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (slug, locale)
);
alter table public.posts enable row level security;

drop policy if exists "published posts are public" on public.posts;
create policy "published posts are public" on public.posts
  for select to anon, authenticated using (status = 'published');
drop policy if exists "admins manage posts" on public.posts;
create policy "admins manage posts" on public.posts
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

drop trigger if exists posts_touch on public.posts;
create trigger posts_touch before update on public.posts
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------- projects
create table if not exists public.projects (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  -- The full project record, in the same shape as `src/data/projects.ts`.
  data jsonb not null,
  sort int not null default 0,
  published boolean not null default true,
  updated_at timestamptz not null default now()
);
alter table public.projects enable row level security;

drop policy if exists "published projects are public" on public.projects;
create policy "published projects are public" on public.projects
  for select to anon, authenticated using (published);
drop policy if exists "admins manage projects" on public.projects;
create policy "admins manage projects" on public.projects
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

drop trigger if exists projects_touch on public.projects;
create trigger projects_touch before update on public.projects
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------- media bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/webp', 'image/png', 'image/jpeg', 'image/avif', 'image/gif'])
on conflict (id) do nothing;

drop policy if exists "admins upload media" on storage.objects;
create policy "admins upload media" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and (select public.is_admin()));
drop policy if exists "admins update media" on storage.objects;
create policy "admins update media" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and (select public.is_admin()))
  with check (bucket_id = 'media' and (select public.is_admin()));
drop policy if exists "admins delete media" on storage.objects;
create policy "admins delete media" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and (select public.is_admin()));
