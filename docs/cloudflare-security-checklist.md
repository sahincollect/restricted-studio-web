# Restricted Studio — Production Security & Cloudflare Kurulum Rehberi

Bu doküman, uygulanan uygulama güvenliği katmanlarının bulut/kenar (Cloudflare, Vercel, Supabase, Google OAuth) tarafında tam anlamıyla aktive edilmesi için gereken manuel yapılandırma adımlarını içerir.

## 1. Supabase Veritabanı & RLS Migrasyonu (Zorunlu)
1. Supabase Dashboard -> **SQL Editor** ekranını açın.
2. [`supabase/schema.sql`](../supabase/schema.sql) dosyasının tamamını yapıştırıp çalıştırın (`Run`).
   - Bu işlem şu tabloları, indeksleri ve kısıtlamaları oluşturur/doğrular:
     - `public.redeem_codes`, `public.user_licenses` (yalnızca sahip okuma RLS politikası + yazma kilidi)
     - `public.user_password_hashes` (OWASP Argon2id parola özetleri, `anon`/`authenticated` erişimi tamamen kapalı)
     - `public.auth_refresh_tokens` (tek kullanımlık rotasyon + aile bazlı Reuse Detection)
     - `public.auth_lockouts` (kalıcı üstel brute-force kilitleri)
     - `public.admin_mfa_secrets` (AES-256-GCM şifreli yönetici TOTP sırrı ve replay koruması)
     - `public.audit_logs` (`prevent_audit_log_mutation()` trigger'ı ile `UPDATE`/`DELETE` engellenmiş append-only tablo)
3. **Project Settings -> API** bölümünden `service_role` gizli anahtarını kopyalayın ve Vercel / `.env.local` içine `SUPABASE_SERVICE_ROLE_KEY` olarak ekleyin.

## 2. Google OAuth (Google ile Giriş) Yapılandırması
1. **Google Cloud Console -> APIs & Services -> Credentials -> Create OAuth Client ID (Web Application)**:
   - Authorized JavaScript origins:
     - `https://restrictedstudio.shop`
     - `https://www.restrictedstudio.shop`
   - Authorized redirect URI (tam olarak aşağıdaki Supabase callback adresi olmalıdır):
     - `https://nknscxscbnucqrxqbgfg.supabase.co/auth/v1/callback`
2. Oluşturulan **Client ID** ve **Client Secret** değerlerini alın.
3. **Supabase Dashboard -> Authentication -> Providers -> Google** bölümünü açıp etkinleştirin ve Client ID / Client Secret değerlerini kaydedin.
4. **Supabase Dashboard -> Authentication -> URL Configuration**:
   - **Site URL**: `https://restrictedstudio.shop`
   - **Redirect URLs**:
     - `https://restrictedstudio.shop/auth/callback`
     - `https://www.restrictedstudio.shop/auth/callback`
     - `http://localhost:3000/auth/callback`

## 3. Cloudflare WAF, Turnstile ve Origin Lock (Tavsiye Edilen)
1. **Cloudflare DNS**: Ana alan adı (`A` / `CNAME` kayıtları) **Proxied (Turuncu Bulut)** modunda olmalıdır; gerçek IP (`CF-Connecting-IP`) uygulama middleware'i tarafından öncelikli okunur.
2. **Cloudflare SSL/TLS**: Encryption mode -> **Full (strict)** ve **Always Use HTTPS** aktif edin.
3. **Cloudflare Turnstile**:
   - Cloudflare Dashboard -> **Turnstile -> Add Widget** (`restrictedstudio.shop`, Widget Mode: Managed).
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` ve `TURNSTILE_SECRET_KEY` değişkenlerini Vercel Environment Variables altına ekleyin.
4. **Cloudflare WAF Rate Limiting Kuralları**:
   - `/api/auth/*`, `/api/admin*`, `/api/redeem` için: `10 saniyede 15 istek` -> **Block / Managed Challenge**.
   - `/katalog*` için: `1 dakikada 90 istek` -> **Managed Challenge** (scraper/fiyat toplayıcı bot koruması).
   - **Bot Fight Mode** / **Super Bot Fight Mode** -> **ON**.
5. **Cloudflare Transform Rule — Origin Lock (`CLOUDFLARE_ORIGIN_SECRET`)**:
   - Origin sunucuya Cloudflare'i atlayarak doğrudan Vercel/origin URL'i üzerinden yapılan saldırıları engellemek için Cloudflare **Rules -> Transform Rules -> Modify Request Header** üzerinden tüm isteklere gizli `x-cf-origin-secret` başlığı ekleyin.
   - Aynı gizli değeri Vercel ortam değişkeni olarak `CLOUDFLARE_ORIGIN_SECRET` adıyla tanımlayın. Tanımlandığı anda `middleware.ts` bu başlığı taşımayan tüm harici istekleri `403 Forbidden` ile reddeder.

## 4. Yönetici 2FA (TOTP) & Zero-Trust İzolasyon
- `/admin` girişinde parola doğrulaması tek başına yetki vermez; zorunlu 6 haneli TOTP doğrulaması gerektirir.
- İlk girişte ekranda beliren QR kodu Authenticator uygulamanıza okutun. Çoklu sunucusuz (serverless) örneklerde kesintisiz TOTP devamlılığı için Base32 gizli anahtarını `ADMIN_TOTP_SECRET` ortam değişkeni olarak kaydedebilirsiniz (`SUPABASE_SERVICE_ROLE_KEY` aktifse `public.admin_mfa_secrets` tablosuna AES-256-GCM şifreli olarak da kaydedilir).
- Kurumsal IP kısıtlaması için `ADMIN_ALLOWED_IPS` (virgülle ayrılmış IPv4/CIDR, örn. `203.0.113.10,10.0.0.0/24`) ve alt alan adı izolasyonu için `ADMIN_SUBDOMAIN` (örn. `admin.restrictedstudio.shop`) ayarlayabilirsiniz.

## 5. Ücretsiz Kurumsal Durum Sayfası (`status.restrictedstudio.shop`)
- **Uygulama İçi Durum Sayfası:** `/status` sayfası ve `GET /api/health` uç noktası; Web/Edge, Supabase Auth/Google OAuth, Veritabanı geçidi ve Katalog servislerini gerçek zamanlı ölçer (`status.*` alt alan adına gelen istekler `middleware.ts` üzerinden doğrudan `/status` sayfasına yönlendirilir).
- **Ücretsiz Alt Alan Adı Bağlantısı:**
  1. **Vercel Dashboard -> Project -> Settings -> Domains:** `status.restrictedstudio.shop` ekleyin.
  2. **Alan Adı DNS Sağlayıcısı (GoDaddy veya Cloudflare DNS):** Host `status` -> `CNAME` -> `cname.vercel-dns.com` kaydını ekleyin.
- **Opsiyonel Geçmiş Uptime (90 Günlük Arşiv):** Ücretsiz bir **UptimeRobot** hesabından Read-Only API Key alıp Vercel ortam değişkenlerine `UPTIMEROBOT_API_KEY` olarak eklerseniz, `/status` sayfasında 24s/7g/30g/90g erişilebilirlik yüzdeleri de otomatik görüntülenir.
