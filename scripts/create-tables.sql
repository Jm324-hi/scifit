-- ============================================================
-- SciFit — Create core database tables
-- Run this in Supabase SQL Editor before enable-rls.sql
-- ============================================================

create extension if not exists "pgcrypto";

-- Keep updated_at current on row updates.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  goal text not null check (goal in ('muscle', 'strength', 'fat_loss')),
  frequency integer not null check (frequency between 2 and 6),
  equipment text not null check (equipment in ('gym', 'home', 'both')),
  experience text not null check (experience in ('beginner', 'intermediate', 'advanced')),
  available_time integer not null check (available_time between 30 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  movement_pattern text not null,
  primary_muscle text not null,
  secondary_muscles text[] not null default '{}',
  equipment text not null,
  difficulty integer not null check (difficulty between 1 and 5),
  description text not null,
  tips text not null,
  video_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  goal text not null,
  frequency integer not null check (frequency between 1 and 7),
  duration_weeks integer not null check (duration_weeks between 1 and 52),
  split_type text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.plan_days (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.plans(id) on delete cascade,
  day_number integer not null check (day_number >= 1),
  name text not null,
  focus text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (plan_id, day_number)
);

create table if not exists public.plan_items (
  id uuid primary key default gen_random_uuid(),
  plan_day_id uuid not null references public.plan_days(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id),
  order_index integer not null check (order_index >= 0),
  sets integer not null check (sets >= 1),
  rep_range_min integer not null check (rep_range_min >= 1),
  rep_range_max integer not null check (rep_range_max >= rep_range_min),
  target_rpe numeric(3,1) check (target_rpe between 1 and 10),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (plan_day_id, order_index)
);

create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_day_id uuid references public.plan_days(id) on delete set null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  notes text,
  status text not null check (status in ('in_progress', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (completed_at is null or completed_at >= started_at)
);

create table if not exists public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workout_sessions(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id),
  set_number integer not null check (set_number >= 1),
  weight numeric(7,2),
  reps integer check (reps is null or reps >= 0),
  rpe numeric(3,1) check (rpe is null or (rpe between 1 and 10)),
  completed boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, set_number)
);

create table if not exists public.recovery_logs (
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  sleep integer not null check (sleep between 0 and 12),
  doms integer not null check (doms between 0 and 10),
  stress integer not null check (stress between 0 and 10),
  readiness integer not null check (readiness between 0 and 100),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, date)
);

create table if not exists public.subscriptions (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  plan_type text not null default 'free',
  status text not null default 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_usage (
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  count integer not null default 0 check (count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, date)
);

create index if not exists idx_plans_user_active
  on public.plans (user_id, is_active);
create index if not exists idx_plan_days_plan
  on public.plan_days (plan_id, day_number);
create index if not exists idx_plan_items_day_order
  on public.plan_items (plan_day_id, order_index);
create index if not exists idx_workout_sessions_user_started
  on public.workout_sessions (user_id, started_at desc);
create index if not exists idx_workout_sets_session
  on public.workout_sets (session_id, set_number);
create index if not exists idx_recovery_logs_user_date
  on public.recovery_logs (user_id, date desc);
create index if not exists idx_ai_usage_user_date
  on public.ai_usage (user_id, date desc);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_plans_updated_at on public.plans;
create trigger set_plans_updated_at
before update on public.plans
for each row execute function public.set_updated_at();

drop trigger if exists set_plan_days_updated_at on public.plan_days;
create trigger set_plan_days_updated_at
before update on public.plan_days
for each row execute function public.set_updated_at();

drop trigger if exists set_plan_items_updated_at on public.plan_items;
create trigger set_plan_items_updated_at
before update on public.plan_items
for each row execute function public.set_updated_at();

drop trigger if exists set_workout_sessions_updated_at on public.workout_sessions;
create trigger set_workout_sessions_updated_at
before update on public.workout_sessions
for each row execute function public.set_updated_at();

drop trigger if exists set_workout_sets_updated_at on public.workout_sets;
create trigger set_workout_sets_updated_at
before update on public.workout_sets
for each row execute function public.set_updated_at();

drop trigger if exists set_recovery_logs_updated_at on public.recovery_logs;
create trigger set_recovery_logs_updated_at
before update on public.recovery_logs
for each row execute function public.set_updated_at();

drop trigger if exists set_subscriptions_updated_at on public.subscriptions;
create trigger set_subscriptions_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

drop trigger if exists set_ai_usage_updated_at on public.ai_usage;
create trigger set_ai_usage_updated_at
before update on public.ai_usage
for each row execute function public.set_updated_at();
