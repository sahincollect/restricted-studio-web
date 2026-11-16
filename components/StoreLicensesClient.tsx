'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import ItemsatisLogo from '@/components/ItemsatisLogo';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useI18n } from '@/components/I18nProvider';
import type { Locale } from '@/lib/i18n';
import type { StoreProductGroup } from '@/lib/itemsatis-store';

export interface PublicStoreProduct {
  id: string;
  title: string;
  description: string;
  categoryName: string;
  typeName: string;
  group: StoreProductGroup;
  price: number;
  comparePrice: number | null;
  imageUrl: string;
  itemsatisUrl: string;
  pinned: boolean;
  featured: boolean;
}

interface StoreLicensesClientProps {
  initialItems: PublicStoreProduct[];
  syncedAt: string;
  feedSource: 'live' | 'cache' | 'snapshot';
}

type GroupFilter = 'all' | StoreProductGroup;
type SortKey = 'default' | 'price-asc' | 'price-desc' | 'name-asc';

const ITEMSATIS_PROFILE_URL = 'https://www.itemsatis.com/p/saintstudio';

interface StoreCopy {
  eyebrow: string;
  heroTitle: string;
  heroDesc: string;
  badgeListings: string;
  badgeEscrow: string;
  badgeEscrowVal: string;
  badgePrice: string;
  badgePriceVal: string;
  profileBtn: string;
  searchPlaceholder: string;
  sortDefault: string;
  sortPriceAsc: string;
  sortPriceDesc: string;
  sortNameAsc: string;
  groups: Record<GroupFilter, string>;
  buyNow: string;
  inspect: string;
  emptyTitle: string;
  emptyDesc: string;
  resetFilter: string;
  modalBuyBtn: string;
  modalContactBtn: string;
  modalCategory: string;
  modalDelivery: string;
  modalPrice: string;
  navAbout: string;
  navContact: string;
  showingCount: (n: number) => string;
}

const STORE_I18N: Record<Locale, StoreCopy> = {
  tr: {
    eyebrow: 'İTEMSATIŞ RESMİ MAĞAZA VİTRİNİ',
    heroTitle: 'DİJİTAL LİSANSLAR & ÖZEL İLANLAR',
    heroDesc:
      'Yapay zeka abonelikleri, tasarım & video araçları, yazılım lisansları ve özel geliştirici paketleri İtemsatış mağaza güvencesiyle listelenir.',
    badgeListings: 'Aktif İlan',
    badgeEscrow: 'Resmi Kanal',
    badgeEscrowVal: 'İtemsatış',
    badgePrice: 'Teslimat',
    badgePriceVal: '7/24 Aktif',
    profileBtn: "İtemsatış Profili",
    searchPlaceholder: 'Ürün veya kategori ara (ChatGPT, Canva, CapCut, Gabz...)',
    sortDefault: 'Mağaza Sırası',
    sortPriceAsc: 'Fiyat: Artan',
    sortPriceDesc: 'Fiyat: Azalan',
    sortNameAsc: 'İsim: A-Z',
    groups: {
      all: 'Tümü',
      ai: 'Yapay Zeka',
      design: 'Tasarım & Video',
      media: 'Üyelik & Medya',
      software: 'Lisans & Yazılım',
      fivem: 'FiveM & Sunucu',
    },
    buyNow: 'Satın Al',
    inspect: 'İncele',
    emptyTitle: 'Eşleşen ilan bulunamadı',
    emptyDesc: 'Arama filtresini temizleyip tüm aktif mağaza ürünlerini görüntüleyebilirsiniz.',
    resetFilter: 'Filtreleri Sıfırla',
    modalBuyBtn: "İtemsatış'ta Satın Al ↗",
    modalContactBtn: 'Destek / İletişim',
    modalCategory: 'Kategori',
    modalDelivery: 'Teslimat Tipi',
    modalPrice: 'Güncel Fiyat',
    navAbout: 'Hakkımızda',
    navContact: 'İletişim',
    showingCount: (n) => `${n} ürün listeleniyor`,
  },
  en: {
    eyebrow: 'OFFICIAL ITEMSATIS STOREFRONT',
    heroTitle: 'DIGITAL LICENSES & STORE LISTINGS',
    heroDesc:
      'AI subscriptions, creative & video tools, software licenses, and curated developer bundles backed by official Itemsatis escrow.',
    badgeListings: 'Active Listings',
    badgeEscrow: 'Verified Channel',
    badgeEscrowVal: 'Itemsatis',
    badgePrice: 'Delivery',
    badgePriceVal: '24/7 Active',
    profileBtn: 'Itemsatis Store',
    searchPlaceholder: 'Search products or categories (ChatGPT, Canva, CapCut...)',
    sortDefault: 'Store Order',
    sortPriceAsc: 'Price: Low to High',
    sortPriceDesc: 'Price: High to Low',
    sortNameAsc: 'Name: A-Z',
    groups: {
      all: 'All',
      ai: 'AI Tools',
      design: 'Design & Video',
      media: 'Media & Accounts',
      software: 'Licenses & Software',
      fivem: 'FiveM & Server',
    },
    buyNow: 'Buy Now',
    inspect: 'Details',
    emptyTitle: 'No matching listings found',
    emptyDesc: 'Clear your search query or switch category tabs to view all available items.',
    resetFilter: 'Reset Filters',
    modalBuyBtn: 'Purchase on Itemsatis ↗',
    modalContactBtn: 'Support / Contact',
    modalCategory: 'Category',
    modalDelivery: 'Listing Type',
    modalPrice: 'Current Price',
    navAbout: 'About',
    navContact: 'Contact',
    showingCount: (n) => `Showing ${n} listings`,
  },
  ru: {
    eyebrow: 'ОФИЦИАЛЬНАЯ ВИТРИНА ITEMSATIS',
    heroTitle: 'ЦИФРОВЫЕ ЛИЦЕНЗИИ И ТОВАРЫ',
    heroDesc:
      'Подписки на ИИ, инструменты дизайна и видео, лицензии ПО и специальные наборы с защитой сделок через официальный магазин Itemsatis.',
    badgeListings: 'Активных лотов',
    badgeEscrow: 'Канал продаж',
    badgeEscrowVal: 'Itemsatis',
    badgePrice: 'Выдача',
    badgePriceVal: '24/7',
    profileBtn: 'Профиль Itemsatis',
    searchPlaceholder: 'Поиск по названию или категории (ChatGPT, Canva...)',
    sortDefault: 'По умолчанию',
    sortPriceAsc: 'Цена: по возрастанию',
    sortPriceDesc: 'Цена: по убыванию',
    sortNameAsc: 'Название: А-Я',
    groups: {
      all: 'Все',
      ai: 'ИИ-сервисы',
      design: 'Дизайн и видео',
      media: 'Подписки и медиа',
      software: 'ПО и лицензии',
      fivem: 'FiveM и серверы',
    },
    buyNow: 'Купить',
    inspect: 'Подробнее',
    emptyTitle: 'Товары не найдены',
    emptyDesc: 'Сбросьте фильтр поиска, чтобы увидеть все доступные позиции.',
    resetFilter: 'Сбросить фильтры',
    modalBuyBtn: 'Купить на Itemsatis ↗',
    modalContactBtn: 'Поддержка / Контакты',
    modalCategory: 'Категория',
    modalDelivery: 'Тип выдачи',
    modalPrice: 'Актуальная цена',
    navAbout: 'О нас',
    navContact: 'Контакты',
    showingCount: (n) => `Показано товаров: ${n}`,
  },
  fr: {
    eyebrow: 'VITRINE OFFICIELLE ITEMSATIS',
    heroTitle: 'LICENCES NUMÉRIQUES & OFFRES',
    heroDesc:
      'Abonnements IA, outils créatifs & vidéo, licences logicielles et packs développeurs garantis via notre boutique officielle Itemsatis.',
    badgeListings: 'Annonces actives',
    badgeEscrow: 'Boutique officielle',
    badgeEscrowVal: 'Itemsatis',
    badgePrice: 'Livraison',
    badgePriceVal: 'Active 24/7',
    profileBtn: 'Profil Itemsatis',
    searchPlaceholder: 'Rechercher un produit (ChatGPT, Canva, CapCut...)',
    sortDefault: 'Ordre boutique',
    sortPriceAsc: 'Prix croissant',
    sortPriceDesc: 'Prix décroissant',
    sortNameAsc: 'Nom (A-Z)',
    groups: {
      all: 'Tout',
      ai: 'Outils IA',
      design: 'Design & Vidéo',
      media: 'Médias & Comptes',
      software: 'Licences & Logiciels',
      fivem: 'FiveM & Serveur',
    },
    buyNow: 'Acheter',
    inspect: 'Détails',
    emptyTitle: 'Aucun produit trouvé',
    emptyDesc: 'Réinitialisez les filtres pour afficher l’ensemble du catalogue boutique.',
    resetFilter: 'Réinitialiser',
    modalBuyBtn: 'Acheter sur Itemsatis ↗',
    modalContactBtn: 'Support / Contact',
    modalCategory: 'Catégorie',
    modalDelivery: 'Type d’offre',
    modalPrice: 'Prix actuel',
    navAbout: 'À propos',
    navContact: 'Contact',
    showingCount: (n) => `${n} offres affichées`,
  },
};

function formatTryPrice(amount: number, formatNumber: (n: number) => string): string {
  const rounded = Math.round(amount * 100) / 100;
  if (Number.isInteger(rounded)) {
    return `${formatNumber(rounded)} TL`;
  }
  return `${rounded.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL`;
}

function formatDescriptionLines(text: string): string[] {
  const clean = text.replace(/✅/g, '\n✅').trim();
  return clean
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function StoreLicensesClient({
  initialItems,
}: StoreLicensesClientProps) {
  const { locale, t, formatNumber } = useI18n();
  const copy = STORE_I18N[locale] || STORE_I18N.tr;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [group, setGroup] = useState<GroupFilter>('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('default');
  const [selectedItem, setSelectedItem] = useState<PublicStoreProduct | null>(null);

  const groupCounts = useMemo(() => {
    const counts: Record<GroupFilter, number> = {
      all: initialItems.length,
      ai: 0,
      design: 0,
      media: 0,
      software: 0,
      fivem: 0,
    };
    for (const item of initialItems) {
      counts[item.group] = (counts[item.group] || 0) + 1;
    }
    return counts;
  }, [initialItems]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLocaleLowerCase('tr');
    let list = initialItems.filter((item) => {
      if (group !== 'all' && item.group !== group) return false;
      if (!q) return true;
      return (
        item.title.toLocaleLowerCase('tr').includes(q) ||
        item.categoryName.toLocaleLowerCase('tr').includes(q) ||
        item.description.toLocaleLowerCase('tr').includes(q)
      );
    });

    if (sort === 'price-asc') {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      list = [...list].sort((a, b) => b.price - a.price);
    } else if (sort === 'name-asc') {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title, 'tr'));
    }

    return list;
  }, [initialItems, group, search, sort]);

  return (
    <div className="rs-store-page">
      <header className="global-nav">
        <div className="nav-container">
          <div className="nav-brand-wrap">
            <Link href="/" className="nav-brand" aria-label={`Restricted Studio ${t.common.home}`}>
              <img src="/assets/rslogo.jpg" alt="Restricted Studio" className="nav-brand-logo" />
              <span className="nav-brand-text">RESTRICTED STUDIO</span>
            </Link>
            <a
              href={ITEMSATIS_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="nav-brand-trust"
              title={t.common.itemsatisOfficialStore}
            >
              <ItemsatisLogo variant="icon" width={12} height={12} />
              <span>{t.common.itemsatisTrust}</span>
            </a>
          </div>

          <nav className={`nav-menu ${mobileMenuOpen ? 'open' : ''}`} aria-label={copy.eyebrow}>
            <Link href="/" className="nav-item" onClick={() => setMobileMenuOpen(false)}>
              {t.common.home}
            </Link>
            <Link
              href="/katalog"
              className="nav-item nav-katalog-shimmer"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t.common.catalog}
            </Link>
            <Link
              href="/lisanslar"
              className="nav-item nav-item-active nav-katalog-shimmer"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t.common.licenses}
            </Link>
            <Link href="/hakkimizda" className="nav-item" onClick={() => setMobileMenuOpen(false)}>
              {copy.navAbout}
            </Link>
            <Link href="/iletisim" className="nav-item" onClick={() => setMobileMenuOpen(false)}>
              {copy.navContact}
            </Link>

            <div className="nav-mobile-actions">
              <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(240,240,240,0.65)' }}>
                  {t.common.langLabel.toUpperCase()}
                </span>
                <LanguageSwitcher compact />
              </div>
              <Link
                href="/katalog"
                className="btn btn-full"
                style={{ background: '#080808', color: '#F0F0F0', border: '1.5px solid #F0F0F0', marginBottom: '8px' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.common.catalog}
              </Link>
              <Link
                href="/dashboard"
                className="btn btn-full"
                style={{ background: '#080808', color: '#F0F0F0', border: '1.5px solid #F0F0F0', marginBottom: '8px' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.common.clientPortal}
              </Link>
              <a
                href={ITEMSATIS_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-itemsatis btn-full"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <ItemsatisLogo variant="icon" width={18} height={18} />
                <span>{t.catalog.mobileItemsatis}</span>
              </a>
            </div>
          </nav>

          <div className="nav-cta-group">
            <LanguageSwitcher compact className="bpn-lang-desktop" />

            <a
              href={ITEMSATIS_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="nav-btn-itemsatis"
              title={t.common.itemsatisStore}
              aria-label={t.common.itemsatisStore}
            >
              <ItemsatisLogo variant="icon" width={15} height={15} />
              <span>{t.common.itemsatisShort}</span>
            </a>

            <Link href="/dashboard" className="nav-btn-portal">
              <span>{t.common.clientPortal}</span>
            </Link>

            <button
              type="button"
              className={`nav-mobile-toggle ${mobileMenuOpen ? 'active' : ''}`}
              aria-label={t.common.openMenu}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((prev) => !prev)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <section className="catalog-hero-strip">
        <div className="container catalog-hero-strip-inner">
          <div className="chs-left">
            <div className="chs-pill">
              <span className="chs-dot" aria-hidden="true" />
              <span>{copy.eyebrow}</span>
            </div>
            <h1 className="chs-title">{copy.heroTitle}</h1>
            <p className="chs-desc">{copy.heroDesc}</p>
          </div>

          <div className="chs-right">
            <div className="chs-badges-row">
              <div className="chs-badge-item">
                <span className="chs-badge-num">{formatNumber(initialItems.length)}</span>
                <span className="chs-badge-lbl">{copy.badgeListings}</span>
              </div>
              <div className="chs-badge-item">
                <span className="chs-badge-num">{copy.badgeEscrowVal}</span>
                <span className="chs-badge-lbl">{copy.badgeEscrow}</span>
              </div>
              <div className="chs-badge-item">
                <span className="chs-badge-num">{copy.badgePriceVal}</span>
                <span className="chs-badge-lbl">{copy.badgePrice}</span>
              </div>
            </div>

            <div className="chs-actions">
              <a
                href={ITEMSATIS_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="chs-guide-btn"
                style={{ textDecoration: 'none' }}
              >
                <ItemsatisLogo variant="icon" width={14} height={14} />
                <span>{copy.profileBtn} ↗</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <main className="container rs-store-main">
        <div className="rs-store-toolbar">
          <div className="rs-store-groups" role="tablist" aria-label={copy.groups.all}>
            {(['all', 'ai', 'design', 'media', 'software', 'fivem'] as GroupFilter[]).map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={group === key}
                className={`rs-store-group-pill ${group === key ? 'is-active' : ''}`}
                onClick={() => setGroup(key)}
              >
                <span>{copy.groups[key]}</span>
                <span className="rs-store-group-count">{formatNumber(groupCounts[key])}</span>
              </button>
            ))}
          </div>

          <div className="rs-store-controls">
            <div className="rs-store-search-wrap">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={copy.searchPlaceholder}
                className="rs-store-search"
                aria-label={copy.searchPlaceholder}
              />
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rs-store-sort"
              aria-label={copy.sortDefault}
            >
              <option value="default">{copy.sortDefault}</option>
              <option value="price-asc">{copy.sortPriceAsc}</option>
              <option value="price-desc">{copy.sortPriceDesc}</option>
              <option value="name-asc">{copy.sortNameAsc}</option>
            </select>
          </div>
        </div>

        <div className="rs-store-meta-bar">
          <span>{copy.showingCount(filteredItems.length)}</span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="rs-store-empty">
            <h2>{copy.emptyTitle}</h2>
            <p>{copy.emptyDesc}</p>
            <button
              type="button"
              onClick={() => {
                setGroup('all');
                setSearch('');
              }}
              className="rs-store-buy-btn"
            >
              {copy.resetFilter}
            </button>
          </div>
        ) : (
          <div className="rs-store-grid">
            {filteredItems.map((item) => {
              const hasDiscount =
                typeof item.comparePrice === 'number' && item.comparePrice > item.price;
              const shortDesc = formatDescriptionLines(item.description).slice(0, 2).join(' · ');

              return (
                <article key={item.id} className="rs-store-card spotlight-surface">
                  <div
                    className="rs-store-card-clickable"
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="rs-store-media">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          loading="lazy"
                          className="rs-store-img"
                        />
                      ) : (
                        <div className="rs-store-img-placeholder">RESTRICTED STUDIO</div>
                      )}
                      <span className="rs-store-cat-badge">{item.categoryName}</span>
                    </div>

                    <div className="rs-store-body">
                      <h2 className="rs-store-title" title={item.title}>
                        {item.title}
                      </h2>
                      <p className="rs-store-desc">{shortDesc || item.typeName}</p>
                    </div>
                  </div>

                  <div className="rs-store-footer">
                    <div className="rs-store-price-wrap">
                      {hasDiscount && item.comparePrice !== null && (
                        <s className="rs-store-price-old">
                          {formatTryPrice(item.comparePrice, formatNumber)}
                        </s>
                      )}
                      <span className="rs-store-price-now">
                        {formatTryPrice(item.price, formatNumber)}
                      </span>
                    </div>

                    <div className="rs-store-actions">
                      <button
                        type="button"
                        onClick={() => setSelectedItem(item)}
                        className="rs-store-inspect-btn"
                      >
                        {copy.inspect}
                      </button>
                      <a
                        href={item.itemsatisUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rs-store-buy-btn"
                      >
                        <span>{copy.buyNow}</span>
                        <span aria-hidden="true">↗</span>
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <footer className="site-footer rs-store-footer-wrap">
        <div className="container">
          <div className="footer-legal" style={{ borderTop: 0, paddingTop: 0 }}>
            <p>{t.catalog.footerCopyright}</p>
            <p className="footer-note">{t.catalog.footerDisclaimer}</p>
          </div>
        </div>
      </footer>

      {selectedItem && (
        <div
          className="guide-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="rs-store-modal-title"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="guide-modal-dialog catalog-preview-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedItem(null)}
              className="guide-modal-close"
              aria-label={t.common.close}
            >
              ✕
            </button>

            {selectedItem.imageUrl && (
              <div className="cpm-cover-wrap">
                <img
                  src={selectedItem.imageUrl}
                  alt={selectedItem.title}
                  className="cpm-cover-img"
                />
              </div>
            )}

            <div className="cpm-badge-row">
              <span className="cpm-kicker">{selectedItem.categoryName}</span>
            </div>

            <h2 id="rs-store-modal-title" className="cpm-title">
              {selectedItem.title}
            </h2>

            <div className="rs-store-modal-desc">
              {formatDescriptionLines(selectedItem.description).map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>

            <dl className="catalog-preview-meta">
              <div className="cpm-meta-cell">
                <dt>{copy.modalCategory}</dt>
                <dd>{selectedItem.categoryName}</dd>
              </div>
              <div className="cpm-meta-cell">
                <dt>{copy.modalDelivery}</dt>
                <dd>{selectedItem.typeName}</dd>
              </div>
              <div className="cpm-meta-cell">
                <dt>{copy.modalPrice}</dt>
                <dd>{formatTryPrice(selectedItem.price, formatNumber)}</dd>
              </div>
              <div className="cpm-meta-cell">
                <dt>{copy.badgeEscrow}</dt>
                <dd>İtemsatış / Restricted Studio</dd>
              </div>
            </dl>

            <div className="cpm-actions">
              <a
                href={selectedItem.itemsatisUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rs-store-modal-cta"
              >
                <ItemsatisLogo variant="icon" width={16} height={16} />
                <span>{copy.modalBuyBtn}</span>
              </a>
              <Link href="/iletisim" className="cpm-discord-btn">
                {copy.modalContactBtn}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
