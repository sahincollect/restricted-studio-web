'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import catalogStats from '@/lib/catalog-stats.json';
import { useI18n } from '@/components/I18nProvider';
import SiteNavbar from '@/components/SiteNavbar';
import SiteFooter from '@/components/SiteFooter';
import PlatformLogosBar from '@/components/PlatformLogosBar';
import { HeroPrismBackdrop, StudioReveal } from '@/components/StudioReveal';
import type { Locale } from '@/lib/i18n';

const ITEMSATIS_URL = 'https://www.itemsatis.com/p/saintstudio';

type CodeTabKey = 'bridge' | 'security' | 'database';

interface HomeLocaleCopy {
  heroLine1: string;
  heroLineAccent: string;
  heroLine3: string;
  heroSubtitle: string;
  heroCta: string;
  heroSecondaryCta: string;
  scrollPill: string;
  whyTitle: string;
  whyBody: string;
  kpi1Label: string;
  kpi2Val: string;
  kpi2Label: string;
  kpi3Val: string;
  kpi3Label: string;
  areasHeading: string;
  areasHeadingAccent: string;
  areasSub: string;
  inspectCta: string;
  areas: {
    key: string;
    title: string;
    count: string;
    desc: string;
    href: string;
    icon: 'code' | 'building' | 'car' | 'sparkles' | 'shirt' | 'key';
  }[];
  stackEyebrow: string;
  stackTitle: string;
  stackSub: string;
  offerTag: string;
  offerTitle: string;
  offerPrice: string;
  offerBulk: string;
  offerBullets: string[];
  offerCta: string;
  faqTitle: string;
  faqSub: string;
  bannerTitle: string;
  bannerDesc: string;
  bannerPrimary: string;
  bannerSecondary: string;
}

const HOME_COPY: Record<Locale, HomeLocaleCopy> = {
  tr: {
    heroLine1: 'FiveM altyapısında',
    heroLineAccent: 'ölçülebilir performans,',
    heroLine3: 'sadece kod değil',
    heroSubtitle:
      '6.446+ açık kaynak Script, MLO ve Araç Paketi; sıfır şifreleme politikası, sabit 100₺ fiyat ve 15+ alımda yarı fiyat avantajıyla.',
    heroCta: 'Kataloğu Keşfet',
    heroSecondaryCta: 'Dijital Lisans Vitrinini Gör →',
    scrollPill: 'Çalışma alanlarımız',
    whyTitle: 'Neden Restricted Studio',
    whyBody:
      'Şifreli ve kapalı kaynak eklentilere bağımlılığı tamamen kaldırıyoruz. Her modül temiz Qbox, QBCore ve ESX uyumuyla, düşük resmon yüküyle ve tam düzenlenebilir kaynak koduyla teslim edilir.',
    kpi1Label: 'AÇIK KAYNAK İÇERİK',
    kpi2Val: '100₺',
    kpi2Label: 'SABİT PARÇA FİYATI',
    kpi3Val: '50₺',
    kpi3Label: '15+ ALIMDA BİRİM FİYAT',
    areasHeading: 'Restricted Studio ana',
    areasHeadingAccent: 'çalışma alanları',
    areasSub:
      'Altyapı scriptlerinden özel MLO haritalara, optimize araç paketlerinden İtemsatış güvenceli dijital lisanslara kadar uçtan uca çözüm sunuyoruz.',
    inspectCta: 'Kategoriye Git',
    areas: [
      {
        key: 'scripts',
        title: 'Script & Sistemler',
        count: `${catalogStats.counts['Script & Sistemler'].toLocaleString('tr-TR')}+`,
        desc: 'Qbox, QBCore ve ESX için yeniden yapılandırılmış ekonomi, polis, soygun ve temel sunucu sistemleri.',
        href: '/katalog?category=Script%20%26%20Sistemler',
        icon: 'code',
      },
      {
        key: 'mlo',
        title: 'MLO & Mekanlar',
        count: `${catalogStats.counts['MLO & Mekanlar'].toLocaleString('tr-TR')}+`,
        desc: 'Düşük VRAM tüketimli LOD yapısına sahip hastane, departman, mekanik ve sosyal yaşam haritaları.',
        href: '/katalog?category=MLO%20%26%20Mekanlar',
        icon: 'building',
      },
      {
        key: 'vehicles',
        title: 'Araç Paketleri',
        count: `${catalogStats.counts['Araç Paketleri'].toLocaleString('tr-TR')}+`,
        desc: 'Özel handling ayarlı, optimize poligon ve doku boyutlarına sahip roleplay & hizmet araç filoları.',
        href: '/katalog?category=Ara%C3%A7%20Paketleri',
        icon: 'car',
      },
      {
        key: 'mods',
        title: 'Modlar & Eklentiler',
        count: `${catalogStats.counts['Modlar & Eklentiler'].toLocaleString('tr-TR')}+`,
        desc: 'Sunucu akıcılığını koruyan ses paketleri, ses efektleri, arayüz yamaları ve yardımcı modüller.',
        href: '/katalog?category=Modlar%20%26%20Eklentiler',
        icon: 'sparkles',
      },
      {
        key: 'eup',
        title: 'Kıyafet & EUP',
        count: `${catalogStats.counts['Kıyafet & EUP'].toLocaleString('tr-TR')}+`,
        desc: 'Birlik ve sivil kombinleri için optimize edilmiş dokularla çakışmasız EUP ve aksesuar paketleri.',
        href: '/katalog?category=K%C4%B1yafet%20%26%20EUP',
        icon: 'shirt',
      },
      {
        key: 'licenses',
        title: 'Dijital Lisanslar',
        count: '17+ İlan',
        desc: 'İtemsatış resmi mağazamız üzerinden ChatGPT, Gemini, Canva ve yazılım lisanslarında anında teslimat.',
        href: '/lisanslar',
        icon: 'key',
      },
    ],
    stackEyebrow: 'SIFIR ESCROW POLİTİKASI',
    stackTitle: 'Temiz Lua & SQL Mimarisi',
    stackSub:
      'Sunucunuzda kontrol tamamen sizde olsun. Şifreli paketlere değil, doğrudan okunabilir ve genişletilebilir koda sahip olun.',
    offerTag: 'ŞEFFAF FİYATLANDIRMA',
    offerTitle: 'Tek Seferde Tam Erişim',
    offerPrice: '100₺',
    offerBulk: '15+ sepet alımında adet 50₺ (%50 indirim)',
    offerBullets: [
      'Cfx.re / Escrow şifrelemesi olmadan açık kaynak teslim',
      '15 ve üzeri ürün seçiminde sepette otomatik %50 indirim',
      'İtemsatış 3D Secure güvencesiyle doğrulanmış sipariş akışı',
    ],
    offerCta: 'Sepetini Oluştur',
    faqTitle: 'Sıkça Sorulan Sorular',
    faqSub: 'Teslimat, lisanslama, açık kaynak politikası ve toplu indirimler hakkında merak edilenler.',
    bannerTitle: 'Sunucunuzun altyapısını bugünden yükseltin',
    bannerDesc:
      'İster tekil script ihtiyacınız için kataloğu filtreleyin, ister İtemsatış mağazamızdan lisanslı dijital ürünleri anında edinin.',
    bannerPrimary: 'Kataloğu Aç',
    bannerSecondary: 'İletişime Geç',
  },
  en: {
    heroLine1: 'FiveM engineering that',
    heroLineAccent: 'delivers measurable speed,',
    heroLine3: 'not locked code',
    heroSubtitle:
      '6,446+ open-source Scripts, MLOs & Vehicle packs built with zero encryption, flat 100 TL pricing, and 50% off for 15+ items.',
    heroCta: 'Explore Catalog',
    heroSecondaryCta: 'Browse Digital Licenses →',
    scrollPill: 'Main areas of work',
    whyTitle: 'Why Teams Choose Us',
    whyBody:
      'We eliminate dependence on encrypted scripts. Every module ships with clean Qbox, QBCore, and ESX compatibility, audited tick usage, and full source access.',
    kpi1Label: 'OPEN-SOURCE ASSETS',
    kpi2Val: '100₺',
    kpi2Label: 'FLAT UNIT PRICE',
    kpi3Val: '50₺',
    kpi3Label: 'PER UNIT AT 15+ CART',
    areasHeading: 'Restricted Studio main',
    areasHeadingAccent: 'areas of work',
    areasSub:
      'From core server frameworks and custom MLO interiors to optimized vehicle fleets and verified digital licenses.',
    inspectCta: 'Open Category',
    areas: [
      {
        key: 'scripts',
        title: 'Scripts & Systems',
        count: `${catalogStats.counts['Script & Sistemler'].toLocaleString('en-US')}+`,
        desc: 'Modular gameplay, economy, police, and core server systems ready for Qbox, QBCore, and ESX.',
        href: '/katalog?category=Script%20%26%20Sistemler',
        icon: 'code',
      },
      {
        key: 'mlo',
        title: 'MLO & Interiors',
        count: `${catalogStats.counts['MLO & Mekanlar'].toLocaleString('en-US')}+`,
        desc: 'Streamlined LOD interiors, hospitals, precincts, and custom city districts engineered for high FPS.',
        href: '/katalog?category=MLO%20%26%20Mekanlar',
        icon: 'building',
      },
      {
        key: 'vehicles',
        title: 'Vehicle Fleets',
        count: `${catalogStats.counts['Araç Paketleri'].toLocaleString('en-US')}+`,
        desc: 'Balanced handling lines and compressed textures for lore-friendly, civilian, and service vehicles.',
        href: '/katalog?category=Ara%C3%A7%20Paketleri',
        icon: 'car',
      },
      {
        key: 'mods',
        title: 'Mods & Addons',
        count: `${catalogStats.counts['Modlar & Eklentiler'].toLocaleString('en-US')}+`,
        desc: 'Audio overhauls, UI patches, and performance-tuned utilities without server hitching.',
        href: '/katalog?category=Modlar%20%26%20Eklentiler',
        icon: 'sparkles',
      },
      {
        key: 'eup',
        title: 'Clothing & EUP',
        count: `${catalogStats.counts['Kıyafet & EUP'].toLocaleString('en-US')}+`,
        desc: 'Conflict-free tactical gear and civilian EUP packs with optimized textures.',
        href: '/katalog?category=K%C4%B1yafet%20%26%20EUP',
        icon: 'shirt',
      },
      {
        key: 'licenses',
        title: 'Digital Licenses',
        count: '17+ Listings',
        desc: 'Official İtemsatış storefront featuring AI subscriptions, design tools, and software keys.',
        href: '/lisanslar',
        icon: 'key',
      },
    ],
    stackEyebrow: 'ZERO ESCROW POLICY',
    stackTitle: 'Clean Lua & SQL Architecture',
    stackSub:
      'Keep full control over your runtime. Inspect, tune, and extend every line without closed-source lock-in.',
    offerTag: 'TRANSPARENT PRICING',
    offerTitle: 'Full Source Access',
    offerPrice: '100₺',
    offerBulk: '50₺ per item at 15+ units (50% off)',
    offerBullets: [
      '100% readable open-source files with zero obfuscation',
      'Automatic 50% bulk discount once your cart hits 15 items',
      'Protected İtemsatış 3D Secure order verification flow',
    ],
    offerCta: 'Build Your Cart',
    faqTitle: 'Frequently Asked Questions',
    faqSub: 'Key answers about open-source delivery, licensing, compatibility, and volume pricing.',
    bannerTitle: 'Upgrade your FiveM stack today',
    bannerDesc:
      'Filter 6,446+ modules across categories or explore our verified digital license catalog on İtemsatış.',
    bannerPrimary: 'Open Catalog',
    bannerSecondary: 'Contact Us',
  },
  ru: {
    heroLine1: 'Архитектура FiveM,',
    heroLineAccent: 'дающая измеримую скорость,',
    heroLine3: 'а не закрытый код',
    heroSubtitle:
      'Более 6 446 модулей с открытым кодом без шифрования: 100₺ за скрипт и 50₺ при заказе от 15 позиций.',
    heroCta: 'Открыть каталог',
    heroSecondaryCta: 'Цифровые лицензии →',
    scrollPill: 'Направления работы',
    whyTitle: 'Почему выбирают нас',
    whyBody:
      'Никакого закрытого escrow-кода. Все решения совместимы с Qbox, QBCore и ESX и поставляются с полным исходным кодом.',
    kpi1Label: 'МОДУЛЕЙ В КАТАЛОГЕ',
    kpi2Val: '100₺',
    kpi2Label: 'ФИКСИРОВАННАЯ ЦЕНА',
    kpi3Val: '50₺',
    kpi3Label: 'ПРИ ЗАКАЗЕ ОТ 15 ШТ.',
    areasHeading: 'Ключевые направления',
    areasHeadingAccent: 'Restricted Studio',
    areasSub:
      'От базовых систем сервера и оптимизированных MLO до автопарков и официальных цифровых лицензий.',
    inspectCta: 'Перейти в раздел',
    areas: [
      {
        key: 'scripts',
        title: 'Скрипты и системы',
        count: `${catalogStats.counts['Script & Sistemler'].toLocaleString('ru-RU')}+`,
        desc: 'Экономика, полиция, ограбления и ядро под Qbox, QBCore и ESX.',
        href: '/katalog?category=Script%20%26%20Sistemler',
        icon: 'code',
      },
      {
        key: 'mlo',
        title: 'MLO и интерьеры',
        count: `${catalogStats.counts['MLO & Mekanlar'].toLocaleString('ru-RU')}+`,
        desc: 'Карты с чистым LOD и низким потреблением видеопамяти.',
        href: '/katalog?category=MLO%20%26%20Mekanlar',
        icon: 'building',
      },
      {
        key: 'vehicles',
        title: 'Автопарки',
        count: `${catalogStats.counts['Araç Paketleri'].toLocaleString('ru-RU')}+`,
        desc: 'Оптимизированный транспорт и настроенная физика управления.',
        href: '/katalog?category=Ara%C3%A7%20Paketleri',
        icon: 'car',
      },
      {
        key: 'mods',
        title: 'Моды и дополнения',
        count: `${catalogStats.counts['Modlar & Eklentiler'].toLocaleString('ru-RU')}+`,
        desc: 'Звуки, UI-патчи и вспомогательные утилиты без просадок FPS.',
        href: '/katalog?category=Modlar%20%26%20Eklentiler',
        icon: 'sparkles',
      },
      {
        key: 'eup',
        title: 'Одежда и EUP',
        count: `${catalogStats.counts['Kıyafet & EUP'].toLocaleString('ru-RU')}+`,
        desc: 'Экипировка и форма без конфликтов слотов.',
        href: '/katalog?category=K%C4%B1yafet%20%26%20EUP',
        icon: 'shirt',
      },
      {
        key: 'licenses',
        title: 'Цифровые лицензии',
        count: '17+ товара',
        desc: 'AI-подписки, софт и ключи через официальную витрину İtemsatış.',
        href: '/lisanslar',
        icon: 'key',
      },
    ],
    stackEyebrow: 'БЕЗ ESCROW И ШИФРОВАНИЯ',
    stackTitle: 'Чистый Lua и SQL код',
    stackSub:
      'Полный контроль над каждым файлом на вашем сервере без закрытых зависимостей.',
    offerTag: 'ПРОЗРАЧНЫЕ УСЛОВИЯ',
    offerTitle: 'Полный доступ к исходникам',
    offerPrice: '100₺',
    offerBulk: '50₺ за штуку при покупке от 15 товаров',
    offerBullets: [
      'Открытый исходный код без привязки к лицензионным серверам',
      'Автоматическая скидка 50% в корзине от 15 позиций',
      'Безопасная сделка через İtemsatış 3D Secure',
    ],
    offerCta: 'Собрать корзину',
    faqTitle: 'Частые вопросы',
    faqSub: 'Ответы по доставке, совместимости, лицензиям и оптовым скидкам.',
    bannerTitle: 'Обновите инфраструктуру сервера уже сегодня',
    bannerDesc:
      'Выберите нужные скрипты в каталоге или закажите цифровые лицензии на İtemsatış.',
    bannerPrimary: 'В каталог',
    bannerSecondary: 'Связаться',
  },
  fr: {
    heroLine1: 'Une ingénierie FiveM',
    heroLineAccent: 'aux résultats mesurables,',
    heroLine3: 'sans code verrouillé',
    heroSubtitle:
      'Plus de 6 446 scripts, MLO et véhicules open-source sans chiffrement, au tarif fixe de 100₺ et -50% dès 15 articles.',
    heroCta: 'Explorer le catalogue',
    heroSecondaryCta: 'Voir les licences →',
    scrollPill: 'Domaines clés',
    whyTitle: 'Pourquoi Restricted Studio',
    whyBody:
      'Aucun script chiffré. Chaque module offre une compatibilité Qbox, QBCore et ESX avec accès complet au code source.',
    kpi1Label: 'RESSOURCES OPEN-SOURCE',
    kpi2Val: '100₺',
    kpi2Label: 'TARIF FIXE UNITAIRE',
    kpi3Val: '50₺',
    kpi3Label: 'UNITÉ DÈS 15 ARTICLES',
    areasHeading: 'Principaux domaines',
    areasHeadingAccent: 'Restricted Studio',
    areasSub:
      'Des systèmes de base aux intérieurs MLO optimisés jusqu’aux licences numériques officielles.',
    inspectCta: 'Voir la catégorie',
    areas: [
      {
        key: 'scripts',
        title: 'Scripts & Systèmes',
        count: `${catalogStats.counts['Script & Sistemler'].toLocaleString('fr-FR')}+`,
        desc: 'Modules d’économie, police et gameplay prêts pour Qbox, QBCore et ESX.',
        href: '/katalog?category=Script%20%26%20Sistemler',
        icon: 'code',
      },
      {
        key: 'mlo',
        title: 'MLO & Intérieurs',
        count: `${catalogStats.counts['MLO & Mekanlar'].toLocaleString('fr-FR')}+`,
        desc: 'Bâtiments et cartes optimisés avec faible empreinte VRAM.',
        href: '/katalog?category=MLO%20%26%20Mekanlar',
        icon: 'building',
      },
      {
        key: 'vehicles',
        title: 'Packs Véhicules',
        count: `${catalogStats.counts['Araç Paketleri'].toLocaleString('fr-FR')}+`,
        desc: 'Flottes civiles et de service avec tenue de route équilibrée.',
        href: '/katalog?category=Ara%C3%A7%20Paketleri',
        icon: 'car',
      },
      {
        key: 'mods',
        title: 'Mods & Addons',
        count: `${catalogStats.counts['Modlar & Eklentiler'].toLocaleString('fr-FR')}+`,
        desc: 'Optimisations audio, UI et utilitaires serveur sans latence.',
        href: '/katalog?category=Modlar%20%26%20Eklentiler',
        icon: 'sparkles',
      },
      {
        key: 'eup',
        title: 'Vêtements & EUP',
        count: `${catalogStats.counts['Kıyafet & EUP'].toLocaleString('fr-FR')}+`,
        desc: 'Tenues tactiques et civiles sans conflit de textures.',
        href: '/katalog?category=K%C4%B1yafet%20%26%20EUP',
        icon: 'shirt',
      },
      {
        key: 'licenses',
        title: 'Licences Numériques',
        count: '17+ Offres',
        desc: 'Boutique officielle İtemsatış pour outils IA, design et logiciels.',
        href: '/lisanslar',
        icon: 'key',
      },
    ],
    stackEyebrow: 'POLITIQUE ZÉRO ESCROW',
    stackTitle: 'Architecture Lua & SQL Claire',
    stackSub:
      'Gardez un contrôle total sur votre serveur grâce à un code lisible et évolutif.',
    offerTag: 'TARIFICATION CLAIRE',
    offerTitle: 'Accès Source Complet',
    offerPrice: '100₺',
    offerBulk: '50₺ l’unité dès 15 articles (-50%)',
    offerBullets: [
      'Fichiers sources complets sans obfuscation Cfx.re',
      'Remise automatique de 50 % à partir de 15 éléments',
      'Transaction vérifiée via İtemsatış 3D Secure',
    ],
    offerCta: 'Composer mon panier',
    faqTitle: 'Questions Fréquentes',
    faqSub: 'Tout savoir sur la livraison, les licences et les remises sur volume.',
    bannerTitle: 'Faites évoluer votre infrastructure dès aujourd’hui',
    bannerDesc:
      'Parcourez plus de 6 446 ressources ou explorez nos licences numériques vérifiées.',
    bannerPrimary: 'Ouvrir le catalogue',
    bannerSecondary: 'Nous contacter',
  },
};

function renderAreaIcon(kind: HomeLocaleCopy['areas'][number]['icon']) {
  switch (kind) {
    case 'code':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      );
    case 'building':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 21h18" />
          <path d="M5 21V7l8-4v18" />
          <path d="M19 21V11l-6-4" />
        </svg>
      );
    case 'car':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 17h14M3 13l2-6h14l2 6v4H3z" />
          <circle cx="7.5" cy="17" r="1.5" />
          <circle cx="16.5" cy="17" r="1.5" />
        </svg>
      );
    case 'sparkles':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
        </svg>
      );
    case 'shirt':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
        </svg>
      );
    case 'key':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="7.5" cy="15.5" r="4.5" />
          <path d="M21 2l-9.6 9.6" />
          <path d="M15.5 7.5l3 3L22 7l-3-3" />
        </svg>
      );
  }
}

export default function StudioHomeClient() {
  const { locale, t, formatNumber } = useI18n();
  const copy = HOME_COPY[locale] || HOME_COPY.tr;
  const [codeTab, setCodeTab] = useState<CodeTabKey>('bridge');
  const [openFaqIdx, setOpenFaqIdx] = useState<number>(0);

  const codeSnippets: Record<CodeTabKey, { label: string; code: string }> = {
    bridge: {
      label: 'bridge.lua',
      code: `-- ${t.home.modals.codeComments.bridge}
local Bridge = {}

function Bridge.GetFramework()
    if GetResourceState("qbx_core") == "started" then
        return "qbox"
    elseif GetResourceState("qb-core") == "started" then
        return "qbcore"
    elseif GetResourceState("es_extended") == "started" then
        return "esx"
    end
end

return Bridge`,
    },
    security: {
      label: 'security.lua',
      code: `-- ${t.home.modals.codeComments.security}
local function VerifyPlayerAction(source, targetCoords)
    local ped = GetPlayerPed(source)
    if not DoesEntityExist(ped) then return false end

    local dist = #(GetEntityCoords(ped) - targetCoords)
    if dist > 3.5 then
        return false
    end

    return true
end`,
    },
    database: {
      label: 'schema.sql',
      code: `-- ${t.home.modals.codeComments.database}
CREATE TABLE IF NOT EXISTS \`restricted_records\` (
    \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    \`citizenid\` VARCHAR(50) NOT NULL,
    \`data\` LONGTEXT NOT NULL,
    INDEX \`idx_citizen\` (\`citizenid\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    },
  };

  return (
    <div className="st-page-shell">
      <SiteNavbar activePath="/" />

      <main className="st-main">
        {/* 1. Hero + Diagonal Prism Ribs + Signature Asymmetric Split Card */}
        <section className="st-hero-section">
          <HeroPrismBackdrop showArc />

          <div className="st-container st-hero-inner">
            <Link href="/GTAVI" className="st-hero-kicker-badge is-vetra-pill">
              <span className="st-eyebrow-dot" aria-hidden="true" />
              <span>RESTRICTED STUDIO · FIVEM &amp; REDM &amp; GTA VI ARCHITECTURE</span>
              <span className="st-vetra-pill-arrow" aria-hidden="true">
                →
              </span>
            </Link>

            <h1 className="st-hero-title">
              <span>{copy.heroLine1}</span>
              <span className="is-accent">{copy.heroLineAccent}</span>
              <span>{copy.heroLine3}</span>
            </h1>

            <p className="st-hero-subtitle">{copy.heroSubtitle}</p>

            <div className="st-hero-actions is-row">
              <Link href="/lisanslar" className="st-pill-btn is-outline st-hero-cta-secondary">
                <span className="st-play-dot" aria-hidden="true">▶</span>
                <span>{copy.heroSecondaryCta.replace(/\s*→$/, '')}</span>
              </Link>
              <Link href="/katalog" className="st-pill-btn is-ember st-hero-cta">
                {copy.heroCta}
              </Link>
            </div>

            <div className="st-vetra-trust-caption">
              6.446+ AÇIK KAYNAK PAKET · DESTEKLENEN PLATFORMLAR
            </div>

            <PlatformLogosBar variant="hero" />
          </div>

          <div className="st-container st-split-card-wrap">
            <StudioReveal delay={1}>
              <article className="st-asym-split-card">
                <div className="st-split-visual">
                  <Image
                    src="/assets/mlo-orange-visual.svg"
                    alt="Restricted Studio MLO"
                    fill
                    unoptimized
                    priority
                    sizes="(max-width: 960px) 100vw, 520px"
                    className="st-split-visual-img"
                  />
                  <div className="st-split-visual-scrim" aria-hidden="true" />
                  <a href="#calisma-alanlari" className="st-split-scroll-pill">
                    <span>{copy.scrollPill}</span>
                    <span aria-hidden="true">⌄</span>
                  </a>
                </div>

                <div className="st-split-content">
                  <h2 className="st-split-heading">{copy.whyTitle}</h2>
                  <p className="st-split-desc">{copy.whyBody}</p>

                  <div className="st-kpi-row">
                    <div>
                      <div className="st-kpi-value">{formatNumber(catalogStats.total)}+</div>
                      <div className="st-kpi-label">{copy.kpi1Label}</div>
                    </div>
                    <div>
                      <div className="st-kpi-value">{copy.kpi2Val}</div>
                      <div className="st-kpi-label">{copy.kpi2Label}</div>
                    </div>
                    <div>
                      <div className="st-kpi-value">{copy.kpi3Val}</div>
                      <div className="st-kpi-label">{copy.kpi3Label}</div>
                    </div>
                  </div>
                </div>
              </article>
            </StudioReveal>
          </div>
        </section>

        {/* 2. Main Areas of Work Grid */}
        <section className="st-section" id="calisma-alanlari">
          <div className="st-container">
            <StudioReveal>
              <div className="st-section-glow-head">
                <h2 className="st-section-title">
                  {copy.areasHeading}{' '}
                  <span className="is-accent">{copy.areasHeadingAccent}</span>
                </h2>
                <p className="st-section-subtitle">{copy.areasSub}</p>
              </div>
            </StudioReveal>

            <div className="st-areas-grid">
              {copy.areas.map((area, idx) => (
                <StudioReveal key={area.key} delay={idx % 3}>
                  <Link href={area.href} className="st-area-card spotlight-surface">
                    <div>
                      <div className="st-area-card-top">
                        <span className="st-area-icon-wrap" aria-hidden="true">
                          {renderAreaIcon(area.icon)}
                        </span>
                        <span className="st-area-count-pill">{area.count}</span>
                      </div>
                      <h3 className="st-area-title">{area.title}</h3>
                      <p className="st-area-desc">{area.desc}</p>
                    </div>
                    <div className="st-area-link-row">
                      <span>{copy.inspectCta}</span>
                      <span aria-hidden="true">→</span>
                    </div>
                  </Link>
                </StudioReveal>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Open-Source Architecture + Pricing Offer */}
        <section className="st-section">
          <div className="st-container st-eng-grid">
            <StudioReveal>
              <div className="st-code-panel spotlight-surface">
                <div className="st-code-header">
                  <div>
                    <div className="st-eyebrow">
                      <span className="st-eyebrow-dot" aria-hidden="true" />
                      {copy.stackEyebrow}
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: 600, letterSpacing: '-0.02em' }}>
                      {copy.stackTitle}
                    </h2>
                    <p style={{ marginTop: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {copy.stackSub}
                    </p>
                  </div>
                </div>

                <div className="st-code-tabs" role="tablist">
                  {(Object.keys(codeSnippets) as CodeTabKey[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      role="tab"
                      aria-selected={codeTab === key}
                      onClick={() => setCodeTab(key)}
                      className={`st-code-tab ${codeTab === key ? 'is-active' : ''}`}
                    >
                      {codeSnippets[key].label}
                    </button>
                  ))}
                </div>

                <pre className="st-code-pre">
                  <code>{codeSnippets[codeTab].code}</code>
                </pre>
              </div>
            </StudioReveal>

            <StudioReveal delay={1}>
              <aside className="st-offer-asym-card">
                <div>
                  <span className="st-offer-tag">{copy.offerTag}</span>
                  <h2 style={{ marginTop: '14px', fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em' }}>
                    {copy.offerTitle}
                  </h2>

                  <div className="st-offer-price-row" style={{ marginTop: '14px' }}>
                    <span className="st-offer-price">{copy.offerPrice}</span>
                    <span className="st-offer-bulk">{copy.offerBulk}</span>
                  </div>

                  <ul className="st-offer-list" style={{ marginTop: '20px' }}>
                    {copy.offerBullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <Link href="/katalog" className="st-pill-btn is-dark is-full">
                    {copy.offerCta} →
                  </Link>
                  <a
                    href={ITEMSATIS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="st-pill-btn is-full"
                    style={{
                      background: 'rgba(17,17,19,0.08)',
                      color: '#111113',
                    }}
                  >
                    {t.common.itemsatisStore} ↗
                  </a>
                </div>
              </aside>
            </StudioReveal>
          </div>
        </section>

        {/* 4. FAQ Accordion */}
        <section className="st-section" id="sss">
          <div className="st-container">
            <StudioReveal>
              <div className="st-section-glow-head">
                <h2 className="st-section-title">{copy.faqTitle}</h2>
                <p className="st-section-subtitle">{copy.faqSub}</p>
              </div>
            </StudioReveal>

            <div className="st-faq-list">
              {t.home.modals.faqItems.map((faq, idx) => {
                const isOpen = openFaqIdx === idx;
                return (
                  <div key={faq.q} className={`st-faq-item ${isOpen ? 'is-open' : ''}`}>
                    <button
                      type="button"
                      className="st-faq-trigger"
                      aria-expanded={isOpen}
                      onClick={() => setOpenFaqIdx(isOpen ? -1 : idx)}
                    >
                      <span>{faq.q}</span>
                      <span className="st-faq-plus" aria-hidden="true">
                        +
                      </span>
                    </button>
                    {isOpen && <div className="st-faq-body">{faq.a}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5. Closing Asymmetric CTA Banner */}
        <section className="st-section" style={{ paddingTop: '24px' }}>
          <div className="st-container">
            <StudioReveal>
              <div className="st-cta-banner">
                <div>
                  <h2>{copy.bannerTitle}</h2>
                  <p>{copy.bannerDesc}</p>
                </div>
                <div className="st-cta-banner-actions">
                  <Link href="/katalog" className="st-pill-btn is-dark">
                    {copy.bannerPrimary}
                  </Link>
                  <Link href="/iletisim" className="st-pill-btn is-ember">
                    {copy.bannerSecondary}
                  </Link>
                </div>
              </div>
            </StudioReveal>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
