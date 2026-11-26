'use client';

import React from 'react';
import Link from 'next/link';
import SiteNavbar from '@/components/SiteNavbar';
import SiteFooter from '@/components/SiteFooter';
import PlatformLogosBar from '@/components/PlatformLogosBar';
import { StudioReveal } from '@/components/StudioReveal';
import { useI18n } from '@/components/I18nProvider';
import type { Locale } from '@/lib/i18n';

const GTAVI_COPY: Record<
  Locale,
  {
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
    kicker: 'VICE CITY ARCHITECTURE · ÖZEL KOLEKSİYON',
    badge: 'GTA VI SPECIAL SERIES',
    titleLine1: 'Yakında özel seri',
    titleAccent: 'GTA 6 temalı FiveM içeriklerimizle sizlerleyiz.',
    leadQuote:
      'Yakında özel seri GTA 6 temalı FiveM içeriklerimizle sizlerleyiz.',
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
    kicker: 'VICE CITY ARCHITECTURE · SPECIAL COLLECTION',
    badge: 'GTA VI SPECIAL SERIES',
    titleLine1: 'Coming soon with our special series',
    titleAccent: 'GTA 6 themed FiveM contents.',
    leadQuote:
      'Yakında özel seri GTA 6 temalı FiveM içeriklerimizle sizlerleyiz.',
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
    kicker: 'АРХИТЕКТУРА VICE CITY · СПЕЦИАЛЬНАЯ СЕРИЯ',
    badge: 'GTA VI SPECIAL SERIES',
    titleLine1: 'Скоро мы представим специальную серию',
    titleAccent: 'контента FiveM в тематике GTA 6.',
    leadQuote:
      'Yakında özel seri GTA 6 temalı FiveM içeriklerimizle sizlerleyiz.',
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
    kicker: 'ARCHITECTURE VICE CITY · SÉRIE SPÉCIALE',
    badge: 'GTA VI SPECIAL SERIES',
    titleLine1: 'Bientôt disponible avec notre série spéciale',
    titleAccent: 'de contenus FiveM sur le thème de GTA 6.',
    leadQuote:
      'Yakında özel seri GTA 6 temalı FiveM içeriklerimizle sizlerleyiz.',
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
        <section className="gtavi-hero-section">
          <div className="st-container gtavi-hero-inner">
            <div className="gtavi-kicker-pill">
              <span className="gtavi-kicker-dot" aria-hidden="true" />
              <span>{copy.kicker}</span>
            </div>

            <div className="gtavi-monogram-badge" aria-hidden="true">
              <span>VI</span>
            </div>

            <h1 className="gtavi-hero-title">
              <span>{copy.titleLine1}</span>
              <span className="is-vice-gradient">{copy.titleAccent}</span>
            </h1>

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

        <section className="st-section" style={{ paddingTop: '24px', paddingBottom: '72px' }}>
          <div className="st-container">
            <StudioReveal>
              <div className="gtavi-showcase-banner">
                <div className="gtavi-showcase-glow" aria-hidden="true" />
                <span className="gtavi-showcase-tag">{copy.badge}</span>
                <h2 className="gtavi-showcase-quote">
                  “{copy.leadQuote}”
                </h2>
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
