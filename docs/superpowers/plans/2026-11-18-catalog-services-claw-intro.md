# Katalog Seçenekleri, Ayrı Hizmet Formları (Resend), Menü İkonları ve Ayı Pençesi Açılış Planı

Tarih: 2026-11-18  
Hedef: Restricted Studio tasarım sistemi (`#0d0c0d`, `#ef5b38`, `#f3f2f2`) üzerinde gezinme ve hizmet dönüşüm akışının tamamlanması.

## 1. Menü Güncellemeleri (`components/SiteNavbar.tsx`, `app/globals.css`)
- **Katalog Seçici Dropdown + Mobil Alt Akordiyon:**
  - `Katalog` öğesi tıklandığında 4 yönlendirme seçeneği açılır:
    1. `Lisanslar` (`/lisanslar`)
    2. `FiveM / RedM` (`/katalog`)
    3. `Web Sitesi Kurulum Hizmeti` (`/hizmetler/web-kurulum`)
    4. `Discord Bot Hizmetleri` (`/hizmetler/discord-bot`)
  - Dışarı tıklama, `Escape` ve rota değişiminde kapanır; 4 dilde (`tr`, `en`, `ru`, `fr`) tam etiket ve kısa açıklamalar sunar.
- **Sağ İkon Güncellemeleri:**
  - İletişim yuvarlak ikonu (`/iletisim`): telefon ikonu yerine zarf (mail) SVG ikonu.
  - İtemsatış yuvarlak ikonu (`https://www.itemsatis.com/p/saintstudio`): jenerik mağaza SVG'si yerine `/assets/itemsatis-icon.png` resmi.

## 2. Hizmet Sayfaları ve Otomatik Mail API'si
- **Güvenlik & Doğrulama:**
  - `lib/security-edge.ts`: `'service_request'` rate-limit tier'ı (10 dakikada IP başına en fazla 6 istek).
  - `lib/validation.ts`: `ServiceRequestSchema` (Zod `.strict()`, `website_url` honeypot, `escapeHtml`).
- **API Rotası (`app/api/service-request/route.ts`):**
  - `guardApiRequest` + `parseJsonBodySafe` + `verifyTurnstileToken` + `ServiceRequestSchema`.
  - Doğrulanmış alan adı (`restrictedstudio.shop` · Resend `verified`) üzerinden `process.env.RESEND_API_KEY` kullanılarak `https://api.resend.com/emails` ile `info@restrictedstudio.shop` adresine otomatik HTML + düz metin e-posta iletimi (`reply_to`: müşteri e-postası).
  - `writeAuditLog` ile sunucu denetim kaydı.
- **Sayfalar (`components/ServiceRequestPageClient.tsx`):**
  - `app/hizmetler/web-kurulum/page.tsx` (`/hizmetler/web-kurulum`)
  - `app/hizmetler/discord-bot/page.tsx` (`/hizmetler/discord-bot`)
  - `app/sitemap.ts` ve `components/SiteFooter.tsx` bağlantıları güncellenir.

## 3. Netflix Tarzı Ayı Pençesi Açılış Animasyonu (`components/BearClawIntro.tsx`, `app/layout.tsx`)
- Sıkı 6 saatlik frekans kilidi (`localStorage` anahtarı `rs_bear_claw_intro_ts`, aralık `21600000` ms) + `?intro=1` önizleme parametresi + `prefers-reduced-motion: reduce` uyumu.
- Aşama 1: 4 çapraz pençe yarık çizgisi + anatomik pençe SVG çizimi ve köz parlaması.
- Aşama 2: Merkez ayı/pençe mührü ve `RESTRICTED STUDIO` tipografisi.
- Aşama 3: Kameranın pençe açıklığından dev `scale(1 -> 16)` zoom geçişiyle site içine dalışı.

## 4. Doğrulama
- `scripts/test-service-request.mjs` + mevcut birim testler
- `npx tsc --noEmit --incremental false` ve `npm run build`
- Yerel & canlı (`https://www.restrictedstudio.shop`) headless Chromium görsel + CSP + API kontrolü (`?intro=1`, dropdown, `/hizmetler/web-kurulum`, `/hizmetler/discord-bot`).
