-- Enable extensions
create extension if not exists pgcrypto;

-- users
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- user_profiles
create table if not exists public.user_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  about_me text,
  birthdate date,
  address_street text,
  address_city text,
  address_state text,
  address_zip text,
  updated_at timestamptz default now()
);

-- sessions
create table if not exists public.onboarding_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  current_step int not null default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- components assignment (each component assigned to exactly one of pages 2 or 3)
create table if not exists public.onboarding_components (
  component text primary key check (component in ('about','address','birthdate')),
  page int not null check (page in (2,3))
);

insert into public.onboarding_components (component, page) values
  ('about', 2)
  on conflict (component) do nothing;

insert into public.onboarding_components (component, page) values
  ('address', 3)
  on conflict (component) do nothing;

insert into public.onboarding_components (component, page) values
  ('birthdate', 2)
  on conflict (component) do nothing;


