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

-- 8. Katalog Popülerlik ve Tıklama Sayaçları (Herkese açık istatistik)
create table if not exists public.catalog_popularity (
  item_id    text primary key,
  clicks     bigint not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists catalog_popularity_clicks_idx on public.catalog_popularity (clicks desc);

alter table public.catalog_popularity enable row level security;

drop policy if exists "catalog_popularity_select_public" on public.catalog_popularity;
create policy "catalog_popularity_select_public"
  on public.catalog_popularity
  for select
  to anon, authenticated
  using (true);

create or replace function public.increment_catalog_click(p_item_id text)
returns bigint
language plpgsql
security definer
as $$
declare
  new_clicks bigint;
begin
  if p_item_id !~ '^RS-CAT-\d{4,6}$' then
    raise exception 'Geçersiz katalog öğe kimliği';
  end if;

  insert into public.catalog_popularity (item_id, clicks, updated_at)
  values (p_item_id, 1, now())
  on conflict (item_id) do update
    set clicks = public.catalog_popularity.clicks + 1,
        updated_at = now()
  returning clicks into new_clicks;

  return new_clicks;
end;
$$;

revoke all on public.catalog_popularity from anon, authenticated;
grant select on public.catalog_popularity to anon, authenticated;

-- 9. Mağaza Ürün Fiyat Yönetimi (/lisanslar & /admin)
create table if not exists public.store_product_prices (
  product_id    text primary key,
  custom_price  numeric(10, 2),
  compare_price numeric(10, 2),
  hidden        boolean not null default false,
  note          text,
  updated_by    text,
  updated_at    timestamptz not null default now()
);

alter table public.store_product_prices enable row level security;

drop policy if exists "store_product_prices_select_public" on public.store_product_prices;
create policy "store_product_prices_select_public"
  on public.store_product_prices
  for select
  to anon, authenticated
  using (true);

revoke all on public.store_product_prices from anon, authenticated;
grant select on public.store_product_prices to anon, authenticated;

-- 10. Müşteri Profilleri & Avatar / Sosyal Bağlantılar (/hesabim)
create table if not exists public.user_profiles (
  user_id          uuid primary key references auth.users(id) on delete cascade,
  display_name     text not null,
  username         text,
  avatar_url       text,
  discord_handle   text,
  discord_id       text,
  auth_providers   text[] not null default '{}',
  server_name      text,
  bio              text,
  preferred_locale text not null default 'tr',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

drop policy if exists "user_profiles_select_own" on public.user_profiles;
create policy "user_profiles_select_own"
  on public.user_profiles
  for select
  to authenticated
  using (auth.uid() = user_id);

revoke all on public.user_profiles from anon, authenticated;
grant select on public.user_profiles to authenticated;

-- 11. Shopier Siparişleri & Dijital Teslimat Kayıtları (/hesabim & /admin)
create table if not exists public.orders (
  id                   uuid primary key default gen_random_uuid(),
  reference_code       text not null unique,
  user_id              uuid not null references auth.users(id) on delete cascade,
  buyer_email          text,
  buyer_name           text,
  source               text not null default 'catalog',
  payment_provider     text not null default 'shopier',
  title                text not null,
  items                jsonb not null default '[]'::jsonb,
  currency             text not null default 'TRY',
  total_amount         numeric(10, 2) not null,
  status               text not null default 'pending_payment',
  shopier_product_id   text,
  shopier_checkout_url text,
  shopier_order_id     text,
  delivery_sla_note    text not null,
  delivery_payload     jsonb,
  paid_at              timestamptz,
  delivered_at         timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists orders_user_created_idx on public.orders (user_id, created_at desc);
create index if not exists orders_status_created_idx on public.orders (status, created_at desc);
create index if not exists orders_shopier_product_idx on public.orders (shopier_product_id);

alter table public.orders enable row level security;

drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own"
  on public.orders
  for select
  to authenticated
  using (auth.uid() = user_id);

revoke all on public.orders from anon, authenticated;
grant select on public.orders to authenticated;

-- 12. Kişiye Özel Sipariş & Ürün Teslimat Sohbeti (1-1 Private Delivery Chat)
create table if not exists public.order_messages (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references public.orders(id) on delete cascade,
  reference_code  text not null,
  sender_user_id  uuid references auth.users(id) on delete set null,
  sender_role     text not null,
  sender_name     text not null,
  sender_avatar   text,
  message_type    text not null default 'text',
  body            text not null,
  attachment_meta jsonb,
  created_at      timestamptz not null default now()
);

create index if not exists order_messages_order_idx on public.order_messages (order_id, created_at asc);
create index if not exists order_messages_ref_idx on public.order_messages (reference_code, created_at asc);

alter table public.order_messages enable row level security;

drop policy if exists "order_messages_select_own" on public.order_messages;
create policy "order_messages_select_own"
  on public.order_messages
  for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

revoke all on public.order_messages from anon, authenticated;
grant select on public.order_messages to authenticated;

-- 13. Yönetici Operatör Hesapları (/admin çoklu yönetici desteği, yalnızca Service Role)
create table if not exists public.admin_operators (
  id            uuid primary key default gen_random_uuid(),
  username      text not null unique,
  password_hash text not null,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.admin_operators enable row level security;

drop policy if exists "deny_all_admin_operators" on public.admin_operators;
create policy "deny_all_admin_operators"
  on public.admin_operators
  for all
  to anon, authenticated
  using (false)
  with check (false);

revoke all on public.admin_operators from anon, authenticated;

-- PostgREST şema önbelleğini yenile
notify pgrst, 'reload schema';
