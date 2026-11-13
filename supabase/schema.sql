-- Restricted Studio Kurumsal Güvenlik ve Lisans Sistemi Şeması
-- Supabase Dashboard -> SQL Editor üzerinde çalıştırın.

create extension if not exists pgcrypto;

-- 1. Aktivasyon Kodları
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

-- 2. Müşteri Lisansları
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

-- 3. Sunucu Taraflı Argon2id Parola Özetleri
create table if not exists public.user_password_hashes (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  argon2_hash   text not null,
  updated_at    timestamptz not null default now()
);

-- 4. Refresh Token Rotasyonu ve Çalınma (Reuse Detection) Ailesi
create table if not exists public.auth_refresh_tokens (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  family_id     uuid not null,
  token_hash    text not null unique,
  parent_hash   text,
  used_at       timestamptz,
  revoked_at    timestamptz,
  expires_at    timestamptz not null,
  ip_address    text,
  user_agent    text,
  created_at    timestamptz not null default now()
);

-- 5. Kalıcı Brute-Force Kilitleme Kayıtları
create table if not exists public.auth_lockouts (
  lock_key      text primary key,
  failed_count  integer not null default 0,
  last_failed_at timestamptz not null default now(),
  locked_until  timestamptz
);

-- 6. Şifreli Yönetici TOTP MFA Sırları
create table if not exists public.admin_mfa_secrets (
  admin_id         text primary key,
  encrypted_secret text not null,
  enabled          boolean not null default false,
  last_used_step   bigint,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- 7. Değiştirilemez Güvenlik ve Yönetici Denetim Kayıtları (Append-Only Audit Log)
create table if not exists public.audit_logs (
  id            uuid primary key default gen_random_uuid(),
  actor_id      text not null,
  actor_type    text not null,
  action        text not null,
  resource_type text,
  resource_id   text,
  ip_address    text,
  user_agent    text,
  before_state  jsonb,
  after_state   jsonb,
  metadata      jsonb,
  created_at    timestamptz not null default now()
);

-- İndeksler
create index if not exists redeem_codes_unused_idx on public.redeem_codes (is_used, created_at desc);
create index if not exists user_licenses_user_idx on public.user_licenses (user_id);
create index if not exists auth_refresh_family_idx on public.auth_refresh_tokens (family_id);
create index if not exists auth_refresh_expires_idx on public.auth_refresh_tokens (expires_at);
create index if not exists audit_logs_created_idx on public.audit_logs (created_at desc);
create index if not exists audit_logs_action_idx on public.audit_logs (action, created_at desc);

-- Satır Düzeyi Güvenlik (RLS - Zero Trust)
alter table public.redeem_codes enable row level security;
alter table public.user_licenses enable row level security;
alter table public.user_password_hashes enable row level security;
alter table public.auth_refresh_tokens enable row level security;
alter table public.auth_lockouts enable row level security;
alter table public.admin_mfa_secrets enable row level security;
alter table public.audit_logs enable row level security;

-- Kullanıcı yalnızca kendi lisans satırını okuyabilir; hiçbir doğrudan yazma izni yoktur.
drop policy if exists "user_licenses_select_own" on public.user_licenses;
create policy "user_licenses_select_own"
  on public.user_licenses
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Diğer tüm hassas tablolara anon/authenticated erişimi tamamen kapalıdır.
drop policy if exists "deny_all_redeem_codes" on public.redeem_codes;
create policy "deny_all_redeem_codes" on public.redeem_codes for all to anon, authenticated using (false) with check (false);

drop policy if exists "deny_all_password_hashes" on public.user_password_hashes;
create policy "deny_all_password_hashes" on public.user_password_hashes for all to anon, authenticated using (false) with check (false);

drop policy if exists "deny_all_refresh_tokens" on public.auth_refresh_tokens;
create policy "deny_all_refresh_tokens" on public.auth_refresh_tokens for all to anon, authenticated using (false) with check (false);

drop policy if exists "deny_all_lockouts" on public.auth_lockouts;
create policy "deny_all_lockouts" on public.auth_lockouts for all to anon, authenticated using (false) with check (false);

drop policy if exists "deny_all_admin_mfa" on public.admin_mfa_secrets;
create policy "deny_all_admin_mfa" on public.admin_mfa_secrets for all to anon, authenticated using (false) with check (false);

drop policy if exists "deny_all_audit_logs" on public.audit_logs;
create policy "deny_all_audit_logs" on public.audit_logs for all to anon, authenticated using (false) with check (false);

-- Audit Logs değiştirilemezlik koruması (Append-Only Trigger)
create or replace function public.prevent_audit_log_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'audit_logs tablosu değiştirilemez (immutable)';
end;
$$;

drop trigger if exists audit_logs_immutable_update on public.audit_logs;
create trigger audit_logs_immutable_update
  before update or delete on public.audit_logs
  for each row execute function public.prevent_audit_log_mutation();

-- Yetki daraltma (Defense in depth)
revoke all on public.redeem_codes from anon, authenticated;
revoke insert, update, delete on public.user_licenses from anon, authenticated;
revoke all on public.user_password_hashes from anon, authenticated;
revoke all on public.auth_refresh_tokens from anon, authenticated;
revoke all on public.auth_lockouts from anon, authenticated;
revoke all on public.admin_mfa_secrets from anon, authenticated;
revoke all on public.audit_logs from anon, authenticated;

-- PostgREST şema önbelleğini yenile
notify pgrst, 'reload schema';
