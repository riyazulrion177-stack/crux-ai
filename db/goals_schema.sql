create extension if not exists pgcrypto;

create table if not exists public.goals (
  id text primary key,
  user_id uuid not null,
  title text not null,
  description text default '',
  category text not null default 'Custom',
  xp_reward integer not null default 0,
  coin_reward integer not null default 0,
  diamond_reward integer not null default 0,
  stat_reward text not null default 'Focus',
  stat_amount integer not null default 0,
  is_completed boolean not null default false,
  completed_at timestamptz,
  is_custom boolean not null default true,
  icon_name text not null default 'Target',
  difficulty text not null default 'medium',
  estimated_minutes integer not null default 30,
  priority text not null default 'medium',
  deadline text,
  progress integer not null default 0,
  repeat_rule text not null default 'daily',
  reminder_time text,
  notes text default '',
  is_archived boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists goals_user_id_idx on public.goals (user_id);
create index if not exists goals_user_created_idx on public.goals (user_id, created_at desc);

alter table public.goals enable row level security;

create policy "Users can manage their own goals"
  on public.goals
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
