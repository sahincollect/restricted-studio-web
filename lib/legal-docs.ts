import type { Locale } from './i18n';

export type LegalDocSlug =
  | 'kvkk'
  | 'gizlilik'
  | 'cerez'
  | 'kullanim-kosullari'
  | 'teslimat-ve-iade';

export interface LegalSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface LegalDocument {
  slug: LegalDocSlug;
  href: `/yasal/${LegalDocSlug}`;
  navLabel: string;
  eyebrow: string;
  title: string;
  summary: string;
  updatedAt: string;
  sections: LegalSection[];
}

export const LEGAL_DOC_ORDER: readonly LegalDocSlug[] = [
  'kvkk',
  'gizlilik',
  'cerez',
  'kullanim-kosullari',
  'teslimat-ve-iade',
];

const LAST_UPDATED_LABEL: Record<Locale, string> = {
  tr: 'Son Güncelleme: 18 Kasım 2026',
  en: 'Last Updated: November 18, 2026',
  ru: 'Последнее обновление: 18 ноября 2026 г.',
  fr: 'Dernière mise à jour : 18 novembre 2026',
};

const TR_DOCS: Record<LegalDocSlug, LegalDocument> = {
  kvkk: {
    slug: 'kvkk',
    href: '/yasal/kvkk',
    navLabel: 'KVKK Aydınlatma',
    eyebrow: '6698 SAYILI KANUN KAPSAMINDA BİLGİLENDİRME',
    title: 'KVKK Aydınlatma Metni',
    summary:
      'Restricted Studio (restrictedstudio.shop) web platformu üzerinden işlenen kişisel verilerin kapsamı, işleme amaçları, aktarım kanalları ve 6698 sayılı Kanun kapsamındaki haklarınız hakkında bilgilendirme metnidir.',
    updatedAt: LAST_UPDATED_LABEL.tr,
    sections: [
      {
        heading: '1. Veri Sorumlusu ve İletişim',
        paragraphs: [
          'Kişisel verileriniz, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca Restricted Studio dijital yazılım ekosistemi kapsamında işlenmektedir.',
          'KVKK kapsamındaki tüm soru, bilgi talebi ve başvurularınızı info@restrictedstudio.shop adresine iletebilirsiniz.',
        ],
      },
      {
        heading: '2. İşlenen Kişisel Veri Kategorileri',
        paragraphs: [
          'Sitemizi ziyaret etmeniz veya platform içi formları kullanmanız durumunda yalnızca işlemin gerektirdiği asgari veriler işlenir:',
        ],
        bullets: [
          'Hesap & Kimlik Bilgileri: Müşteri portalına kayıt/giriş sırasında paylaşılan kullanıcı adı veya e-posta adresi ile tek yönlü özetlenmiş (Argon2id) parola verisi.',
          'Hizmet Başvuru Bilgileri: /hizmetler/web-kurulum ve /hizmetler/discord-bot formları üzerinden ilettiğiniz ad/kurum adı, e-posta adresi, Discord kullanıcı adı, kapsam tercihi ve proje açıklaması.',
          'İşlem & Güvenlik Kayıtları: Kötüye kullanımın önlenmesi, hız sınırlama (rate-limit), oturum güvenliği ve denetim izi için geçici IP adresi ve güvenlik doğrulama kayıtları.',
          'Tercih & Etkileşim Verileri: Arayüz dili tercihi, yerel sepet listesi ve sayfa içi teknik performans metrikleri.',
        ],
      },
      {
        heading: '3. Kişisel Verilerin İşlenme Amaçları ve Hukuki Sebepler',
        paragraphs: [
          'Verileriniz KVKK Md. 5 kapsamında bir sözleşmenin kurulması/ifası, bilgi güvenliğinin sağlanması, hakkın tesisi ve meşru menfaat hukuki sebeplerine dayanılarak aşağıdaki amaçlarla işlenir:',
        ],
        bullets: [
          'Müşteri portalı, lisans aktivasyonu (redeem) ve donanım kilidi doğrulama süreçlerinin yürütülmesi.',
          'Web kurulumu ve Discord botu hizmet taleplerinin değerlendirilmesi ve tarafınıza e-posta yoluyla geri dönüş yapılması.',
          'DDoS, yetkisiz erişim ve otomatik bot saldırılarına karşı ağ güvenliğinin korunması.',
        ],
      },
      {
        heading: '4. Kişisel Verilerin Aktarılması (Teknik Altyapı Sağlayıcıları)',
        paragraphs: [
          'Kişisel verileriniz hiçbir şekilde reklam veya pazarlama amacıyla üçüncü kişilere satılmaz. Hizmetin teknik olarak sunulabilmesi için sınırlı ve şifreli kanallar üzerinden aşağıdaki altyapı sağlayıcılarından yararlanılır:',
        ],
        bullets: [
          'Vercel: Web barındırma, sunucu taraflı işleme ve anonimleştirilmiş performans telemetrisi.',
          'Cloudflare: DNS yönlendirme, DDoS/WAF ağ koruması ve form güvenliği (Turnstile).',
          'Supabase: Müşteri hesabı, lisans anahtarı ve güvenlik denetim kayıtlarının saklanması.',
          'Resend: /hizmetler/* formlarından gelen taleplerin resmi info@restrictedstudio.shop adresine iletilmesi.',
        ],
      },
      {
        heading: '5. KVKK Madde 11 Kapsamındaki Haklarınız',
        paragraphs: [
          'Kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, amacına uygun kullanılıp kullanılmadığını sorgulama, düzeltilmesini veya silinmesini isteme ve zarar halinde tazminat talep etme haklarına sahipsiniz. Başvurularınızı talebinizi açıkça belirterek info@restrictedstudio.shop adresine gönderebilirsiniz.',
        ],
      },
    ],
  },
  gizlilik: {
    slug: 'gizlilik',
    href: '/yasal/gizlilik',
    navLabel: 'Gizlilik Politikası',
    eyebrow: 'VERİ GÜVENLİĞİ VE GİZLİLİK STANDARTLARI',
    title: 'Gizlilik Politikası',
    summary:
      'Restricted Studio platformundaki hesap verilerinizin, hizmet taleplerinizin ve gezinme güvenliğinizi sağlayan teknik mekanizmaların nasıl korunduğunu açıklar.',
    updatedAt: LAST_UPDATED_LABEL.tr,
    sections: [
      {
        heading: '1. Gizlilik ve Veri Minimizasyonu İlkesi',
        paragraphs: [
          'Platformumuz yalnızca hizmetin çalışması için zorunlu olan verileri toplar. Katalog incelemek veya açık vitrin sayfalarını gezmek için hesap açmanız zorunlu değildir.',
          'Sitemiz üzerinden doğrudan kredi kartı, banka kartı veya ödeme aracı bilgisi toplanmaz; dijital ilan satın alımları dış ödeme güvencesi sağlayan İtemsatış (itemsatis.com/p/saintstudio) üzerinden yürütülür.',
        ],
      },
      {
        heading: '2. Teknik Güvenlik Önlemleri',
        paragraphs: [
          'Kullanıcı ve işlem güvenliği için kod tabanımızda uygulanan başlıca teknik kontroller şunlardır:',
        ],
        bullets: [
          'Parolalar düz metin olarak saklanmaz; bellek-sert Argon2id algoritması ile özetlenir.',
          'Oturum çerezleri HttpOnly, SameSite ve HTTPS ortamında Secure bayraklarıyla korunur.',
          'Tüm yanıtlar istek bazlı tek kullanımlık nonce içeren Content-Security-Policy (CSP) ve HSTS başlıklarıyla sunulur.',
          'Hizmet talep formları HTML kaçış temizliği, uzunluk/biçim doğrulaması (Zod), honeypot tuzakları ve hız sınırlaması ile korunur.',
        ],
      },
      {
        heading: '3. Üçüncü Taraf Bağlantılar ve Dış Platformlar',
        paragraphs: [
          'Sitemizden İtemsatış resmi mağaza profiline yönlendirilen bağlantılarda işlem güvenliği ve ödeme gizliliği İtemsatış platformunun kendi gizlilik ve kullanıcı sözleşmesi hükümlerine tabidir.',
          'Performans izleme için kullanılan Vercel Analytics ve Vercel Speed Insights araçları bireysel kimlik profillemesi yapmadan teknik gecikme ve sayfa metriklerini ölçer.',
        ],
      },
      {
        heading: '4. Saklama Süresi ve Silme Talepleri',
        paragraphs: [
          'Hizmet talep yazışmaları ve hesap kayıtları, hizmet ilişkisinin devamı ve yasal/güvenlik uyuşmazlıklarının önlenmesi için makul süre boyunca saklanır. Hesap veya veri silme talepleriniz için info@restrictedstudio.shop adresine yazabilirsiniz.',
        ],
      },
    ],
  },
  cerez: {
    slug: 'cerez',
    href: '/yasal/cerez',
    navLabel: 'Çerez Politikası',
    eyebrow: 'TARAYICI DEPOLAMA VE ÇEREZ ŞEFFAFLIĞI',
    title: 'Çerez ve Yerel Depolama Politikası',
    summary:
      'Tarayıcınızda saklanan çerezlerin, yerel depolama (localStorage) anahtarlarının ve performans ölçümlerinin tam ve şeffaf listesi.',
    updatedAt: LAST_UPDATED_LABEL.tr,
    sections: [
      {
        heading: '1. Reklam veya Üçüncü Taraf Takip Çerezi Kullanımı',
        paragraphs: [
          'Restricted Studio web sitesi reklam hedefleme piksel kodları, davranışsal reklam çerezleri veya çapraz site izleme ağları kullanmaz.',
          'Yalnızca oturum güvenliği, dil seçimi, katalog sepet listesi, güvenlik doğrulaması (Cloudflare) ve anonim sayfa hızı ölçümü (Vercel) için teknik depolama kullanılır.',
        ],
      },
      {
        heading: '2. Çerezler ve Yerel Depolamayı Yönetme',
        paragraphs: [
          'Zorunlu oturum çerezleri yalnızca giriş yapan kullanıcılar için oluşturulur; ziyaretçiler tarayıcı ayarlarından yerel depolama ve çerezleri diledikleri zaman temizleyebilir veya engelleyebilir.',
        ],
      },
    ],
  },
  'kullanim-kosullari': {
    slug: 'kullanim-kosullari',
    href: '/yasal/kullanim-kosullari',
    navLabel: 'Kullanım Koşulları & DMCA',
    eyebrow: 'PLATFORM KURALLARI VE FİKRİ MÜLKİYET BİLDİRİMİ',
    title: 'Kullanım Koşulları ve Fikri Mülkiyet (DMCA)',
    summary:
      'Web sitesi kullanım sınırlarını, yazılım teslim standartlarını, ticari marka ayrımını ve telif hakkı bildirim (Uyar-Kaldır) sürecini düzenler.',
    updatedAt: LAST_UPDATED_LABEL.tr,
    sections: [
      {
        heading: '1. Hizmet Kapsamı ve Yasaklı Kullanım',
        paragraphs: [
          'Site içeriğini otomatik araçlarla toplu çekmek (scraping), rate-limit veya Cloudflare güvenlik bariyerlerini aşmaya çalışmak, sahte/spam form göndermek ve yetkisiz erişim denemelerinde bulunmak kesinlikle yasaktır.',
          'Kural ihlalinde bulunan IP adresleri güvenlik duvarı kurallarıyla engellenebilir.',
        ],
      },
      {
        heading: '2. Ticari Marka ve Ekosistem Bağımsızlığı',
        paragraphs: [
          'Restricted Studio bağımsız bir yazılım geliştirme ekibidir. FiveM®, Cfx.re® ve Rockstar Games® ile herhangi bir resmi ortaklık, sponsorluk veya onay ilişkisi bulunmamaktadır. Söz konusu markalar ilgili hak sahiplerinin tescilli değerleridir.',
        ],
      },
      {
        heading: '3. Fikri Mülkiyet İhlali & Uyar-Kaldır (DMCA) Prosedürü',
        paragraphs: [
          'Katalog listelerinde veya mağaza vitrininde size ait telif hakkı veya lisans hakkını ihlal ettiğini düşündüğünüz bir içerik bulunması halinde aşağıdaki bilgilerle info@restrictedstudio.shop adresine bildirimde bulunabilirsiniz:',
        ],
        bullets: [
          'Hak sahibi veya yetkili temsilcinin kimlik ve iletişim bilgileri.',
          'İhlale konu eserin özgün tanımı ve sitemizdeki tam sayfa/paket adı veya kodu (ör. RS-CAT-XXXX).',
          'Bildirimin doğruluğuna dair beyanınız.',
          'Doğrulanabilir hak sahipliği bildirimi ulaştığında ilgili kayıt incelenerek makul en kısa sürede yayından kaldırılır.',
        ],
      },
      {
        heading: '4. Sorumluluk Sınırı',
        paragraphs: [
          'Açık kaynak paketler veya özel geliştirilen yazılımlar teslim sonrası kullanıcı sunucu ortamında (hosting, FiveM artifact sürümü, üçüncü taraf bağımlılıklar) çalıştırılır. Üçüncü taraf sunucu yapılandırmalarından veya sonradan yapılan kod müdahalelerinden doğan dolaylı kesintilerden Restricted Studio sorumlu tutulamaz.',
        ],
      },
    ],
  },
  'teslimat-ve-iade': {
    slug: 'teslimat-ve-iade',
    href: '/yasal/teslimat-ve-iade',
    navLabel: 'Teslimat & İade',
    eyebrow: 'SİPARİŞ AKIŞI, DİJİTAL TESLİMAT VE CAYMA İSTİSNALARI',
    title: 'Dijital Teslimat, İade ve Hizmet Koşulları',
    summary:
      'Katalog paketleri, İtemsatış dijital lisansları ve özel web/bot geliştirme hizmetleri için teslimat yöntemini ve iade kurallarını açıklar.',
    updatedAt: LAST_UPDATED_LABEL.tr,
    sections: [
      {
        heading: '1. Ödeme ve Satın Alma Akışı',
        paragraphs: [
          'restrictedstudio.shop web sitesi üzerinden doğrudan kredi kartı tahsilatı yapılmaz. Katalog arşivi seçim listesi ve İtemsatış vitrin bağlantıları sizi İtemsatış resmi mağaza kanalına yönlendirir; ödeme güvencesi İtemsatış alıcı koruma sistemi altında gerçekleşir.',
          '/hizmetler/web-kurulum ve /hizmetler/discord-bot sayfaları bir ön teklif ve teknik talep formu niteliğindedir; ücret, süre ve kapsam yazılı mutabakat sağlanmadan işleme alınmaz.',
        ],
      },
      {
        heading: '2. Teslimat Koşulları',
        paragraphs: [
          'Katalogda seçilen paketler sabit 100 TL (16+ adet toplu alımda %50 indirimli 50 TL) birim fiyatıyla İtemsatış üzerinden sipariş sonrası doğrulanmış açık kaynak dosyaları olarak teslim edilir.',
          'Özel web sitesi kurulumu ve Discord bot geliştirme işlerinde teslim süresi proje kapsamına göre yazılı olarak kararlaştırılır (genellikle web projeleri 3–14 gün, Discord botları 2–7 gün).',
        ],
      },
      {
        heading: '3. İade ve Cayma Hakkı İstisnaları',
        paragraphs: [
          '6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği Md. 15/1-(ğ) uyarınca elektronik ortamda anında ifa edilen gayri maddi mallar (açık kaynak scriptler, indirilebilir paketler, aktivasyon/lisans kodları) ile tüketicinin özel talepleri doğrultusunda hazırlanan özel yazılımlarda teslimat gerçekleştirildikten sonra cayma/iade hakkı uygulanmaz.',
          'Bununla birlikte, teslim edilen dosya bozuksa, ilan açıklamasıyla uyuşmuyorsa veya aktivasyon kodu çalışmıyorsa tarafımıza bildirildiği anda ücretsiz telafi, değişim veya teknik düzeltme sağlanır; çözülemeyen teknik aksaklıklarda İtemsatış iade prosedürü işletilir.',
        ],
      },
    ],
  },
};

function buildLocalizedFallback(locale: Exclude<Locale, 'tr'>): Record<LegalDocSlug, LegalDocument> {
  const copy = {
    en: {
      kvkk: {
        navLabel: 'KVKK / Data Notice',
        eyebrow: 'TURKISH DATA PROTECTION LAW NO. 6698 (KVKK)',
        title: 'KVKK Data Processing Notice',
        summary:
          'Information notice regarding personal data processed on restrictedstudio.shop, security processing purposes, infrastructure providers, and your statutory rights.',
      },
      gizlilik: {
        navLabel: 'Privacy Policy',
        eyebrow: 'DATA SECURITY & PRIVACY STANDARDS',
        title: 'Privacy Policy',
        summary:
          'How Restricted Studio protects account credentials, service inquiries, and browsing privacy across third-party processors.',
      },
      cerez: {
        navLabel: 'Cookie Policy',
        eyebrow: 'COOKIES & BROWSER STORAGE TRANSPARENCY',
        title: 'Cookie & Local Storage Policy',
        summary:
          'Complete inventory of essential cookies, localStorage preference keys, and cookieless performance telemetry.',
      },
      'kullanim-kosullari': {
        navLabel: 'Terms & DMCA',
        eyebrow: 'TERMS OF USE & INTELLECTUAL PROPERTY',
        title: 'Terms of Use & Notice-and-Takedown (DMCA)',
        summary:
          'Acceptable platform use, trademark independence (FiveM® / Rockstar Games®), and copyright takedown procedure.',
      },
      'teslimat-ve-iade': {
        navLabel: 'Delivery & Refunds',
        eyebrow: 'DIGITAL DELIVERY, ESCROW FLOW & REFUND RULES',
        title: 'Delivery, Service & Refund Policy',
        summary:
          'How open-source catalog orders via İtemsatış, custom web/bot projects, and digital refund exceptions operate.',
      },
    },
    ru: {
      kvkk: {
        navLabel: 'Уведомление KVKK',
        eyebrow: 'ЗАКОН № 6698 О ЗАЩИТЕ ПЕРСОНАЛЬНЫХ ДАННЫХ',
        title: 'Уведомление об обработке данных (KVKK)',
        summary:
          'Сведения об объёме обрабатываемых данных на restrictedstudio.shop, целях обработки, технических провайдерах и правах пользователей.',
      },
      gizlilik: {
        navLabel: 'Конфиденциальность',
        eyebrow: 'СТАНДАРТЫ БЕЗОПАСНОСТИ ДАННЫХ',
        title: 'Политика конфиденциальности',
        summary:
          'Принципы защиты учётных данных, заявок на услуги и взаимодействия с внешними сервисами.',
      },
      cerez: {
        navLabel: 'Файлы Cookie',
        eyebrow: 'ПРОЗРАЧНОСТЬ COOKIE И ЛОКАЛЬНОГО ХРАНИЛИЩА',
        title: 'Политика Cookie и localStorage',
        summary:
          'Перечень технических cookie, ключей localStorage и телеметрии производительности без рекламного отслеживания.',
      },
      'kullanim-kosullari': {
        navLabel: 'Условия & DMCA',
        eyebrow: 'ПРАВИЛА ИСПОЛЬЗОВАНИЯ И ИНТЕЛЛЕКТУАЛЬНАЯ СОБСТВЕННОСТЬ',
        title: 'Условия использования и DMCA',
        summary:
          'Правила платформы, независимость от FiveM® / Rockstar Games® и порядок рассмотрения правообладательских обращений.',
      },
      'teslimat-ve-iade': {
        navLabel: 'Доставка и возврат',
        eyebrow: 'ЦИФРОВАЯ ДОСТАВКА И УСЛОВИЯ ВОЗВРАТА',
        title: 'Доставка, услуги и возврат средств',
        summary:
          'Порядок оформления заказов через İtemsatış, этапы разработки сайтов/ботов и исключения для цифрового ПО.',
      },
    },
    fr: {
      kvkk: {
        navLabel: 'Notice Données (KVKK)',
        eyebrow: 'LOI SUR LA PROTECTION DES DONNÉES (KVKK N° 6698)',
        title: 'Information sur le traitement des données',
        summary:
          'Cadre de collecte minimale sur restrictedstudio.shop, sous-traitants techniques (Supabase, Resend, Cloudflare, Vercel) et exercice de vos droits via info@restrictedstudio.shop.',
      },
      gizlilik: {
        navLabel: 'Confidentialité',
        eyebrow: 'SÉCURITÉ & PROTECTION DES DONNÉES',
        title: 'Politique de confidentialité',
        summary:
          'Protection des identifiants (Argon2id, cookies HttpOnly), formulaires de service et liens externes vers İtemsatış.',
      },
      cerez: {
        navLabel: 'Cookies',
        eyebrow: 'TRANSPARENCE DES COOKIES ET DU STOCKAGE LOCAL',
        title: 'Politique Cookies & Stockage Local',
        summary:
          'Inventaire complet des cookies techniques, clés localStorage et mesures de performance sans traceurs publicitaires.',
      },
      'kullanim-kosullari': {
        navLabel: 'Conditions & DMCA',
        eyebrow: 'CONDITIONS D’UTILISATION & PROPRIÉTÉ INTELLECTUELLE',
        title: 'Conditions d’utilisation et procédure DMCA',
        summary:
          'Règles d’accès, indépendance vis-à-vis de FiveM® / Rockstar Games® et signalement de droits via info@restrictedstudio.shop.',
      },
      'teslimat-ve-iade': {
        navLabel: 'Livraison & Retours',
        eyebrow: 'LIVRAISON NUMÉRIQUE & CONDITIONS DE REMBOURSEMENT',
        title: 'Conditions de livraison et de remboursement',
        summary:
          'Fonctionnement des commandes via İtemsatış, devis web/bot et exceptions applicables aux contenus numériques.',
      },
    },
  }[locale];

  const out = {} as Record<LegalDocSlug, LegalDocument>;
  for (const slug of LEGAL_DOC_ORDER) {
    const trDoc = TR_DOCS[slug];
    const meta = copy[slug];
    out[slug] = {
      ...trDoc,
      navLabel: meta.navLabel,
      eyebrow: meta.eyebrow,
      title: meta.title,
      summary: meta.summary,
      updatedAt: LAST_UPDATED_LABEL[locale],
      // Retain full legally binding Turkish text alongside localized header summary so statutory clauses remain unambiguous
      sections: trDoc.sections,
    };
  }
  return out;
}

const ALL_LEGAL_DOCS: Record<Locale, Record<LegalDocSlug, LegalDocument>> = {
  tr: TR_DOCS,
  en: buildLocalizedFallback('en'),
  ru: buildLocalizedFallback('ru'),
  fr: buildLocalizedFallback('fr'),
};

export function getLegalDocument(locale: Locale, slug: LegalDocSlug): LegalDocument {
  return ALL_LEGAL_DOCS[locale]?.[slug] ?? TR_DOCS[slug];
}

export function getLegalNavItems(locale: Locale): Array<{ slug: LegalDocSlug; href: string; label: string }> {
  const docs = ALL_LEGAL_DOCS[locale] ?? TR_DOCS;
  return LEGAL_DOC_ORDER.map((slug) => ({
    slug,
    href: docs[slug].href,
    label: docs[slug].navLabel,
  }));
}

export interface CookieInventoryRow {
  name: string;
  storage: string;
  purpose: Record<Locale, string>;
  duration: Record<Locale, string>;
  type: Record<Locale, string>;
}

export const COOKIE_INVENTORY: CookieInventoryRow[] = [
  {
    name: 'rs_lang',
    storage: 'Cookie',
    purpose: {
      tr: 'Seçilen arayüz dilini (TR/EN/RU/FR) hatırlar',
      en: 'Stores selected interface language (TR/EN/RU/FR)',
      ru: 'Сохраняет выбранный язык интерфейса (TR/EN/RU/FR)',
      fr: 'Mémorise la langue choisie (TR/EN/RU/FR)',
    },
    duration: { tr: '1 Yıl', en: '1 Year', ru: '1 год', fr: '1 An' },
    type: { tr: 'Tercih (Zorunlu)', en: 'Preference', ru: 'Предпочтение', fr: 'Préférence' },
  },
  {
    name: 'rs_access / rs_refresh',
    storage: 'HttpOnly Cookie',
    purpose: {
      tr: 'Yalnızca müşteri portalına giriş yapan üyeler için güvenli oturum anahtarları',
      en: 'Secure session tokens issued only when signed into client portal',
      ru: 'Токены защищённой сессии только для авторизованных клиентов',
      fr: 'Jetons de session sécurisés émis uniquement après connexion',
    },
    duration: { tr: '15 dk / 7 gün', en: '15 min / 7 days', ru: '15 мин / 7 дней', fr: '15 min / 7 jours' },
    type: { tr: 'Zorunlu Güvenlik', en: 'Strictly Necessary', ru: 'Обязательный', fr: 'Strictement nécessaire' },
  },
  {
    name: 'rs_bear_claw_intro_ts',
    storage: 'localStorage',
    purpose: {
      tr: 'Açılış animasyonunun 6 saatte bir gösterilmesini kontrol eder',
      en: 'Limits opening splash animation frequency to once every 6 hours',
      ru: 'Ограничивает показ заставки до 1 раза в 6 часов',
      fr: 'Limite l’animation d’ouverture à une fois toutes les 6 heures',
    },
    duration: { tr: 'Kalıcı (Tarayıcı)', en: 'Persistent', ru: 'Постоянно', fr: 'Persistant' },
    type: { tr: 'İşlevsel', en: 'Functional', ru: 'Функциональный', fr: 'Fonctionnel' },
  },
  {
    name: 'rs_catalog_cart / rs_local_clicks',
    storage: 'localStorage',
    purpose: {
      tr: 'Katalog sepet listenizi ve cihaz içi etkileşim özetini korur',
      en: 'Preserves your catalog cart selections and local click counter',
      ru: 'Сохраняет корзину каталога и локальные клики',
      fr: 'Conserve votre panier catalogue et les interactions locales',
    },
    duration: { tr: 'Kalıcı (Tarayıcı)', en: 'Persistent', ru: 'Постоянно', fr: 'Persistant' },
    type: { tr: 'İşlevsel', en: 'Functional', ru: 'Функциональный', fr: 'Fonctionnel' },
  },
  {
    name: 'rs_cookie_notice_v1',
    storage: 'localStorage',
    purpose: {
      tr: 'Çerez ve gizlilik bilgilendirme bandının onay durumunu saklar',
      en: 'Remembers cookie & privacy notice acknowledgement',
      ru: 'Сохраняет подтверждение уведомления о cookie',
      fr: 'Mémorise l’acceptation du bandeau de confidentialité',
    },
    duration: { tr: 'Kalıcı (Tarayıcı)', en: 'Persistent', ru: 'Постоянно', fr: 'Persistant' },
    type: { tr: 'Zorunlu Tercih', en: 'Necessary', ru: 'Обязательный', fr: 'Nécessaire' },
  },
  {
    name: 'Vercel Analytics / Cloudflare',
    storage: 'Cookieless / Ağ',
    purpose: {
      tr: 'Sayfa açılış hızı ölçümü ve bot/DDoS güvenlik doğrulaması',
      en: 'Cookieless web vitals telemetry & Cloudflare WAF/Turnstile protection',
      ru: 'Телеметрия скорости без cookie и защита от ботов Cloudflare',
      fr: 'Télémétrie de performance sans cookie et protection Cloudflare',
    },
    duration: { tr: 'Oturumluk', en: 'Session', ru: 'Сессия', fr: 'Session' },
    type: { tr: 'Güvenlik & Performans', en: 'Security & Performance', ru: 'Безопасность', fr: 'Sécurité' },
  },
];

export const LEGAL_FORM_COPY: Record<
  Locale,
  {
    kvkkLink: string;
    privacyLink: string;
    termsLink: string;
    serviceConsentPrefix: string;
    serviceConsentSuffix: string;
    serviceConsentErr: string;
    registerConsentPrefix: string;
    registerConsentSuffix: string;
    registerConsentErr: string;
    contactMailNotePrefix: string;
    contactMailNoteSuffix: string;
  }
> = {
  tr: {
    kvkkLink: 'KVKK Aydınlatma Metni',
    privacyLink: 'Gizlilik Politikası',
    termsLink: 'Kullanım Koşulları',
    serviceConsentPrefix: 'Başvuru bilgilerimin değerlendirilmesi ve dönüş yapılması amacıyla ',
    serviceConsentSuffix: ' kapsamında işlenmesini okudum ve onaylıyorum.',
    serviceConsentErr: 'Devam etmek için KVKK ve Gizlilik onay kutusunu işaretlemelisiniz.',
    registerConsentPrefix: 'Hesap oluşturulması sürecinde ',
    registerConsentSuffix: ' metinlerini okudum ve kabul ediyorum.',
    registerConsentErr: 'Kayıt olmak için KVKK ve Kullanım Koşulları onayı gereklidir.',
    contactMailNotePrefix: 'Gönder butonu varsayılan e-posta istemcinizi açar; paylaşılan iletişim verileri ',
    contactMailNoteSuffix: ' çerçevesinde işlenir.',
  },
  en: {
    kvkkLink: 'KVKK Data Notice',
    privacyLink: 'Privacy Policy',
    termsLink: 'Terms of Use',
    serviceConsentPrefix: 'I have read and agree to the processing of my request under the ',
    serviceConsentSuffix: '.',
    serviceConsentErr: 'Please accept the Data Notice & Privacy Policy to submit.',
    registerConsentPrefix: 'I have read and accept the ',
    registerConsentSuffix: ' for account creation.',
    registerConsentErr: 'Please accept the Data Notice & Terms of Use to register.',
    contactMailNotePrefix: 'Submitting opens your email client; inquiry details are handled under the ',
    contactMailNoteSuffix: '.',
  },
  ru: {
    kvkkLink: 'Уведомлением KVKK',
    privacyLink: 'Политикой конфиденциальности',
    termsLink: 'Условиями использования',
    serviceConsentPrefix: 'Я ознакомился(лась) и согласен(на) на обработку заявки согласно ',
    serviceConsentSuffix: '.',
    serviceConsentErr: 'Для отправки заявки необходимо принять условия обработки данных.',
    registerConsentPrefix: 'Я принимаю положения документов: ',
    registerConsentSuffix: '.',
    registerConsentErr: 'Для регистрации необходимо принять условия обработки данных.',
    contactMailNotePrefix: 'Кнопка открывает почтовый клиент; данные обрабатываются согласно ',
    contactMailNoteSuffix: '.',
  },
  fr: {
    kvkkLink: 'Notice Données (KVKK)',
    privacyLink: 'Politique de confidentialité',
    termsLink: 'Conditions d’utilisation',
    serviceConsentPrefix: 'J’ai lu et j’accepte le traitement de ma demande conformément à la ',
    serviceConsentSuffix: '.',
    serviceConsentErr: 'Veuillez accepter la notice de confidentialité pour envoyer la demande.',
    registerConsentPrefix: 'J’ai lu et j’accepte les documents suivants : ',
    registerConsentSuffix: '.',
    registerConsentErr: 'Veuillez accepter les conditions légales pour créer un compte.',
    contactMailNotePrefix: 'L’envoi ouvre votre messagerie ; vos échanges relèvent de la ',
    contactMailNoteSuffix: '.',
  },
};
