create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  items jsonb not null
);

alter table public.orders enable row level security;

drop policy if exists "service role can manage orders" on public.orders;

create policy "service role can manage orders"
on public.orders
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');
