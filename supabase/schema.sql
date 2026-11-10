-- Restricted Studio lisans sistemi şeması.
-- Supabase Dashboard → SQL Editor'a yapıştırıp "Run" ile çalıştırın.

create extension if not exists pgcrypto;

create table if not exists public.redeem_codes (
  id            uuid primary key default gen_random_uuid(),
  code          text not null unique,
  product_name  text not null default 'R-AI',
  duration_days integer not null default 30,
  is_used       boolean not null default false,
  used_by       uuid references auth.users(id) on delete set null,
  used_at       timestamptz,
  created_at    timestamptz not null default now()
);

create table if not exists public.user_licenses (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  product_name  text not null default 'R-AI',
  hwid          text,
  status        text not null default 'active',
  expires_at    timestamptz not null,
  created_at    timestamptz not null default now(),
  unique (user_id, product_name)
);

create index if not exists redeem_codes_unused_idx on public.redeem_codes (is_used, created_at desc);
create index if not exists user_licenses_user_idx on public.user_licenses (user_id);

-- RLS açık, politika YOK: anon/authenticated anahtarlar tablolara erişemez.
-- Tüm okuma/yazma sunucudaki service role anahtarı üzerinden (API route'ları) yapılır.
alter table public.redeem_codes enable row level security;
alter table public.user_licenses enable row level security;

-- PostgREST şema önbelleğini yenile
notify pgrst, 'reload schema';
