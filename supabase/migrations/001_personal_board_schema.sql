-- ============================================================================
-- AI Mastery Hub — 1 User = 1 Personal Learning Board Schema (PostgreSQL + RLS)
-- ============================================================================

-- 1. PROFILES TABLE (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text not null default 'AI Learner',
  total_xp integer not null default 0,
  current_streak integer not null default 1,
  public_board_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Public boards are readable when enabled"
  on public.profiles for select
  using (public_board_enabled = true);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create profile row when a new OAuth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'user_name', split_part(new.email, '@', 1) || '_' || substr(new.id::text, 1, 6)),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', 'AI Learner')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. SUBMISSIONS TABLE (Full Attempt History per User & Module)
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id text not null,
  code_content text,
  file_url text,
  filename text,
  score double precision not null default 0,
  passed_tests integer not null default 0,
  total_tests integer not null default 0,
  execution_ms integer not null default 0,
  passed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_submissions_user_module
  on public.submissions (user_id, module_id, created_at desc);

alter table public.submissions enable row level security;

create policy "Users can view own submissions"
  on public.submissions for select
  using (auth.uid() = user_id);

create policy "Users can insert own submissions"
  on public.submissions for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own submissions"
  on public.submissions for delete
  using (auth.uid() = user_id);

-- 3. USER_WORKSPACE TABLE (Debounced Auto-Save Notes, Colab URL & Tasks)
create table if not exists public.user_workspace (
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id text not null,
  notes_markdown text not null default '',
  colab_url text not null default '',
  tasks_json jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, module_id)
);

alter table public.user_workspace enable row level security;

create policy "Users can view own workspace"
  on public.user_workspace for select
  using (auth.uid() = user_id);

create policy "Users can upsert own workspace"
  on public.user_workspace for insert
  with check (auth.uid() = user_id);

create policy "Users can update own workspace"
  on public.user_workspace for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 4. PRIVATE WORKS ARTIFACT STORAGE BUCKET (works/{user_id}/{module_id}/)
insert into storage.buckets (id, name, public)
values ('works', 'works', false)
on conflict (id) do nothing;

create policy "Users can upload own work artifacts"
  on storage.objects for insert
  with check (
    bucket_id = 'works'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can read own work artifacts"
  on storage.objects for select
  using (
    bucket_id = 'works'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own work artifacts"
  on storage.objects for delete
  using (
    bucket_id = 'works'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
