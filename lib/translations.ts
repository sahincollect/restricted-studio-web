import type { Locale } from './i18n';

export const CATALOG_CATEGORY_KEYS = [
  'Tümü',
  'Script & Sistemler',
  'MLO & Mekanlar',
  'Araç Paketleri',
  'Kıyafet & EUP',
  'Modlar & Eklentiler',
  'Program & Araçlar',
] as const;

export interface TranslationDictionary {
  meta: {
    siteTitle: string;
    siteDescription: string;
    ogDescription: string;
    twitterDescription: string;
    discordTitle: string;
    discordDescription: string;
    statusTitle: string;
    statusDescription: string;
  };
  common: {
    home: string;
    catalog: string;
    discord: string;
    status: string;
    clientPortal: string;
    itemsatisTrust: string;
    itemsatisOfficialStore: string;
    itemsatisStore: string;
    itemsatisShort: string;
    close: string;
    backToHome: string;
    openMenu: string;
    langLabel: string;
    autoLangHint: string;
  };
  home: {
    nav: {
      about: string;
      solutions: string;
      catalog: string;
      engineering: string;
      faq: string;
      searchTitle: string;
      discordTitle: string;
      portal: string;
    };
    drawer: {
      about: string;
      solutions: string;
      catalog: string;
      engineering: string;
      faq: string;
      portal: string;
      itemsatis: string;
      discord: string;
      status: string;
    };
    hero: {
      eyebrow: string;
      headline1: string;
      headline2: string;
      headline3: string;
      subheadBeforeCount: string;
      subheadAfterCount: string;
      exploreCatalog: string;
      statPackages: string;
      statResmon: string;
      statOpenSource: string;
      statValuesAria: string;
    };
    cards: {
      engTag: string;
      engTitle: string;
      engSub: string;
      discordTag: string;
      discordTitle: string;
      discordSub: string;
    };
    telemetry: {
      ariaLabel: string;
      statusVersion: string;
      online: string;
      tick: string;
      sql: string;
      escrow: string;
      capacityTitle: string;
      capacitySub: string;
      capacityFooter: string;
      statusLink: string;
    };
    modals: {
      aboutEyebrow: string;
      aboutTitle: string;
      solutionsEyebrow: string;
      solutionsTitle: string;
      engineeringEyebrow: string;
      engineeringTitle: string;
      faqEyebrow: string;
      faqTitle: string;
      aboutLeadBold: string;
      aboutLeadRest: string;
      aboutCards: [
        { title: string; body: string },
        { title: string; body: string },
        { title: string; body: string },
      ];
      compareHeaders: [string, string, string];
      compareRows: [string, string, string][];
      solutionsCards: [
        { title: string; body: string; chips: [string, string] },
        { title: string; body: string; chips: [string, string] },
        { title: string; body: string; chips: [string, string] },
        { title: string; body: string; chips: [string, string] },
      ];
      archiveDistribution: string;
      archivePackagesUnit: string;
      openCatalogLink: string;
      engineeringCards: [
        { title: string; body: string },
        { title: string; body: string },
        { title: string; body: string },
      ];
      codeComments: {
        bridge: string;
        security: string;
        database: string;
      };
      faqItems: { q: string; a: string }[];
      goToCatalog: string;
      itemsatisLink: string;
    };
  };
  catalog: {
    eyebrow: string;
    title: string;
    descBeforeCount: string;
    descMiddle: string;
    descDiscount: string;
    badgeOpenSource: string;
    badgeUnitPrice: string;
    badgeDiscount: string;
    orderGuideBtn: string;
    mobileMenuBtn: string;
    mobileMyCart: (count: number) => string;
    mobilePortal: string;
    mobileItemsatis: string;
    mobileDiscord: string;
    mobileStatus: string;
    cartShort: string;
    sidebarTitle: string;
    searchTitle: string;
    searchPlaceholder: string;
    searchClearAria: string;
    categoriesTitle: string;
    categoryLabels: Record<string, string>;
    sortTitle: string;
    sortLabel: string;
    sortDefault: string;
    sortAsc: string;
    sortDesc: string;
    campaignActiveBadge: string;
    campaignDefaultBadge: string;
    campaignActiveText: (count: number) => string;
    campaignDefaultText: string;
    progressStart: string;
    progressRemaining: (remaining: number) => string;
    openCartWithTotal: (total: string) => string;
    quickSearchTitle: string;
    verifiedStoreBadge: string;
    verifiedStoreDesc: string;
    inspectStoreLink: string;
    orderInstructionsLink: string;
    discordSupportLink: string;
    packageCountLabel: (count: string) => string;
    removeCategoryAria: string;
    removeSearchAria: string;
    resetFilters: string;
    myCartBtn: string;
    verifiedItemBadge: string;
    priceLabel: string;
    inCartBtn: string;
    addToCartBtn: string;
    addToCartTitle: string;
    removeFromCartTitle: string;
    askDiscordTitle: string;
    askDiscordAria: string;
    emptySearchTitle: (q: string) => string;
    emptyCategoryTitle: string;
    emptyDesc: string;
    requestCustomBtn: string;
    loadMoreBtn: (pageSize: number) => string;
    trustOpenSourceTitle: string;
    trustOpenSourceDesc: string;
    trustSecureTitle: string;
    trustSecureDesc: string;
    trustPerfTitle: string;
    trustPerfDesc: string;
    footerTagline: string;
    officialSalesLabel: string;
    footerSections: string;
    footerCatalogLink: string;
    footerDiscordSupport: string;
    footerCategories: string;
    footerOfficialChannels: string;
    footerCopyright: string;
    footerDisclaimer: string;
    guideModalTitle: string;
    guideModalSubtitle: string;
    guideSteps: [
      { n: string; t: string; d: string },
      { n: string; t: string; d: string },
      { n: string; t: string; d: string },
    ];
    sampleInquiry: string;
    templateHeader: string;
    templateCopied: string;
    templateCopyHint: string;
    templateCopyAria: string;
    guideCampaignNoteLabel: string;
    guideCampaignNoteBody: string;
    guideStartExploring: string;
    guideDontShowToday: string;
    floatingDiscountTag: string;
    floatingHintActive: string;
    floatingHintOneLeft: string;
    floatingHintRemaining: (remaining: number) => string;
    floatingCheckoutBtn: string;
    drawerTitle: string;
    drawerSub: (count: number) => string;
    drawerDiscountTitle: string;
    drawerDiscountDesc: string;
    drawerCampaignTitle: string;
    drawerCampaignDesc: (remaining: number) => string;
    drawerEmptyTitle: string;
    drawerEmptyDesc: string;
    drawerRemoveTitle: string;
    drawerRemoveAria: string;
    summaryCountLabel: string;
    summaryCountVal: (count: number) => string;
    summaryUnitLabel: string;
    summaryDiscountLabel: string;
    summaryTotalLabel: string;
    checkoutBtn: string;
    checkoutNoteBefore: string;
    checkoutNoteMiddle: string;
    checkoutNoteAfter: string;
    clearCartBtn: string;
    continueCatalogBtn: string;
    toastAdded: (title: string) => string;
    toastRemoved: (title: string) => string;
    toastCleared: string;
    toastCheckoutCopied: (count: number) => string;
    toastCheckoutRedirect: string;
  };
  statusPage: {
    pillTag: string;
    navAria: string;
    states: {
      operational: { label: string; headline: string };
      degraded: { label: string; headline: string };
      outage: { label: string; headline: string };
    };
    loadingHeadline: string;
    errorHeadline: string;
    errorFallback: string;
    invalidResponseError: string;
    lastCheckedPrefix: string;
    verifyingLive: string;
    checkingBtn: string;
    checkNowBtn: string;
    servicesTitle: string;
    serviceNames: Record<'web' | 'auth' | 'database' | 'catalog', string>;
    historicalTitle: string;
    ratio24h: string;
    ratio7d: string;
    ratio30d: string;
    ratio90d: string;
    incidentDetected: string;
    noIncidents: string;
    footerBrand: string;
  };
  auth: {
    loginErrors: {
      oauth_denied: string;
      oauth_failed: string;
      rate_limited: string;
    };
    registeredInfo: string;
    anonStartError: string;
    anonGenericError: string;
    invalidCredentials: string;
    loginGenericError: string;
    forgotProcessError: string;
    forgotSendError: string;
    forgotTitle: string;
    loginTitle: string;
    forgotSubtitle: string;
    loginSubtitle: string;
    registeredEmailLabel: string;
    emailPlaceholder: string;
    sendingBtn: string;
    sendResetBtn: string;
    backToLoginBtn: string;
    identifierLabel: string;
    identifierPlaceholder: string;
    passwordLabel: string;
    forgotPasswordLink: string;
    verifyingBtn: string;
    loginBtn: string;
    orDivider: string;
    googleContinueBtn: string;
    anonOpeningBtn: string;
    anonContinueBtn: string;
    noAccountText: string;
    registerLink: string;
    systemStatusLink: string;
    registerTitle: string;
    registerSubtitle: string;
    errEnterIdentifier: string;
    errUsernameLength: string;
    errPasswordLength: string;
    errPasswordMismatch: string;
    errRegisterFailed: string;
    errRegisterGeneric: string;
    registerIdentifierPlaceholder: string;
    registerPasswordPlaceholder: string;
    passwordConfirmLabel: string;
    registerSubmitBtn: string;
    alreadyHaveAccount: string;
    loginHereLink: string;
  };
  dashboard: {
    adminPanelBtn: string;
    logoutBtn: string;
    pageTitle: string;
    pageSubtitle: string;
    redeemTitle: string;
    redeemSubtitle: string;
    redeemPlaceholder: string;
    redeemLoadingBtn: string;
    redeemSubmitBtn: string;
    redeemError: string;
    genericError: string;
    downloadError: string;
    downloadFailed: string;
    stationTitle: string;
    stationSubtitle: string;
    licenseActiveBadge: string;
    licenseMissingBadge: string;
    fileMeta: string;
    downloadActiveNotice: string;
    downloadLockedNotice: string;
    downloadPreparingBtn: string;
    downloadBtn: string;
    downloadLockedBtn: string;
    licensesTitle: string;
    licensesSubtitle: string;
    loadingLicenses: string;
    emptyLicensesTitle: string;
    emptyLicensesHint: string;
    thProduct: string;
    thStatus: string;
    thRemaining: string;
    thHwid: string;
    thExpires: string;
    statusActive: string;
    statusExpired: string;
    statusSuspended: string;
    daysSuffix: string;
    hwidLockedPrefix: string;
    hwidPending: string;
  };
  discordPage: {
    statusBadge: string;
    title: string;
    description: string;
    features: [
      { title: string; desc: string },
      { title: string; desc: string },
      { title: string; desc: string },
    ];
    primaryBtn: string;
    secondaryBtn: string;
    tertiaryBtn: string;
    footerCopyright: string;
    footerSub: string;
  };
  errorsPage: {
    notFoundCode: string;
    notFoundTitle: string;
    notFoundDesc: string;
    exploreCatalog: string;
    errorCode: string;
    errorTitle: string;
    errorDesc: string;
    retryBtn: string;
  };
}

export const TRANSLATIONS: Record<Locale, TranslationDictionary> = {
  tr: {
    meta: {
      siteTitle: 'Restricted Studio — Kurumsal FiveM Altyapı & Yazılım Ekosistemi',
      siteDescription:
        'Restricted Studio; FiveM sunucuları için yüksek performanslı açık kaynak scriptler, 3D MLO mekanlar, optimize SQL veri mimarisi ve hazır altyapı çözümleri sunan profesyonel yazılım stüdyosudur.',
      ogDescription:
        'Açık kaynak FiveM scriptler, optimize SQL mimarisi, 3D MLO haritalar ve lisans yönetimi.',
      twitterDescription:
        'FiveM sunucuları için yüksek performanslı açık kaynak scriptler ve optimize altyapı çözümleri.',
      discordTitle: 'Discord Sunucumuz Yakında Sizlerle — Restricted Studio',
      discordDescription:
        'Restricted Studio resmi Discord topluluk ve teknik destek altyapısı çok yakında yayında.',
      statusTitle: 'Sistem Durumu',
      statusDescription:
        'Restricted Studio servislerinin canlı erişilebilirlik ve çalışma durumu.',
    },
    common: {
      home: 'Ana Sayfa',
      catalog: 'Katalog',
      discord: 'Discord',
      status: 'Durum',
      clientPortal: 'Müşteri Portalı',
      itemsatisTrust: 'İTEMSATIŞ GÜVENCESİYLE',
      itemsatisOfficialStore: 'İtemsatış Resmi Mağaza Güvencesi',
      itemsatisStore: 'Resmi İtemsatış Mağazası',
      itemsatisShort: 'İtemsatış',
      close: 'Kapat',
      backToHome: 'Ana Sayfaya Dön',
      openMenu: 'Menüyü Aç/Kapat',
      langLabel: 'Dil',
      autoLangHint: 'Cihaz diline göre otomatik',
    },
    home: {
      nav: {
        about: 'BİZ KİMİZ',
        solutions: 'ÇÖZÜMLER',
        catalog: 'KATALOG',
        engineering: 'MÜHENDİSLİK',
        faq: 'SSS',
        searchTitle: 'Katalogda Ara',
        discordTitle: 'Discord Topluluğu',
        portal: 'MÜŞTERİ PORTALI',
      },
      drawer: {
        about: 'BİZ KİMİZ',
        solutions: 'ÇÖZÜMLER & İSTATİSTİKLER',
        catalog: 'PAKET KATALOĞU (6.400+)',
        engineering: 'MÜHENDİSLİK & AÇIK KAYNAK',
        faq: 'SIKÇA SORULAN SORULAR',
        portal: 'MÜŞTERİ PORTALI & LİSANS',
        itemsatis: 'İTEMSATIŞ RESMİ MAĞAZA',
        discord: 'DİSCORD TOPLULUĞU',
        status: 'SİSTEM DURUMU',
      },
      hero: {
        eyebrow: 'RESTRICTED STUDIO · YILBAŞI SÜRÜMÜ 2026',
        headline1: 'KARARLI ALTYAPI.',
        headline2: 'ŞEFFAF MÜHENDİSLİK.',
        headline3: 'YÜKSEK PERFORMANS.',
        subheadBeforeCount: 'Şüpheli sızıntılar ve karmaşık kurulumlarla vakit kaybetmeyin.',
        subheadAfterCount:
          '+ doğrulanmış açık kaynak script, optimize 3D mekanlar ve sıfır gecikmeli SQL mimarisiyle doğrudan üretime geçin.',
        exploreCatalog: 'KATALOĞU KEŞFET',
        statPackages: 'PAKET',
        statResmon: 'RESMON',
        statOpenSource: 'AÇIK KAYNAK',
        statValuesAria: 'Temel Değerler',
      },
      cards: {
        engTag: 'MÜHENDİSLİK & MİMARİ',
        engTitle: 'ŞİFRESİZ KOD',
        engSub: '%100 Açık kaynak Lua/JS · Escrow kilitsiz mimari.',
        discordTag: 'TOPLULUK & DESTEK',
        discordTitle: 'DİSCORD',
        discordSub: '7/24 Birebir destek talebi ve kurulum danışmanlığı.',
      },
      telemetry: {
        ariaLabel: 'Sistem Telemetri Monitörü',
        statusVersion: 'v3.4 · Aktif',
        online: 'ONLINE',
        tick: 'Tick',
        sql: 'SQL',
        escrow: 'Escrow',
        capacityTitle: 'SUNUCU KAPASİTESİ',
        capacitySub: 'Eşzamanlı Yük · Bu Hafta',
        capacityFooter: '64 / 64 Kapasite · Istanbul Engine',
        statusLink: 'SİSTEM DURUMU →',
      },
      modals: {
        aboutEyebrow: '01 // BİZ KİMİZ & STANDARTLARIMIZ',
        aboutTitle: 'FiveM Türkiye’de kaliteyi yeniden inşa ediyoruz.',
        solutionsEyebrow: '02 // ÜRETİM ALANLARI & ARŞİV DAĞILIMI',
        solutionsTitle: 'Tek çatı altında modüler sunucu altyapısı.',
        engineeringEyebrow: '03 // MÜHENDİSLİK & ŞİFRESİZ MİMARİ',
        engineeringTitle: 'Şifreli kutular değil, okunabilir temiz kod.',
        faqEyebrow: '04 // SIKÇA SORULAN SORULAR',
        faqTitle: 'Merak edilen tüm teknik ve satış detayları.',
        aboutLeadBold: 'Yurt dışında 100€ ile 300€ arasında satılan yazılımlar',
        aboutLeadRest:
          ', kur farkı nedeniyle Türkiye’deki sunucu girişimlerinin önündeki en büyük engele dönüştü. Restricted Studio; dünya standartlarındaki Lua/JS, 3D mekan (MLO) ve MariaDB mühendisliğini Türkiye ekonomisine uygun, ulaşılabilir ve %100 açık kaynak koşullarla sunmak için kuruldu.',
        aboutCards: [
          {
            title: 'Ulaşılabilir Yerel Fiyat',
            body: 'Döviz kuruna endeksli fahiş etiketler yerine TL bazlı şeffaf fiyatlandırma. 16+ paket sepetlerinde anında %50 kampanya indirimi.',
          },
          {
            title: 'Tek Tipleşmeye Son',
            body: 'Arayüzü, dili ve kuralları tamamen sunucunuza göre özelleştirilebilen modüler sistemler.',
          },
          {
            title: 'Koşulsuz Kod Güvenliği',
            body: 'Gizli dış bağlantılardan ve arka kapılardan (backdoor/webhook) tamamen arındırılmış temiz kaynak kodları.',
          },
        ],
        compareHeaders: ['Kriter', 'Hazır Kopya / Yurt Dışı', 'Restricted Studio'],
        compareRows: [
          ['Kaynak Kod', 'Escrow kilitli, müdahaleye kapalı', '%100 Açık kaynak, düzenlenebilir'],
          ['Performans', 'Yüksek işlemci yükü & FPS kaybı', '0.00 ms boşta tüketim, optimize SQL'],
          ['Güvenlik', 'Denetlenemeyen şifreli dosyalar', 'Şeffaf güvenlik taramalı temiz kod'],
          ['Satış & Güvence', 'Belirsiz forum ticareti', 'İtemsatış 3D Secure & Discord'],
        ],
        solutionsCards: [
          {
            title: 'Özgün FiveM Scriptleri',
            body: 'Lua 5.4 ve modern arayüzlerle geliştirilen, sunucu işlemcisini yormayan modüler sistemler.',
            chips: ['QB-Core / Qbox / ESX', '0.00 ms Idle'],
          },
          {
            title: '3D MLO & Mekan Tasarımı',
            body: 'Kalabalık oyuncularda dahi FPS düşürmeyen portal/occlusion optimize iç mekanlar.',
            chips: ['Optimize Poligon', 'Özel İç Mekan'],
          },
          {
            title: 'SQL Veritabanı Mimarisi',
            body: 'Doğru indekslenmiş MariaDB tablolarıyla milisaniye altı sorgu yanıtı ve UTF-8 uyumu.',
            chips: ['1.1 ms Gecikme', 'InnoDB UTF8MB4'],
          },
          {
            title: 'Hazır Sunucu Paketleri',
            body: 'Ekonomisi dengelenmiş, çakışmasız ve kurulum rehberli anahtar teslim sunucu paketleri.',
            chips: ['Tam Entegrasyon', 'Discord Destek'],
          },
        ],
        archiveDistribution: 'ARŞİV DAĞILIMI',
        archivePackagesUnit: 'PAKET',
        openCatalogLink: 'Kataloğu Aç →',
        engineeringCards: [
          {
            title: '1. Çoklu Altyapı Köprüsü',
            body: 'Tek kod tabanı üzerinden QB-Core, Qbox ve ESX Legacy otomatik tanıma.',
          },
          {
            title: '2. Sunucu Taraflı Güvenlik',
            body: 'Tüm para, envanter ve mesafe kontrolleri doğrudan sunucuda doğrulanır.',
          },
          {
            title: '3. Şeffaf Güvenlik Raporu',
            body: 'Her arşiv teslimat öncesi harici webhook ve backdoor taramasından geçer.',
          },
        ],
        codeComments: {
          bridge: 'QB-Core, Qbox ve ESX Otomatik Algılama Köprüsü',
          security: 'Sunucu Taraflı Mesafe ve Güvenlik Doğrulaması',
          database: 'İndekslenmiş MariaDB Veri Tablosu Yapısı',
        },
        faqItems: [
          {
            q: 'Ürünleri nasıl inceleyebilir ve satın alabilirim?',
            a: 'Tüm ürünlerimiz, fiyatlarımız ve detaylı açıklamalarımız resmi İtemsatış mağazamızda yer almaktadır. Katalog üzerinden paketleri sepetinize ekleyip İtemsatış butonları aracılığıyla 3D Secure güvencesiyle satın alım yapabilirsiniz.',
          },
          {
            q: 'Teslim edilen dosyalarda şifreleme veya lisans kilidi var mı?',
            a: 'Hayır. Sunucu sahiplerinin tasarımları ve kodları kendi sunucularına göre özgürce uyarlayabilmesi için tüm teslimatlarımızı %100 açık kaynak (open-source, escrow kilitsiz) olarak gerçekleştiriyoruz.',
          },
          {
            q: 'Hangi FiveM altyapıları (Framework) destekleniyor?',
            a: 'Geliştirdiğimiz scriptler ve sunucu paketleri hem QB-Core ve Qbox hem de ESX Legacy altyapılarıyla tam uyumlu çalışmaktadır.',
          },
          {
            q: 'Satın alım sonrası kurulum desteği sağlıyor musunuz?',
            a: 'Evet. Her ürünün içerisinde adım adım kurulum rehberi yer alır. Ayrıca Discord topluluğumuz üzerinden teknik ekibimizden birebir kurulum ve entegrasyon desteği alabilirsiniz.',
          },
        ],
        goToCatalog: 'Paket Kataloğuna Git →',
        itemsatisLink: 'İtemsatış Mağazası ↗',
      },
    },
    catalog: {
      eyebrow: 'Yılbaşı Sezonu · Kurumsal FiveM Arşivi',
      title: 'FiveM Yazılım & Altyapı Arşivi',
      descBeforeCount: 'Doğrulanmış',
      descMiddle: 'paket. Parça başı 100 TL, 15+ seçimde anında',
      descDiscount: '%50 İndirim',
      badgeOpenSource: 'Açık Kaynak Kod',
      badgeUnitPrice: 'Sabit Parça Fiyatı',
      badgeDiscount: '15+ Sepet İndirimi',
      orderGuideBtn: 'Sipariş Rehberi',
      mobileMenuBtn: 'Menü & Filtreler',
      mobileMyCart: (count) => `Sepetim (${count} Paket)`,
      mobilePortal: 'Müşteri Portalı & Lisanslarım',
      mobileItemsatis: 'İtemsatış Mağazası',
      mobileDiscord: 'İletişime Geçin (Discord)',
      mobileStatus: 'Sistem Durumu',
      cartShort: 'Sepet',
      sidebarTitle: 'Katalog Menüsü & Filtreler',
      searchTitle: 'Paket Ara',
      searchPlaceholder: 'Paket adı, sistem, MLO...',
      searchClearAria: 'Temizle',
      categoriesTitle: 'Kategoriler',
      categoryLabels: {
        Tümü: 'Tümü',
        'Script & Sistemler': 'Script & Sistemler',
        'MLO & Mekanlar': 'MLO & Mekanlar',
        'Araç Paketleri': 'Araç Paketleri',
        'Kıyafet & EUP': 'Kıyafet & EUP',
        'Modlar & Eklentiler': 'Modlar & Eklentiler',
        'Program & Araçlar': 'Program & Araçlar',
      },
      sortTitle: 'Sıralama',
      sortLabel: 'Sırala:',
      sortDefault: 'Önerilen',
      sortAsc: 'İsim (A → Z)',
      sortDesc: 'İsim (Z → A)',
      campaignActiveBadge: '★ %50 İNDİRİM AKTİF',
      campaignDefaultBadge: '■ PARÇA BAŞI 100 TL',
      campaignActiveText: (count) =>
        `Sepetinizde ${count} paket var. %50 indirimle paket başı 50 TL hesaplanıyor!`,
      campaignDefaultText:
        'Sepetinize 15 adetten fazla (16+) ürün eklediğinizde tüm sepetinize anında %50 İndirim uygulanır.',
      progressStart: '16 paket ekle, %50 indirimi yakala!',
      progressRemaining: (remaining) => `${remaining} paket sonra %50 indirimdesiniz!`,
      openCartWithTotal: (total) => `Sepeti İncele (${total} TL)`,
      quickSearchTitle: 'Hızlı Aramalar',
      verifiedStoreBadge: '✓ Doğrulanmış Mağaza',
      verifiedStoreDesc:
        'Tüm alışverişleriniz resmi İtemsatış mağazamız üzerinden 3D Secure güvencesiyle tamamlanır.',
      inspectStoreLink: 'Mağaza Profilini İncele ↗',
      orderInstructionsLink: '■ Sipariş Yönergesi',
      discordSupportLink: '↗ Discord Destek',
      packageCountLabel: (count) => `${count} Paket`,
      removeCategoryAria: 'Kategoriyi kaldır',
      removeSearchAria: 'Aramayı kaldır',
      resetFilters: 'Filtreleri Sıfırla',
      myCartBtn: 'Sepetim',
      verifiedItemBadge: 'Doğrulanmış',
      priceLabel: 'Fiyat:',
      inCartBtn: 'Sepette (Çıkar)',
      addToCartBtn: 'Sepete Ekle',
      addToCartTitle: 'Sepete ekle',
      removeFromCartTitle: 'Sepetten çıkar',
      askDiscordTitle: 'Discord üzerinden bu paket hakkında soru sor',
      askDiscordAria: "Discord'da sor",
      emptySearchTitle: (q) => `"${q}" ile eşleşen paket bulunamadı`,
      emptyCategoryTitle: 'Bu kategoride paket bulunamadı',
      emptyDesc:
        'Aradığınız paket henüz kataloğumuza eklenmemiş olabilir. FiveM veya CFX linkini bize Discord üzerinden iletin; aynı gün arşivimizden tarayıp temizleyerek sizin için hazırlayalım.',
      requestCustomBtn: 'Özel Paket Talebi Aç (Discord) ↗',
      loadMoreBtn: (pageSize) => `Daha Fazla Paket Yükle (+${pageSize})`,
      trustOpenSourceTitle: '%100 Açık Kaynak Kod',
      trustOpenSourceDesc: 'Escrow kilidi olmadan dilediğiniz gibi düzenleyin.',
      trustSecureTitle: 'İtemsatış 3D Secure',
      trustSecureDesc: 'Resmi mağazamız üzerinden güvenli ödeme koruması.',
      trustPerfTitle: '0.00 ms Boşta Tüketim',
      trustPerfDesc: 'Gereksiz döngülerden arındırılmış yüksek FPS performansı.',
      footerTagline:
        'FiveM ekosistemi için sade, güvenli ve yüksek performanslı yazılım ve altyapı çözümleri.',
      officialSalesLabel: 'Resmi Satış:',
      footerSections: 'Bölümler',
      footerCatalogLink: 'Paket Kataloğu',
      footerDiscordSupport: 'Discord Desteği',
      footerCategories: 'Kategoriler',
      footerOfficialChannels: 'Resmi Kanallar',
      footerCopyright: 'Telif Hakkı © 2026 Restricted Studio. Tüm hakları saklıdır.',
      footerDisclaimer:
        'Restricted Studio; Rockstar Games, Take-Two Interactive veya CitizenFX Collective ile bağlantılı değildir. Tüm katalog içeriği talep üzerine güvenlik denetimi yapılarak sağlanmaktadır.',
      guideModalTitle: 'İtemsatış ile Sipariş Yönergesi',
      guideModalSubtitle: 'Resmi İtemsatış mağazamız üzerinden 3 basit adımda güvenle siparişinizi verin:',
      guideSteps: [
        {
          n: '1',
          t: 'Paketlerinizi Sepete Ekleyin',
          d: 'Katalogdaki 6.400+ paket arasından sunucunuza gerekenleri "Sepete Ekle" butonuyla toplayın.',
        },
        {
          n: '2',
          t: 'Satın Al Butonuna Basın',
          d: 'Sepetten "Satın Al" dediğinizde paket isimleri panonuza kopyalanır ve resmi İtemsatış mağazamıza yönlendirilirsiniz.',
        },
        {
          n: '3',
          t: "İtemsatış'tan İletin & Teslim Alın",
          d: 'Açılan mağazada satıcıya mesaj olarak kopyalanan listeyi iletin; 3D Secure güvencesiyle temiz açık kaynak kodlarınız hemen teslim edilsin.',
        },
      ],
      sampleInquiry:
        'Merhaba, İtemsatış üzerinden sipariş vermek istiyorum:\nPaketler:\n[Paket İsimlerini Buraya Yapıştırın]\nStok, güncellik ve fiyat teyidi alabilir miyim?',
      templateHeader: 'ÖRNEK İTEMSATIŞ MESAJ ŞABLONU',
      templateCopied: '✓ Kopyalandı',
      templateCopyHint: 'Kopyalamak için tıklayın',
      templateCopyAria: 'Mesaj şablonunu kopyala',
      guideCampaignNoteLabel: 'Kampanya Notu:',
      guideCampaignNoteBody:
        'Parça başı 100 TL. Sepetinize 15 adetten fazla (16+) ürün eklerseniz sepetiniz anında %50 indirime girer (50 TL / Paket).',
      guideStartExploring: 'Kataloğu Keşfetmeye Başla',
      guideDontShowToday: 'Bugün tekrar gösterme',
      floatingDiscountTag: '%50 İndirim',
      floatingHintActive: 'Kampanya aktif (Paket başı 50 TL)',
      floatingHintOneLeft: 'Sadece 1 paket daha ekle, %50 indirimi kap!',
      floatingHintRemaining: (remaining) => `${remaining} paket sonra %50 indirim!`,
      floatingCheckoutBtn: 'Sepeti İncele & Satın Al',
      drawerTitle: 'Sepetim',
      drawerSub: (count) => `${count} paket seçildi`,
      drawerDiscountTitle: '%50 İndirim Tanımlandı!',
      drawerDiscountDesc:
        '15 adetten fazla ürün eklendiği için paket başı 100 TL yerine 50 TL olarak hesaplanıyor.',
      drawerCampaignTitle: "15'ten Fazla Ürün Kampanyası",
      drawerCampaignDesc: (remaining) =>
        `Sepetinize ${remaining} paket daha eklerseniz tüm sepet %50 indirime girecektir!`,
      drawerEmptyTitle: 'Sepetiniz henüz boş',
      drawerEmptyDesc: 'Katalogdan istediğiniz paketleri "Sepete Ekle" butonuyla ekleyebilirsiniz.',
      drawerRemoveTitle: 'Sepetten Çıkar',
      drawerRemoveAria: 'Çıkar',
      summaryCountLabel: 'Seçilen Paket Adedi',
      summaryCountVal: (count) => `${count} Adet`,
      summaryUnitLabel: 'Birim Fiyat',
      summaryDiscountLabel: '%50 Kampanya İndirimi',
      summaryTotalLabel: 'Toplam Tutar',
      checkoutBtn: "Satın Al (İtemsatış'a İlet)",
      checkoutNoteBefore: 'Satın Al butonuna bastığınızda sepetteki',
      checkoutNoteMiddle: 'paketin yalnızca isimleri panonuza kopyalanır ve resmi İtemsatış mağazamıza aktarılırsınız.',
      checkoutNoteAfter: '',
      clearCartBtn: 'Sepeti Temizle',
      continueCatalogBtn: 'Kataloğa Devam Et →',
      toastAdded: (title) => `"${title}" sepete eklendi.`,
      toastRemoved: (title) => `"${title}" sepetten çıkarıldı.`,
      toastCleared: 'Sepetiniz temizlendi.',
      toastCheckoutCopied: (count) => `${count} paket ismi kopyalandı! İtemsatış açılıyor...`,
      toastCheckoutRedirect: 'İtemsatış mağazamıza aktarılıyorsunuz...',
    },
    statusPage: {
      pillTag: 'DURUM',
      navAria: 'Hızlı Geçiş',
      states: {
        operational: { label: 'Çalışıyor', headline: 'Tüm Sistemler Çalışıyor' },
        degraded: { label: 'Kısmi Sorun', headline: 'Bazı Servislerde Yavaşlama' },
        outage: { label: 'Kesinti', headline: 'Servis Erişim Sorunu' },
      },
      loadingHeadline: 'Durum kontrol ediliyor...',
      errorHeadline: 'Durum bilgisi alınamadı',
      errorFallback: 'Bağlantı kurulamadı. Lütfen tekrar deneyin.',
      invalidResponseError: 'Geçersiz durum yanıtı.',
      lastCheckedPrefix: 'Son kontrol:',
      verifyingLive: 'Servisler doğrulanıyor...',
      checkingBtn: 'Yenileniyor',
      checkNowBtn: 'Yenile',
      servicesTitle: 'Servisler',
      serviceNames: {
        web: 'Web & Müşteri Portalı',
        auth: 'Hesap & Giriş',
        database: 'Lisans & Veri',
        catalog: 'Ürün Kataloğu',
      },
      historicalTitle: 'Erişilebilirlik Özeti',
      ratio24h: '24 Saat',
      ratio7d: '7 Gün',
      ratio30d: '30 Gün',
      ratio90d: '90 Gün',
      incidentDetected: 'Etkilenen servisler',
      noIncidents: 'Aktif bir kesinti veya planlı bakım bulunmuyor.',
      footerBrand: 'Restricted Studio',
    },
    auth: {
      loginErrors: {
        oauth_denied: 'Google oturum açma isteği iptal edildi.',
        oauth_failed: 'Google ile giriş doğrulaması tamamlanamadı. Lütfen tekrar deneyin.',
        rate_limited: 'Çok fazla deneme algılandı. Lütfen birkaç dakika sonra tekrar deneyin.',
      },
      registeredInfo: 'Hesabınız oluşturuldu. Güvenli giriş yapabilirsiniz.',
      anonStartError: 'Misafir oturumu başlatılamadı.',
      anonGenericError: 'Misafir girişi sırasında bir hata oluştu.',
      invalidCredentials: 'Geçersiz kimlik bilgileri.',
      loginGenericError: 'Giriş yapılırken bir hata oluştu.',
      forgotProcessError: 'Talep işlenemedi.',
      forgotSendError: 'Şifre sıfırlama talebi gönderilemedi.',
      forgotTitle: 'Şifre Sıfırlama',
      loginTitle: 'Müşteri Girişi',
      forgotSubtitle: 'E-posta adresinize tek kullanımlık sıfırlama bağlantısı gönderin.',
      loginSubtitle: 'R-AI lisans yönetimi ve dosya indirmeleri için hesabınıza güvenli giriş yapın.',
      registeredEmailLabel: 'KAYITLI E-POSTA ADRESİ',
      emailPlaceholder: 'ornek@domain.com',
      sendingBtn: 'Gönderiliyor...',
      sendResetBtn: 'Sıfırlama Bağlantısı Gönder',
      backToLoginBtn: 'Giriş Ekranına Dön',
      identifierLabel: 'KULLANICI ADI VEYA E-POSTA',
      identifierPlaceholder: 'Restricted veya ornek@domain.com',
      passwordLabel: 'ŞİFRE',
      forgotPasswordLink: 'Şifremi Unuttum',
      verifyingBtn: 'Doğrulanıyor...',
      loginBtn: 'Giriş Yap',
      orDivider: 'VEYA TEK TIKLA',
      googleContinueBtn: 'Google ile Devam Et',
      anonOpeningBtn: 'Güvenli Oturum Açılıyor...',
      anonContinueBtn: 'Anonim Olarak Devam Et',
      noAccountText: 'İsteğe bağlı hesap oluşturmak için:',
      registerLink: 'Kayıt Olun',
      systemStatusLink: 'Sistem Durumu',
      registerTitle: 'Hesap Oluştur',
      registerSubtitle: 'İtemsatış kodlarınızı aktive etmek ve R-AI kullanmak için kaydolun.',
      errEnterIdentifier: 'Lütfen kullanıcı adı veya e-posta giriniz.',
      errUsernameLength: 'Kullanıcı adı en az 3 karakter olmalıdır.',
      errPasswordLength: 'Şifre en az 8 karakter olmalıdır.',
      errPasswordMismatch: 'Girdiğiniz şifreler birbiriyle eşleşmiyor.',
      errRegisterFailed: 'Kayıt işlemi tamamlanamadı.',
      errRegisterGeneric: 'Kayıt işlemi sırasında bir hata oluştu.',
      registerIdentifierPlaceholder: 'Örn: saintstudio veya ornek@domain.com',
      registerPasswordPlaceholder: 'En az 8 karakter (Büyük/küçük harf + rakam)',
      passwordConfirmLabel: 'ŞİFRE TEKRAR',
      registerSubmitBtn: 'Güvenli Kayıt Ol',
      alreadyHaveAccount: 'Zaten hesabınız var mı?',
      loginHereLink: 'Giriş Yapın',
    },
    dashboard: {
      adminPanelBtn: 'Yönetici Paneli',
      logoutBtn: 'Çıkış Yap',
      pageTitle: 'Müşteri Kontrol Paneli',
      pageSubtitle: 'İtemsatış kodlarınızı aktive edin, lisanslarınızı görüntüleyin ve R-AI kurulum dosyasını indirin.',
      redeemTitle: 'Aktivasyon Kodu Kullan (Redeem)',
      redeemSubtitle: 'İtemsatış siparişinizden aldığınız kodu buraya girerek lisansınızı hesabınıza tanımlayın.',
      redeemPlaceholder: 'Örn: R-AI-XXXX-XXXX-XXXX',
      redeemLoadingBtn: 'Doğrulanıyor...',
      redeemSubmitBtn: 'Kodu Aktif Et',
      redeemError: 'Kod aktive edilemedi.',
      genericError: 'Bir hata oluştu.',
      downloadError: 'İndirme bağlantısı alınamadı.',
      downloadFailed: 'İndirme başarısız.',
      stationTitle: 'R-AI Masaüstü Çalışma İstasyonu',
      stationSubtitle: 'Kurumsal yapay zeka masaüstü (.exe) yazılımını doğrudan indirin.',
      licenseActiveBadge: 'LİSANS AKTİF & ONAYLI',
      licenseMissingBadge: 'AKTİF LİSANS BULUNAMADI',
      fileMeta: 'Restricted_Studio_Setup.exe • Windows 10/11 x64',
      downloadActiveNotice: 'Aktif lisansınız onaylandı. Aşağıdaki butona tıklayarak kurulum dosyasını indirebilirsiniz.',
      downloadLockedNotice: 'Kurulum dosyasını indirebilmek için önce geçerli bir aktivasyon kodu girerek lisans tanımlamalısınız.',
      downloadPreparingBtn: 'Bağlantı hazırlanıyor...',
      downloadBtn: 'R-AI Kurulum Dosyasını İndir (.exe)',
      downloadLockedBtn: 'İndirme Kilitli (Lisans Gereklidir)',
      licensesTitle: 'Lisanslarım ve Cihaz Durumları',
      licensesSubtitle: 'Hesabınıza tanımlı ürünler, kalan süreler ve HWID donanım kilitleri.',
      loadingLicenses: 'Lisans bilgileri yükleniyor...',
      emptyLicensesTitle: 'Henüz hesabınıza tanımlı aktif bir lisans bulunmuyor.',
      emptyLicensesHint: 'İtemsatış kodunuzu yukarıdaki kutucuğa girerek hemen başlatabilirsiniz.',
      thProduct: 'ÜRÜN',
      thStatus: 'DURUM',
      thRemaining: 'KALAN SÜRE',
      thHwid: 'DONANIM KİLİDİ (HWID)',
      thExpires: 'BİTİŞ TARİHİ',
      statusActive: 'Aktif',
      statusExpired: 'Süresi Doldu',
      statusSuspended: 'Askıya Alındı',
      daysSuffix: 'Gün',
      hwidLockedPrefix: 'Kilitli',
      hwidPending: 'İlk Cihaz Bekleniyor',
    },
    discordPage: {
      statusBadge: 'YAPILANDIRMA AŞAMASINDA',
      title: 'Discord Sunucumuz Yakında Sizlerle',
      description:
        'Topluluk ve teknik destek altyapımızı daha hızlı, güvenli ve kusursuz bir deneyim sunmak amacıyla yapılandırıyoruz. Çok yakında resmi Discord sunucumuz üzerinden kesintisiz destek ve paylaşımlarla hizmetinizde olacağız.',
      features: [
        {
          title: 'Birebir Ticket Desteği',
          desc: 'FiveM mimarisi, script kurulumları ve R-AI çalışma istasyonu için doğrudan geliştirici ekibiyle iletişim.',
        },
        {
          title: 'Otomatik Rol & Lisans',
          desc: 'İtemsatış veya portal üzerinden edindiğiniz lisanslar otomatik doğrulanarak özel müşteri rolleriniz atanacak.',
        },
        {
          title: 'Erken Erişim & İndirimler',
          desc: 'Yayınlanacak yeni MLO mekanlar, güncellemeler ve topluluğa özel kampanya duyurularına ilk erişim hakkı.',
        },
      ],
      primaryBtn: 'İtemsatış Mağazamıza Git',
      secondaryBtn: 'Paket Kataloğunu İncele',
      tertiaryBtn: 'Ana Sayfaya Dön',
      footerCopyright: 'Telif Hakkı © 2026 Restricted Studio. Tüm hakları saklıdır.',
      footerSub: 'Sorularınız ve satın alımlarınız için İtemsatış mağazamız üzerinden bize 7/24 ulaşabilirsiniz.',
    },
    errorsPage: {
      notFoundCode: 'HATA KODU // 404',
      notFoundTitle: 'Sayfa Bulunamadı',
      notFoundDesc:
        'Aradığınız rota mevcut değil, taşınmış olabilir veya güvenlik politikası kapsamında gizlenmiştir.',
      exploreCatalog: 'Kataloğu İncele',
      errorCode: 'SİSTEM DURUMU // 500',
      errorTitle: 'Beklenmeyen Bir Hata Oluştu',
      errorDesc:
        'İşlem güvenlik katmanı tarafından durduruldu. Sayfayı yenileyebilir veya ana ekrana dönebilirsiniz.',
      retryBtn: 'Tekrar Dene',
    },
  },

  en: {
    meta: {
      siteTitle: 'Restricted Studio — Enterprise FiveM Infrastructure & Software Ecosystem',
      siteDescription:
        'Restricted Studio is a professional software studio delivering open-source FiveM scripts, 3D MLO interiors, indexed SQL architecture, and turnkey server infrastructure.',
      ogDescription:
        'Open-source FiveM scripts, optimized SQL architecture, 3D MLO maps, and license management.',
      twitterDescription:
        'High-performance open-source FiveM scripts and optimized infrastructure solutions.',
      discordTitle: 'Discord Community Launching Soon — Restricted Studio',
      discordDescription:
        'Official Restricted Studio Discord community and technical support hub is launching soon.',
      statusTitle: 'System Status',
      statusDescription:
        'Live operational status and availability of Restricted Studio services.',
    },
    common: {
      home: 'Home',
      catalog: 'Catalog',
      discord: 'Discord',
      status: 'Status',
      clientPortal: 'Client Portal',
      itemsatisTrust: 'VERIFIED ON ITEMSATIS',
      itemsatisOfficialStore: 'Official Itemsatis Verified Store',
      itemsatisStore: 'Official Itemsatis Store',
      itemsatisShort: 'Itemsatis',
      close: 'Close',
      backToHome: 'Back to Home',
      openMenu: 'Toggle Menu',
      langLabel: 'Language',
      autoLangHint: 'Auto-detected from device language',
    },
    home: {
      nav: {
        about: 'ABOUT US',
        solutions: 'SOLUTIONS',
        catalog: 'CATALOG',
        engineering: 'ENGINEERING',
        faq: 'FAQ',
        searchTitle: 'Search Catalog',
        discordTitle: 'Discord Community',
        portal: 'CLIENT PORTAL',
      },
      drawer: {
        about: 'ABOUT US',
        solutions: 'SOLUTIONS & METRICS',
        catalog: 'PACKAGE CATALOG (6,400+)',
        engineering: 'ENGINEERING & OPEN SOURCE',
        faq: 'FREQUENTLY ASKED QUESTIONS',
        portal: 'CLIENT PORTAL & LICENSES',
        itemsatis: 'OFFICIAL ITEMSATIS STORE',
        discord: 'DISCORD COMMUNITY',
        status: 'SYSTEM STATUS',
      },
      hero: {
        eyebrow: 'RESTRICTED STUDIO · NEW YEAR EDITION 2026',
        headline1: 'SOLID INFRASTRUCTURE.',
        headline2: 'TRANSPARENT CODE.',
        headline3: 'PEAK PERFORMANCE.',
        subheadBeforeCount: 'Stop wasting time on broken leaks and bloated setups. Ship directly to production with',
        subheadAfterCount:
          '+ verified open-source scripts, optimized 3D interiors, and zero-lag SQL architecture.',
        exploreCatalog: 'EXPLORE CATALOG',
        statPackages: 'PACKAGES',
        statResmon: 'RESMON',
        statOpenSource: 'OPEN SOURCE',
        statValuesAria: 'Core Metrics',
      },
      cards: {
        engTag: 'ENGINEERING & CORE',
        engTitle: 'UNENCRYPTED CODE',
        engSub: '100% Open-source Lua/JS · Zero escrow lock.',
        discordTag: 'COMMUNITY & SUPPORT',
        discordTitle: 'DISCORD',
        discordSub: '24/7 Direct support tickets and setup assistance.',
      },
      telemetry: {
        ariaLabel: 'System Telemetry Monitor',
        statusVersion: 'v3.4 · Active',
        online: 'ONLINE',
        tick: 'Tick',
        sql: 'SQL',
        escrow: 'Escrow',
        capacityTitle: 'SERVER CAPACITY',
        capacitySub: 'Concurrent Load · This Week',
        capacityFooter: '64 / 64 Slots · Istanbul Engine',
        statusLink: 'SYSTEM STATUS →',
      },
      modals: {
        aboutEyebrow: '01 // ABOUT US & STANDARDS',
        aboutTitle: 'Rebuilding FiveM engineering quality without paywalls.',
        solutionsEyebrow: '02 // PRODUCTION STACK & ARCHIVE BREAKDOWN',
        solutionsTitle: 'Modular server infrastructure under one roof.',
        engineeringEyebrow: '03 // ENGINEERING & OPEN ARCHITECTURE',
        engineeringTitle: 'Readable source code, not locked black boxes.',
        faqEyebrow: '04 // FREQUENTLY ASKED QUESTIONS',
        faqTitle: 'Technical and purchasing details explained.',
        aboutLeadBold: 'Scripts priced between 100€ and 300€ abroad',
        aboutLeadRest:
          ' became a barrier for community servers everywhere. Restricted Studio was founded to deliver enterprise-grade Lua/JS systems, 3D MLO interiors, and MariaDB architecture on 100% open-source, accessible terms.',
        aboutCards: [
          {
            title: 'Accessible Fair Pricing',
            body: 'Flat 100 TL per package pricing instead of overpriced tags. Instant 50% discount on orders of 16+ packages.',
          },
          {
            title: 'Zero Cookie-Cutter Limits',
            body: 'Modular UI, localization, and gameplay rules you can customize freely for your own server.',
          },
          {
            title: 'Audited Code Integrity',
            body: 'Clean source files audited and stripped of hidden external webhooks, backdoors, and telemetry traps.',
          },
        ],
        compareHeaders: ['Criteria', 'Typical Escrow / Resellers', 'Restricted Studio'],
        compareRows: [
          ['Source Code', 'Escrow locked, uneditable', '100% Open-source, customizable'],
          ['Performance', 'High CPU spikes & FPS drops', '0.00 ms idle tick, indexed SQL'],
          ['Security', 'Opaque encrypted binaries', 'Scanned clean readable source'],
          ['Checkout', 'Unverified forum DMs', 'Itemsatis 3D Secure & Discord'],
        ],
        solutionsCards: [
          {
            title: 'Custom FiveM Scripts',
            body: 'Lua 5.4 and modern UI modules engineered to keep server tick rates minimal.',
            chips: ['QB-Core / Qbox / ESX', '0.00 ms Idle'],
          },
          {
            title: '3D MLO & Interiors',
            body: 'Portal and occlusion-tuned 3D environments that preserve FPS in high-population zones.',
            chips: ['Tuned Polygons', 'Custom Interiors'],
          },
          {
            title: 'SQL Database Design',
            body: 'Properly indexed MariaDB schemas with sub-millisecond queries and full UTF-8 support.',
            chips: ['1.1 ms Query', 'InnoDB UTF8MB4'],
          },
          {
            title: 'Turnkey Server Packs',
            body: 'Balanced economy, conflict-free configuration, and structured setup documentation.',
            chips: ['Full Integration', 'Discord Support'],
          },
        ],
        archiveDistribution: 'ARCHIVE DISTRIBUTION',
        archivePackagesUnit: 'PACKAGES',
        openCatalogLink: 'Open Catalog →',
        engineeringCards: [
          {
            title: '1. Multi-Framework Bridge',
            body: 'Automatic runtime detection for QB-Core, Qbox, and ESX Legacy from a single codebase.',
          },
          {
            title: '2. Server-Side Validation',
            body: 'All economy, inventory, and proximity checks are verified authoritatively on the server.',
          },
          {
            title: '3. Security Screening',
            body: 'Every release is inspected against unauthorized webhooks and backdoors prior to delivery.',
          },
        ],
        codeComments: {
          bridge: 'QB-Core, Qbox & ESX Auto-Detection Bridge',
          security: 'Server-Side Distance & Authority Validation',
          database: 'Indexed MariaDB Schema Definition',
        },
        faqItems: [
          {
            q: 'How can I browse and purchase packages?',
            a: 'All packages and pricing are hosted through our official Itemsatis store. Add packages to your cart in the catalog and click checkout to complete payment securely via Itemsatis 3D Secure.',
          },
          {
            q: 'Are delivered files encrypted or escrow-locked?',
            a: 'No. Every delivery is 100% open-source with no escrow lock so server owners can freely inspect, edit, and maintain the codebase.',
          },
          {
            q: 'Which FiveM frameworks are supported?',
            a: 'Our scripts and server packages are compatible with QB-Core, Qbox, and ESX Legacy architectures.',
          },
          {
            q: 'Do you provide installation support after purchase?',
            a: 'Yes. Each package includes step-by-step setup notes, plus one-on-one integration assistance via our Discord support team.',
          },
        ],
        goToCatalog: 'Browse Package Catalog →',
        itemsatisLink: 'Itemsatis Store ↗',
      },
    },
    catalog: {
      eyebrow: 'New Year Edition · Enterprise FiveM Archive',
      title: 'FiveM Software & Infrastructure Archive',
      descBeforeCount: 'Verified',
      descMiddle: 'packages. Flat 100 TL per unit, instant',
      descDiscount: '50% Off on 16+ items',
      badgeOpenSource: 'Open Source Code',
      badgeUnitPrice: 'Flat Unit Price',
      badgeDiscount: '15+ Cart Discount',
      orderGuideBtn: 'Order Guide',
      mobileMenuBtn: 'Menu & Filters',
      mobileMyCart: (count) => `My Cart (${count} Items)`,
      mobilePortal: 'Client Portal & Licenses',
      mobileItemsatis: 'Itemsatis Store',
      mobileDiscord: 'Contact (Discord)',
      mobileStatus: 'System Status',
      cartShort: 'Cart',
      sidebarTitle: 'Catalog Menu & Filters',
      searchTitle: 'Search Packages',
      searchPlaceholder: 'Package name, system, MLO...',
      searchClearAria: 'Clear search',
      categoriesTitle: 'Categories',
      categoryLabels: {
        Tümü: 'All Packages',
        'Script & Sistemler': 'Scripts & Systems',
        'MLO & Mekanlar': 'MLO & Interiors',
        'Araç Paketleri': 'Vehicle Packs',
        'Kıyafet & EUP': 'Clothing & EUP',
        'Modlar & Eklentiler': 'Mods & Addons',
        'Program & Araçlar': 'Tools & Utilities',
      },
      sortTitle: 'Sort By',
      sortLabel: 'Sort:',
      sortDefault: 'Recommended',
      sortAsc: 'Name (A → Z)',
      sortDesc: 'Name (Z → A)',
      campaignActiveBadge: '★ 50% DISCOUNT ACTIVE',
      campaignDefaultBadge: '■ 100 TL PER PACKAGE',
      campaignActiveText: (count) =>
        `You have ${count} packages in your cart. With 50% off, each package is only 50 TL!`,
      campaignDefaultText:
        'Add more than 15 packages (16+) to unlock an instant 50% discount across your entire cart.',
      progressStart: 'Add 16 packages to unlock 50% off!',
      progressRemaining: (remaining) => `${remaining} more to unlock 50% off!`,
      openCartWithTotal: (total) => `Inspect Cart (${total} TL)`,
      quickSearchTitle: 'Quick Tags',
      verifiedStoreBadge: '✓ Verified Store',
      verifiedStoreDesc:
        'All purchases are completed securely via our official Itemsatis store with 3D Secure protection.',
      inspectStoreLink: 'View Store Profile ↗',
      orderInstructionsLink: '■ Order Instructions',
      discordSupportLink: '↗ Discord Support',
      packageCountLabel: (count) => `${count} Packages`,
      removeCategoryAria: 'Clear category',
      removeSearchAria: 'Clear search',
      resetFilters: 'Reset Filters',
      myCartBtn: 'My Cart',
      verifiedItemBadge: 'Verified',
      priceLabel: 'Price:',
      inCartBtn: 'In Cart (Remove)',
      addToCartBtn: 'Add to Cart',
      addToCartTitle: 'Add to cart',
      removeFromCartTitle: 'Remove from cart',
      askDiscordTitle: 'Ask about this package on Discord',
      askDiscordAria: 'Ask on Discord',
      emptySearchTitle: (q) => `No packages matching "${q}"`,
      emptyCategoryTitle: 'No packages found in this category',
      emptyDesc:
        'The package you are looking for might not be indexed yet. Send us the FiveM or CFX link on Discord and we will audit and prepare it for you the same day.',
      requestCustomBtn: 'Request Custom Package (Discord) ↗',
      loadMoreBtn: (pageSize) => `Load More Packages (+${pageSize})`,
      trustOpenSourceTitle: '100% Open-Source Code',
      trustOpenSourceDesc: 'No escrow locks — customize everything freely for your server.',
      trustSecureTitle: 'Itemsatis 3D Secure',
      trustSecureDesc: 'Protected checkout through our verified official storefront.',
      trustPerfTitle: '0.00 ms Idle Consumption',
      trustPerfDesc: 'High-FPS scripts stripped of unnecessary background loops.',
      footerTagline:
        'Clean, secure, and high-performance software infrastructure for the FiveM ecosystem.',
      officialSalesLabel: 'Official Store:',
      footerSections: 'Sections',
      footerCatalogLink: 'Package Catalog',
      footerDiscordSupport: 'Discord Support',
      footerCategories: 'Categories',
      footerOfficialChannels: 'Official Channels',
      footerCopyright: 'Copyright © 2026 Restricted Studio. All rights reserved.',
      footerDisclaimer:
        'Restricted Studio is not affiliated with Rockstar Games, Take-Two Interactive, or CitizenFX Collective. All catalog assets are audited for security upon request.',
      guideModalTitle: 'Itemsatis Order Instructions',
      guideModalSubtitle: 'Place your order safely through our official Itemsatis store in 3 simple steps:',
      guideSteps: [
        {
          n: '1',
          t: 'Add Packages to Your Cart',
          d: 'Select the scripts, MLOs, or packs you need from our 6,400+ archive using "Add to Cart".',
        },
        {
          n: '2',
          t: 'Click Checkout',
          d: 'Clicking "Buy Now" copies your selected package titles to your clipboard and opens our official Itemsatis page.',
        },
        {
          n: '3',
          t: 'Message Store & Receive Files',
          d: 'Paste the copied package list to the seller chat; receive your audited open-source files immediately via 3D Secure checkout.',
        },
      ],
      sampleInquiry:
        'Hello, I would like to place an order on Itemsatis:\nPackages:\n[Paste Package Names Here]\nCould you confirm availability, latest version, and total?',
      templateHeader: 'SAMPLE ITEMSATIS MESSAGE TEMPLATE',
      templateCopied: '✓ Copied',
      templateCopyHint: 'Click to copy',
      templateCopyAria: 'Copy message template',
      guideCampaignNoteLabel: 'Promo Note:',
      guideCampaignNoteBody:
        '100 TL per package. Adding more than 15 items (16+) automatically activates 50% off (50 TL / item).',
      guideStartExploring: 'Start Exploring Catalog',
      guideDontShowToday: "Don't show again today",
      floatingDiscountTag: '50% Off',
      floatingHintActive: 'Promo active (50 TL per package)',
      floatingHintOneLeft: 'Add 1 more package to unlock 50% off!',
      floatingHintRemaining: (remaining) => `${remaining} more for 50% off!`,
      floatingCheckoutBtn: 'Review Cart & Checkout',
      drawerTitle: 'My Cart',
      drawerSub: (count) => `${count} packages selected`,
      drawerDiscountTitle: '50% Discount Applied!',
      drawerDiscountDesc:
        'Since you added over 15 items, pricing dropped from 100 TL to 50 TL per package.',
      drawerCampaignTitle: '16+ Package Bundle Discount',
      drawerCampaignDesc: (remaining) =>
        `Add ${remaining} more packages to unlock 50% off your entire cart!`,
      drawerEmptyTitle: 'Your cart is empty',
      drawerEmptyDesc: 'Use "Add to Cart" on any package in the catalog to build your bundle.',
      drawerRemoveTitle: 'Remove from Cart',
      drawerRemoveAria: 'Remove',
      summaryCountLabel: 'Selected Items',
      summaryCountVal: (count) => `${count} Items`,
      summaryUnitLabel: 'Unit Price',
      summaryDiscountLabel: '50% Campaign Discount',
      summaryTotalLabel: 'Total Amount',
      checkoutBtn: 'Buy Now (Proceed to Itemsatis)',
      checkoutNoteBefore: 'Clicking Buy Now copies only the titles of your',
      checkoutNoteMiddle: 'selected packages to your clipboard and redirects to our official Itemsatis store.',
      checkoutNoteAfter: '',
      clearCartBtn: 'Clear Cart',
      continueCatalogBtn: 'Continue Browsing →',
      toastAdded: (title) => `"${title}" added to cart.`,
      toastRemoved: (title) => `"${title}" removed from cart.`,
      toastCleared: 'Your cart has been cleared.',
      toastCheckoutCopied: (count) => `${count} package names copied! Opening Itemsatis...`,
      toastCheckoutRedirect: 'Redirecting to our official Itemsatis store...',
    },
    statusPage: {
      pillTag: 'STATUS',
      navAria: 'Quick Navigation',
      states: {
        operational: { label: 'Operational', headline: 'All Systems Operational' },
        degraded: { label: 'Degraded', headline: 'Partial Service Degradation' },
        outage: { label: 'Outage', headline: 'Service Disruption Detected' },
      },
      loadingHeadline: 'Checking status...',
      errorHeadline: 'Status unavailable',
      errorFallback: 'Unable to retrieve system status. Please try again.',
      invalidResponseError: 'Invalid status response.',
      lastCheckedPrefix: 'Updated',
      verifyingLive: 'Verifying services...',
      checkingBtn: 'Refreshing',
      checkNowBtn: 'Refresh',
      servicesTitle: 'Services',
      serviceNames: {
        web: 'Web & Client Portal',
        auth: 'Account & Sign-In',
        database: 'Licensing & Data',
        catalog: 'Product Catalog',
      },
      historicalTitle: 'Uptime Summary',
      ratio24h: '24 Hours',
      ratio7d: '7 Days',
      ratio30d: '30 Days',
      ratio90d: '90 Days',
      incidentDetected: 'Affected services',
      noIncidents: 'No active incidents or scheduled maintenance.',
      footerBrand: 'Restricted Studio',
    },
    auth: {
      loginErrors: {
        oauth_denied: 'Google sign-in request was canceled.',
        oauth_failed: 'Google authentication could not be verified. Please try again.',
        rate_limited: 'Too many attempts detected. Please wait a few minutes and try again.',
      },
      registeredInfo: 'Your account has been created. You can now sign in securely.',
      anonStartError: 'Could not start guest session.',
      anonGenericError: 'An error occurred during anonymous sign-in.',
      invalidCredentials: 'Invalid credentials.',
      loginGenericError: 'An error occurred while signing in.',
      forgotProcessError: 'Request could not be processed.',
      forgotSendError: 'Could not send password reset request.',
      forgotTitle: 'Reset Password',
      loginTitle: 'Client Portal Login',
      forgotSubtitle: 'Send a one-time password reset link to your registered email.',
      loginSubtitle: 'Sign in securely to manage R-AI licenses and download setup files.',
      registeredEmailLabel: 'REGISTERED EMAIL ADDRESS',
      emailPlaceholder: 'name@domain.com',
      sendingBtn: 'Sending...',
      sendResetBtn: 'Send Reset Link',
      backToLoginBtn: 'Back to Sign In',
      identifierLabel: 'USERNAME OR EMAIL',
      identifierPlaceholder: 'Restricted or name@domain.com',
      passwordLabel: 'PASSWORD',
      forgotPasswordLink: 'Forgot Password',
      verifyingBtn: 'Verifying...',
      loginBtn: 'Sign In',
      orDivider: 'OR ONE-CLICK',
      googleContinueBtn: 'Continue with Google',
      anonOpeningBtn: 'Starting Secure Session...',
      anonContinueBtn: 'Continue Anonymously',
      noAccountText: 'Need a dedicated account?',
      registerLink: 'Create Account',
      systemStatusLink: 'System Status',
      registerTitle: 'Create Account',
      registerSubtitle: 'Sign up to redeem Itemsatis license keys and download R-AI.',
      errEnterIdentifier: 'Please enter a username or email address.',
      errUsernameLength: 'Username must be at least 3 characters long.',
      errPasswordLength: 'Password must be at least 8 characters long.',
      errPasswordMismatch: 'The passwords you entered do not match.',
      errRegisterFailed: 'Registration could not be completed.',
      errRegisterGeneric: 'An error occurred during registration.',
      registerIdentifierPlaceholder: 'e.g. saintstudio or name@domain.com',
      registerPasswordPlaceholder: 'Min 8 characters (uppercase/lowercase + number)',
      passwordConfirmLabel: 'CONFIRM PASSWORD',
      registerSubmitBtn: 'Create Secure Account',
      alreadyHaveAccount: 'Already have an account?',
      loginHereLink: 'Sign In',
    },
    dashboard: {
      adminPanelBtn: 'Admin Panel',
      logoutBtn: 'Sign Out',
      pageTitle: 'Client Control Panel',
      pageSubtitle: 'Redeem Itemsatis activation codes, inspect active licenses, and download the R-AI installer.',
      redeemTitle: 'Redeem Activation Code',
      redeemSubtitle: 'Enter the code received with your Itemsatis order to link your license.',
      redeemPlaceholder: 'e.g. R-AI-XXXX-XXXX-XXXX',
      redeemLoadingBtn: 'Verifying...',
      redeemSubmitBtn: 'Activate Code',
      redeemError: 'Could not activate code.',
      genericError: 'An error occurred.',
      downloadError: 'Could not generate download link.',
      downloadFailed: 'Download failed.',
      stationTitle: 'R-AI Desktop Workstation',
      stationSubtitle: 'Download the enterprise desktop (.exe) application directly.',
      licenseActiveBadge: 'LICENSE ACTIVE & VERIFIED',
      licenseMissingBadge: 'NO ACTIVE LICENSE FOUND',
      fileMeta: 'Restricted_Studio_Setup.exe • Windows 10/11 x64',
      downloadActiveNotice: 'Your active license is verified. Click the button below to download the installer.',
      downloadLockedNotice: 'You must redeem a valid activation code before downloading the setup executable.',
      downloadPreparingBtn: 'Preparing download...',
      downloadBtn: 'Download R-AI Installer (.exe)',
      downloadLockedBtn: 'Download Locked (License Required)',
      licensesTitle: 'My Licenses & Device Bindings',
      licensesSubtitle: 'Active products, remaining duration, and HWID hardware lock status.',
      loadingLicenses: 'Loading license records...',
      emptyLicensesTitle: 'No active licenses are currently linked to your account.',
      emptyLicensesHint: 'Enter your Itemsatis activation code above to get started immediately.',
      thProduct: 'PRODUCT',
      thStatus: 'STATUS',
      thRemaining: 'TIME LEFT',
      thHwid: 'HARDWARE LOCK (HWID)',
      thExpires: 'EXPIRES ON',
      statusActive: 'Active',
      statusExpired: 'Expired',
      statusSuspended: 'Suspended',
      daysSuffix: 'Days',
      hwidLockedPrefix: 'Bound',
      hwidPending: 'Awaiting First Device',
    },
    discordPage: {
      statusBadge: 'CONFIGURATION IN PROGRESS',
      title: 'Our Discord Server Is Launching Soon',
      description:
        'We are finalizing our community and technical support infrastructure for a fast, structured experience. Soon you will have direct access to our development team, release logs, and ticket support on Discord.',
      features: [
        {
          title: '1-on-1 Ticket Support',
          desc: 'Direct communication with engineers for FiveM architecture, script installation, and R-AI support.',
        },
        {
          title: 'Auto Roles & Licensing',
          desc: 'Licenses acquired via Itemsatis or our portal automatically sync to grant verified client roles.',
        },
        {
          title: 'Early Access & Promos',
          desc: 'First access to upcoming 3D MLO releases, codebase updates, and seasonal community discounts.',
        },
      ],
      primaryBtn: 'Visit Itemsatis Store',
      secondaryBtn: 'Browse Package Catalog',
      tertiaryBtn: 'Back to Home',
      footerCopyright: 'Copyright © 2026 Restricted Studio. All rights reserved.',
      footerSub: 'For inquiries and purchases, reach us 24/7 through our official Itemsatis store.',
    },
    errorsPage: {
      notFoundCode: 'ERROR CODE // 404',
      notFoundTitle: 'Page Not Found',
      notFoundDesc:
        'The route you requested does not exist, may have been moved, or is restricted by security policy.',
      exploreCatalog: 'Browse Catalog',
      errorCode: 'SYSTEM STATE // 500',
      errorTitle: 'Unexpected Error Occurred',
      errorDesc:
        'The operation was interrupted safely. You can retry the request or return to the main screen.',
      retryBtn: 'Try Again',
    },
  },

  ru: {
    meta: {
      siteTitle: 'Restricted Studio — Корпоративная FiveM Инфраструктура и ПО',
      siteDescription:
        'Restricted Studio — студия разработки открытых скриптов FiveM, 3D-локаций MLO, оптимизированной SQL-архитектуры и готовых серверных решений.',
      ogDescription:
        'Открытые скрипты FiveM, оптимизация SQL, 3D-карты MLO и управление лицензиями.',
      twitterDescription:
        'Высокопроизводительные открытые скрипты и инфраструктура для серверов FiveM.',
      discordTitle: 'Discord-сервер скоро откроется — Restricted Studio',
      discordDescription:
        'Официальное сообщество и служба технической поддержки Restricted Studio в Discord скоро будут запущены.',
      statusTitle: 'Статус систем',
      statusDescription:
        'Актуальный статус доступности и работы сервисов Restricted Studio.',
    },
    common: {
      home: 'Главная',
      catalog: 'Каталог',
      discord: 'Discord',
      status: 'Статус',
      clientPortal: 'Клиентский портал',
      itemsatisTrust: 'МАГАЗИН ITEMSATIS',
      itemsatisOfficialStore: 'Официальный магазин на Itemsatis',
      itemsatisStore: 'Официальный магазин Itemsatis',
      itemsatisShort: 'Itemsatis',
      close: 'Закрыть',
      backToHome: 'На главную',
      openMenu: 'Открыть меню',
      langLabel: 'Язык',
      autoLangHint: 'Определено по языку устройства',
    },
    home: {
      nav: {
        about: 'О НАС',
        solutions: 'РЕШЕНИЯ',
        catalog: 'КАТАЛОГ',
        engineering: 'ТЕХНОЛОГИИ',
        faq: 'FAQ',
        searchTitle: 'Поиск в каталоге',
        discordTitle: 'Сообщество Discord',
        portal: 'ПОРТАЛ',
      },
      drawer: {
        about: 'О НАС',
        solutions: 'РЕШЕНИЯ И СТАТИСТИКА',
        catalog: 'КАТАЛОГ ПАКЕТОВ (6 400+)',
        engineering: 'АРХИТЕКТУРА И ОТКРЫТЫЙ КОД',
        faq: 'ЧАСТЫЕ ВОПРОСЫ',
        portal: 'ПОРТАЛ И ЛИЦЕНЗИИ',
        itemsatis: 'МАГАЗИН ITEMSATIS',
        discord: 'СООБЩЕСТВО DISCORD',
        status: 'СТАТУС СИСТЕМЫ',
      },
      hero: {
        eyebrow: 'RESTRICTED STUDIO · НОВОГОДНИЙ РЕЛИЗ 2026',
        headline1: 'НАДЁЖНАЯ БАЗА.',
        headline2: 'ОТКРЫТЫЙ КОД.',
        headline3: 'ВЫСОКИЙ FPS.',
        subheadBeforeCount: 'Хватит тратить время на кривые сливы и сложную настройку. Запускайте продакшн с',
        subheadAfterCount:
          '+ проверенных скриптов, 3D-локаций MLO и SQL-архитектуры без задержек.',
        exploreCatalog: 'ОТКРЫТЬ КАТАЛОГ',
        statPackages: 'ПАКЕТОВ',
        statResmon: 'RESMON',
        statOpenSource: 'OPEN SOURCE',
        statValuesAria: 'Ключевые показатели',
      },
      cards: {
        engTag: 'АРХИТЕКТУРА И КОД',
        engTitle: 'ЧИСТЫЙ КОД',
        engSub: '100% открытый Lua/JS · Без привязки Escrow.',
        discordTag: 'ПОДДЕРЖКА И ЧАТ',
        discordTitle: 'DISCORD',
        discordSub: 'Прямая поддержка тикетами и помощь в установке 24/7.',
      },
      telemetry: {
        ariaLabel: 'Монитор телеметрии системы',
        statusVersion: 'v3.4 · Активен',
        online: 'ONLINE',
        tick: 'Tick',
        sql: 'SQL',
        escrow: 'Escrow',
        capacityTitle: 'НАГРУЗКА СЕРВЕРА',
        capacitySub: 'Одновременная работа · Неделя',
        capacityFooter: '64 / 64 Слотов · Istanbul Engine',
        statusLink: 'СТАТУС СИСТЕМЫ →',
      },
      modals: {
        aboutEyebrow: '01 // О НАС И СТАНДАРТЫ',
        aboutTitle: 'Новый стандарт качества для FiveM без переплат.',
        solutionsEyebrow: '02 // СТЕК РАЗРАБОТКИ И СОСТАВ АРХИВА',
        solutionsTitle: 'Модульная инфраструктура сервера в одном месте.',
        engineeringEyebrow: '03 // АРХИТЕКТУРА И ОТКРЫТЫЙ ИСХОДНЫЙ КОД',
        engineeringTitle: 'Никаких чёрных ящиков — только читаемый чистый код.',
        faqEyebrow: '04 // ЧАСТО ЗАДАВАЕМЫЕ ВОПРОСЫ',
        faqTitle: 'Все технические детали и условия покупки.',
        aboutLeadBold: 'Зарубежные скрипты стоимостью от 100€ до 300€',
        aboutLeadRest:
          ' создали высокий порог входа для разработчиков и владельцев серверов. Restricted Studio объединяет Lua/JS, 3D-маппинг (MLO) и MariaDB на прозрачных условиях со 100% открытым исходным кодом.',
        aboutCards: [
          {
            title: 'Доступная честная цена',
            body: 'Фиксированная цена 100 TL за пакет. При выборе от 16 пакетов автоматически действует скидка 50%.',
          },
          {
            title: 'Гибкая кастомизация',
            body: 'Интерфейс, перевод и игровая логика полностью адаптируются под концепцию вашего проекта.',
          },
          {
            title: 'Проверенная безопасность',
            body: 'Каждый файл очищен от скрытых внешних вебхуков, бэкдоров и вредоносных вставок.',
          },
        ],
        compareHeaders: ['Критерий', 'Обычный Escrow / Сливы', 'Restricted Studio'],
        compareRows: [
          ['Исходный код', 'Закрыт Escrow, нельзя править', '100% открытый исходный код'],
          ['Нагрузка CPU', 'Просадки FPS и фризы', '0.00 ms в простое, быстрый SQL'],
          ['Безопасность', 'Непроверяемые шифрованные файлы', 'Аудит и чистая структура кода'],
          ['Покупка', 'Рискованные переводы на форумах', 'Itemsatis 3D Secure и Discord'],
        ],
        solutionsCards: [
          {
            title: 'Оригинальные скрипты',
            body: 'Модули на Lua 5.4 и современном UI без лишней нагрузки на процессор сервера.',
            chips: ['QB-Core / Qbox / ESX', '0.00 ms Idle'],
          },
          {
            title: '3D MLO и интерьеры',
            body: 'Оптимизированные порталы и окклюзия, сохраняющие высокий FPS даже при полном онлайне.',
            chips: ['Оптимум полигонов', 'Свои интерьеры'],
          },
          {
            title: 'Архитектура SQL',
            body: 'Грамотные индексы MariaDB для моментальных запросов и полной поддержки UTF-8/кириллицы.',
            chips: ['1.1 ms Задержка', 'InnoDB UTF8MB4'],
          },
          {
            title: 'Готовые сборки',
            body: 'Сбалансированная экономика, совместимые ресурсы и пошаговая инструкция развёртывания.',
            chips: ['Полная интеграция', 'Поддержка Discord'],
          },
        ],
        archiveDistribution: 'РАСПРЕДЕЛЕНИЕ АРХИВА',
        archivePackagesUnit: 'ПАКЕТОВ',
        openCatalogLink: 'Открыть каталог →',
        engineeringCards: [
          {
            title: '1. Мульти-фреймворк мост',
            body: 'Автоматическое определение QB-Core, Qbox и ESX Legacy из единой кодовой базы.',
          },
          {
            title: '2. Серверная валидация',
            body: 'Все проверки валюты, инвентаря и дистанции выполняются строго на стороне сервера.',
          },
          {
            title: '3. Аудит перед выдачей',
            body: 'Каждый архив проходит сканирование на скрытые вебхуки и бэкдоры до передачи клиенту.',
          },
        ],
        codeComments: {
          bridge: 'Автоопределение QB-Core, Qbox и ESX',
          security: 'Серверная проверка дистанции и прав',
          database: 'Индексированная таблица MariaDB',
        },
        faqItems: [
          {
            q: 'Как ознакомиться с товарами и оформить покупку?',
            a: 'Весь каталог представлен на нашей официальной странице Itemsatis. Добавьте нужные пакеты в корзину и перейдите к оплате с защитой 3D Secure.',
          },
          {
            q: 'Есть ли шифрование или Escrow-блокировка в файлах?',
            a: 'Нет. Все материалы передаются со 100% открытым исходным кодом без каких-либо лицензионных замков.',
          },
          {
            q: 'Какие фреймворки FiveM поддерживаются?',
            a: 'Ресурсы полностью совместимы с QB-Core, Qbox и ESX Legacy.',
          },
          {
            q: 'Предоставляется ли поддержка после покупки?',
            a: 'Да. Каждый пакет сопровождается инструкцией по установке, а команда поддержки помогает с интеграцией в Discord.',
          },
        ],
        goToCatalog: 'Перейти в каталог →',
        itemsatisLink: 'Магазин Itemsatis ↗',
      },
    },
    catalog: {
      eyebrow: 'Новогодний сезон · Архив FiveM',
      title: 'Каталог скриптов и инфраструктуры FiveM',
      descBeforeCount: 'Проверено',
      descMiddle: 'пакетов. Фиксированная цена 100 TL, от 16 позиций —',
      descDiscount: 'скидка 50%',
      badgeOpenSource: 'Открытый код',
      badgeUnitPrice: 'Цена за пакет',
      badgeDiscount: 'Скидка от 16 шт.',
      orderGuideBtn: 'Как заказать',
      mobileMenuBtn: 'Меню и фильтры',
      mobileMyCart: (count) => `Корзина (${count})`,
      mobilePortal: 'Портал и лицензии',
      mobileItemsatis: 'Магазин Itemsatis',
      mobileDiscord: 'Поддержка (Discord)',
      mobileStatus: 'Статус системы',
      cartShort: 'Корзина',
      sidebarTitle: 'Меню и фильтры каталога',
      searchTitle: 'Поиск пакетов',
      searchPlaceholder: 'Название, скрипт, MLO...',
      searchClearAria: 'Очистить поиск',
      categoriesTitle: 'Категории',
      categoryLabels: {
        Tümü: 'Все пакеты',
        'Script & Sistemler': 'Скрипты и системы',
        'MLO & Mekanlar': 'MLO и локации',
        'Araç Paketleri': 'Автомобили',
        'Kıyafet & EUP': 'Одежда и EUP',
        'Modlar & Eklentiler': 'Моды и аддоны',
        'Program & Araçlar': 'Софт и утилиты',
      },
      sortTitle: 'Сортировка',
      sortLabel: 'Порядок:',
      sortDefault: 'Рекомендуемые',
      sortAsc: 'По имени (A → Z)',
      sortDesc: 'По имени (Z → A)',
      campaignActiveBadge: '★ СКИДКА 50% АКТИВНА',
      campaignDefaultBadge: '■ 100 TL ЗА ПАКЕТ',
      campaignActiveText: (count) =>
        `В корзине ${count} пакетов. С учётом скидки 50% цена за каждый составляет 50 TL!`,
      campaignDefaultText:
        'Добавьте более 15 пакетов (16+), чтобы мгновенно получить скидку 50% на всю корзину.',
      progressStart: 'Добавьте 16 пакетов для скидки 50%!',
      progressRemaining: (remaining) => `Ещё ${remaining} пакетов до скидки 50%!`,
      openCartWithTotal: (total) => `Открыть корзину (${total} TL)`,
      quickSearchTitle: 'Быстрый поиск',
      verifiedStoreBadge: '✓ Проверенный магазин',
      verifiedStoreDesc:
        'Все заказы оформляются через официальный магазин Itemsatis с защитой платежей 3D Secure.',
      inspectStoreLink: 'Профиль магазина ↗',
      orderInstructionsLink: '■ Инструкция заказа',
      discordSupportLink: '↗ Поддержка Discord',
      packageCountLabel: (count) => `${count} шт.`,
      removeCategoryAria: 'Сбросить категорию',
      removeSearchAria: 'Сбросить поиск',
      resetFilters: 'Сбросить фильтры',
      myCartBtn: 'Корзина',
      verifiedItemBadge: 'Проверено',
      priceLabel: 'Цена:',
      inCartBtn: 'В корзине (Убрать)',
      addToCartBtn: 'В корзину',
      addToCartTitle: 'Добавить в корзину',
      removeFromCartTitle: 'Убрать из корзины',
      askDiscordTitle: 'Задать вопрос в Discord',
      askDiscordAria: 'Спросить в Discord',
      emptySearchTitle: (q) => `Ничего не найдено по запросу "${q}"`,
      emptyCategoryTitle: 'В этой категории пока пусто',
      emptyDesc:
        'Нужного ресурса ещё нет в витрине. Отправьте ссылку FiveM / CFX нам в Discord — мы проверим архив и подготовим его для вас в тот же день.',
      requestCustomBtn: 'Запросить пакет (Discord) ↗',
      loadMoreBtn: (pageSize) => `Показать ещё (+${pageSize})`,
      trustOpenSourceTitle: '100% Открытый код',
      trustOpenSourceDesc: 'Полная свобода редактирования без привязки к Escrow.',
      trustSecureTitle: 'Itemsatis 3D Secure',
      trustSecureDesc: 'Безопасная оплата через наш официальный магазин.',
      trustPerfTitle: '0.00 ms в простое',
      trustPerfDesc: 'Чистый код без лишних циклов для максимального FPS.',
      footerTagline:
        'Надёжные и производительные программные решения для экосистемы FiveM.',
      officialSalesLabel: 'Продажи:',
      footerSections: 'Разделы',
      footerCatalogLink: 'Каталог пакетов',
      footerDiscordSupport: 'Поддержка Discord',
      footerCategories: 'Категории',
      footerOfficialChannels: 'Каналы',
      footerCopyright: '© 2026 Restricted Studio. Все права защищены.',
      footerDisclaimer:
        'Restricted Studio не связан с Rockstar Games, Take-Two Interactive или CitizenFX Collective. Весь контент проходит проверку безопасности по запросу.',
      guideModalTitle: 'Инструкция заказа через Itemsatis',
      guideModalSubtitle: 'Оформите заказ в официальном магазине Itemsatis за 3 простых шага:',
      guideSteps: [
        {
          n: '1',
          t: 'Соберите пакеты в корзину',
          d: 'Выберите нужные модули среди 6 400+ позиций кнопкой «В корзину».',
        },
        {
          n: '2',
          t: 'Нажмите «Купить»',
          d: 'Список названий автоматически скопируется в буфер обмена, а вы перейдёте на страницу магазина Itemsatis.',
        },
        {
          n: '3',
          t: 'Отправьте список и получите файлы',
          d: 'Отправьте скопированный список продавцу — после оплаты 3D Secure чистый архив будет передан моментально.',
        },
      ],
      sampleInquiry:
        'Здравствуйте, хочу оформить заказ на Itemsatis:\nПакеты:\n[Вставьте названия пакетов сюда]\nПодтвердите, пожалуйста, наличие, актуальность версии и итог.',
      templateHeader: 'ШАБЛОН СООБЩЕНИЯ ДЛЯ ITEMSATIS',
      templateCopied: '✓ Скопировано',
      templateCopyHint: 'Нажмите для копирования',
      templateCopyAria: 'Скопировать шаблон сообщения',
      guideCampaignNoteLabel: 'Акция:',
      guideCampaignNoteBody:
        '100 TL за позицию. При заказе от 16 пакетов вся корзина пересчитывается со скидкой 50% (50 TL / шт.).',
      guideStartExploring: 'Перейти к каталогу',
      guideDontShowToday: 'Больше не показывать сегодня',
      floatingDiscountTag: 'Скидка 50%',
      floatingHintActive: 'Скидка активна (50 TL за пакет)',
      floatingHintOneLeft: 'Добавьте ещё 1 пакет для скидки 50%!',
      floatingHintRemaining: (remaining) => `Ещё ${remaining} до скидки 50%!`,
      floatingCheckoutBtn: 'Корзина и оформление',
      drawerTitle: 'Моя корзина',
      drawerSub: (count) => `Выбрано: ${count}`,
      drawerDiscountTitle: 'Применена скидка 50%!',
      drawerDiscountDesc:
        'Так как выбрано более 15 пакетов, стоимость каждого снижена со 100 TL до 50 TL.',
      drawerCampaignTitle: 'Оптовая скидка от 16 пакетов',
      drawerCampaignDesc: (remaining) =>
        `Добавьте ещё ${remaining} пакетов, чтобы получить скидку 50% на весь заказ!`,
      drawerEmptyTitle: 'Корзина пока пуста',
      drawerEmptyDesc: 'Нажимайте «В корзину» у нужных пакетов в каталоге.',
      drawerRemoveTitle: 'Убрать из корзины',
      drawerRemoveAria: 'Удалить',
      summaryCountLabel: 'Количество пакетов',
      summaryCountVal: (count) => `${count} шт.`,
      summaryUnitLabel: 'Цена за штуку',
      summaryDiscountLabel: 'Скидка 50%',
      summaryTotalLabel: 'Итого к оплате',
      checkoutBtn: 'Купить через Itemsatis',
      checkoutNoteBefore: 'При нажатии «Купить» в буфер обмена копируются только названия',
      checkoutNoteMiddle: 'выбранных пакетов, после чего откроется официальный магазин Itemsatis.',
      checkoutNoteAfter: '',
      clearCartBtn: 'Очистить',
      continueCatalogBtn: 'Продолжить выбор →',
      toastAdded: (title) => `«${title}» добавлен в корзину.`,
      toastRemoved: (title) => `«${title}» убран из корзины.`,
      toastCleared: 'Корзина очищена.',
      toastCheckoutCopied: (count) => `Скопировано ${count} названий! Открываем Itemsatis...`,
      toastCheckoutRedirect: 'Перенаправление в магазин Itemsatis...',
    },
    statusPage: {
      pillTag: 'СТАТУС',
      navAria: 'Быстрая навигация',
      states: {
        operational: { label: 'Работает', headline: 'Все системы работают' },
        degraded: { label: 'Замедление', headline: 'Частичное снижение стабильности' },
        outage: { label: 'Сбой', headline: 'Проблема с доступностью' },
      },
      loadingHeadline: 'Проверка статуса...',
      errorHeadline: 'Статус недоступен',
      errorFallback: 'Не удалось обновить статус. Попробуйте ещё раз.',
      invalidResponseError: 'Некорректный ответ сервера.',
      lastCheckedPrefix: 'Обновлено:',
      verifyingLive: 'Проверка сервисов...',
      checkingBtn: 'Обновление',
      checkNowBtn: 'Обновить',
      servicesTitle: 'Сервисы',
      serviceNames: {
        web: 'Веб-портал и сайт',
        auth: 'Аккаунт и вход',
        database: 'Лицензии и данные',
        catalog: 'Каталог продуктов',
      },
      historicalTitle: 'Статистика доступности',
      ratio24h: '24 часа',
      ratio7d: '7 дней',
      ratio30d: '30 дней',
      ratio90d: '90 дней',
      incidentDetected: 'Затронутые сервисы',
      noIncidents: 'Активных сбоев или плановых работ не зафиксировано.',
      footerBrand: 'Restricted Studio',
    },
    auth: {
      loginErrors: {
        oauth_denied: 'Вход через Google был отменён.',
        oauth_failed: 'Не удалось завершить вход через Google. Попробуйте ещё раз.',
        rate_limited: 'Слишком много попыток входа. Подождите несколько минут.',
      },
      registeredInfo: 'Аккаунт успешно создан. Теперь вы можете войти.',
      anonStartError: 'Не удалось открыть гостевую сессию.',
      anonGenericError: 'Ошибка при анонимном входе.',
      invalidCredentials: 'Неверные учётные данные.',
      loginGenericError: 'Ошибка при попытке входа.',
      forgotProcessError: 'Не удалось обработать запрос.',
      forgotSendError: 'Не удалось отправить ссылку сброса пароля.',
      forgotTitle: 'Сброс пароля',
      loginTitle: 'Вход в клиентский портал',
      forgotSubtitle: 'Отправим одноразовую ссылку для восстановления на вашу почту.',
      loginSubtitle: 'Войдите в аккаунт для управления лицензиями R-AI и загрузки файлов.',
      registeredEmailLabel: 'ЗАРЕГИСТРИРОВАННЫЙ E-MAIL',
      emailPlaceholder: 'name@domain.com',
      sendingBtn: 'Отправка...',
      sendResetBtn: 'Отправить ссылку',
      backToLoginBtn: 'Назад ко входу',
      identifierLabel: 'ЛОГИН ИЛИ E-MAIL',
      identifierPlaceholder: 'Restricted или name@domain.com',
      passwordLabel: 'ПАРОЛЬ',
      forgotPasswordLink: 'Забыли пароль?',
      verifyingBtn: 'Проверка...',
      loginBtn: 'Войти',
      orDivider: 'ИЛИ В ОДИН КЛИК',
      googleContinueBtn: 'Войти через Google',
      anonOpeningBtn: 'Создание безопасной сессии...',
      anonContinueBtn: 'Продолжить анонимно',
      noAccountText: 'Хотите создать аккаунт?',
      registerLink: 'Регистрация',
      systemStatusLink: 'Статус системы',
      registerTitle: 'Создать аккаунт',
      registerSubtitle: 'Зарегистрируйтесь для активации ключей Itemsatis и загрузки R-AI.',
      errEnterIdentifier: 'Введите логин или электронную почту.',
      errUsernameLength: 'Логин должен содержать минимум 3 символа.',
      errPasswordLength: 'Пароль должен содержать минимум 8 символов.',
      errPasswordMismatch: 'Введённые пароли не совпадают.',
      errRegisterFailed: 'Не удалось завершить регистрацию.',
      errRegisterGeneric: 'Ошибка при создании аккаунта.',
      registerIdentifierPlaceholder: 'Напр.: saintstudio или name@domain.com',
      registerPasswordPlaceholder: 'От 8 символов (заглавные/строчные буквы + цифры)',
      passwordConfirmLabel: 'ПОВТОРИТЕ ПАРОЛЬ',
      registerSubmitBtn: 'Создать аккаунт',
      alreadyHaveAccount: 'Уже есть аккаунт?',
      loginHereLink: 'Войти',
    },
    dashboard: {
      adminPanelBtn: 'Панель администратора',
      logoutBtn: 'Выйти',
      pageTitle: 'Личный кабинет клиента',
      pageSubtitle: 'Активируйте коды Itemsatis, управляйте лицензиями и скачайте установщик R-AI.',
      redeemTitle: 'Активация ключа (Redeem)',
      redeemSubtitle: 'Введите код из заказа Itemsatis, чтобы привязать лицензию к вашему аккаунту.',
      redeemPlaceholder: 'Напр.: R-AI-XXXX-XXXX-XXXX',
      redeemLoadingBtn: 'Проверка...',
      redeemSubmitBtn: 'Активировать ключ',
      redeemError: 'Не удалось активировать код.',
      genericError: 'Произошла ошибка.',
      downloadError: 'Не удалось получить ссылку на скачивание.',
      downloadFailed: 'Ошибка загрузки.',
      stationTitle: 'Рабочая станция R-AI Desktop',
      stationSubtitle: 'Скачайте корпоративное настольное приложение (.exe) напрямую.',
      licenseActiveBadge: 'ЛИЦЕНЗИЯ АКТИВНА',
      licenseMissingBadge: 'НЕТ АКТИВНОЙ ЛИЦЕНЗИИ',
      fileMeta: 'Restricted_Studio_Setup.exe • Windows 10/11 x64',
      downloadActiveNotice: 'Ваша лицензия подтверждена. Нажмите кнопку ниже, чтобы скачать установщик.',
      downloadLockedNotice: 'Перед скачиванием установщика необходимо активировать действительный ключ лицензии.',
      downloadPreparingBtn: 'Подготовка файла...',
      downloadBtn: 'Скачать установщик R-AI (.exe)',
      downloadLockedBtn: 'Скачивание заблокировано (нужна лицензия)',
      licensesTitle: 'Мои лицензии и устройства',
      licensesSubtitle: 'Привязанные продукты, остаток срока и статус аппаратной блокировки HWID.',
      loadingLicenses: 'Загрузка списка лицензий...',
      emptyLicensesTitle: 'К вашему аккаунту пока не привязано ни одной активной лицензии.',
      emptyLicensesHint: 'Введите ключ активации Itemsatis в форме выше, чтобы начать работу.',
      thProduct: 'ПРОДУКТ',
      thStatus: 'СТАТУС',
      thRemaining: 'ОСТАТОК',
      thHwid: 'HWID ПРИВЯЗКА',
      thExpires: 'ДЕЙСТВУЕТ ДО',
      statusActive: 'Активна',
      statusExpired: 'Истекла',
      statusSuspended: 'Приостановлена',
      daysSuffix: 'дн.',
      hwidLockedPrefix: 'Привязан',
      hwidPending: 'Ожидание запуска',
    },
    discordPage: {
      statusBadge: 'НАСТРОЙКА ИНФРАСТРУКТУРЫ',
      title: 'Наш Discord-сервер скоро откроется',
      description:
        'Мы настраиваем официальное Discord-сообщество для быстрой и надёжной технической поддержки. Совсем скоро вы сможете общаться с командой разработчиков и получать обновления напрямую.',
      features: [
        {
          title: 'Прямые тикеты поддержки',
          desc: 'Прямая связь с инженерами по архитектуре FiveM, установке скриптов и работе R-AI.',
        },
        {
          title: 'Авто-роли и лицензии',
          desc: 'Лицензии из Itemsatis и личного кабинета автоматически выдают клиентские роли.',
        },
        {
          title: 'Ранний доступ и скидки',
          desc: 'Ранний доступ к новым MLO-локациям, обновлениям и закрытым акциям сообщества.',
        },
      ],
      primaryBtn: 'Открыть магазин Itemsatis',
      secondaryBtn: 'Перейти в каталог',
      tertiaryBtn: 'На главную',
      footerCopyright: '© 2026 Restricted Studio. Все права защищены.',
      footerSub: 'По всем вопросам и покупкам обращайтесь круглосуточно в наш магазин Itemsatis.',
    },
    errorsPage: {
      notFoundCode: 'КОД ОШИБКИ // 404',
      notFoundTitle: 'Страница не найдена',
      notFoundDesc:
        'Запрашиваемый адрес не существует, был перемещён или ограничен политикой безопасности.',
      exploreCatalog: 'Перейти в каталог',
      errorCode: 'СОСТОЯНИЕ СИСТЕМЫ // 500',
      errorTitle: 'Произошла непредвиденная ошибка',
      errorDesc:
        'Операция была безопасно прервана. Попробуйте обновить страницу или вернуться на главную.',
      retryBtn: 'Повторить попытку',
    },
  },

  fr: {
    meta: {
      siteTitle: 'Restricted Studio — Écosystème Logiciel & Infrastructure FiveM',
      siteDescription:
        'Restricted Studio est un studio logiciel spécialisé dans les scripts FiveM open-source, intérieurs 3D MLO, bases SQL optimisées et infrastructures serveur prêtes pour la production.',
      ogDescription:
        'Scripts FiveM open-source, architecture SQL optimisée, cartes 3D MLO et portail de licences.',
      twitterDescription:
        'Scripts open-source haute performance et solutions d’infrastructure pour FiveM.',
      discordTitle: 'Serveur Discord bientôt disponible — Restricted Studio',
      discordDescription:
        'La communauté officielle et l’assistance technique Restricted Studio sur Discord arrivent bientôt.',
      statusTitle: 'État des systèmes',
      statusDescription:
        'Disponibilité en direct et état de fonctionnement des services Restricted Studio.',
    },
    common: {
      home: 'Accueil',
      catalog: 'Catalogue',
      discord: 'Discord',
      status: 'Statut',
      clientPortal: 'Portail Client',
      itemsatisTrust: 'VÉRIFIÉ ITEMSATIS',
      itemsatisOfficialStore: 'Boutique Officielle Vérifiée Itemsatis',
      itemsatisStore: 'Boutique Officielle Itemsatis',
      itemsatisShort: 'Itemsatis',
      close: 'Fermer',
      backToHome: "Retour à l'accueil",
      openMenu: 'Ouvrir le menu',
      langLabel: 'Langue',
      autoLangHint: 'Détecté via la langue de l’appareil',
    },
    home: {
      nav: {
        about: 'À PROPOS',
        solutions: 'SOLUTIONS',
        catalog: 'CATALOGUE',
        engineering: 'INGÉNIERIE',
        faq: 'FAQ',
        searchTitle: 'Rechercher au catalogue',
        discordTitle: 'Communauté Discord',
        portal: 'PORTAIL CLIENT',
      },
      drawer: {
        about: 'À PROPOS',
        solutions: 'SOLUTIONS & STATISTIQUES',
        catalog: 'CATALOGUE DES PACKS (6 400+)',
        engineering: 'INGÉNIERIE & OPEN SOURCE',
        faq: 'QUESTIONS FRÉQUENTES',
        portal: 'PORTAIL CLIENT & LICENCES',
        itemsatis: 'BOUTIQUE ITEMSATIS',
        discord: 'COMMUNAUTÉ DISCORD',
        status: 'ÉTAT DU SYSTÈME',
      },
      hero: {
        eyebrow: 'RESTRICTED STUDIO · ÉDITION NOUVEL AN 2026',
        headline1: 'BASE FIABLE.',
        headline2: 'CODE OUVERT.',
        headline3: 'HAUTE PERFORMANCE.',
        subheadBeforeCount: 'Ne perdez plus de temps avec des fuites instables ou des configs complexes. Passez en production avec',
        subheadAfterCount:
          '+ scripts open-source vérifiés, intérieurs 3D optimisés et SQL ultra-rapide.',
        exploreCatalog: 'VOIR LE CATALOGUE',
        statPackages: 'PACKS',
        statResmon: 'RESMON',
        statOpenSource: 'OPEN SOURCE',
        statValuesAria: 'Indicateurs Clés',
      },
      cards: {
        engTag: 'INGÉNIERIE & ARCHITECTURE',
        engTitle: 'CODE SANS CHIFFRAGE',
        engSub: '100% Open-source Lua/JS · Aucun verrou Escrow.',
        discordTag: 'COMMUNAUTÉ & SUPPORT',
        discordTitle: 'DISCORD',
        discordSub: 'Assistance dédiée par ticket et aide à l’installation 24/7.',
      },
      telemetry: {
        ariaLabel: 'Moniteur de Télémétrie Système',
        statusVersion: 'v3.4 · Actif',
        online: 'ONLINE',
        tick: 'Tick',
        sql: 'SQL',
        escrow: 'Escrow',
        capacityTitle: 'CAPACITÉ SERVEUR',
        capacitySub: 'Charge Simultanée · Semaine',
        capacityFooter: '64 / 64 Slots · Istanbul Engine',
        statusLink: 'STATUT SYSTÈME →',
      },
      modals: {
        aboutEyebrow: '01 // QUI SOMMES-NOUS & STANDARDS',
        aboutTitle: 'La qualité FiveM professionnelle, sans barrières.',
        solutionsEyebrow: '02 // ARCHITECTURE & RÉPARTITION DE L’ARCHIVE',
        solutionsTitle: 'Infrastructure serveur modulaire sous un même toit.',
        engineeringEyebrow: '03 // INGÉNIERIE & ARCHITECTURE OUVERTE',
        engineeringTitle: 'Du code lisible et propre, jamais des boîtes verrouillées.',
        faqEyebrow: '04 // QUESTIONS FRÉQUENTES',
        faqTitle: 'Détails techniques et modalités d’acquisition.',
        aboutLeadBold: 'Les ressources vendues entre 100€ et 300€ à l’international',
        aboutLeadRest:
          ' freinent le lancement des serveurs indépendants. Restricted Studio propose une ingénierie Lua/JS, 3D MLO et MariaDB de niveau professionnel à tarif accessible et 100% open-source.',
        aboutCards: [
          {
            title: 'Tarification Accessible',
            body: 'Tarif fixe de 100 TL par pack au lieu de prix exorbitants. Remise immédiate de 50% dès 16 packs dans le panier.',
          },
          {
            title: 'Modularité Totale',
            body: 'Interface, langue et règles entièrement personnalisables selon l’identité de votre serveur.',
          },
          {
            title: 'Intégrité du Code Auditée',
            body: 'Fichiers sources nettoyés, exempts de webhooks cachés ou de portes dérobées.',
          },
        ],
        compareHeaders: ['Critère', 'Escrow / Revendeurs', 'Restricted Studio'],
        compareRows: [
          ['Code Source', 'Verrouillé Escrow, non modifiable', '100% Open-source, modifiable'],
          ['Performance', 'Surcharge CPU & chutes de FPS', '0.00 ms au repos, SQL indexé'],
          ['Sécurité', 'Fichiers chiffrés opaques', 'Code source sain et vérifié'],
          ['Achat & Garantie', 'Échanges risqués sur forums', 'Itemsatis 3D Secure & Discord'],
        ],
        solutionsCards: [
          {
            title: 'Scripts FiveM Sur Mesure',
            body: 'Systèmes modulaires en Lua 5.4 et interfaces fluides économisant le CPU du serveur.',
            chips: ['QB-Core / Qbox / ESX', '0.00 ms Idle'],
          },
          {
            title: 'MLO 3D & Intérieurs',
            body: 'Portails et occlusions optimisés pour maintenir les FPS même dans les zones denses.',
            chips: ['Polygones Optimisés', 'Intérieurs Custom'],
          },
          {
            title: 'Architecture SQL',
            body: 'Tables MariaDB correctement indexées avec requêtes inférieures à la milliseconde et support UTF-8.',
            chips: ['Latence 1.1 ms', 'InnoDB UTF8MB4'],
          },
          {
            title: 'Packs Clés en Main',
            body: 'Économie équilibrée, configuration sans conflit et guides d’installation clairs.',
            chips: ['Intégration Complète', 'Support Discord'],
          },
        ],
        archiveDistribution: 'RÉPARTITION DE L’ARCHIVE',
        archivePackagesUnit: 'PACKS',
        openCatalogLink: 'Ouvrir le catalogue →',
        engineeringCards: [
          {
            title: '1. Pont Multi-Framework',
            body: 'Détection automatique de QB-Core, Qbox et ESX Legacy depuis une base unifiée.',
          },
          {
            title: '2. Validation Côté Serveur',
            body: 'Tous les contrôles d’argent, d’inventaire et de distance sont validés sur le serveur.',
          },
          {
            title: '3. Audit de Sécurité',
            body: 'Chaque archive est contrôlée contre les webhooks externes et backdoors avant livraison.',
          },
        ],
        codeComments: {
          bridge: 'Pont de détection auto QB-Core, Qbox & ESX',
          security: 'Validation serveur de distance et sécurité',
          database: 'Schéma MariaDB indexé',
        },
        faqItems: [
          {
            q: 'Comment consulter et commander les packs ?',
            a: 'Tous nos packs sont disponibles via notre boutique officielle Itemsatis. Ajoutez vos articles au panier puis finalisez votre commande en toute sécurité via Itemsatis 3D Secure.',
          },
          {
            q: 'Les fichiers livrés sont-ils chiffrés ou verrouillés Escrow ?',
            a: 'Non. Toutes nos livraisons sont 100% open-source, sans verrouillage Escrow, afin que vous puissiez modifier le code librement.',
          },
          {
            q: 'Quels frameworks FiveM sont pris en charge ?',
            a: 'Nos scripts et packs sont compatibles avec QB-Core, Qbox et ESX Legacy.',
          },
          {
            q: 'Proposez-vous un accompagnement à l’installation ?',
            a: 'Oui. Chaque ressource inclut un guide d’installation ainsi qu’une assistance personnalisée de notre équipe sur Discord.',
          },
        ],
        goToCatalog: 'Explorer le catalogue →',
        itemsatisLink: 'Boutique Itemsatis ↗',
      },
    },
    catalog: {
      eyebrow: 'Édition Nouvel An · Archive FiveM Pro',
      title: 'Archive Logicielle & Infrastructure FiveM',
      descBeforeCount: 'Plus de',
      descMiddle: 'packs vérifiés. 100 TL l’unité, remise immédiate de',
      descDiscount: '50% dès 16 articles',
      badgeOpenSource: 'Code Open Source',
      badgeUnitPrice: 'Tarif Unitaire Fixe',
      badgeDiscount: 'Remise Panier 16+',
      orderGuideBtn: 'Guide de commande',
      mobileMenuBtn: 'Menu & Filtres',
      mobileMyCart: (count) => `Mon Panier (${count})`,
      mobilePortal: 'Portail Client & Licences',
      mobileItemsatis: 'Boutique Itemsatis',
      mobileDiscord: 'Contacter (Discord)',
      mobileStatus: 'Statut Système',
      cartShort: 'Panier',
      sidebarTitle: 'Menu & Filtres du Catalogue',
      searchTitle: 'Rechercher un pack',
      searchPlaceholder: 'Nom du pack, script, MLO...',
      searchClearAria: 'Effacer',
      categoriesTitle: 'Catégories',
      categoryLabels: {
        Tümü: 'Tous les packs',
        'Script & Sistemler': 'Scripts & Systèmes',
        'MLO & Mekanlar': 'MLO & Intérieurs',
        'Araç Paketleri': 'Packs Véhicules',
        'Kıyafet & EUP': 'Vêtements & EUP',
        'Modlar & Eklentiler': 'Mods & Extensions',
        'Program & Araçlar': 'Logiciels & Outils',
      },
      sortTitle: 'Trier par',
      sortLabel: 'Tri :',
      sortDefault: 'Recommandés',
      sortAsc: 'Nom (A → Z)',
      sortDesc: 'Nom (Z → A)',
      campaignActiveBadge: '★ REMISE 50% ACTIVE',
      campaignDefaultBadge: '■ 100 TL PAR PACK',
      campaignActiveText: (count) =>
        `Vous avez ${count} packs dans votre panier. Avec 50% de remise, chaque pack coûte 50 TL !`,
      campaignDefaultText:
        'Ajoutez plus de 15 packs (16+) pour activer instantanément 50% de remise sur tout le panier.',
      progressStart: 'Ajoutez 16 packs pour obtenir -50% !',
      progressRemaining: (remaining) => `Encore ${remaining} pour débloquer -50% !`,
      openCartWithTotal: (total) => `Voir le panier (${total} TL)`,
      quickSearchTitle: 'Recherches rapides',
      verifiedStoreBadge: '✓ Boutique Vérifiée',
      verifiedStoreDesc:
        'Tous vos achats passent par notre boutique officielle Itemsatis avec protection 3D Secure.',
      inspectStoreLink: 'Voir le profil boutique ↗',
      orderInstructionsLink: '■ Guide de commande',
      discordSupportLink: '↗ Support Discord',
      packageCountLabel: (count) => `${count} Packs`,
      removeCategoryAria: 'Retirer la catégorie',
      removeSearchAria: 'Effacer la recherche',
      resetFilters: 'Réinitialiser',
      myCartBtn: 'Mon Panier',
      verifiedItemBadge: 'Vérifié',
      priceLabel: 'Prix :',
      inCartBtn: 'Ajouté (Retirer)',
      addToCartBtn: 'Ajouter',
      addToCartTitle: 'Ajouter au panier',
      removeFromCartTitle: 'Retirer du panier',
      askDiscordTitle: 'Poser une question sur ce pack via Discord',
      askDiscordAria: 'Demander sur Discord',
      emptySearchTitle: (q) => `Aucun pack trouvé pour "${q}"`,
      emptyCategoryTitle: 'Aucun pack trouvé dans cette catégorie',
      emptyDesc:
        'Ce pack n’est peut-être pas encore indexé. Envoyez-nous le lien FiveM ou CFX sur Discord ; nous l’auditerons et le préparerons le jour même.',
      requestCustomBtn: 'Demander un pack sur mesure (Discord) ↗',
      loadMoreBtn: (pageSize) => `Charger plus (+${pageSize})`,
      trustOpenSourceTitle: '100% Open Source',
      trustOpenSourceDesc: 'Aucun verrou Escrow — modifiez chaque ligne librement.',
      trustSecureTitle: 'Itemsatis 3D Secure',
      trustSecureDesc: 'Paiement sécurisé via notre boutique officielle vérifiée.',
      trustPerfTitle: '0.00 ms au repos',
      trustPerfDesc: 'Code optimisé sans boucles inutiles pour un FPS maximal.',
      footerTagline:
        'Solutions logicielles simples, sécurisées et performantes pour l’écosystème FiveM.',
      officialSalesLabel: 'Boutique officielle :',
      footerSections: 'Sections',
      footerCatalogLink: 'Catalogue des packs',
      footerDiscordSupport: 'Support Discord',
      footerCategories: 'Catégories',
      footerOfficialChannels: 'Canaux Officiels',
      footerCopyright: 'Copyright © 2026 Restricted Studio. Tous droits réservés.',
      footerDisclaimer:
        'Restricted Studio n’est affilié ni à Rockstar Games, ni à Take-Two Interactive, ni au CitizenFX Collective. Tout le contenu fait l’objet d’un contrôle de sécurité sur demande.',
      guideModalTitle: 'Guide de Commande via Itemsatis',
      guideModalSubtitle: 'Commandez en toute sécurité sur notre boutique officielle en 3 étapes :',
      guideSteps: [
        {
          n: '1',
          t: 'Ajoutez vos packs au panier',
          d: 'Sélectionnez les ressources dont votre serveur a besoin parmi 6 400+ packs via « Ajouter ».',
        },
        {
          n: '2',
          t: 'Cliquez sur Commander',
          d: 'Cliquer sur « Commander » copie la liste des packs dans votre presse-papiers et ouvre notre page Itemsatis.',
        },
        {
          n: '3',
          t: 'Envoyez la liste & recevez vos fichiers',
          d: 'Collez la liste dans le chat vendeur ; recevez immédiatement vos fichiers open-source audités via 3D Secure.',
        },
      ],
      sampleInquiry:
        'Bonjour, je souhaite passer commande sur Itemsatis :\nPacks :\n[Collez les noms des packs ici]\nPouvez-vous confirmer la disponibilité, la version et le total ?',
      templateHeader: 'MODÈLE DE MESSAGE ITEMSATIS',
      templateCopied: '✓ Copié',
      templateCopyHint: 'Cliquer pour copier',
      templateCopyAria: 'Copier le modèle de message',
      guideCampaignNoteLabel: 'Offre :',
      guideCampaignNoteBody:
        '100 TL par pack. Dès 16 articles ajoutés, tout votre panier passe immédiatement à -50% (50 TL / pack).',
      guideStartExploring: 'Explorer le catalogue',
      guideDontShowToday: 'Ne plus afficher aujourd’hui',
      floatingDiscountTag: 'Remise -50%',
      floatingHintActive: 'Offre active (50 TL par pack)',
      floatingHintOneLeft: 'Ajoutez 1 dernier pack pour -50% !',
      floatingHintRemaining: (remaining) => `Encore ${remaining} pour -50% !`,
      floatingCheckoutBtn: 'Voir le panier & Commander',
      drawerTitle: 'Mon Panier',
      drawerSub: (count) => `${count} packs sélectionnés`,
      drawerDiscountTitle: 'Remise de 50% activée !',
      drawerDiscountDesc:
        'Avec plus de 15 articles sélectionnés, chaque pack passe de 100 TL à 50 TL.',
      drawerCampaignTitle: 'Offre Lot 16+ Articles',
      drawerCampaignDesc: (remaining) =>
        `Ajoutez encore ${remaining} packs pour obtenir 50% de remise sur tout votre panier !`,
      drawerEmptyTitle: 'Votre panier est vide',
      drawerEmptyDesc: 'Cliquez sur « Ajouter » dans le catalogue pour composer votre sélection.',
      drawerRemoveTitle: 'Retirer du panier',
      drawerRemoveAria: 'Retirer',
      summaryCountLabel: 'Nombre de packs',
      summaryCountVal: (count) => `${count} unités`,
      summaryUnitLabel: 'Prix unitaire',
      summaryDiscountLabel: 'Remise campagne -50%',
      summaryTotalLabel: 'Montant total',
      checkoutBtn: 'Commander (Aller sur Itemsatis)',
      checkoutNoteBefore: 'En cliquant sur Commander, seuls les titres de vos',
      checkoutNoteMiddle: 'packs sont copiés dans votre presse-papiers avant l’ouverture de notre boutique Itemsatis.',
      checkoutNoteAfter: '',
      clearCartBtn: 'Vider le panier',
      continueCatalogBtn: 'Continuer les achats →',
      toastAdded: (title) => `"${title}" ajouté au panier.`,
      toastRemoved: (title) => `"${title}" retiré du panier.`,
      toastCleared: 'Votre panier a été vidé.',
      toastCheckoutCopied: (count) => `${count} noms copiés ! Ouverture d’Itemsatis...`,
      toastCheckoutRedirect: 'Redirection vers notre boutique Itemsatis...',
    },
    statusPage: {
      pillTag: 'STATUT',
      navAria: 'Navigation Rapide',
      states: {
        operational: { label: 'Opérationnel', headline: 'Tous les systèmes fonctionnent' },
        degraded: { label: 'Ralenti', headline: 'Dégradation partielle' },
        outage: { label: 'Incident', headline: 'Interruption de service' },
      },
      loadingHeadline: 'Vérification en cours...',
      errorHeadline: 'Statut indisponible',
      errorFallback: 'Impossible de récupérer le statut. Veuillez réessayer.',
      invalidResponseError: 'Réponse invalide.',
      lastCheckedPrefix: 'Mis à jour :',
      verifyingLive: 'Vérification des services...',
      checkingBtn: 'Actualisation',
      checkNowBtn: 'Actualiser',
      servicesTitle: 'Services',
      serviceNames: {
        web: 'Portail Web & Client',
        auth: 'Compte & Connexion',
        database: 'Licences & Données',
        catalog: 'Catalogue Produits',
      },
      historicalTitle: 'Historique de disponibilité',
      ratio24h: '24 Heures',
      ratio7d: '7 Jours',
      ratio30d: '30 Jours',
      ratio90d: '90 Jours',
      incidentDetected: 'Services concernés',
      noIncidents: 'Aucun incident actif ni maintenance planifiée.',
      footerBrand: 'Restricted Studio',
    },
    auth: {
      loginErrors: {
        oauth_denied: 'La connexion Google a été annulée.',
        oauth_failed: 'La vérification Google a échoué. Veuillez réessayer.',
        rate_limited: 'Trop de tentatives détectées. Réessayez dans quelques minutes.',
      },
      registeredInfo: 'Votre compte a été créé. Vous pouvez maintenant vous connecter.',
      anonStartError: 'Impossible de démarrer la session invité.',
      anonGenericError: 'Une erreur est survenue lors de l’accès anonyme.',
      invalidCredentials: 'Identifiants invalides.',
      loginGenericError: 'Une erreur est survenue lors de la connexion.',
      forgotProcessError: 'La demande n’a pas pu être traitée.',
      forgotSendError: 'Impossible d’envoyer le lien de réinitialisation.',
      forgotTitle: 'Réinitialisation',
      loginTitle: 'Espace Client',
      forgotSubtitle: 'Recevez un lien de réinitialisation unique sur votre adresse e-mail.',
      loginSubtitle: 'Connectez-vous pour gérer vos licences R-AI et télécharger l’installateur.',
      registeredEmailLabel: 'ADRESSE E-MAIL ENREGISTRÉE',
      emailPlaceholder: 'nom@domaine.com',
      sendingBtn: 'Envoi...',
      sendResetBtn: 'Envoyer le lien',
      backToLoginBtn: 'Retour à la connexion',
      identifierLabel: 'IDENTIFIANT OU E-MAIL',
      identifierPlaceholder: 'Restricted ou nom@domaine.com',
      passwordLabel: 'MOT DE PASSE',
      forgotPasswordLink: 'Mot de passe oublié ?',
      verifyingBtn: 'Vérification...',
      loginBtn: 'Se connecter',
      orDivider: 'OU EN UN CLIC',
      googleContinueBtn: 'Continuer avec Google',
      anonOpeningBtn: 'Ouverture session sécurisée...',
      anonContinueBtn: 'Continuer en mode anonyme',
      noAccountText: 'Besoin d’un compte dédié ?',
      registerLink: 'Créer un compte',
      systemStatusLink: 'État du système',
      registerTitle: 'Créer un compte',
      registerSubtitle: 'Inscrivez-vous pour activer vos clés Itemsatis et accéder à R-AI.',
      errEnterIdentifier: 'Veuillez saisir un identifiant ou un e-mail.',
      errUsernameLength: 'Le nom d’utilisateur doit contenir au moins 3 caractères.',
      errPasswordLength: 'Le mot de passe doit contenir au moins 8 caractères.',
      errPasswordMismatch: 'Les mots de passe ne correspondent pas.',
      errRegisterFailed: 'L’inscription n’a pas pu être finalisée.',
      errRegisterGeneric: 'Une erreur est survenue lors de l’inscription.',
      registerIdentifierPlaceholder: 'Ex : saintstudio ou nom@domaine.com',
      registerPasswordPlaceholder: 'Min 8 caractères (majuscules/minuscules + chiffre)',
      passwordConfirmLabel: 'CONFIRMER LE MOT DE PASSE',
      registerSubmitBtn: 'Créer un compte sécurisé',
      alreadyHaveAccount: 'Vous avez déjà un compte ?',
      loginHereLink: 'Se connecter',
    },
    dashboard: {
      adminPanelBtn: 'Panneau Admin',
      logoutBtn: 'Déconnexion',
      pageTitle: 'Tableau de Bord Client',
      pageSubtitle: 'Activez vos codes Itemsatis, consultez vos licences et téléchargez l’installateur R-AI.',
      redeemTitle: 'Activer un code (Redeem)',
      redeemSubtitle: 'Saisissez le code reçu avec votre commande Itemsatis pour lier votre licence.',
      redeemPlaceholder: 'Ex : R-AI-XXXX-XXXX-XXXX',
      redeemLoadingBtn: 'Validation...',
      redeemSubmitBtn: 'Activer le code',
      redeemError: 'Impossible d’activer le code.',
      genericError: 'Une erreur est survenue.',
      downloadError: 'Impossible de générer le lien de téléchargement.',
      downloadFailed: 'Échec du téléchargement.',
      stationTitle: 'Station de Travail R-AI Desktop',
      stationSubtitle: 'Téléchargez directement le logiciel de bureau (.exe).',
      licenseActiveBadge: 'LICENCE ACTIVE & VALIDÉE',
      licenseMissingBadge: 'AUCUNE LICENCE ACTIVE',
      fileMeta: 'Restricted_Studio_Setup.exe • Windows 10/11 x64',
      downloadActiveNotice: 'Votre licence est confirmée. Cliquez ci-dessous pour télécharger l’installateur.',
      downloadLockedNotice: 'Vous devez d’abord activer un code valide pour débloquer le téléchargement.',
      downloadPreparingBtn: 'Préparation du lien...',
      downloadBtn: 'Télécharger l’installateur R-AI (.exe)',
      downloadLockedBtn: 'Téléchargement verrouillé (licence requise)',
      licensesTitle: 'Mes Licences & Appareils',
      licensesSubtitle: 'Produits associés, durée restante et verrous matériels HWID.',
      loadingLicenses: 'Chargement des licences...',
      emptyLicensesTitle: 'Aucune licence active n’est actuellement liée à votre compte.',
      emptyLicensesHint: 'Saisissez votre code Itemsatis ci-dessus pour démarrer immédiatement.',
      thProduct: 'PRODUIT',
      thStatus: 'STATUT',
      thRemaining: 'DURÉE RESTANTE',
      thHwid: 'VERROU HWID',
      thExpires: 'EXPIRATION',
      statusActive: 'Active',
      statusExpired: 'Expirée',
      statusSuspended: 'Suspendue',
      daysSuffix: 'jours',
      hwidLockedPrefix: 'Lié',
      hwidPending: 'En attente du 1er lancement',
    },
    discordPage: {
      statusBadge: 'CONFIGURATION EN COURS',
      title: 'Notre Serveur Discord Arrive Bientôt',
      description:
        'Nous finalisons notre infrastructure communautaire et de support technique pour offrir une expérience fluide et sécurisée. Vous aurez bientôt accès à l’équipe de développement en direct.',
      features: [
        {
          title: 'Support par Tickets 1-à-1',
          desc: 'Échange direct avec les développeurs pour l’architecture FiveM, l’installation de scripts et R-AI.',
        },
        {
          title: 'Rôles & Licences Auto',
          desc: 'Vos licences Itemsatis et du portail attribuent automatiquement vos rôles client vérifiés.',
        },
        {
          title: 'Accès Anticipé & Offres',
          desc: 'Accès prioritaire aux nouveaux MLO 3D, mises à jour et promotions exclusives.',
        },
      ],
      primaryBtn: 'Boutique Itemsatis',
      secondaryBtn: 'Explorer le catalogue',
      tertiaryBtn: "Retour à l'accueil",
      footerCopyright: 'Copyright © 2026 Restricted Studio. Tous droits réservés.',
      footerSub: 'Pour toute question ou commande, contactez-nous 24/7 via notre boutique Itemsatis.',
    },
    errorsPage: {
      notFoundCode: 'CODE ERREUR // 404',
      notFoundTitle: 'Page Introuvable',
      notFoundDesc:
        'La route demandée n’existe pas, a été déplacée ou est restreinte par notre politique de sécurité.',
      exploreCatalog: 'Explorer le catalogue',
      errorCode: 'ÉTAT SYSTÈME // 500',
      errorTitle: 'Une Erreur Inattendue Est Survenue',
      errorDesc:
        'L’opération a été interrompue par sécurité. Vous pouvez réessayer ou revenir à l’accueil.',
      retryBtn: 'Réessayer',
    },
  },
};
