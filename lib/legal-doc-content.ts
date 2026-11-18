import type { Locale } from './i18n';
import type { LegalDocSlug, LegalDocument } from './legal-docs';
import { LEGAL_DOC_ORDER, LEGAL_NAV_META } from './legal-docs';

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
    navLabel: LEGAL_NAV_META.kvkk.navLabel.tr,
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
    navLabel: LEGAL_NAV_META.gizlilik.navLabel.tr,
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
          'Sitemiz üzerinden doğrudan kredi kartı veya banka kartı numarası toplanmaz ya da saklanmaz; dijital sipariş tahsilatları PCI-DSS lisanslı Shopier ödeme altyapısı (sipariş referansına özel otomatik ilan) veya dış ödeme güvencesi sağlayan İtemsatış (itemsatis.com/p/saintstudio) üzerinden yürütülür.',
        ],
      },
      {
        heading: '2. Teknik Güvenlik Önlemleri',
        paragraphs: [
          'Kullanıcı ve işlem güvenliği için kod tabanımızda uygulanan başlıca teknik kontroller şunlardır:',
        ],
        bullets: [
          'Parolalar düz metin olarak saklanmaz; bellek-sert Argon2id algoritması ile özetlenir. Google OAuth ve Discord OAuth girişleri PKCE akışı ile doğrulanır.',
          'Oturum çerezleri HttpOnly, SameSite ve HTTPS ortamında Secure bayraklarıyla korunur.',
          'Tüm yanıtlar istek bazlı tek kullanımlık nonce içeren Content-Security-Policy (CSP) ve HSTS başlıklarıyla sunulur.',
          'Kişiye özel 1-1 teslimat sohbet odaları hesap sahipliği doğrulamasıyla (BOLA koruması) ve profil görselleri sunucu taraflı MIME/boyut kontrolüyle korunur.',
        ],
      },
      {
        heading: '3. Üçüncü Taraf Bağlantılar ve Dış Platformlar',
        paragraphs: [
          'Shopier ödeme sayfaları, Google/Discord OAuth kimlik sağlayıcıları ve İtemsatış mağaza bağlantıları üzerinden yürütülen işlemlerde ilgili platformların kendi gizlilik ve güvenlik sözleşmeleri geçerlidir.',
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
    navLabel: LEGAL_NAV_META.cerez.navLabel.tr,
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
    navLabel: LEGAL_NAV_META['kullanim-kosullari'].navLabel.tr,
    eyebrow: 'EĞİTİM / AR-GE KAPSAMI, SORUMLULUK SINIRI VE FİKRİ MÜLKİYET',
    title: 'Kullanım Koşulları, Sorumluluk Reddi ve DMCA',
    summary:
      'Sunulan teknik kaynakların eğitim ve yerel geliştirme kapsamını, art niyetli/yetkisiz kullanımda münhasır kullanıcı sorumluluğunu, rücu şartlarını ve FSEK/DMCA Uyar-Kaldır sürecini düzenler.',
    updatedAt: LAST_UPDATED_LABEL.tr,
    sections: [
      {
        heading: '1. Hizmetin Amacı: Eğitim, Teknik İnceleme ve Yerel Geliştirme (Sandbox)',
        paragraphs: [
          'restrictedstudio.shop ve bağlı katalog kanalları üzerinden erişime sunulan veya teknik destek kapsamında incelenen kod örnekleri, yapılandırma arşivleri ve uyumluluk referansları münhasıran yazılım eğitimi, mimari inceleme, hata ayıklama (debugging) ve izole yerel geliştirme/test (localhost / staging) süreçleri için sunulmaktadır.',
          'Bu platform üzerinden sağlanan hiçbir teknik doküman veya arşiv paketi; üçüncü kişilere ait lisanslama mekanizmalarını devre dışı bırakma, ticari canlı (production) sunucu işletme, yeniden satma veya kamuya açık şekilde yeniden dağıtma izni teşkil etmez.',
        ],
      },
      {
        heading: '2. Kullanıcının Orijinal Lisans Doğrulama ve Uyumluluk Yükümlülüğü',
        paragraphs: [
          'Platformda yer alan herhangi bir teknik bileşeni, betiği veya yapılandırmayı yerel eğitim/test ortamının dışına taşıyan, canlı (public/production) bir sunucuya kuran ya da ticari projelerinde kullanan kişi; ilgili yazılımın fikri mülkiyet statüsünü, üçüncü kişi telif haklarını ve Cfx.re® / FiveM® / Rockstar Games® hizmet şartlarına uyumluluğunu bizzat doğrulamakla yükümlüdür.',
          'Üçüncü kişi geliştiricilere veya hak sahiplerine ait haklarla korunan bileşenlerin canlı ortamda kullanılması hedefleniyorsa, kurulum öncesinde doğrudan ilgili eser sahibinden veya yetkili dağıtım kanalından geçerli bir kullanım lisansı temin edilmesi zorunludur.',
        ],
      },
      {
        heading: '3. Art Niyetli Kullanım Yasağı, Münhasır Kullanıcı Sorumluluğu ve Rücu',
        paragraphs: [
          'Sunulan kaynakların veya platform altyapısının art niyetli amaçlarla (zararlı kod/backdoor enjeksiyonu, üçüncü kişi sistemlerine veya oyun sunucularına yetkisiz müdahale, güvenlik açığı istismarı, haksız ticari kazanç, telif hakkı ihlali veya yasa dışı faaliyetler) kullanılması kesinlikle yasaktır.',
          'Kullanıcının işbu kullanım sınırlarını aşması, eğitim/test kapsamı dışına çıkarak canlı ortamda izinsiz kullanım gerçekleştirmesi veya kötü niyetli fiillerde bulunması halinde doğabilecek tüm hukuki, idari ve cezai sorumluluk (5846 sayılı FSEK, 5237 sayılı TCK ve 6098 sayılı TBK hükümleri uyarınca üçüncü kişi tazminat talepleri, idari para cezaları, vekâlet ücretleri ve sunucu/platform yaptırımları dâhil) münhasıran ilgili kullanıcıya aittir.',
          'Kullanıcının eylemleri nedeniyle Restricted Studio’ya yöneltilebilecek her türlü üçüncü kişi talebinde, davada veya idari yaptırımda Restricted Studio uğradığı tüm doğrudan ve dolaylı zararları faizi ve fer’ileriyle birlikte sorumlu kullanıcıya rücu etme (tazmin ettirme) ile ilgili hesap/erişim yetkilerini derhal feshetme hakkını saklı tutar.',
        ],
      },
      {
        heading: '4. "Olduğu Gibi" (AS-IS) Sunum ve Sorumluluğun Sınırlandırılması',
        paragraphs: [
          'Platformdaki arşiv referansları, örnek kodlar ve teknik açıklamalar; ticarete elverişlilik, belirli bir canlı sunucu amacına uygunluk, kesintisiz çalışma veya üçüncü kişi güncellemeleriyle sürekli uyum dâhil olmak üzere açık ya da zımni hiçbir garanti verilmeksizin "OLDUĞU GİBİ" (AS-IS) ve "MEVCUT HALİYLE" (AS-AVAILABLE) sağlanır.',
          'Yürürlükteki emredici hukuk kurallarının izin verdiği azami ölçüde; kullanıcı sunucu ortamındaki (hosting, FiveM artifact sürümü, veritabanı, txAdmin veya üçüncü taraf bağımlılıklar) çakışmalardan, veri kayıplarından, kullanıcı müdahalelerinden, hesap/sunucu askıya almalarından veya dolaylı/müspet/menfi zararlardan Restricted Studio sorumlu tutulamaz.',
        ],
      },
      {
        heading: '5. Platform Güvenliği ve Yasaklı Erişim',
        paragraphs: [
          'Site içeriğini otomatik araçlarla toplu çekmek (scraping), rate-limit veya Cloudflare/Turnstile güvenlik bariyerlerini aşmaya çalışmak, sahte/spam form göndermek ve yetkisiz erişim denemelerinde bulunmak yasaktır. İhlal tespit edilen IP adresleri güvenlik duvarı kurallarıyla engellenebilir ve erişim kayıtları adli/idari makam taleplerinde muhafaza edilebilir.',
        ],
      },
      {
        heading: '6. Ticari Marka ve Ekosistem Bağımsızlığı',
        paragraphs: [
          'Restricted Studio bağımsız bir yazılım geliştirme ekibidir. FiveM®, Cfx.re® ve Rockstar Games® ile herhangi bir resmi ortaklık, sponsorluk veya onay ilişkisi bulunmamaktadır. Söz konusu markalar ilgili hak sahiplerinin tescilli değerleridir.',
        ],
      },
      {
        heading: '7. Fikri Mülkiyet Bildirimi & Hızlı Uyar-Kaldır (5846 FSEK / DMCA)',
        paragraphs: [
          'Katalog listelerinde veya platform sayfalarında hak sahibi olduğunuz bir eserin izinsiz listelendiğini veya telif/lisans hakkınızı ihlal ettiğini değerlendirmeniz halinde, iyi niyetli bildirim ve hızlı kaldırma süreci için aşağıdaki bilgilerle doğrudan info@restrictedstudio.shop adresine başvurabilirsiniz:',
        ],
        bullets: [
          'Hak sahibi veya yetkili temsilcinin kimlik, unvan ve doğrulanabilir iletişim bilgileri.',
          'İhlale konu eserin özgün tanımı, sahiplik kanıtı ve sitemizdeki tam sayfa/paket adı veya kodu (ör. RS-CAT-XXXX).',
          'Şikâyete konu içeriğin yetkisiz kullanımına ilişkin iyi niyetli doğruluk beyanı.',
          'Doğrulanabilir hak sahipliği bildirimi ulaştığında ilgili kayıt öncelikli olarak incelenir ve makul en kısa sürede yayından kaldırılır.',
        ],
      },
    ],
  },
  'teslimat-ve-iade': {
    slug: 'teslimat-ve-iade',
    href: '/yasal/teslimat-ve-iade',
    navLabel: LEGAL_NAV_META['teslimat-ve-iade'].navLabel.tr,
    eyebrow: 'SİPARİŞ AKIŞI, DİJİTAL TESLİMAT VE CAYMA İSTİSNALARI',
    title: 'Dijital Teslimat, İade ve Hizmet Koşulları',
    summary:
      'Katalog paketleri, Shopier referanslı ödeme akışı, İtemsatış dijital lisansları ve özel web/bot geliştirme hizmetleri için teslimat süresini ve iade kurallarını açıklar.',
    updatedAt: LAST_UPDATED_LABEL.tr,
    sections: [
      {
        heading: '1. Ödeme ve Satın Alma Akışı',
        paragraphs: [
          'restrictedstudio.shop sunucularında doğrudan kart bilgisi toplanmaz. Katalog ve Lisanslar sayfalarındaki Shopier ödeme seçeneğinde siparişinize özel benzersiz referans numarasıyla (RS-ORD-...) otomatik Shopier dijital ilanı açılır; dilerseniz İtemsatış resmi mağaza kanalından da işlem yapabilirsiniz.',
          '/hizmetler/web-kurulum ve /hizmetler/discord-bot sayfaları bir ön teklif ve teknik talep formu niteliğindedir; ücret, süre ve kapsam yazılı mutabakat sağlanmadan işleme alınmaz.',
        ],
      },
      {
        heading: '2. Teslimat Süresi ve Yöntemi',
        paragraphs: [
          'Ürünlerimiz ortalama 2 saat içerisinde, Hesabım (/hesabim) panelinizdeki kişiye özel 1-1 teslimat sohbet odası ve sabitlenen Teslimat Kasası (lisans anahtarı, kurulum paketi ve indirme bağlantısı) üzerinden teslim edilmektedir. Yoğunluk vb. durumlarda teslimat süresi 6 ila 24 saate uzayabilmektedir.',
          'Özel web sitesi kurulumu ve Discord bot geliştirme işlerinde teslim süresi proje kapsamına göre yazılı olarak kararlaştırılır (genellikle web projeleri 3–14 gün, Discord botları 2–7 gün).',
        ],
      },
      {
        heading: '3. İade ve Cayma Hakkı İstisnaları',
        paragraphs: [
          '6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği Md. 15/1-(ğ) uyarınca elektronik ortamda anında ifa edilen gayri maddi mallar (dijital teknik inceleme scriptleri, indirilebilir arşiv paketleri, aktivasyon/lisans kodları) ile tüketicinin özel talepleri doğrultusunda hazırlanan özel yazılımlarda teslimat gerçekleştirildikten sonra cayma/iade hakkı uygulanmaz.',
          'Bununla birlikte, teslim edilen dosya bozuksa, ilan açıklamasıyla uyuşmuyorsa veya aktivasyon kodu çalışmıyorsa 1-1 teslimat sohbetiniz üzerinden bildirdiğiniz anda ücretsiz telafi, değişim veya teknik düzeltme sağlanır; çözülemeyen teknik aksaklıklarda Shopier/İtemsatış iade prosedürü işletilir.',
        ],
      },
    ],
  },
};

const EN_DOCS: Record<LegalDocSlug, LegalDocument> = {
  kvkk: {
    slug: 'kvkk',
    href: '/yasal/kvkk',
    navLabel: LEGAL_NAV_META.kvkk.navLabel.en,
    eyebrow: 'PERSONAL DATA PROTECTION LAW NO. 6698 (KVKK)',
    title: 'KVKK & Personal Data Processing Notice',
    summary:
      'Transparent disclosure of personal data processed on restrictedstudio.shop under Turkish Law No. 6698 (KVKK), processing purposes, infrastructure processors, and your statutory rights.',
    updatedAt: LAST_UPDATED_LABEL.en,
    sections: [
      {
        heading: '1. Data Controller & Contact Channel',
        paragraphs: [
          'Your personal data is processed within the Restricted Studio digital software ecosystem in accordance with Turkish Law No. 6698 on the Protection of Personal Data ("KVKK") and aligned international data minimization standards.',
          'You may direct all privacy inquiries, access requests, or statutory applications to info@restrictedstudio.shop.',
        ],
      },
      {
        heading: '2. Categories of Personal Data Processed',
        paragraphs: [
          'When browsing restrictedstudio.shop or submitting platform forms, only the strict minimum data required for security and requested workflows is processed:',
        ],
        bullets: [
          'Account & Authentication Data: Username or email address provided upon portal registration/sign-in and one-way salted password hashes (Argon2id).',
          'Service Request Details: Name/studio label, email address, Discord handle, scope selection, and project brief submitted via /hizmetler/web-kurulum and /hizmetler/discord-bot.',
          'Security & Operational Telemetry: Ephemeral IP addresses, rate-limit counters, session integrity records, and bot verification signals used to prevent abuse.',
          'Preference & Client State Data: Interface locale selection (TR/EN/RU/FR), local catalog cart selections, and anonymized page performance metrics.',
        ],
      },
      {
        heading: '3. Processing Purposes & Legal Bases',
        paragraphs: [
          'Under Article 5 of Law No. 6698 (KVKK), personal data is processed strictly where necessary for contract establishment/performance, information security, establishment or defense of legal claims, and legitimate operational interests:',
        ],
        bullets: [
          'Operating client portal authentication, license key redemption, and hardware/client verification workflows.',
          'Reviewing custom web setup and Discord bot inquiries and replying via email.',
          'Defending the platform against DDoS traffic, credential stuffing, and automated scraping.',
        ],
      },
      {
        heading: '4. Technical Infrastructure Sub-Processors',
        paragraphs: [
          'Personal data is never sold or shared for cross-site behavioral advertising. To operate the web application reliably, limited encrypted transfers occur strictly with core technical providers:',
        ],
        bullets: [
          'Vercel: Serverless edge hosting, SSR rendering, and cookieless Core Web Vitals telemetry.',
          'Cloudflare: Authoritative DNS, WAF/DDoS mitigation, TLS termination, and bot Turnstile protection.',
          'Supabase: Encrypted persistence for customer portal accounts, license tokens, and audit records.',
          'Resend: Transactional delivery of /hizmetler/* inquiries to info@restrictedstudio.shop.',
        ],
      },
      {
        heading: '5. Your Statutory Data Rights',
        paragraphs: [
          'You have the right to learn whether your personal data is processed, request information about processing scope and third-party transfers, request rectification of incomplete records, request erasure where retention is no longer justified, and seek legal remedies in case of unlawful damage. Submit any request clearly to info@restrictedstudio.shop.',
        ],
      },
    ],
  },
  gizlilik: {
    slug: 'gizlilik',
    href: '/yasal/gizlilik',
    navLabel: LEGAL_NAV_META.gizlilik.navLabel.en,
    eyebrow: 'DATA SECURITY & PRIVACY STANDARDS',
    title: 'Privacy Policy',
    summary:
      'Explains how Restricted Studio protects portal credentials, service inquiries, and browsing privacy across third-party processors.',
    updatedAt: LAST_UPDATED_LABEL.en,
    sections: [
      {
        heading: '1. Privacy & Data Minimization Principle',
        paragraphs: [
          'Restricted Studio collects only data technically required for platform operation. Browsing public showcase pages and searching the catalog requires no user account.',
          'We do not collect or store card or banking details directly on restrictedstudio.shop; digital checkouts execute via PCI-DSS licensed Shopier (auto-generated reference listing RS-ORD-...) or İtemsatış buyer escrow (itemsatis.com/p/saintstudio).',
        ],
      },
      {
        heading: '2. Technical Security Controls',
        paragraphs: [
          'Key engineering safeguards enforced across our application stack include:',
        ],
        bullets: [
          'Passwords are never stored in plaintext and are hashed using Argon2id; Google OAuth and Discord OAuth use strict PKCE authorization flows.',
          'Authentication tokens are transmitted via HttpOnly, SameSite, and HTTPS Secure cookies.',
          'Responses enforce per-request nonce Content-Security-Policy (CSP) and HTTP Strict Transport Security (HSTS).',
          'Private 1-on-1 order delivery chat rooms enforce strict ownership checks (BOLA mitigation), while profile avatars validate MIME magic bytes and file limits server-side.',
        ],
      },
      {
        heading: '3. Third-Party Links & External Platforms',
        paragraphs: [
          'Checkouts processed through Shopier or İtemsatış and identity logins via Google/Discord are governed by the respective provider’s privacy and security policies.',
          'Vercel Analytics and Vercel Speed Insights measure aggregate technical latency and web vitals without cross-site advertising cookies or individual identity profiling.',
        ],
      },
      {
        heading: '4. Data Retention & Deletion Requests',
        paragraphs: [
          'Service inquiry emails and client account records are retained only for as long as necessary to maintain support continuity, prevent abuse, and resolve potential disputes. Contact info@restrictedstudio.shop anytime to request account or record deletion.',
        ],
      },
    ],
  },
  cerez: {
    slug: 'cerez',
    href: '/yasal/cerez',
    navLabel: LEGAL_NAV_META.cerez.navLabel.en,
    eyebrow: 'COOKIES & BROWSER STORAGE TRANSPARENCY',
    title: 'Cookie & Local Storage Policy',
    summary:
      'Complete inventory of essential security cookies, localStorage preference keys, and cookieless telemetry used on restrictedstudio.shop.',
    updatedAt: LAST_UPDATED_LABEL.en,
    sections: [
      {
        heading: '1. Zero Advertising or Cross-Site Tracking Cookies',
        paragraphs: [
          'Restricted Studio does not embed ad retargeting pixels, behavioral profiling cookies, or third-party advertising trackers.',
          'Browser storage is strictly limited to portal session security, interface language persistence, local catalog cart management, Cloudflare security verification, and cookieless performance monitoring (Vercel).',
        ],
      },
      {
        heading: '2. Managing Cookies & Local Storage',
        paragraphs: [
          'Essential authentication cookies are issued solely when you sign into the client portal. You may clear or restrict localStorage keys and cookies at any time via your browser privacy settings.',
        ],
      },
    ],
  },
  'kullanim-kosullari': {
    slug: 'kullanim-kosullari',
    href: '/yasal/kullanim-kosullari',
    navLabel: LEGAL_NAV_META['kullanim-kosullari'].navLabel.en,
    eyebrow: 'EDUCATIONAL / SANDBOX SCOPE, LIABILITY & IP',
    title: 'Terms of Use, Liability Disclaimer & DMCA',
    summary:
      'Defines strictly educational and local development testing boundaries, sole user liability and indemnification for misuse or unauthorized production deployment, AS-IS disclaimers, and Law No. 5846 / DMCA takedowns.',
    updatedAt: LAST_UPDATED_LABEL.en,
    sections: [
      {
        heading: '1. Scope of Service: Educational Research & Local Sandbox Testing',
        paragraphs: [
          'Code samples, configuration archives, technical documentation, and compatibility references accessible on restrictedstudio.shop or associated catalog channels are provided strictly for software education, architectural study, debugging, compatibility research, and isolated local development/testing (localhost / staging sandbox).',
          'No documentation, technical file, or archive package grants permission to bypass third-party licensing mechanisms, operate unauthorized live/commercial production servers, resell materials, or publicly redistribute protected assets.',
        ],
      },
      {
        heading: '2. User Obligation for Original License Verification & Compliance',
        paragraphs: [
          'Any user who moves a script, configuration, or technical asset beyond a private educational/testing sandbox, deploys it onto a public or commercial live server, or incorporates it into revenue-generating operations is solely responsible for verifying its intellectual property status, obtaining any required licenses from original authors or authorized distributors, and ensuring compliance with Cfx.re®, FiveM®, and Rockstar Games® terms.',
          'Where third-party proprietary or licensed works are intended for live deployment, a valid active license must be acquired directly from the rightful creator prior to production use.',
        ],
      },
      {
        heading: '3. Prohibited Malicious Use, Sole User Liability & Indemnification',
        paragraphs: [
          'Malicious exploitation of any platform materials or infrastructure—including inserting backdoors or malware, unauthorized interference with third-party servers, exploiting security vulnerabilities, unlawful commercial gain, copyright infringement, or illegal activities—is strictly prohibited.',
          'Should a user exceed this strictly educational/testing scope, deploy materials onto live servers without proper authorization, or engage in malicious conduct, all resulting civil, administrative, and criminal liability (including under Turkish Intellectual Property Law No. 5846, Turkish Penal Code No. 5237, and Turkish Code of Obligations No. 6098, third-party damages claims, fines, legal fees, and platform bans) rests exclusively with that user.',
          'You agree to indemnify, defend, and hold Restricted Studio harmless from any third-party claim, lawsuit, fine, or direct/indirect loss arising from your breach of these Terms or unauthorized deployment, and Restricted Studio reserves the full right of recourse and immediate termination of account or IP access.',
        ],
      },
      {
        heading: '4. "AS-IS" Provision & Limitation of Liability',
        paragraphs: [
          'All catalog references, code specimens, and technical guides are provided strictly "AS-IS" and "AS-AVAILABLE", without express or implied warranties of merchantability, uninterrupted compatibility (including FiveM artifacts, database engines, txAdmin, or upstream dependencies), or fitness for any live server production purpose.',
          'To the maximum extent permitted by mandatory applicable law, Restricted Studio shall not be liable for server downtime, hosting conflicts, data corruption, user-side code modifications, Cfx.re/platform account suspensions, or indirect, incidental, or consequential damages.',
        ],
      },
      {
        heading: '5. Platform Security & Prohibited Automation',
        paragraphs: [
          'Automated bulk scraping, attempting to bypass rate limits or Cloudflare/Turnstile security controls, submitting spam/spoofed requests, and unauthorized probing are strictly forbidden. Offending IP addresses may be blocked via firewall policy and access logs preserved for lawful authority requests.',
        ],
      },
      {
        heading: '6. Trademark & Ecosystem Independence',
        paragraphs: [
          'Restricted Studio operates independently. There is no official affiliation, partnership, sponsorship, or endorsement with FiveM®, Cfx.re®, or Rockstar Games®. All referenced trademarks belong strictly to their respective owners.',
        ],
      },
      {
        heading: '7. Intellectual Property Notice & Rapid Takedown (Law No. 5846 / DMCA)',
        paragraphs: [
          'If you are a rightsholder or authorized agent who believes an item listed in catalog indexes or pages infringes your copyright or license rights, submit a good-faith takedown notice directly to info@restrictedstudio.shop with:',
        ],
        bullets: [
          'Identification, title, and verifiable contact details of the copyright owner or authorized representative.',
          'Clear description of the protected work, proof of ownership, and exact page URL or catalog code (e.g., RS-CAT-XXXX).',
          'A good-faith statement affirming that the disputed listing or material is not authorized by the rightsholder or law.',
          'Upon receipt of a verifiable notice, the flagged entry is prioritized for review and promptly removed.',
        ],
      },
    ],
  },
  'teslimat-ve-iade': {
    slug: 'teslimat-ve-iade',
    href: '/yasal/teslimat-ve-iade',
    navLabel: LEGAL_NAV_META['teslimat-ve-iade'].navLabel.en,
    eyebrow: 'DIGITAL DELIVERY, ESCROW FLOW & REFUND RULES',
    title: 'Digital Delivery, Service & Refund Policy',
    summary:
      'Explains Shopier reference-tracked checkout, İtemsatış escrow flow, 2-hour average digital delivery timelines, and statutory digital refund exceptions.',
    updatedAt: LAST_UPDATED_LABEL.en,
    sections: [
      {
        heading: '1. Payment & Purchase Flow',
        paragraphs: [
          'restrictedstudio.shop never stores raw payment cards. Selecting Shopier automatically generates a single-order tracked digital listing bound to a unique reference code (RS-ORD-...); customers may also pay via our official İtemsatış storefront.',
          'The /hizmetler/web-kurulum and /hizmetler/discord-bot pages act solely as technical scoping and quotation forms; no fee or project schedule takes effect without written confirmation.',
        ],
      },
      {
        heading: '2. Digital Delivery Terms & Turnaround SLA',
        paragraphs: [
          'Our products are delivered within 2 hours on average via your private 1-on-1 delivery chat room and pinned Delivery Vault under My Account (/hesabim). Depending on order volume, delivery may extend to 6–24 hours.',
          'Delivery timelines for custom web platforms (typically 3–14 days) and Discord bots (typically 2–7 days) are agreed in writing per project scope.',
        ],
      },
      {
        heading: '3. Digital Withdrawal Exceptions & Technical Remediation',
        paragraphs: [
          'Pursuant to Turkish Consumer Protection Law No. 6502 and Distance Contracts Regulation Art. 15/1-(ğ), digital intangible goods delivered electronically with immediate performance (technical study scripts, downloadable archive bundles, activation/license keys) and bespoke software built to client specifications are non-refundable once delivered.',
          'However, if any delivered archive is corrupted, fails to match its listing description, or an activation token does not function, free technical remediation, file replacement, or correction is provided promptly inside your 1-on-1 order chat—and where unresolvable, Shopier/İtemsatış refund procedures apply.',
        ],
      },
    ],
  },
};

const RU_DOCS: Record<LegalDocSlug, LegalDocument> = {
  kvkk: {
    slug: 'kvkk',
    href: '/yasal/kvkk',
    navLabel: LEGAL_NAV_META.kvkk.navLabel.ru,
    eyebrow: 'ЗАКОН № 6698 О ЗАЩИТЕ ПЕРСОНАЛЬНЫХ ДАННЫХ (KVKK)',
    title: 'Уведомление об обработке персональных данных (KVKK)',
    summary:
      'Сведения о перечне данных, обрабатываемых на restrictedstudio.shop согласно Закону № 6698 (KVKK), целях обработки, технических провайдерах и правах субъектов данных.',
    updatedAt: LAST_UPDATED_LABEL.ru,
    sections: [
      {
        heading: '1. Оператор данных и контакты',
        paragraphs: [
          'Персональные данные обрабатываются в рамках цифровой экосистемы Restricted Studio в соответствии с Законом Турецкой Республики № 6698 «О защите персональных данных» (KVKK) и принципом минимизации данных.',
          'Все запросы, обращения по доступу, уточнению или удалению данных направляйте на адрес info@restrictedstudio.shop.',
        ],
      },
      {
        heading: '2. Категории обрабатываемых данных',
        paragraphs: [
          'При просмотре сайта или отправке форм обрабатывается только минимально необходимый объём сведений:',
        ],
        bullets: [
          'Учётные данные: имя пользователя или email при регистрации/входе в клиентский портал, а также необратимый хеш пароля (Argon2id).',
          'Заявки на услуги: имя/название проекта, email, тег Discord, выбранный пакет и описание задачи, отправленные через /hizmetler/web-kurulum и /hizmetler/discord-bot.',
          'Технические журналы безопасности: временный IP-адрес, счётчики rate-limit, маркеры целостности сессии и антибот-проверки для защиты от злоупотреблений.',
          'Локальные настройки интерфейса: выбранный язык (TR/EN/RU/FR), локальная корзина каталога и обезличенные метрики скорости страниц.',
        ],
      },
      {
        heading: '3. Цели и правовые основания обработки',
        paragraphs: [
          'Согласно ст. 5 Закона № 6698 (KVKK), обработка осуществляется исключительно для заключения и исполнения соглашений, обеспечения информационной безопасности, защиты прав и законных интересов платформы:',
        ],
        bullets: [
          'Поддержка работы клиентского портала, активации лицензионных ключей (redeem) и проверки привязки.',
          'Рассмотрение заявок на разработку сайтов и Discord-ботов и обратная связь по электронной почте.',
          'Защита инфраструктуры от DDoS-атак, несанкционированного доступа и автоматического парсинга.',
        ],
      },
      {
        heading: '4. Передача данных техническим провайдерам инфраструктуры',
        paragraphs: [
          'Персональные данные ни при каких обстоятельствах не продаются для рекламного таргетинга. Для функционирования платформы шифрованная передача ограничена следующими провайдерами:',
        ],
        bullets: [
          'Vercel: серверный рендеринг, хостинг и обезличенная телеметрия скорости работы страниц.',
          'Cloudflare: DNS-маршрутизация, защита WAF/DDoS и антибот-фильтрация форм (Turnstile).',
          'Supabase: защищённое хранение учётных записей портала, ключей и журналов безопасности.',
          'Resend: доставка заявок с форм /hizmetler/* на официальный адрес info@restrictedstudio.shop.',
        ],
      },
      {
        heading: '5. Ваши права согласно статье 11 KVKK',
        paragraphs: [
          'Вы вправе запрашивать сведения о факте и целях обработки данных, требовать исправления неточных сведений, удаления данных при отсутствии законных оснований хранения и возмещения ущерба при неправомерной обработке. Обращения направляются на info@restrictedstudio.shop.',
        ],
      },
    ],
  },
  gizlilik: {
    slug: 'gizlilik',
    href: '/yasal/gizlilik',
    navLabel: LEGAL_NAV_META.gizlilik.navLabel.ru,
    eyebrow: 'СТАНДАРТЫ БЕЗОПАСНОСТИ И КОНФИДЕНЦИАЛЬНОСТИ',
    title: 'Политика конфиденциальности',
    summary:
      'Описывает технические меры защиты учётных данных, обращений пользователей и приватности работы с платформой Restricted Studio.',
    updatedAt: LAST_UPDATED_LABEL.ru,
    sections: [
      {
        heading: '1. Принцип конфиденциальности и минимизации',
        paragraphs: [
          'Платформа собирает только данные, технически необходимые для работы сервисов. Для просмотра витрины и каталога регистрация не требуется.',
          'Банковские карты на restrictedstudio.shop не хранятся; оплата проходит через лицензированный шлюз Shopier (индивидуальный лот заказа RS-ORD-...) либо через площадку İtemsatış (itemsatis.com/p/saintstudio).',
        ],
      },
      {
        heading: '2. Технические меры защиты',
        paragraphs: [
          'На уровне кода и сетевой архитектуры платформы применяются следующие механизмы безопасности:',
        ],
        bullets: [
          'Пароли не хранятся в открытом виде и хешируются алгоритмом Argon2id; вход через Google и Discord защищён протоколом PKCE.',
          'Сессионные cookie защищены флагами HttpOnly, SameSite и Secure по протоколу HTTPS.',
          'Все ответы сервера содержат заголовки HSTS и строгий Content-Security-Policy (CSP) с одноразовым nonce.',
          'Личные чаты выдачи 1-на-1 проверяют владельца заказа (защита от BOLA), а изображения профиля проходят серверную проверку MIME и размера.',
        ],
      },
      {
        heading: '3. Сторонние ссылки и внешние сервисы',
        paragraphs: [
          'При оплате через Shopier или İtemsatış и авторизации через Google/Discord обработка данных регулируется политиками конфиденциальности соответствующих провайдеров.',
          'Инструменты Vercel Analytics и Vercel Speed Insights фиксируют только агрегированные метрики производительности без рекламного профилирования личности.',
        ],
      },
      {
        heading: '4. Сроки хранения и запросы на удаление',
        paragraphs: [
          'Переписка по заявкам и данные учётных записей хранятся в течение разумного срока для поддержки клиентов и предотвращения злоупотреблений. Запросы на удаление учётной записи или данных принимаются на info@restrictedstudio.shop.',
        ],
      },
    ],
  },
  cerez: {
    slug: 'cerez',
    href: '/yasal/cerez',
    navLabel: LEGAL_NAV_META.cerez.navLabel.ru,
    eyebrow: 'ПРОЗРАЧНОСТЬ COOKIE И ЛОКАЛЬНОГО ХРАНИЛИЩА',
    title: 'Политика использования Cookie и localStorage',
    summary:
      'Полный и прозрачный перечень технических файлов cookie, ключей localStorage и обезличенной телеметрии производительности.',
    updatedAt: LAST_UPDATED_LABEL.ru,
    sections: [
      {
        heading: '1. Отсутствие рекламных и сторонних трекинговых Cookie',
        paragraphs: [
          'Сайт Restricted Studio не использует пиксели ретаргетинга, поведенческие рекламные cookie или сторонние рекламные сети слежения.',
          'Хранилище браузера применяется исключительно для безопасности сессии, сохранения языка интерфейса, локальной корзины каталога, защиты Cloudflare и обезличенного замера скорости (Vercel).',
        ],
      },
      {
        heading: '2. Управление Cookie и локальным хранилищем',
        paragraphs: [
          'Обязательные сессионные cookie создаются только при входе в клиентский портал. Вы можете очистить или ограничить cookie и localStorage в любой момент через настройки вашего браузера.',
        ],
      },
    ],
  },
  'kullanim-kosullari': {
    slug: 'kullanim-kosullari',
    href: '/yasal/kullanim-kosullari',
    navLabel: LEGAL_NAV_META['kullanim-kosullari'].navLabel.ru,
    eyebrow: 'ОБРАЗОВАТЕЛЬНЫЕ ЦЕЛИ, ОТВЕТСТВЕННОСТЬ И DMCA',
    title: 'Условия использования, отказ от гарантий и DMCA',
    summary:
      'Ограничение использования рамками обучения и локальной разработки (sandbox), исключительная ответственность пользователя и право регресса при злоупотреблениях, отказ от гарантий AS-IS и порядок DMCA.',
    updatedAt: LAST_UPDATED_LABEL.ru,
    sections: [
      {
        heading: '1. Назначение сервиса: обучение, анализ кода и локальная разработка (Sandbox)',
        paragraphs: [
          'Примеры кода, конфигурационные архивы, технические материалы и справочные модули, доступные на restrictedstudio.shop или в связанных каталогах, предоставляются исключительно для обучения программированию, анализа архитектуры, отладки и тестирования в изолированной локальной среде разработки (localhost / staging sandbox).',
          'Ни один архив или технический документ платформы не даёт разрешения на обход систем лицензирования третьих лиц, запуск на публичных коммерческих серверах, перепродажу или публичное распространение защищённых материалов.',
        ],
      },
      {
        heading: '2. Обязанность пользователя по проверке оригинальных лицензий',
        paragraphs: [
          'Любое лицо, переносящее код, скрипты или конфигурации за пределы частной локальной тестовой среды, размещающее их на публичном (production) сервере или использующее в коммерческих проектах, обязано самостоятельно проверить правовой статус материалов, наличие исключительных прав третьих лиц и соблюдение правил платформ Cfx.re®, FiveM® и Rockstar Games®.',
          'При намерении использовать сторонние разработки в рабочей среде необходимо предварительно приобрести действующую лицензию напрямую у правообладателя или официального дистрибьютора.',
        ],
      },
      {
        heading: '3. Запрет недобросовестного использования, ответственность пользователя и регресс',
        paragraphs: [
          'Категорически запрещается использовать материалы или инфраструктуру платформы с недобросовестным умыслом: внедрять вредоносный код (backdoor), нарушать работу чужих серверов, эксплуатировать уязвимости, извлекать неправомерную коммерческую выгоду, нарушать авторские права или совершать противоправные действия.',
          'При выходе пользователя за рамки учебного/тестового назначения, несанкционированном коммерческом запуске или неправомерных действиях вся гражданско-правовая, административная и уголовная ответственность (включая иски третьих лиц, компенсации по Закону № 5846 FSEK, ст. УК № 5237 и Обязательственному кодексу № 6098, штрафы, судебные издержки и блокировки серверов) ложится исключительно на такого пользователя.',
          'В случае предъявления к Restricted Studio каких-либо претензий, исков или санкций вследствие действий пользователя Restricted Studio сохраняет полное право регрессного требования (возмещения всех прямых и косвенных убытков) к виновному пользователю и право немедленно прекратить доступ.',
        ],
      },
      {
        heading: '4. Предоставление «КАК ЕСТЬ» (AS-IS) и ограничение ответственности',
        paragraphs: [
          'Все архивные ссылки, примеры кода и технические описания предоставляются «КАК ЕСТЬ» (AS-IS) и «ПО МЕРЕ ДОСТУПНОСТИ» (AS-AVAILABLE) без каких-либо явных или подразумеваемых гарантий коммерческой пригодности, бесперебойной совместимости (включая сборки FiveM artifact, СУБД, txAdmin или внешние зависимости) либо пригодности для публичных серверов.',
          'В максимальной степени, допускаемой применимым обязательным законодательством, Restricted Studio не несёт ответственности за сбои серверов, потерю данных, последствия пользовательских правок кода, блокировки на сторонних платформах или косвенные убытки.',
        ],
      },
      {
        heading: '5. Безопасность платформы и запрещённые действия',
        paragraphs: [
          'Запрещены автоматизированный сбор данных (scraping), обход ограничений rate-limit и защиты Cloudflare/Turnstile, рассылка спама через формы и попытки несанкционированного доступа. Нарушающие IP-адреса блокируются, а журналы доступа могут сохраняться для ответа на законные запросы уполномоченных органов.',
        ],
      },
      {
        heading: '6. Независимость от товарных знаков',
        paragraphs: [
          'Restricted Studio является независимой командой разработчиков и не имеет официального партнёрства, спонсорства или одобрения со стороны FiveM®, Cfx.re® или Rockstar Games®. Все товарные знаки принадлежат их законным правообладателям.',
        ],
      },
      {
        heading: '7. Нарушение прав и ускоренный порядок удаления (Закон № 5846 / DMCA)',
        paragraphs: [
          'Если вы являетесь правообладателем или уполномоченным представителем и считаете, что позиция каталога или материал на сайте нарушает ваши права, направьте добросовестное уведомление на info@restrictedstudio.shop с указанием:',
        ],
        bullets: [
          'ФИО/наименования правообладателя (или представителя) и подтверждаемых контактных данных.',
          'Точного описания охраняемого произведения, доказательства авторства и URL или кода позиции на сайте (например, RS-CAT-XXXX).',
          'Добросовестного заявления об отсутствии разрешения правообладателя на спорное размещение.',
          'После получения проверяемого обращения запись рассматривается в приоритетном порядке и оперативно удаляется.',
        ],
      },
    ],
  },
  'teslimat-ve-iade': {
    slug: 'teslimat-ve-iade',
    href: '/yasal/teslimat-ve-iade',
    navLabel: LEGAL_NAV_META['teslimat-ve-iade'].navLabel.ru,
    eyebrow: 'ЦИФРОВАЯ ДОСТАВКА, СДЕЛКИ ЧЕРЕЗ İTEMSATIŞ И ВОЗВРАТ',
    title: 'Условия цифровой доставки, услуг и возврата',
    summary:
      'Описывает оформление заказов через Shopier с уникальным номером и через İtemsatış, стандарты выдачи в течение 2 часов (6–24 ч при нагрузке) и правила возврата.',
    updatedAt: LAST_UPDATED_LABEL.ru,
    sections: [
      {
        heading: '1. Оплата и порядок оформления заказа',
        paragraphs: [
          'Сайт restrictedstudio.shop не хранит реквизиты банковских карт. При оплате через Shopier автоматически создаётся индивидуальный цифровой лот с уникальным номером (RS-ORD-...); также доступен заказ через официальный магазин İtemsatış.',
          'Формы на страницах /hizmetler/web-kurulum и /hizmetler/discord-bot предназначены для технического расчёта и согласования; стоимость и сроки фиксируются только после письменного подтверждения.',
        ],
      },
      {
        heading: '2. Сроки и способ цифровой передачи',
        paragraphs: [
          'Наши продукты доставляются в среднем в течение 2 часов через персональный чат заказа 1-на-1 и закреплённое хранилище выдачи в разделе «Аккаунт» (/hesabim). При высокой нагрузке срок доставки может увеличиться до 6–24 часов.',
          'Сроки индивидуальной разработки веб-проектов (обычно 3–14 дней) и Discord-ботов (обычно 2–7 дней) согласовываются письменно согласно техническому заданию.',
        ],
      },
      {
        heading: '3. Исключения права на возврат и техническая замена',
        paragraphs: [
          'В соответствии со ст. 15/1-(ğ) Положения о дистанционных договорах к Закону о защите прав потребителей № 6502 цифровые нематериальные продукты с мгновенной электронной поставкой (технические учебные скрипты, скачиваемые архивные пакеты, ключи активации), а также индивидуально разработанное ПО после передачи возврату не подлежат.',
          'Однако при повреждении архива, несоответствии описанию или нерабочем ключе активации мы бесплатно исправляем ошибку или предоставляем замену прямо в вашем чате заказа; при невозможности решения применяется процедура возврата через Shopier или İtemsatış.',
        ],
      },
    ],
  },
};

const FR_DOCS: Record<LegalDocSlug, LegalDocument> = {
  kvkk: {
    slug: 'kvkk',
    href: '/yasal/kvkk',
    navLabel: LEGAL_NAV_META.kvkk.navLabel.fr,
    eyebrow: 'LOI SUR LA PROTECTION DES DONNÉES (KVKK N° 6698)',
    title: 'Notice d’information sur le traitement des données (KVKK)',
    summary:
      'Cadre de collecte minimale sur restrictedstudio.shop au titre de la loi turque n° 6698 (KVKK), finalités techniques, sous-traitants et exercice de vos droits.',
    updatedAt: LAST_UPDATED_LABEL.fr,
    sections: [
      {
        heading: '1. Responsable du traitement et contact',
        paragraphs: [
          'Vos données personnelles sont traitées au sein de l’écosystème logiciel Restricted Studio conformément à la loi turque n° 6698 sur la protection des données personnelles (« KVKK ») et aux principes de minimisation.',
          'Toute demande d’information, d’accès ou d’effacement peut être adressée directement à info@restrictedstudio.shop.',
        ],
      },
      {
        heading: '2. Catégories de données traitées',
        paragraphs: [
          'Lors de la consultation du site ou de l’utilisation des formulaires, seul le strict minimum requis pour la sécurité et le service demandé est traité :',
        ],
        bullets: [
          'Données de compte : identifiant ou adresse e-mail lors de l’inscription/connexion au portail client, ainsi que l’empreinte hachée unidirectionnelle du mot de passe (Argon2id).',
          'Demandes de prestations : nom ou studio, e-mail, identifiant Discord, type de prestation et description technique transmis via /hizmetler/web-kurulum et /hizmetler/discord-bot.',
          'Journaux de sécurité et d’accès : adresse IP temporaire, compteurs de limitation de débit (rate-limit), état de session et vérifications anti-bot.',
          'Préférences locales : langue d’interface (TR/EN/RU/FR), sélection locale du panier catalogue et métriques techniques anonymisées.',
        ],
      },
      {
        heading: '3. Finalités et bases légales',
        paragraphs: [
          'Conformément à l’article 5 de la loi n° 6698 (KVKK), les données sont traitées pour la préparation/exécution des prestations demandées, la sécurité des systèmes, l’exercice des droits et l’intérêt légitime :',
        ],
        bullets: [
          'Gestion de l’accès au portail client, activation de clés de licence (redeem) et vérification client.',
          'Étude des demandes de développement web et de bots Discord et réponse par e-mail.',
          'Protection réseau contre les attaques DDoS, les accès non autorisés et l’extraction automatisée.',
        ],
      },
      {
        heading: '4. Transfert aux prestataires d’infrastructure technique',
        paragraphs: [
          'Vos données ne sont jamais vendues à des tiers publicitaires. Des transferts chiffrés limités interviennent uniquement auprès des fournisseurs techniques suivants :',
        ],
        bullets: [
          'Vercel : hébergement applicatif, rendu serveur et télémétrie technique sans cookies publicitaires.',
          'Cloudflare : routage DNS, pare-feu WAF/DDoS et vérification anti-robot (Turnstile).',
          'Supabase : stockage sécurisé des comptes portail, clés de licence et journaux d’audit.',
          'Resend : acheminement des demandes /hizmetler/* vers info@restrictedstudio.shop.',
        ],
      },
      {
        heading: '5. Vos droits au titre de l’article 11 (KVKK)',
        paragraphs: [
          'Vous disposez du droit de savoir si vos données sont traitées, d’en obtenir communication, d’en demander la rectification, la suppression lorsqu’elles ne sont plus nécessaires et d’exercer les voies de recours prévues en cas de préjudice, en écrivant à info@restrictedstudio.shop.',
        ],
      },
    ],
  },
  gizlilik: {
    slug: 'gizlilik',
    href: '/yasal/gizlilik',
    navLabel: LEGAL_NAV_META.gizlilik.navLabel.fr,
    eyebrow: 'SÉCURITÉ & PROTECTION DES DONNÉES',
    title: 'Politique de confidentialité',
    summary:
      'Présentation des mesures techniques protégeant les comptes utilisateurs, formulaires de demande et données de navigation sur Restricted Studio.',
    updatedAt: LAST_UPDATED_LABEL.fr,
    sections: [
      {
        heading: '1. Confidentialité et minimisation des données',
        paragraphs: [
          'Notre plateforme collecte uniquement les données strictement nécessaires à son fonctionnement. Aucune inscription n’est requise pour consulter les pages publiques ou parcourir le catalogue.',
          'Aucune donnée bancaire n’est stockée sur restrictedstudio.shop ; le règlement passe par Shopier (annonce dédiée liée à la référence RS-ORD-...) ou via İtemsatış (itemsatis.com/p/saintstudio).',
        ],
      },
      {
        heading: '2. Mesures techniques de sécurité',
        paragraphs: [
          'Principales protections déployées au sein de l’architecture applicative :',
        ],
        bullets: [
          'Les mots de passe sont hachés via Argon2id ; les connexions Google OAuth et Discord OAuth utilisent le flux PKCE.',
          'Les cookies de session utilisent les attributs HttpOnly, SameSite et Secure sous HTTPS.',
          'Les réponses appliquent une politique Content-Security-Policy (CSP) avec nonce unique par requête et HSTS.',
          'Les salons privés de livraison 1-à-1 vérifient strictement la propriété de la commande (protection BOLA) et les avatars subissent un contrôle serveur MIME et de taille.',
        ],
      },
      {
        heading: '3. Liens tiers et plateformes externes',
        paragraphs: [
          'Les transactions sur Shopier ou İtemsatış ainsi que les connexions Google/Discord relèvent des politiques de confidentialité respectives de ces prestataires.',
          'Les mesures Vercel Analytics et Vercel Speed Insights évaluent la latence technique sans profilage publicitaire individuel.',
        ],
      },
      {
        heading: '4. Conservation et demandes de suppression',
        paragraphs: [
          'Les échanges de support et données de compte sont conservés pendant une durée raisonnable pour assurer le suivi technique et prévenir les abus. Vous pouvez demander la suppression de vos données à info@restrictedstudio.shop.',
        ],
      },
    ],
  },
  cerez: {
    slug: 'cerez',
    href: '/yasal/cerez',
    navLabel: LEGAL_NAV_META.cerez.navLabel.fr,
    eyebrow: 'TRANSPARENCE DES COOKIES ET DU STOCKAGE LOCAL',
    title: 'Politique Cookies & Stockage Local',
    summary:
      'Inventaire complet des cookies techniques essentiels, clés localStorage et mesures de performance sans traceurs publicitaires.',
    updatedAt: LAST_UPDATED_LABEL.fr,
    sections: [
      {
        heading: '1. Absence de traceurs publicitaires ou intersites',
        paragraphs: [
          'Restricted Studio n’utilise aucun pixel de ciblage publicitaire, cookie comportemental ou réseau de suivi intersites.',
          'Le stockage navigateur est strictement limité à la sécurité de session, la langue choisie, la liste locale du panier catalogue, la protection Cloudflare et la mesure technique de rapidité (Vercel).',
        ],
      },
      {
        heading: '2. Gestion des cookies et du stockage local',
        paragraphs: [
          'Les cookies de session obligatoires ne sont émis qu’en cas de connexion au portail client. Vous pouvez effacer ou bloquer cookies et localStorage à tout moment dans les paramètres de votre navigateur.',
        ],
      },
    ],
  },
  'kullanim-kosullari': {
    slug: 'kullanim-kosullari',
    href: '/yasal/kullanim-kosullari',
    navLabel: LEGAL_NAV_META['kullanim-kosullari'].navLabel.fr,
    eyebrow: 'CADRE ÉDUCATIF, RESPONSABILITÉ & PROPRIÉTÉ INTELLECTUELLE',
    title: 'Conditions d’utilisation, exclusion de garantie et DMCA',
    summary:
      'Usage strictement limité à l’étude et au développement local (sandbox), responsabilité exclusive et recours contre l’utilisateur en cas d’usage abusif, clause AS-IS et procédure DMCA.',
    updatedAt: LAST_UPDATED_LABEL.fr,
    sections: [
      {
        heading: '1. Objet du service : étude technique, recherche et développement local (Sandbox)',
        paragraphs: [
          'Les exemples de code, archives de configuration, documentations techniques et références de compatibilité accessibles sur restrictedstudio.shop ou via le catalogue associé sont fournis exclusivement à des fins d’apprentissage logiciel, d’audit architectural, de débogage et de tests en environnement local isolé (localhost / staging sandbox).',
          'Aucun fichier ni document technique mis à disposition n’autorise le contournement de systèmes de licence tiers, l’exploitation commerciale sur un serveur public en production, la revente ou la redistribution publique.',
        ],
      },
      {
        heading: '2. Obligation utilisateur de vérification des licences d’origine',
        paragraphs: [
          'Tout utilisateur qui sort un script, module ou fichier de configuration d’un environnement privé d’étude locale, l’installe sur un serveur public (production) ou l’exploite à des fins commerciales demeure seul responsable de vérifier son statut de propriété intellectuelle, d’obtenir les licences requises auprès des auteurs d’origine et de respecter les conditions de Cfx.re®, FiveM® et Rockstar Games®.',
          'Lorsque des composants appartiennent à des éditeurs tiers, l’acquisition préalable d’une licence valide directement auprès de l’ayant droit ou d’un distributeur autorisé est obligatoire avant toute mise en production.',
        ],
      },
      {
        heading: '3. Interdiction d’usage malveillant, responsabilité exclusive et recours',
        paragraphs: [
          'Toute utilisation malveillante des ressources ou de l’infrastructure de la plateforme (injection de portes dérobées/malware, atteinte à des serveurs tiers, exploitation de failles, profit commercial illicite, contrefaçon ou activité illégale) est formellement interdite.',
          'Si l’utilisateur dépasse le cadre strictement éducatif et de test local, déploie des ressources en production sans autorisation ou agit de manière malveillante, l’intégralité de la responsabilité civile, administrative et pénale (y compris les réclamations de tiers, dommages-intérêts au titre de la loi turque n° 5846, du Code pénal n° 5237 et du Code des obligations n° 6098, amendes, frais juridiques et sanctions de plateforme) incombe exclusivement audit utilisateur.',
          'L’utilisateur s’engage à garantir et indemniser Restricted Studio contre toute réclamation de tiers, procédure ou sanction résultant de ses actes ; Restricted Studio conserve plein droit d’action récursoire et de révocation immédiate de l’accès.',
        ],
      },
      {
        heading: '4. Mise à disposition « EN L’ÉTAT » (AS-IS) et limitation de responsabilité',
        paragraphs: [
          'Les références d’archive, extraits de code et notes techniques sont fournis strictement « EN L’ÉTAT » (AS-IS) et « SELON DISPONIBILITÉ » (AS-AVAILABLE), sans aucune garantie expresse ou implicite de qualité marchande, de compatibilité continue (versions FiveM artifact, bases de données, txAdmin ou dépendances tierces) ou d’adéquation à un usage serveur en production.',
          'Dans toute la mesure permise par les dispositions légales impératives applicables, Restricted Studio décline toute responsabilité en cas d’interruption serveur, conflit d’hébergement, perte de données, modification utilisateur ou suspension de compte plateforme.',
        ],
      },
      {
        heading: '5. Sécurité de la plateforme et accès interdits',
        paragraphs: [
          'L’extraction automatisée massive (scraping), le contournement des limites de débit ou de la protection Cloudflare/Turnstile, l’envoi de requêtes automatisées abusives et les tentatives d’intrusion sont interdits et peuvent entraîner le blocage IP ainsi que la conservation des journaux pour les autorités compétentes.',
        ],
      },
      {
        heading: '6. Indépendance des marques commerciales',
        paragraphs: [
          'Restricted Studio est une équipe indépendante sans aucun lien d’affiliation, de partenariat, de parrainage ou d’approbation avec FiveM®, Cfx.re® ou Rockstar Games®. Les marques citées appartiennent à leurs titulaires respectifs.',
        ],
      },
      {
        heading: '7. Signalement de droits & Retrait rapide (Loi n° 5846 / DMCA)',
        paragraphs: [
          'Si vous êtes titulaire de droits ou mandataire habilité et estimez qu’un élément référencé porte atteinte à vos droits d’auteur ou de licence, adressez une notification motivée de bonne foi à info@restrictedstudio.shop en précisant :',
        ],
        bullets: [
          'L’identité, la qualité et les coordonnées vérifiables du titulaire ou de son représentant.',
          'La description précise de l’œuvre protégée, la preuve de titularité et l’URL ou le code catalogue concerné (ex. : RS-CAT-XXXX).',
          'Une déclaration de bonne foi attestant l’absence d’autorisation de mise à disposition.',
          'À réception d’une demande vérifiable, l’entrée signalée est examinée en priorité et retirée dans les plus brefs délais.',
        ],
      },
    ],
  },
  'teslimat-ve-iade': {
    slug: 'teslimat-ve-iade',
    href: '/yasal/teslimat-ve-iade',
    navLabel: LEGAL_NAV_META['teslimat-ve-iade'].navLabel.fr,
    eyebrow: 'LIVRAISON NUMÉRIQUE & CONDITIONS DE REMBOURSEMENT',
    title: 'Conditions de livraison numérique, services et remboursement',
    summary:
      'Précise le paiement Shopier avec suivi de référence et le parcours İtemsatış, le délai moyen de livraison de 2 heures (6 à 24 h en forte affluence) et les règles de rétractation.',
    updatedAt: LAST_UPDATED_LABEL.fr,
    sections: [
      {
        heading: '1. Paiement et parcours de commande',
        paragraphs: [
          'Aucune coordonnée de carte bancaire n’est enregistrée sur restrictedstudio.shop. Le bouton Shopier génère automatiquement une annonce dédiée avec référence unique (RS-ORD-...) ; la boutique İtemsatış reste également disponible.',
          'Les pages /hizmetler/web-kurulum et /hizmetler/discord-bot constituent des formulaires de demande de devis technique ; aucun engagement financier ni calendrier n’est validé sans accord écrit préalable.',
        ],
      },
      {
        heading: '2. Délais et modalités de livraison numérique',
        paragraphs: [
          'Nos produits sont livrés sous 2 heures en moyenne dans votre salon de livraison privé 1-à-1 et coffre-fort dédié sous Mon compte (/hesabim). En période de forte affluence, la livraison peut s’étendre à 6 à 24 heures.',
          'Les délais des développements sur mesure (généralement 3 à 14 jours pour le web, 2 à 7 jours pour les bots Discord) sont convenus par écrit selon le cahier des charges.',
        ],
      },
      {
        heading: '3. Exceptions au droit de rétractation et assistance technique',
        paragraphs: [
          'Conformément à l’art. 15/1-(ğ) du règlement turc sur les contrats à distance (loi n° 6502), les contenus numériques immatériels exécutés immédiatement après livraison électronique (scripts d’étude technique, archives téléchargeables, clés d’activation) ainsi que les logiciels sur mesure ne sont pas remboursables après remise.',
          'Toutefois, si un fichier livré est corrompu, non conforme à l’annonce ou qu’une clé ne s’active pas, un remplacement, correctif ou dépannage gratuit est assuré via votre salon de commande, ou la procédure de remboursement Shopier/İtemsatış s’applique.',
        ],
      },
    ],
  },
};

const ALL_LEGAL_DOCS: Record<Locale, Record<LegalDocSlug, LegalDocument>> = {
  tr: TR_DOCS,
  en: EN_DOCS,
  ru: RU_DOCS,
  fr: FR_DOCS,
};

export function getLegalDocument(locale: Locale, slug: LegalDocSlug): LegalDocument {
  return ALL_LEGAL_DOCS[locale]?.[slug] ?? TR_DOCS[slug];
}

export interface CookieInventoryRow {
  name: string;
  storage: Record<Locale, string>;
  purpose: Record<Locale, string>;
  duration: Record<Locale, string>;
  type: Record<Locale, string>;
}

export const COOKIE_INVENTORY: CookieInventoryRow[] = [
  {
    name: 'rs_lang',
    storage: {
      tr: 'Cookie',
      en: 'Cookie',
      ru: 'Cookie',
      fr: 'Cookie',
    },
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
    storage: {
      tr: 'HttpOnly Cookie',
      en: 'HttpOnly Cookie',
      ru: 'HttpOnly Cookie',
      fr: 'HttpOnly Cookie',
    },
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
    storage: {
      tr: 'localStorage',
      en: 'localStorage',
      ru: 'localStorage',
      fr: 'localStorage',
    },
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
    storage: {
      tr: 'localStorage',
      en: 'localStorage',
      ru: 'localStorage',
      fr: 'localStorage',
    },
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
    storage: {
      tr: 'localStorage',
      en: 'localStorage',
      ru: 'localStorage',
      fr: 'localStorage',
    },
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
    storage: {
      tr: 'Çerezsiz / Ağ',
      en: 'Cookieless / Edge',
      ru: 'Без Cookie / Сеть',
      fr: 'Sans Cookie / Réseau',
    },
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

export { LEGAL_DOC_ORDER };
