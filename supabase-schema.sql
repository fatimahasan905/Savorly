-- ─── SAVORLY DATABASE SCHEMA ──────────────────────────────────────────────────
-- Paste this entire file into Supabase → SQL Editor → Run
-- This creates all the tables Savorly needs.

-- Enable Row Level Security on all tables (each user only sees their own data)

-- ── PROFILES ──────────────────────────────────────────────────────────────────
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  data jsonb not null default '{}',
  updated_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "Users can manage own profile"
  on profiles for all using (auth.uid() = user_id);

-- ── INVENTORY ─────────────────────────────────────────────────────────────────
create table if not exists inventory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  items jsonb not null default '[]',
  updated_at timestamptz default now()
);
alter table inventory enable row level security;
create policy "Users can manage own inventory"
  on inventory for all using (auth.uid() = user_id);

-- ── MEAL BANK ─────────────────────────────────────────────────────────────────
create table if not exists meal_bank (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  recipes jsonb not null default '[]',
  updated_at timestamptz default now()
);
alter table meal_bank enable row level security;
create policy "Users can manage own meal bank"
  on meal_bank for all using (auth.uid() = user_id);

-- ── WEEKLY PLANS ──────────────────────────────────────────────────────────────
create table if not exists weekly_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  plan jsonb not null default '{}',
  updated_at timestamptz default now()
);
alter table weekly_plans enable row level security;
create policy "Users can manage own weekly plan"
  on weekly_plans for all using (auth.uid() = user_id);

-- ── GROCERY LISTS ─────────────────────────────────────────────────────────────
create table if not exists grocery_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  items jsonb not null default '[]',
  updated_at timestamptz default now()
);
alter table grocery_lists enable row level security;
create policy "Users can manage own grocery list"
  on grocery_lists for all using (auth.uid() = user_id);
