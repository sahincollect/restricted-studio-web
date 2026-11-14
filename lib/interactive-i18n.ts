import type { Locale } from './i18n';

export interface InteractiveLocaleStrings {
  showcase: {
    tabs: {
      arcade: string;
      core: string;
      console: string;
    };
    arcade: {
      title: string;
      score: string;
      best: string;
      playBtn: string;
      resumeHint: string;
      retryBtn: string;
      autoDemo: string;
      gameOver: string;
      victory: string;
      controls: string;
      godmode: string;
      mobilePreviewNote: string;
    };
    core: {
      idle: string;
      load128: string;
      stress256: string;
    };
    f8: {
      openFull: string;
      placeholder: string;
      helpHint: string;
      close: string;
      title: string;
      emptySearch: string;
      addToCartDone: string;
      openInCatalog: string;
      godmodeToast: string;
    };
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
  };
}

export const INTERACTIVE_I18N: Record<Locale, InteractiveLocaleStrings> = {
  tr: {
    showcase: {
      tabs: { arcade: 'PAC-RUN', core: 'CORE', console: 'F8' },
      arcade: {
        title: 'PAC-RUN // NOIR',
        score: 'SKOR',
        best: 'REKOR',
        playBtn: 'OYNA',
        resumeHint: 'WASD / OK TUŞLARI',
        retryBtn: 'TEKRAR OYNA',
        autoDemo: 'OTOPİLOT',
        gameOver: 'ESCROW YAKALADI',
        victory: 'ARŞİV TEMİZLENDİ',
        controls: 'WASD / Yön · F8 Konsol',
        godmode: 'GODMODE',
        mobilePreviewNote: 'Dokunmatik yön tuşlarıyla oyna',
      },
      core: {
        idle: 'BOŞTA',
        load128: '128 OYUNCU',
        stress256: '256 YÜK',
      },
      f8: {
        openFull: 'F8 Konsolu Aç (Ctrl+K)',
        placeholder: 'komut yaz: help, noclip, pacman, ara roxwood, lang en...',
        helpHint: 'F8 / Ctrl+K · "help" yazarak gizli komutları gör',
        close: 'ESC',
        title: 'RESTRICTED F8 KONSOL',
        emptySearch: 'Aramak için paket adı veya komut yazın.',
        addToCartDone: 'Katalogda açılıyor',
        openInCatalog: 'Katalogda Göster →',
        godmodeToast: 'NOIR GODMODE AKTİF · 0.00 MS OVERDRIVE',
      },
    },
    catalogExtra: {
      viewsLabel: 'Koleksiyon',
      viewAll: 'Tüm Arşiv',
      viewFeatured: 'Öne Çıkanlar',
      viewPopular: 'En Çok Tıklananlar',
      sortPopular: 'En Çok Tıklanan',
      sortFeatured: 'Öne Çıkanlar',
      popularStripTitle: 'EN ÇOK TIKLANANLAR',
      popularStripSub: 'Topluluğun en sık incelediği paketler',
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
    },
  },
  en: {
    showcase: {
      tabs: { arcade: 'PAC-RUN', core: 'CORE', console: 'F8' },
      arcade: {
        title: 'PAC-RUN // NOIR',
        score: 'SCORE',
        best: 'BEST',
        playBtn: 'PLAY',
        resumeHint: 'WASD / ARROWS',
        retryBtn: 'RETRY',
        autoDemo: 'AUTOPILOT',
        gameOver: 'CAUGHT BY ESCROW',
        victory: 'SECTOR CLEARED',
        controls: 'WASD / Arrows · F8 Console',
        godmode: 'GODMODE',
        mobilePreviewNote: 'Use D-pad below to play',
      },
      core: {
        idle: 'IDLE',
        load128: '128 PLAYERS',
        stress256: '256 STRESS',
      },
      f8: {
        openFull: 'Open F8 Console (Ctrl+K)',
        placeholder: 'command: help, noclip, pacman, find roxwood, lang tr...',
        helpHint: 'F8 / Ctrl+K · type "help" for secret commands',
        close: 'ESC',
        title: 'RESTRICTED F8 CONSOLE',
        emptySearch: 'Type a package keyword or console command.',
        addToCartDone: 'Opening in catalog',
        openInCatalog: 'Open in Catalog →',
        godmodeToast: 'NOIR GODMODE ENABLED · 0.00 MS OVERDRIVE',
      },
    },
    catalogExtra: {
      viewsLabel: 'Collections',
      viewAll: 'All Archive',
      viewFeatured: 'Featured',
      viewPopular: 'Most Clicked',
      sortPopular: 'Most Clicked',
      sortFeatured: 'Featured',
      popularStripTitle: 'MOST CLICKED',
      popularStripSub: 'Top explored packages across the archive',
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
    },
  },
  ru: {
    showcase: {
      tabs: { arcade: 'PAC-RUN', core: 'CORE', console: 'F8' },
      arcade: {
        title: 'PAC-RUN // NOIR',
        score: 'СЧЁТ',
        best: 'РЕКОРД',
        playBtn: 'ИГРАТЬ',
        resumeHint: 'WASD / СТРЕЛКИ',
        retryBtn: 'ЗАНОВО',
        autoDemo: 'АВТОДЕМО',
        gameOver: 'ПОЙМАН ESCROW',
        victory: 'СЕКТОР ОЧИЩЕН',
        controls: 'WASD / Стрелки · F8',
        godmode: 'GODMODE',
        mobilePreviewNote: 'Управление кнопками ниже',
      },
      core: {
        idle: 'ПРОСТОЙ',
        load128: '128 ИГРОКОВ',
        stress256: '256 СТРЕСС',
      },
      f8: {
        openFull: 'Открыть F8 Консоль (Ctrl+K)',
        placeholder: 'команда: help, noclip, pacman, find roxwood, lang en...',
        helpHint: 'F8 / Ctrl+K · введите "help" для секретных команд',
        close: 'ESC',
        title: 'КОНСОЛЬ RESTRICTED F8',
        emptySearch: 'Введите название пакета или команду консоли.',
        addToCartDone: 'Открытие в каталоге',
        openInCatalog: 'Открыть в каталоге →',
        godmodeToast: 'NOIR GODMODE ВКЛЮЧЁН · 0.00 MS',
      },
    },
    catalogExtra: {
      viewsLabel: 'Подборки',
      viewAll: 'Весь архив',
      viewFeatured: 'Рекомендуемые',
      viewPopular: 'Популярные',
      sortPopular: 'По кликам',
      sortFeatured: 'Рекомендуемые',
      popularStripTitle: 'САМЫЕ ПОПУЛЯРНЫЕ',
      popularStripSub: 'Наиболее часто открываемые пакеты',
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
    },
  },
  fr: {
    showcase: {
      tabs: { arcade: 'PAC-RUN', core: 'CORE', console: 'F8' },
      arcade: {
        title: 'PAC-RUN // NOIR',
        score: 'SCORE',
        best: 'RECORD',
        playBtn: 'JOUER',
        resumeHint: 'WASD / FLÈCHES',
        retryBtn: 'REJOUER',
        autoDemo: 'DÉMO',
        gameOver: 'CAPTURÉ ESCROW',
        victory: 'ARCHIVE NETTOYÉE',
        controls: 'WASD / Flèches · Console F8',
        godmode: 'GODMODE',
        mobilePreviewNote: 'Utilisez les touches ci-dessous',
      },
      core: {
        idle: 'REPOS',
        load128: '128 JOUEURS',
        stress256: '256 CHARGE',
      },
      f8: {
        openFull: 'Ouvrir Console F8 (Ctrl+K)',
        placeholder: 'commande : help, noclip, pacman, find roxwood, lang en...',
        helpHint: 'F8 / Ctrl+K · tapez "help" pour les commandes secrètes',
        close: 'ESC',
        title: 'CONSOLE RESTRICTED F8',
        emptySearch: 'Saisissez un mot-clé ou une commande console.',
        addToCartDone: 'Ouverture catalogue',
        openInCatalog: 'Voir au catalogue →',
        godmodeToast: 'NOIR GODMODE ACTIF · 0.00 MS OVERDRIVE',
      },
    },
    catalogExtra: {
      viewsLabel: 'Sélections',
      viewAll: 'Toute l’archive',
      viewFeatured: 'À la une',
      viewPopular: 'Les plus cliqués',
      sortPopular: 'Les plus cliqués',
      sortFeatured: 'À la une',
      popularStripTitle: 'LES PLUS CLIQUÉS',
      popularStripSub: 'Packs les plus consultés par la communauté',
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
    },
  },
};
