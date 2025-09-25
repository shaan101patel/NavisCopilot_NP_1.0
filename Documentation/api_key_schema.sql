-- Schema for API key storage and audit
-- Create tables
create table if not exists public.user_settings (
  user_id uuid primary key,
  api_key text,
  iv text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.api_key_audit (
  id bigserial primary key,
  user_id uuid not null,
  action text not null check (action in ('set','delete')),
  created_at timestamptz not null default now()
);

-- Updated at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists trg_user_settings_updated_at on public.user_settings;
create trigger trg_user_settings_updated_at
before update on public.user_settings
for each row execute function public.set_updated_at();

-- RLS policies
alter table public.user_settings enable row level security;
alter table public.api_key_audit enable row level security;

-- Policies for user_settings
create policy if not exists user_settings_select_own
  on public.user_settings for select
  using (auth.uid() = user_id);

create policy if not exists user_settings_insert_own
  on public.user_settings for insert
  with check (auth.uid() = user_id);

create policy if not exists user_settings_update_own
  on public.user_settings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy if not exists user_settings_delete_own
  on public.user_settings for delete
  using (auth.uid() = user_id);

-- Policies for api_key_audit
create policy if not exists api_key_audit_insert_own
  on public.api_key_audit for insert
  with check (auth.uid() = user_id);

create policy if not exists api_key_audit_select_own
  on public.api_key_audit for select
  using (auth.uid() = user_id);
