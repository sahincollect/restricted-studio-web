'use client';

import React from 'react';
import Link from 'next/link';
import SiteNavbar from '@/components/SiteNavbar';
import SiteFooter from '@/components/SiteFooter';
import PlatformLogosBar from '@/components/PlatformLogosBar';
import { StudioReveal } from '@/components/StudioReveal';
import { useI18n } from '@/components/I18nProvider';
import type { Locale } from '@/lib/i18n';

const GTAVI_RENTAL_URL =
  'https://www.itemsatis.com/gta-6/gta-vi-ultimate-edition-playstation-48-saat-6103139.html';

const RENTAL_TITLE = 'GTA VI Ultimate Edition PlayStation | 48 Saat';
const RENTAL_PRICE = '499,00 TL';

const RENTAL_DESCRIPTION_HEADER =
  '🟠 RESTRICTED STUDIO | GTA VI ULTIMATE EDITION DİJİTAL ERİŞİM BİLGİLENDİRMESİ 🟠';

const RENTAL_DESCRIPTION_SECTIONS = [
  {
    heading: '🔶 HİZMET KAPSAMI',
    items: [
      '🔸 Satın alma işlemiyle birlikte orijinal lisanslı Grand Theft Auto VI (Ultimate Edition) sürümünü içeren hesap, yalnızca 48 saat süreyle kiralama kapsamında teslim edilir.',
      '🔸 İşlem bir mülkiyet devri değildir; hesabın tüm hakları Restricted Studio’ya aittir ve bağlı e-posta adresine erişim sağlanamaz.',
      '🔸 48 saatlik kullanım süresi teslimat anında başlar, süre sonunda erişim yetkisi otomatik olarak sonlandırılır.',
    ],
  },
  {
    heading: '🟠 KULLANIM KOŞULLARI VE KISITLAMALAR 🟠',
    items: [
      '🔸 Hesaba yalnızca PlayStation üzerinden giriş yapılabilir; web tarayıcısı veya konsol dışı herhangi bir cihazdan erişim kesinlikle yasaktır.',
      '🔸 Kullanım hakkı tek bir cihazla sınırlıdır; birden fazla konsolda oturum açılması veya hesap bilgilerinin üçüncü kişilerle paylaşılması yasaktır.',
      '🔸 Hesabın çevrimiçi (online) kullanılması yasaktır; yalnızca çevrimdışı (offline) kullanıma uygundur.',
      '🔸 Hesap şifresi, güvenlik ayarları veya profil bilgilerine müdahale edilmesi yasaktır.',
    ],
  },
  {
    heading: '🔶 İADE, GARANTİ VE YAPTIRIM',
    items: [
      '🔸 Kurallara eksiksiz uyulması şartıyla 48 saat boyunca teknik erişim garantisi sunulur.',
      '🔸 Elektronik ortamda anında ifa edilen dijital hizmet kapsamında olduğundan, teslimat sonrasında cayma hakkı ve ücret iadesi uygulanmaz.',
      '🔸 Belirtilen kuralların ihlali halinde erişim ve garanti tek taraflı olarak derhal sonlandırılır, ücret iadesi yapılmaz.',
    ],
  },
] as const;

const RENTAL_DESCRIPTION_CLOSING =
  'Satın alma işlemini tamamlayan kullanıcı, işbu tüm şartları okumuş ve kabul etmiş sayılır. Restricted Studio, keyifli oyunlar diler!';

const GTAVI_COPY: Record<
  Locale,
  {
    buyBtn: string;
    termsBtnAria: string;
    listingMeta: string;
    guaranteeMeta: string;
    durationBadge: string;
    descSectionKicker: string;
    kicker: string;
    badge: string;
    titleLine1: string;
    titleAccent: string;
    leadQuote: string;
    subtext: string;
    primaryCta: string;
    secondaryCta: string;
    features: { tag: string; title: string; desc: string }[];
  }
> = {
  tr: {
    buyBtn: 'Satın Al',
    termsBtnAria: 'Açıklama ve kullanım koşullarına git',
    listingMeta: 'Restricted Studio · İtemsatış #6103139',
    guaranteeMeta: '48 Saat Teknik Erişim Garantisi · İtemsatış Güvencesi',
    durationBadge: '48 Saat Kiralama',
    descSectionKicker: 'ÜRÜN AÇIKLAMASI VE KOŞULLAR',
    kicker: 'VICE CITY ARCHITECTURE · ÖZEL KOLEKSİYON',
    badge: 'GTA VI SPECIAL SERIES',
    titleLine1: 'Yakında özel seri',
    titleAccent: 'GTA 6 temalı FiveM içeriklerimizle sizlerleyiz.',
    leadQuote: 'Yakında özel seri GTA 6 temalı FiveM içeriklerimizle sizlerleyiz.',
    subtext:
      'Leonida & Vice City atmosferini sunucunuza taşıyacak yeni nesil açık kaynak MLO mekanlar, Vice serisi UI/HUD paketleri, yüksek detaylı araç filoları ve sıfır şifrelemeli (0% Escrow) özel script koleksiyonumuz hazırlanıyor.',
    primaryCta: 'Mevcut Kataloğu Keşfet (6.446+)',
    secondaryCta: 'Discord Duyurularına Katıl →',
    features: [
      {
        tag: '01 · LEONIDA & VICE MLO',
        title: 'Vice City Mimari Mekanlar',
        desc: 'Düşük VRAM tüketimli, özel ışıklandırma ve Leonida estetiğine sahip yeni nesil sahil, kulüp ve departman MLO haritaları.',
      },
      {
        tag: '02 · NEXT-GEN HUD & SCRIPT',
        title: 'Özel Seri Vice Sistemleri',
        desc: 'Qbox, QBCore ve ESX uyumlu; GTA 6 arayüz dilinden ilham alan telefon, envanter, garaj ve ekonomi modülleri.',
      },
      {
        tag: '03 · %100 AÇIK KAYNAK',
        title: 'Sıfır Şifreleme & Sabit Fiyat',
        desc: 'Tüm özel seri GTA 6 temalı içeriklerimiz de Restricted Studio standartlarıyla şifresiz ve tam kaynak koduyla sunulacak.',
      },
    ],
  },
  en: {
    buyBtn: 'Satın Al',
    termsBtnAria: 'Jump to rental description and terms',
    listingMeta: 'Restricted Studio · İtemsatış #6103139',
    guaranteeMeta: '48-Hour Technical Access Guarantee · İtemsatış Verified',
    durationBadge: '48-Hour Rental',
    descSectionKicker: 'PRODUCT DESCRIPTION & TERMS',
    kicker: 'VICE CITY ARCHITECTURE · SPECIAL COLLECTION',
    badge: 'GTA VI SPECIAL SERIES',
    titleLine1: 'Coming soon with our special series',
    titleAccent: 'GTA 6 themed FiveM contents.',
    leadQuote: 'Yakında özel seri GTA 6 temalı FiveM içeriklerimizle sizlerleyiz.',
    subtext:
      'Our next-generation collection of Leonida & Vice City inspired open-source MLO interiors, Vice series UI/HUD systems, custom vehicle fleets, and zero-escrow script modules is currently in production.',
    primaryCta: 'Explore Current Catalog (6,446+)',
    secondaryCta: 'Join Discord Updates →',
    features: [
      {
        tag: '01 · LEONIDA & VICE MLO',
        title: 'Vice City Architectural MLOs',
        desc: 'Low-VRAM coastal venues, penthouses, and department interiors crafted with Vice sunset lighting.',
      },
      {
        tag: '02 · NEXT-GEN HUD & SCRIPTS',
        title: 'Special Series Vice Systems',
        desc: 'Qbox, QBCore, and ESX compatible HUD, inventory, garage, and economy systems inspired by GTA VI.',
      },
      {
        tag: '03 · 100% OPEN SOURCE',
        title: 'Zero Escrow & Flat Pricing',
        desc: 'Every special series release ships with full unencrypted source code under Restricted Studio standards.',
      },
    ],
  },
  ru: {
    buyBtn: 'Satın Al',
    termsBtnAria: 'Перейти к описанию и условиям аренды',
    listingMeta: 'Restricted Studio · İtemsatış #6103139',
    guaranteeMeta: 'Гарантия доступа 48 часов · İtemsatış',
    durationBadge: 'Аренда 48 часов',
    descSectionKicker: 'ОПИСАНИЕ И УСЛОВИЯ ДОСТУПА',
    kicker: 'АРХИТЕКТУРА VICE CITY · СПЕЦИАЛЬНАЯ СЕРИЯ',
    badge: 'GTA VI SPECIAL SERIES',
    titleLine1: 'Скоро мы представим специальную серию',
    titleAccent: 'контента FiveM в тематике GTA 6.',
    leadQuote: 'Yakında özel seri GTA 6 temalı FiveM içeriklerimizle sizlerleyiz.',
    subtext:
      'Готовится коллекция открытых MLO-интерьеров в стиле Leonida и Vice City, интерфейсов HUD нового поколения, автопарков и скриптов без шифрования Escrow.',
    primaryCta: 'Открыть текущий каталог (6 446+)',
    secondaryCta: 'Следить в Discord →',
    features: [
      {
        tag: '01 · LEONIDA & VICE MLO',
        title: 'Архитектура Vice City',
        desc: 'Оптимизированные интерьеры и карты побережья с низким потреблением VRAM.',
      },
      {
        tag: '02 · NEXT-GEN HUD & SCRIPTS',
        title: 'Системы специальной серии',
        desc: 'Модули интерфейса, инвентаря и экономики для Qbox, QBCore и ESX в эстетике GTA VI.',
      },
      {
        tag: '03 · 100% ОТКРЫТЫЙ КОД',
        title: 'Без шифрования Escrow',
        desc: 'Полный доступ к исходному коду всех релизов специальной серии.',
      },
    ],
  },
  fr: {
    buyBtn: 'Satın Al',
    termsBtnAria: 'Voir la description et les conditions',
    listingMeta: 'Restricted Studio · İtemsatış #6103139',
    guaranteeMeta: 'Garantie d’accès 48h · İtemsatış',
    durationBadge: 'Location 48h',
    descSectionKicker: 'DESCRIPTION ET CONDITIONS',
    kicker: 'ARCHITECTURE VICE CITY · SÉRIE SPÉCIALE',
    badge: 'GTA VI SPECIAL SERIES',
    titleLine1: 'Bientôt disponible avec notre série spéciale',
    titleAccent: 'de contenus FiveM sur le thème de GTA 6.',
    leadQuote: 'Yakında özel seri GTA 6 temalı FiveM içeriklerimizle sizlerleyiz.',
    subtext:
      'Notre collection nouvelle génération de cartes MLO Leonida & Vice City, systèmes UI/HUD, flottes de véhicules et scripts open-source sans chiffrement Escrow est en cours de préparation.',
    primaryCta: 'Explorer le catalogue actuel (6 446+)',
    secondaryCta: 'Rejoindre le Discord →',
    features: [
      {
        tag: '01 · LEONIDA & VICE MLO',
        title: 'Intérieurs MLO Vice City',
        desc: 'Cartes et bâtiments optimisés à faible empreinte VRAM inspirés de Vice City.',
      },
      {
        tag: '02 · NEXT-GEN HUD & SCRIPTS',
        title: 'Systèmes Série Spéciale',
        desc: 'Modules HUD, inventaire et économie compatibles Qbox, QBCore et ESX.',
      },
      {
        tag: '03 · 100% OPEN SOURCE',
        title: 'Zéro Escrow & Code Complet',
        desc: 'Chaque module de la série spéciale est livré avec son code source complet.',
      },
    ],
  },
};

export default function GtaViSpecialClient() {
  const { locale } = useI18n();
  const copy = GTAVI_COPY[locale] || GTAVI_COPY.tr;

  return (
    <div className="st-page-shell gtavi-theme-scope">
      <SiteNavbar activePath="/GTAVI" />

      <main className="st-main">
        {/* 1. PlayStation Store-Style Account Rental Showcase (Vice City Palette) */}
        <section className="gtavi-rental-section" aria-label={RENTAL_TITLE}>
          <div className="st-container">
            <div className="gtavi-ps-stage">
              {/* Top Panoramic Vice Banner */}
              <div className="gtavi-ps-banner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/gtavi-ps-banner.jpg"
                  alt={RENTAL_TITLE}
                  className="gtavi-ps-banner-img"
                  loading="eager"
                  decoding="async"
                />
                <div className="gtavi-ps-banner-scrim" aria-hidden="true" />
                <div className="gtavi-ps-banner-emblem" aria-hidden="true">
                  <span className="gtavi-ps-emblem-vi">VI</span>
                  <span className="gtavi-ps-emblem-sub">ULTIMATE EDITION · 48H</span>
                </div>
              </div>

              {/* Lower Dark Surface: Overlapping Left Purchase Card + 3-Col PS Metadata Strip */}
              <div className="gtavi-ps-lower">
                <div className="gtavi-ps-buy-card">
                  <h1 className="gtavi-ps-title">{RENTAL_TITLE}</h1>
                  <div className="gtavi-ps-publisher">{copy.listingMeta}</div>

                  <div className="gtavi-ps-tags" aria-label="Platform ve sürüm etiketleri">
                    <span className="gtavi-ps-tag">PS5</span>
                    <span className="gtavi-ps-tag">ULTIMATE EDITION</span>
                    <span className="gtavi-ps-tag">48 SAAT</span>
                    <span className="gtavi-ps-tag">OFFLINE</span>
                  </div>

                  <div className="gtavi-ps-trust-row">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="gtavi-ps-trust-star"
                      aria-hidden="true"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span>{copy.guaranteeMeta}</span>
                  </div>

                  <div className="gtavi-ps-price-row">
                    <span className="gtavi-ps-price">{RENTAL_PRICE}</span>
                    <span className="gtavi-ps-duration-pill">{copy.durationBadge}</span>
                  </div>

                  <div className="gtavi-ps-actions">
                    <a
                      href={GTAVI_RENTAL_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gtavi-ps-buy-btn"
                    >
                      <span>{copy.buyBtn}</span>
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M7 17L17 7" />
                        <path d="M8 7h9v9" />
                      </svg>
                    </a>

                    <a
                      href="#gtavi-aciklama"
                      className="gtavi-ps-info-circle"
                      aria-label={copy.termsBtnAria}
                      title={copy.termsBtnAria}
                    >
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="9" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Right PlayStation Store-Style 3-Column Spec & Rating Strip */}
                <div className="gtavi-ps-meta-grid">
                  <div className="gtavi-ps-spec-col">
                    <div className="gtavi-ps-spec-item">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
                        <rect x="2" y="6" width="20" height="12" rx="6" />
                        <line x1="6" y1="12" x2="10" y2="12" />
                        <line x1="8" y1="10" x2="8" y2="14" />
                        <circle cx="15.5" cy="11" r="0.9" fill="currentColor" />
                        <circle cx="17.5" cy="13" r="0.9" fill="currentColor" />
                      </svg>
                      <span>Yalnızca PlayStation üzerinden giriş yapılır</span>
                    </div>

                    <div className="gtavi-ps-spec-item">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
                        <circle cx="12" cy="12" r="9" />
                        <line x1="3" y1="12" x2="21" y2="12" />
                        <path d="M12 3a14 14 0 0 1 0 18" />
                        <path d="M12 3a14 14 0 0 0 0 18" />
                      </svg>
                      <span>Çevrimdışı (offline) oynama etkindir</span>
                    </div>

                    <div className="gtavi-ps-spec-item">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
                        <circle cx="12" cy="8" r="4" />
                        <path d="M5 20a7 7 0 0 1 14 0" />
                      </svg>
                      <span>Tek konsol · 1 cihaz kullanım hakkı</span>
                    </div>

                    <div className="gtavi-ps-spec-item">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
                        <circle cx="12" cy="12" r="9" />
                        <polyline points="12 7 12 12 15.5 14" />
                      </svg>
                      <span>48 saat kesintisiz dijital erişim</span>
                    </div>
                  </div>

                  <div className="gtavi-ps-spec-col">
                    <div className="gtavi-ps-spec-heading">PlayStation Sürümü</div>

                    <div className="gtavi-ps-spec-item">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
                        <rect x="6" y="3" width="12" height="18" rx="2" />
                        <line x1="10" y1="7" x2="14" y2="7" />
                      </svg>
                      <span>Grand Theft Auto VI (Ultimate Edition)</span>
                    </div>

                    <div className="gtavi-ps-spec-item">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <polyline points="9 12 11 14 15 10" />
                      </svg>
                      <span>48 saat teknik erişim garantisi</span>
                    </div>

                    <div className="gtavi-ps-spec-item">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                      </svg>
                      <a
                        href={GTAVI_RENTAL_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="gtavi-ps-inline-link"
                      >
                        İtemsatış #6103139{'\u00A0'}↗
                      </a>
                    </div>
                  </div>

                  <div className="gtavi-ps-rating-col">
                    <div className="gtavi-ps-pegi-row">
                      <span className="gtavi-ps-pegi-18" aria-label="PEGI 18">
                        18
                      </span>
                      <div className="gtavi-ps-pegi-labels">
                        <strong>PEGI 18</strong>
                        <span>Dijital Kiralama</span>
                      </div>
                    </div>
                    <p className="gtavi-ps-policy-note">
                      Mülkiyet devri değildir; yalnızca çevrimdışı konsol erişimi sağlanır. Anında ifa edilen dijital hizmet kapsamında iade uygulanmaz.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Full Exact Description & Terms Card */}
            <article id="gtavi-aciklama" className="gtavi-ps-desc-card">
              <div className="gtavi-ps-desc-kicker">{copy.descSectionKicker}</div>
              <h2 className="gtavi-ps-desc-header">{RENTAL_DESCRIPTION_HEADER}</h2>

              <div className="gtavi-ps-desc-grid">
                {RENTAL_DESCRIPTION_SECTIONS.map((sec) => (
                  <div key={sec.heading} className="gtavi-ps-desc-block">
                    <h3 className="gtavi-ps-desc-subheading">{sec.heading}</h3>
                    <ul className="gtavi-ps-desc-list">
                      {sec.items.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="gtavi-ps-desc-footer">
                <p className="gtavi-ps-desc-closing">{RENTAL_DESCRIPTION_CLOSING}</p>
                <a
                  href={GTAVI_RENTAL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gtavi-ps-buy-btn is-compact"
                >
                  <span>
                    {copy.buyBtn} · {RENTAL_PRICE}
                  </span>
                  <span aria-hidden="true">↗</span>
                </a>
              </div>
            </article>
          </div>
        </section>

        {/* 2. Existing GTA VI Special Series FiveM Showcase */}
        <section className="gtavi-hero-section is-secondary">
          <div className="st-container gtavi-hero-inner">
            <div className="gtavi-kicker-pill">
              <span className="gtavi-kicker-dot" aria-hidden="true" />
              <span>{copy.kicker}</span>
            </div>

            <div className="gtavi-monogram-badge" aria-hidden="true">
              <span>VI</span>
            </div>

            <h2 className="gtavi-hero-title">
              <span>{copy.titleLine1}</span>
              <span className="is-vice-gradient">{copy.titleAccent}</span>
            </h2>

            <p className="gtavi-hero-subtitle">{copy.subtext}</p>

            <div className="gtavi-hero-actions">
              <Link href="/katalog" className="gtavi-cta-primary">
                <span>{copy.primaryCta}</span>
                <span aria-hidden="true">→</span>
              </Link>
              <Link href="/discord" className="gtavi-cta-secondary">
                {copy.secondaryCta}
              </Link>
            </div>

            <PlatformLogosBar variant="hero" theme="vice" />
          </div>
        </section>

        <section className="st-section" style={{ paddingTop: '12px', paddingBottom: '72px' }}>
          <div className="st-container">
            <StudioReveal>
              <div className="gtavi-showcase-banner">
                <div className="gtavi-showcase-glow" aria-hidden="true" />
                <span className="gtavi-showcase-tag">{copy.badge}</span>
                <h2 className="gtavi-showcase-quote">“{copy.leadQuote}”</h2>
              </div>
            </StudioReveal>

            <div className="gtavi-feature-grid">
              {copy.features.map((feat, idx) => (
                <StudioReveal key={feat.tag} delay={idx}>
                  <article className="gtavi-feature-card">
                    <span className="gtavi-feature-tag">{feat.tag}</span>
                    <h3 className="gtavi-feature-title">{feat.title}</h3>
                    <p className="gtavi-feature-desc">{feat.desc}</p>
                  </article>
                </StudioReveal>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
