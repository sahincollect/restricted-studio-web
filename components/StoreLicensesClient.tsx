'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import ItemsatisLogo from '@/components/ItemsatisLogo';
import { useI18n } from '@/components/I18nProvider';
import SiteNavbar from '@/components/SiteNavbar';
import SiteFooter from '@/components/SiteFooter';
import { HeroPrismBackdrop } from '@/components/StudioReveal';
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
  showingCount: (n: number) => string;
}

const STORE_I18N: Record<Locale, StoreCopy> = {
  tr: {
    eyebrow: 'İTEMSATIŞ RESMİ MAĞAZA VİTRİNİ',
    heroTitle: 'Dijital Lisanslar & Özel İlanlar',
    heroDesc:
      'Yapay zeka abonelikleri, tasarım & video araçları, yazılım lisansları ve özel geliştirici paketleri İtemsatış mağaza güvencesiyle listelenir.',
    badgeListings: 'Aktif İlan',
    badgeEscrow: 'Resmi Kanal',
    badgeEscrowVal: 'İtemsatış',
    badgePrice: 'Teslimat',
    badgePriceVal: '7/24 Aktif',
    profileBtn: 'İtemsatış Profili',
    searchPlaceholder: 'Ürün veya kategori ara (ChatGPT, Canva, CapCut...)',
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
    showingCount: (n) => `${n} ürün listeleniyor`,
  },
  en: {
    eyebrow: 'OFFICIAL ITEMSATIS STOREFRONT',
    heroTitle: 'Digital Licenses & Store Listings',
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
    showingCount: (n) => `Showing ${n} listings`,
  },
  ru: {
    eyebrow: 'ОФИЦИАЛЬНАЯ ВИТРИНА ITEMSATIS',
    heroTitle: 'Цифровые лицензии и товары',
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
    showingCount: (n) => `Показано товаров: ${n}`,
  },
  fr: {
    eyebrow: 'VITRINE OFFICIELLE ITEMSATIS',
    heroTitle: 'Licences numériques & offres',
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

export default function StoreLicensesClient({ initialItems }: StoreLicensesClientProps) {
  const { locale, t, formatNumber } = useI18n();
  const copy = STORE_I18N[locale] || STORE_I18N.tr;

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
    <div className="st-page-shell">
      <SiteNavbar activePath="/lisanslar" />

      <main className="st-main">
        <section className="st-subhero" style={{ overflow: 'hidden' }}>
          <HeroPrismBackdrop />
          <div className="st-container st-subhero-box">
            <div>
              <div className="st-eyebrow">
                <span className="st-eyebrow-dot" aria-hidden="true" />
                <span>{copy.eyebrow}</span>
              </div>
              <h1 className="st-subhero-title">{copy.heroTitle}</h1>
              <p className="st-subhero-desc">{copy.heroDesc}</p>
            </div>

            <div className="st-subhero-stats">
              <div className="st-stat-chip is-light">
                <span className="st-stat-chip-val">{formatNumber(initialItems.length)}</span>
                <span className="st-stat-chip-lbl">{copy.badgeListings}</span>
              </div>
              <div className="st-stat-chip">
                <span className="st-stat-chip-val">{copy.badgeEscrowVal}</span>
                <span className="st-stat-chip-lbl">{copy.badgeEscrow}</span>
              </div>
              <a
                href={ITEMSATIS_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="st-pill-btn is-ember is-sm"
                style={{ alignSelf: 'center' }}
              >
                <ItemsatisLogo variant="icon" width={15} height={15} />
                <span>{copy.profileBtn} ↗</span>
              </a>
            </div>
          </div>
        </section>

        <section className="st-container" style={{ paddingBottom: '80px' }}>
          <div className="rs-store-controls">
            <div className="rs-store-groups" role="tablist">
              {(['all', 'ai', 'design', 'media', 'software', 'fivem'] as GroupFilter[])
                .filter((key) => key === 'all' || groupCounts[key] > 0)
                .map((key) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={group === key}
                    className={`st-filter-pill ${group === key ? 'is-active' : ''}`}
                    onClick={() => setGroup(key)}
                  >
                    <span>{copy.groups[key]}</span>{' '}
                    <span style={{ opacity: 0.68 }}>({formatNumber(groupCounts[key])})</span>
                  </button>
                ))}
            </div>

            <div className="rs-store-search-sort">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={copy.searchPlaceholder}
                className="st-input"
                aria-label={copy.searchPlaceholder}
              />

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="st-select"
                aria-label={copy.sortDefault}
              >
                <option value="default">{copy.sortDefault}</option>
                <option value="price-asc">{copy.sortPriceAsc}</option>
                <option value="price-desc">{copy.sortPriceDesc}</option>
                <option value="name-asc">{copy.sortNameAsc}</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '14px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
            {copy.showingCount(filteredItems.length)}
          </div>

          {filteredItems.length === 0 ? (
            <div
              className="st-area-card"
              style={{ marginTop: '24px', alignItems: 'center', textAlign: 'center', padding: '48px 24px' }}
            >
              <h2 style={{ fontSize: '20px', fontWeight: 600 }}>{copy.emptyTitle}</h2>
              <p style={{ marginTop: '8px', color: 'var(--text-secondary)', fontSize: '13.5px' }}>
                {copy.emptyDesc}
              </p>
              <button
                type="button"
                onClick={() => {
                  setGroup('all');
                  setSearch('');
                }}
                className="st-pill-btn is-light is-sm"
                style={{ marginTop: '18px' }}
              >
                {copy.resetFilter}
              </button>
            </div>
          ) : (
            <div className="rs-store-grid">
              {filteredItems.map((item) => {
                const hasDiscount =
                  typeof item.comparePrice === 'number' && item.comparePrice > item.price;
                const discountPct =
                  hasDiscount && item.comparePrice
                    ? Math.round(((item.comparePrice - item.price) / item.comparePrice) * 100)
                    : 0;

                return (
                  <article key={item.id} className="rs-store-card spotlight-surface">
                    <div className="rs-store-thumb" onClick={() => setSelectedItem(item)}>
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          loading="lazy"
                          decoding="async"
                          width={360}
                          height={225}
                        />
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '11px',
                            color: 'var(--text-muted)',
                          }}
                        >
                          RESTRICTED STUDIO
                        </div>
                      )}
                      {discountPct > 0 && (
                        <span className="rs-store-discount-pill">-%{discountPct}</span>
                      )}
                    </div>

                    <div className="rs-store-card-body">
                      <div className="rs-store-cat">{item.categoryName}</div>
                      <h2
                        className="rs-store-card-title"
                        title={item.title}
                        onClick={() => setSelectedItem(item)}
                      >
                        {item.title}
                      </h2>

                      <div className="rs-store-price-row">
                        <span className="rs-store-price">
                          {formatTryPrice(item.price, formatNumber)}
                        </span>
                        {hasDiscount && item.comparePrice !== null && (
                          <span className="rs-store-compare">
                            {formatTryPrice(item.comparePrice, formatNumber)}
                          </span>
                        )}
                      </div>

                      <div className="rs-store-card-actions">
                        <a
                          href={item.itemsatisUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="st-pill-btn is-light is-sm"
                          style={{ padding: '8px 12px' }}
                        >
                          {copy.buyNow} ↗
                        </a>
                        <button
                          type="button"
                          onClick={() => setSelectedItem(item)}
                          className="st-pill-btn is-outline is-sm"
                          style={{ padding: '8px 12px' }}
                        >
                          {copy.inspect}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <SiteFooter />

      {selectedItem && (
        <div
          className="st-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="rs-store-modal-title"
          onClick={() => setSelectedItem(null)}
        >
          <div className="st-modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
              <span className="rs-store-cat">{selectedItem.categoryName}</span>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="st-circle-btn"
                aria-label={t.common.close}
                style={{ width: '30px', height: '30px' }}
              >
                ✕
              </button>
            </div>

            {selectedItem.imageUrl && (
              <div
                style={{
                  marginTop: '14px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  aspectRatio: '16 / 9',
                  background: '#0b0a0c',
                }}
              >
                <img
                  src={selectedItem.imageUrl}
                  alt={selectedItem.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            )}

            <h2
              id="rs-store-modal-title"
              style={{ marginTop: '18px', fontSize: '20px', fontWeight: 700, lineHeight: 1.3 }}
            >
              {selectedItem.title}
            </h2>

            <div
              style={{
                marginTop: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
              }}
            >
              {formatDescriptionLines(selectedItem.description).map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>

            <div
              style={{
                marginTop: '18px',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '10px',
                padding: '14px',
                borderRadius: '16px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border-hairline)',
                fontSize: '12.5px',
              }}
            >
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{copy.modalCategory}</div>
                <div style={{ fontWeight: 600 }}>{selectedItem.categoryName}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{copy.modalPrice}</div>
                <div style={{ fontWeight: 700, color: 'var(--accent-coral)' }}>
                  {formatTryPrice(selectedItem.price, formatNumber)}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '18px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <a
                href={selectedItem.itemsatisUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="st-pill-btn is-light"
                style={{ flex: 1 }}
              >
                <ItemsatisLogo variant="icon" width={15} height={15} />
                <span>{copy.modalBuyBtn}</span>
              </a>
              <Link href="/iletisim" className="st-pill-btn is-outline">
                {copy.modalContactBtn}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
