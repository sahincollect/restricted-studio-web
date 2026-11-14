import type { Locale } from './i18n';

export interface InteractiveLocaleStrings {
  showcase: {
    headerEyebrow: string;
    statusOperational: string;
    loadProfileLabel: string;
    core: {
      idle: string;
      load128: string;
      stress256: string;
    };
    metrics: {
      resmonLabel: string;
      resmonSub: string;
      sqlLabel: string;
      sqlSub: string;
      escrowLabel: string;
      escrowSub: string;
      archiveLabel: string;
      archiveSub: string;
    };
    bridgesLabel: string;
    archivePanelTitle: string;
    archivePanelSub: string;
    slaPanelTitle: string;
    slaItems: readonly [string, string, string];
    openCatalogCta: string;
  };
  catalogExtra: {
    viewsLabel: string;
    viewAll: string;
    viewFeatured: string;
    viewPopular: string;
    sortPopular: string;
    sortFeatured: string;
    popularStripTitle: string;
    popularStripSub: string;
    featuredTag: string;
    clicksUnit: string;
    inspectBtn: string;
    quickCopy: string;
    quickCopied: string;
    previewTitle: string;
    previewId: string;
    previewCat: string;
    previewClicks: string;
    previewStatus: string;
    gridHeadingAll: string;
    gridHeadingResults: string;
    studioLabel: string;
    roleLabel: string;
    compatLabel: string;
    openSourceSpec: string;
    searchRelevanceHint: string;
  };
}

export const INTERACTIVE_I18N: Record<Locale, InteractiveLocaleStrings> = {
  tr: {
    showcase: {
      headerEyebrow: 'KURUMSAL ALTYAPI & TELEMETRİ',
      statusOperational: 'OPERASYONEL',
      loadProfileLabel: 'Yük Profili',
      core: {
        idle: 'STANDBY · 0P',
        load128: 'PROD · 128P',
        stress256: 'STRESS · 256P',
      },
      metrics: {
        resmonLabel: 'RESMON',
        resmonSub: 'Sunucu Thread',
        sqlLabel: 'DB SORGU',
        sqlSub: 'InnoDB UTF8MB4',
        escrowLabel: 'ESCROW',
        escrowSub: 'Tam Açık Kaynak',
        archiveLabel: 'DOĞRULANMIŞ',
        archiveSub: 'Aktif Modül',
      },
      bridgesLabel: 'Çekirdek Uyumu',
      archivePanelTitle: 'ARŞİV DAĞILIMI',
      archivePanelSub: '6 Ana Kategori',
      slaPanelTitle: 'KURUMSAL STANDART',
      slaItems: [
        'Backdoor & webhook güvenlik taramalı temiz kod',
        'Escrow kilitsiz %100 düzenlenebilir mimari',
        'İtemsatış 3D Secure & Discord 7/24 SLA',
      ],
      openCatalogCta: 'KATALOĞU AÇ',
    },
    catalogExtra: {
      viewsLabel: 'Koleksiyon',
      viewAll: 'Tüm Arşiv',
      viewFeatured: 'Öne Çıkanlar',
      viewPopular: 'En Çok Tıklananlar',
      sortPopular: 'En Çok Tıklanan',
      sortFeatured: 'Öne Çıkanlar',
      popularStripTitle: 'EN ÇOK TIKLANANLAR',
      popularStripSub: 'Topluluğun en çok açtığı 4 paket',
      featuredTag: 'ÖNE ÇIKAN',
      clicksUnit: 'tık',
      inspectBtn: 'İncele',
      quickCopy: 'İsmi Kopyala',
      quickCopied: '✓ Kopyalandı',
      previewTitle: 'Paket Detayı',
      previewId: 'Arşiv Kodu',
      previewCat: 'Kategori',
      previewClicks: 'Tıklanma',
      previewStatus: 'Durum',
      gridHeadingAll: 'KATALOG PAKETLERİ',
      gridHeadingResults: 'ARAMA SONUÇLARI',
      studioLabel: 'Yapımcı / Marka',
      roleLabel: 'Sistem Türü',
      compatLabel: 'Uyumluluk / Özellikler',
      openSourceSpec: 'Açık Kaynak',
      searchRelevanceHint: 'Eşleşme sırasına göre',
    },
  },
  en: {
    showcase: {
      headerEyebrow: 'ENTERPRISE INFRASTRUCTURE',
      statusOperational: 'OPERATIONAL',
      loadProfileLabel: 'Load Profile',
      core: {
        idle: 'STANDBY · 0P',
        load128: 'PROD · 128P',
        stress256: 'STRESS · 256P',
      },
      metrics: {
        resmonLabel: 'RESMON',
        resmonSub: 'Server Thread',
        sqlLabel: 'DB QUERY',
        sqlSub: 'InnoDB UTF8MB4',
        escrowLabel: 'ESCROW',
        escrowSub: '100% Open Source',
        archiveLabel: 'VERIFIED',
        archiveSub: 'Active Modules',
      },
      bridgesLabel: 'Core Bridge',
      archivePanelTitle: 'ARCHIVE BREAKDOWN',
      archivePanelSub: '6 Main Sectors',
      slaPanelTitle: 'ENTERPRISE SLA',
      slaItems: [
        'Audited clean source · Zero hidden webhooks',
        '100% unlocked architecture · Zero Escrow DRM',
        '3D Secure storefront & 24/7 Discord SLA',
      ],
      openCatalogCta: 'OPEN CATALOG',
    },
    catalogExtra: {
      viewsLabel: 'Collections',
      viewAll: 'All Archive',
      viewFeatured: 'Featured',
      viewPopular: 'Most Clicked',
      sortPopular: 'Most Clicked',
      sortFeatured: 'Featured',
      popularStripTitle: 'MOST CLICKED',
      popularStripSub: 'Top 4 viewed packages in archive',
      featuredTag: 'FEATURED',
      clicksUnit: 'clicks',
      inspectBtn: 'Inspect',
      quickCopy: 'Copy Name',
      quickCopied: '✓ Copied',
      previewTitle: 'Package Overview',
      previewId: 'Archive ID',
      previewCat: 'Category',
      previewClicks: 'Clicks',
      previewStatus: 'Status',
      gridHeadingAll: 'CATALOG PACKAGES',
      gridHeadingResults: 'SEARCH RESULTS',
      studioLabel: 'Studio / Brand',
      roleLabel: 'System Type',
      compatLabel: 'Compatibility / Specs',
      openSourceSpec: 'Open Source',
      searchRelevanceHint: 'Ranked by relevance',
    },
  },
  ru: {
    showcase: {
      headerEyebrow: 'КОРПОРАТИВНАЯ ИНФРАСТРУКТУРА',
      statusOperational: 'В СЕТИ',
      loadProfileLabel: 'Профиль',
      core: {
        idle: 'ПРОСТОЙ · 0P',
        load128: 'PROD · 128P',
        stress256: 'СТРЕСС · 256P',
      },
      metrics: {
        resmonLabel: 'RESMON',
        resmonSub: 'Поток сервера',
        sqlLabel: 'SQL ЗАПРОС',
        sqlSub: 'InnoDB UTF8MB4',
        escrowLabel: 'ESCROW',
        escrowSub: 'Открытый код',
        archiveLabel: 'ПРОВЕРЕНО',
        archiveSub: 'Модулей в базе',
      },
      bridgesLabel: 'Совместимость',
      archivePanelTitle: 'СОСТАВ АРХИВА',
      archivePanelSub: '6 категорий',
      slaPanelTitle: 'СТАНДАРТ SLA',
      slaItems: [
        'Аудит чистоты кода · Без скрытых вебхуков',
        'Открытый код без привязки Escrow DRM',
        'Защищённая оплата и поддержка SLA 24/7',
      ],
      openCatalogCta: 'ОТКРЫТЬ КАТАЛОГ',
    },
    catalogExtra: {
      viewsLabel: 'Подборки',
      viewAll: 'Весь архив',
      viewFeatured: 'Рекомендуемые',
      viewPopular: 'Популярные',
      sortPopular: 'По кликам',
      sortFeatured: 'Рекомендуемые',
      popularStripTitle: 'САМЫЕ ПОПУЛЯРНЫЕ',
      popularStripSub: 'Топ-4 просматриваемых пакета',
      featuredTag: 'ТОП',
      clicksUnit: 'клик.',
      inspectBtn: 'Обзор',
      quickCopy: 'Копировать',
      quickCopied: '✓ Скопировано',
      previewTitle: 'Детали пакета',
      previewId: 'Код архива',
      previewCat: 'Категория',
      previewClicks: 'Клики',
      previewStatus: 'Статус',
      gridHeadingAll: 'ПАКЕТЫ КАТАЛОГА',
      gridHeadingResults: 'РЕЗУЛЬТАТЫ ПОИСКА',
      studioLabel: 'Студия / Бренд',
      roleLabel: 'Тип пакета',
      compatLabel: 'Совместимость',
      openSourceSpec: 'Открытый код',
      searchRelevanceHint: 'По релевантности',
    },
  },
  fr: {
    showcase: {
      headerEyebrow: 'INFRASTRUCTURE ENTREPRISE',
      statusOperational: 'OPÉRATIONNEL',
      loadProfileLabel: 'Profil Charge',
      core: {
        idle: 'VEILLE · 0P',
        load128: 'PROD · 128P',
        stress256: 'STRESS · 256P',
      },
      metrics: {
        resmonLabel: 'RESMON',
        resmonSub: 'Thread Serveur',
        sqlLabel: 'REQUÊTE SQL',
        sqlSub: 'InnoDB UTF8MB4',
        escrowLabel: 'ESCROW',
        escrowSub: '100% Open Source',
        archiveLabel: 'VÉRIFIÉ',
        archiveSub: 'Modules Actifs',
      },
      bridgesLabel: 'Compatibilité',
      archivePanelTitle: 'RÉPARTITION ARCHIVE',
      archivePanelSub: '6 Catégories',
      slaPanelTitle: 'GARANTIE SLA',
      slaItems: [
        'Code audité · Aucune porte dérobée ni webhook',
        'Architecture ouverte · Zéro verrou Escrow DRM',
        'Paiement sécurisé & support Discord 24/7',
      ],
      openCatalogCta: 'OUVRIR CATALOGUE',
    },
    catalogExtra: {
      viewsLabel: 'Sélections',
      viewAll: 'Toute l’archive',
      viewFeatured: 'À la une',
      viewPopular: 'Les plus cliqués',
      sortPopular: 'Les plus cliqués',
      sortFeatured: 'À la une',
      popularStripTitle: 'LES PLUS CLIQUÉS',
      popularStripSub: 'Top 4 des packs consultés',
      featuredTag: 'À LA UNE',
      clicksUnit: 'clics',
      inspectBtn: 'Aperçu',
      quickCopy: 'Copier le nom',
      quickCopied: '✓ Copié',
      previewTitle: 'Détails du pack',
      previewId: 'ID Archive',
      previewCat: 'Catégorie',
      previewClicks: 'Clics',
      previewStatus: 'Statut',
      gridHeadingAll: 'PACKS DU CATALOGUE',
      gridHeadingResults: 'RÉSULTATS',
      studioLabel: 'Studio / Marque',
      roleLabel: 'Type',
      compatLabel: 'Compatibilité',
      openSourceSpec: 'Open Source',
      searchRelevanceHint: 'Triés par pertinence',
    },
  },
};
