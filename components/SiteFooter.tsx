'use client';

import React from 'react';
import Link from 'next/link';
import { useI18n } from '@/components/I18nProvider';
import type { Locale } from '@/lib/i18n';

const ITEMSATIS_URL = 'https://www.itemsatis.com/p/saintstudio';

interface FooterCopy {
  tagline: string;
  explore: string;
  channels: string;
  legal: string;
  disclaimer: string;
  nav: {
    home: string;
    catalog: string;
    licenses: string;
    about: string;
    status: string;
    contact: string;
  };
  portal: string;
  admin: string;
  itemsatis: string;
}

const FOOTER_COPY: Record<Locale, FooterCopy> = {
  tr: {
    tagline:
      'Açık kaynak FiveM altyapıları, 6.446+ doğrulanmış modüler paket ve İtemsatış güvenceli dijital lisans platformu.',
    explore: 'SAYFALAR',
    channels: 'RESMİ KANALLAR',
    legal: '© 2026 Restricted Studio. Tüm hakları saklıdır.',
    disclaimer:
      'FiveM® ve Rockstar Games® ile resmi bir bağlantısı yoktur; tüm yazılım paketleri ve lisanslar bağımsız geliştirici stüdyosu tarafından sunulmaktadır.',
    nav: {
      home: 'Ana Sayfa',
      catalog: 'Katalog Arşivi',
      licenses: 'Dijital Lisanslar',
      about: 'Hakkımızda',
      status: 'Sistem Durumu',
      contact: 'İletişim',
    },
    portal: 'Müşteri Portalı',
    admin: 'Yönetici Girişi',
    itemsatis: 'İtemsatış Resmi Mağaza',
  },
  en: {
    tagline:
      'Open-source FiveM architectures, 6,446+ verified modules, and digital software licensing backed by İtemsatış escrow.',
    explore: 'PAGES',
    channels: 'OFFICIAL CHANNELS',
    legal: '© 2026 Restricted Studio. All rights reserved.',
    disclaimer:
      'Not affiliated with FiveM® or Rockstar Games®; all software packages and licenses are independently distributed.',
    nav: {
      home: 'Home',
      catalog: 'Catalog Archive',
      licenses: 'Digital Licenses',
      about: 'About Studio',
      status: 'System Status',
      contact: 'Contact',
    },
    portal: 'Client Portal',
    admin: 'Admin Access',
    itemsatis: 'İtemsatış Official Store',
  },
  ru: {
    tagline:
      'Инфраструктуры FiveM с открытым исходным кодом, более 6 446 модулей и цифровые лицензии через İtemsatış.',
    explore: 'РАЗДЕЛЫ',
    channels: 'КАНАЛЫ СВЯЗИ',
    legal: '© 2026 Restricted Studio. Все права защищены.',
    disclaimer:
      'Не связано с FiveM® или Rockstar Games®; все модули и лицензии распространяются независимо.',
    nav: {
      home: 'Главная',
      catalog: 'Каталог',
      licenses: 'Лицензии',
      about: 'О нас',
      status: 'Статус систем',
      contact: 'Контакты',
    },
    portal: 'Портал клиентов',
    admin: 'Вход для админа',
    itemsatis: 'Магазин İtemsatış',
  },
  fr: {
    tagline:
      'Architectures FiveM open-source, plus de 6 446 modules vérifiés et licences numériques sécurisées via İtemsatış.',
    explore: 'PAGES',
    channels: 'CANAUX OFFICIELS',
    legal: '© 2026 Restricted Studio. Tous droits réservés.',
    disclaimer:
      'Sans affiliation officielle avec FiveM® ou Rockstar Games®; tous les scripts et licences sont distribués de manière indépendante.',
    nav: {
      home: 'Accueil',
      catalog: 'Catalogue',
      licenses: 'Licences numériques',
      about: 'À propos',
      status: 'Statut système',
      contact: 'Contact',
    },
    portal: 'Portail client',
    admin: 'Accès admin',
    itemsatis: 'Boutique İtemsatış',
  },
};

export default function SiteFooter({ mainOrigin = '' }: { mainOrigin?: string }) {
  const { locale } = useI18n();
  const copy = FOOTER_COPY[locale] || FOOTER_COPY.tr;
  const siteLink = (path: string) => (mainOrigin ? `${mainOrigin}${path}` : path);

  const linkOrA = (href: string, label: string, isStatusRoute?: boolean) =>
    mainOrigin && !isStatusRoute ? (
      <a key={href} href={siteLink(href)} className="st-footer-link">
        {label}
      </a>
    ) : (
      <Link key={href} href={href} className="st-footer-link">
        {label}
      </Link>
    );

  return (
    <footer className="st-footer">
      <div className="st-container st-footer-inner">
        <div className="st-footer-brand-col">
          <div className="st-footer-logo-row">
            <img
              src="/assets/newlogo.png"
              alt="Restricted Studio"
              width={36}
              height={36}
              className="st-brand-mark"
            />
            <span className="st-footer-brand-title">RESTRICTED STUDIO</span>
          </div>
          <p className="st-footer-tagline">{copy.tagline}</p>
          <a href="mailto:info@restrictedstudio.shop" className="st-footer-mail">
            info@restrictedstudio.shop
          </a>
        </div>

        <div className="st-footer-col">
          <div className="st-footer-col-title">{copy.explore}</div>
          <div className="st-footer-links">
            {linkOrA('/', copy.nav.home)}
            {linkOrA('/katalog', copy.nav.catalog)}
            {linkOrA('/lisanslar', copy.nav.licenses)}
            {linkOrA('/hakkimizda', copy.nav.about)}
            {linkOrA('/status', copy.nav.status, true)}
            {linkOrA('/iletisim', copy.nav.contact)}
          </div>
        </div>

        <div className="st-footer-col">
          <div className="st-footer-col-title">{copy.channels}</div>
          <div className="st-footer-links">
            <a
              href={ITEMSATIS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="st-footer-link"
            >
              {copy.itemsatis} ↗
            </a>
            {linkOrA('/dashboard', copy.portal)}
            {linkOrA('/admin', copy.admin)}
          </div>
        </div>
      </div>

      <div className="st-container st-footer-bottom">
        <span>{copy.legal}</span>
        <span className="st-footer-disclaimer">{copy.disclaimer}</span>
      </div>
    </footer>
  );
}
