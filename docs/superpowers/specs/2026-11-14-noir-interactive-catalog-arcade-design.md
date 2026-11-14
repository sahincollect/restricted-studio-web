# Restricted Studio — Triadic Noir İnteraktif Sahne, Katalog Sadeleştirme, Öne Çıkanlar ve Arcade/Konsol Tasarımı

## Hedef
Mevcut Triadic Noir estetiğini (`#080808` obsidian, `#A50000`/`#8B0000` kızıl, `#F0F0F0`/`#E8E5DE` tebeşir beyazı, analog grain) bozmadan:
1. Giriş (`/`) ve katalog (`/katalog`) yüzeylerine **imlece tepkili kızıl optik spotlight** eklemek.
2. Giriş sağ vitrin kartının (`.bento-card-showcase`) arka planındaki statik tepe SVG'sini **fareyle eğilen 3D Wireframe Monolit Sahnesi** (`components/MonolithStage.tsx`) ile değiştirmek.
3. Sağ vitrin kasasını (`.device-mockup-chassis`) tek tıkla geçiş yapılan **3 modlu interaktif konsol** haline getirmek:
   - `PAC-RUN`: Triadic Noir Pac-Man mini oyunu (varsayılan olarak canlı otopilot demosunda akar, `OYNA` / yön tuşları / `WASD` veya dokunmatik oklarla kontrol devralınır; `#E8E5DE` veri noktaları, `#A50000` hayaletler, `0% ESCROW` güç hapı ve `localStorage` en yüksek skor kaydı).
   - `CORE`: Etkileşimli sunucu yük modu (`Idle / 128 Oyuncu / 256 Oyuncu`) ve canlı eğriye sahip `Restricted Core` telemetrisi.
   - `F8`: Oyun içi FiveM konsolundan esinlenen hızlı komut ve Easter Egg terminali (`Ctrl+K` / `F8` ile tüm sitede açılabilen küresel katmanla entegre).
4. Tarayıcı Geliştirici Konsolu (`F12`) ve site içi `F8` konsolunda **Easter Egg** deneyimi eklemek (`window.rs` yardımcısı + görsel overdrive/matrix/godmode efektleri + gizli komutlar).
5. `/katalog` menü ve üst alanını **tasarım dokusunu koruyarak sadeleştirmek**, gereksiz uzun açıklama paragraflarını ve yinelenen kontrolleri kaldırmak, `.sb-cat-item.is-active` CSS hatasını düzeltmek ve **Öne Çıkanlar / En Çok Tıklananlar** sistemini (`/api/catalog/clicks` + Supabase `catalog_popularity` + bellek/yerel fallback) işlevsel kılmak.

## Kısıtlar
- Strict CSP (`lib/security-edge.ts`): Production'da `unsafe-eval` ve dış betikler yasaktır; tüm 3D projeksiyon, spotlight, oyun döngüsü ve ses/görsel efektler harici kütüphanesiz saf TypeScript + Canvas2D + CSS ile yazılır.
- Viewport Lock (`/`): `html.is-viewport-locked` korunur; masaüstü, dizüstü (`max-height: 760px`) ve mobil (`<= 980px`) kırılımlarında dikey taşma oluşmaz.
- Çoklu Dil (`tr`, `en`, `ru`, `fr`): Yeni tüm arayüz metinleri `lib/translations.ts` üzerinden dört dilde sunulur.
- Gizlilik & Güvenlik: `/api/catalog/clicks` anonim/herkese açık ürün ID tıklama sayacını tutar, girdi Zod/regex ile doğrulanır (`^RS-CAT-\d{4}$`), kişisel veri saklanmaz.
