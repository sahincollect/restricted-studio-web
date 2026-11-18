# Restricted Studio Full Website Redesign Implementation Plan

> **For agentic workers:** Implementing the complete visual and structural redesign matching `incele.png` + `newlogo.png` while preserving 100% of backend APIs, auth, Supabase storage, live İtemsatış sync, 6.446+ catalog, and Turnstile/CSP security.

**Goal:** Rebuild every public, portal, auth, status, and admin UI from scratch in the `incele.png` visual system (warm obsidian `#0d0c0d`, glowing diagonal prism light ribs, ember-coral `#ef5b38` accents, signature `#f3f2f2` asymmetric `24px 96px 24px 96px` split cards, white pill CTAs, geometric `Plus Jakarta Sans` typography, smooth GPU animations) integrated cleanly with the new logo (`newlogo.png`).

**Architecture:** Modular React App Router components sharing a centralized `app/globals.css` design-token sheet and unified `SiteNavbar` + `SiteFooter` components. Remove legacy pixel/CRT blackout and snowfall overlays; preserve all `/api/*`, middleware CSP nonce forwarding, `@vercel/analytics`, `@vercel/speed-insights`, i18n (`TR/EN/RU/FR`), and Turnstile flows.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, CSS Custom Properties + Keyframe Motion + `IntersectionObserver`, Pillow (icon asset pipeline from `newlogo.png`).

---

## Global Constraints
- CSP is nonce-based (`style-src 'self' 'nonce-...'`): all visual styles live in `app/globals.css` (plus small safe utility classes). Avoid untrusted inline `<script>` or external unapproved hosts.
- Preserve every API contract (`/api/auth/*`, `/api/admin/*`, `/api/licenses`, `/api/redeem`, `/api/download`, `/api/store-products`, `/api/catalog/clicks`, `/api/health`, `/api/v1/verify-client`).
- All 4 locales (`tr`, `en`, `ru`, `fr`) in `lib/translations.ts` must remain type-safe with zero missing keys.
- Responsive zero horizontal overflow (`overflowX: false`) at `360x780`, `390x844`, `768x1024`, and `1440x900`.
- Keep `/katalog` and `/lisanslar` mobile cards in 2-column grid (`grid-template-columns: repeat(2, minmax(0, 1fr))`) as previously requested by the user.

---

## Phase 1: Brand Assets & Favicons from `newlogo.png`
- Copy `C:\Users\yesah\OneDrive\Desktop\Restricted Studio\newlogo.png` (`1000x1000`) -> `public/assets/newlogo.png`.
- Generate square PWA/favicon assets from `newlogo.png` using Python Pillow (`Lanczos` resampling):
  - `public/icon-48.png` (`48x48`)
  - `public/icon-96.png` (`96x96`)
  - `public/icon-192.png` (`192x192`)
  - `public/icon-512.png` (`512x512`)
  - `public/apple-touch-icon.png` (`180x180`)
  - `public/favicon.ico` (`16, 32, 48` multi-size ICO)
- Create a clean dark+ember silhouette feature graphic SVG/CSS backdrop inspired directly by `incele.png`'s split card visual pane (using crisp geometric vector artwork + red bear emblem watermark).
- Update `public/manifest.webmanifest` (`theme_color: "#ef5b38"`, `background_color: "#0d0c0d"`).

## Phase 2: Root Layout, Typography, Global Tokens & Motion Primitives
- **`app/layout.tsx`:**
  - Load `Plus Jakarta Sans` (`400..800`), `Inter` (`400..700`), and `JetBrains Mono` (`400..700`).
  - Remove legacy `<WinterSnow />` and CRT blackout `<CrtTransitionProvider>` wrapper from blocking navigation (keep a lightweight pass-through compatibility hook if anything still references `CrtTransitionProvider`, OR clean up all callers directly so route changes are crisp instant transitions + smooth scroll reveals!).
  - Keep `<CursorSpotlight />` (refreshed for subtle warm ember hover glow), `<MinimalAudioPlayer />` (refreshed in floating pill style), `<Analytics />`, `<SpeedInsights />`.
- **`app/globals.css` (Clean From-Scratch Design System):**
  - Core tokens (`--bg-canvas: #0d0c0d`, `--bg-elevated: #141316`, `--bg-card: #18171a`, `--surface-light: #f3f2f2`, `--accent-ember: #ef5b38`, `--accent-crimson: #e02819`, `--text-primary: #ffffff`, `--text-muted: rgba(255, 255, 255, 0.66)`, `--text-dark: #121214`, `--text-dark-muted: #5a585e`, `--radius-asym: 24px 96px 24px 96px`, `--radius-pill: 999px`).
  - Diagonal Volumetric Prism Ribs (`.studio-prism-ribs`): rotated angled light panes behind Hero heading + animated ambient intensity + smooth GPU pointer parallax.
  - Reveal choreography (`.reveal-on-scroll`, `.is-visible`), button spring physics (`.btn-pill-light`, `.btn-pill-ghost`, `.nav-circle-btn`), and zero-overflow responsive rules (`1440px`, `1024px`, `768px`, `390px`, `360px`).
- **Shared Chrome Components:**
  - `components/SiteNavbar.tsx`: Exact 1:1 `incele.png` header layout (Left: `newlogo.png` + `RESTRICTED STUDIO`, Center: `Ana Sayfa`, `Katalog`, `Lisanslar`, `Hakkımızda`, `Durum`, `İletişim` with active orange indicator dot, Right: 3 white circular icon buttons `İletişim`, `İtemsatış`, `Portal`, plus compact `LanguageSwitcher` + responsive mobile drawer).
  - `components/SiteFooter.tsx`: Minimal dark editorial footer matching the new design system (`newlogo.png`, route navigation, İtemsatış verified store link, `info@restrictedstudio.shop`, copyright).
  - `components/RevealSection.tsx`: Lightweight `IntersectionObserver` scroll-reveal wrapper (immediately visible on SSR/reduced-motion/above-the-fold to prevent blank flashes).

## Phase 3: Homepage (`/` — `components/StudioHomeClient.tsx` + `app/page.tsx`)
Faithful 1:1 recreation of `incele.png` hierarchy adapted to Restricted Studio:
1. **Top Ambient Aura + Diagonal Volumetric Prism Lights + Editorial Hero:**
   - 3-line display headline (`h1`) with ember middle line (`FiveM dünyasında / ölçülebilir performans, / sadece kod değil`).
   - 2-line crisp subtitle explaining 6.446+ open-source FiveM archive + zero encryption + flat 100 TL / 15+ 50 TL pricing.
   - Large pill CTA button (`#f3f2f2` background, `#121214` ink, `border-radius: 999px`) -> `Kataloğu Keşfet` (`/katalog`), with subtle secondary link -> `Lisans Mağazası` (`/lisanslar`).
2. **Signature Asymmetric White Split Card (`border-radius: 24px 96px 24px 96px`):**
   - Left visual frame (`#d63c18` -> `#1e0906` atmospheric graphic with layered developer/FiveM silhouettes & crisp overlay button `"Çalışma alanlarımız ⌄"`).
   - Right narrative + 3-column KPI grid (`6.446+ Açık Kaynak İçerik`, `100₺ Sabit Parça Fiyatı`, `50₺ 15+ Birim Fiyat`).
3. **Main Areas of Work (`Restricted Studio ana çalışma alanları`):**
   - Centered glow header matching `"NDM's main areas of work"`.
   - Clean dark bento/grid showcasing all 6 core product pillars (`Script & Sistemler`, `MLO & Mekanlar`, `Araç Paketleri`, `Modlar & Eklentiler`, `Kıyafet & EUP`, `İtemsatış Dijital Lisanslar`) with live counts from `catalog-stats.json` and direct deep-links.
4. **Architecture & Pricing Offer Section:**
   - Interactive live code showcase (`bridge.lua`, `security.lua`, `schema.sql`) paired with asymmetric white pricing & bulk savings summary (`%50 Sepet İndirimi` for `15+` items + İtemsatış Escrow guarantee).
5. **Testimonials / FAQ Accordion + Closing Asymmetric CTA Banner + `SiteFooter`.**

## Phase 4: Rebuilding All Subpages & Portals Under One Unified Design Language
- `app/katalog/page.tsx`: Re-skinned into `SiteNavbar` + `SiteFooter` + dark obsidian hero & cards (`#141316`), ember `#ef5b38` highlights, white pill controls, clean 2-column mobile grid (`repeat(2, minmax(0, 1fr))`), preserving all 6.446+ items, search intelligence, cart 15+ 50% discount calculator, click analytics, and inspect modal.
- `components/StoreLicensesClient.tsx` (`/lisanslar`): Unified navbar & asymmetric hero header + clean 2-column mobile grid + modal preview, preserving live Itemsatış feed + `admin` price overrides (82 items).
- `components/AboutStudioClient.tsx` (`/hakkimizda`): Asymmetric white dossier card (`24px 96px`), engineering comparison matrix, category distribution charts from `catalog-stats.json`, FAQ accordion.
- `components/ContactTerminalClient.tsx` (`/iletisim`): Asymmetric light channel info card + dark corporate inquiry form (`info@restrictedstudio.shop`, İtemsatış store, SLA, topic selector, mailto dispatch).
- `components/StatusBoard.tsx` (`/status` & `status.restrictedstudio.shop`): `SiteNavbar` (respecting `mainOrigin` cross-domain navigation), live `/api/health` latency telemetry cards, service health grid, status badges.
- `components/AuthPortalShell.tsx` + `app/login/page.tsx` + `app/register/page.tsx`: Asymmetric light dossier card (`HTTPONLY • HMAC-SHA256`) + sleek dark auth form preserving Supabase login/register, Google OAuth, guest session, forgot password, and Turnstile.
- `components/DashboardClient.tsx` (`/dashboard`): Refreshed client portal with KPI stats card, license key redemption bar, client download CTA, HWID license cards, active session management.
- `app/admin/page.tsx` + `components/AdminStoreManager.tsx` (`/admin`): Refreshed admin console & MFA login UI preserving all TOTP MFA setup, key generation, license table, audit log stream, and Itemsatış store price override controls.
- `app/error.tsx` & `app/not-found.tsx`: Styled cleanly inside the `#0d0c0d` + `#ef5b38` + white-pill editorial system.

## Phase 5: Verification, Local Audit, Commit & Live Verification
1. Unit tests (`node --experimental-strip-types --test ...`) + `npx tsc --noEmit --incremental false` + `npm run build`.
2. Headless browser CDP audit across ALL 10 routes at `1440x900` (desktop), `390x844` (mobile), `360x780` (small mobile):
   - Zero console errors, zero CSP violations (`@vercel/analytics` + `@vercel/speed-insights` intact).
   - `overflowX === false` and `offenderCount === 0` across all viewports.
   - Real visual inspection of captured PNG screenshots (`desktop_home.png`, `desktop_katalog.png`, `desktop_lisanslar.png`, `desktop_status.png`, `mobile_home.png`, `mobile_katalog.png`, `mobile_lisanslar.png`, etc.) compared side-by-side against `incele.png`.
3. Commit and push to `origin main`, wait for Vercel deployment, verify live `https://www.restrictedstudio.shop` and `https://status.restrictedstudio.shop`.
