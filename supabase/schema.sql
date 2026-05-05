-- ============================================================
-- STMS — Student Task Management System
-- Supabase SQL Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension (already enabled on Supabase by default)
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES TABLE
-- Extends Supabase auth.users with app-specific fields
-- ============================================================
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  role        text not null default 'student' check (role in ('student', 'admin')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- TASKS TABLE
-- ============================================================
create table public.tasks (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  title       text not null,
  description text,
  type        text not null check (type in ('assignment', 'quiz', 'project')),
  priority    text not null check (priority in ('low', 'medium', 'high')),
  status      text not null default 'pending' check (status in ('pending', 'ongoing', 'done')),
  due_date    date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
create index tasks_user_id_idx   on public.tasks(user_id);
create index tasks_status_idx    on public.tasks(status);
create index tasks_type_idx      on public.tasks(type);
create index tasks_due_date_idx  on public.tasks(due_date);

-- ============================================================
-- updated_at auto-trigger function
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger tasks_updated_at
  before update on public.tasks
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- Auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
alter table public.profiles enable row level security;
alter table public.tasks enable row level security;

-- PROFILES policies
-- Students see their own profile; admins see all
create policy "profiles: own read"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: admin read all"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "profiles: own update"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles: admin update all"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- TASKS policies
-- Students manage their own tasks only; admins manage all
create policy "tasks: own select"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "tasks: admin select all"
  on public.tasks for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "tasks: own insert"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "tasks: own update"
  on public.tasks for update
  using (auth.uid() = user_id);

create policy "tasks: admin update all"
  on public.tasks for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "tasks: own delete"
  on public.tasks for delete
  using (auth.uid() = user_id);

create policy "tasks: admin delete all"
  on public.tasks for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ============================================================
-- SEED DATA (optional — run after signing up your admin user)
-- Replace 'your-admin-uuid-here' with your actual Supabase user UUID
-- ============================================================
-- update public.profiles set role = 'admin' where id = 'your-admin-uuid-here';
