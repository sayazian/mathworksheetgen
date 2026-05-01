create extension if not exists pgcrypto;

create type public.worksheet_visibility as enum ('private', 'public');

create table public.worksheets (
  id uuid primary key default gen_random_uuid(),
  topic text not null check (char_length(trim(topic)) > 0),
  visibility public.worksheet_visibility not null default 'private',
  content_json jsonb not null,
  edit_token_hash text not null unique,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index worksheets_created_at_idx on public.worksheets (created_at desc);
create index worksheets_visibility_idx on public.worksheets (visibility);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create trigger set_worksheets_updated_at
before update on public.worksheets
for each row
execute function public.set_updated_at();

alter table public.worksheets enable row level security;
