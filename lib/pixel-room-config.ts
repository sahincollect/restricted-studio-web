export const PIXEL_ROOM_PROMOS = {
  unitPrice: 'TÜM ÜRÜNLER 100TL!',
  bulkDiscount: '15+ ALIMA %50 İNDİRİM',
} as const;

export type RoomHotspotAction =
  | { type: 'route'; href: string; external?: boolean }
  | { type: 'modal'; modal: 'about' | 'solutions' | 'engineering' | 'faq' };

export interface PixelSignHitbox {
  /** Pixel coordinates on the 352x192 foreground.png sprite */
  px: number;
  py: number;
  pw: number;
  ph: number;
}

export interface PixelRoomHotspot {
  id: string;
  code: string;
  shortNum: string;
  label: string;
  badge: string;
  description: string;
  spec: string;
  cta: string;
  /** Percentage coordinates on the fullscreen stage (0..100) */
  x: number;
  y: number;
  /** Which parallax depth layer this building marker belongs to (1 = far, 2 = mid, 3 = foreground) */
  layer: 1 | 2 | 3;
  /** Keep badge always visible (only for top 2 campaigns) */
  alwaysOpen?: boolean;
  /** Exact bounding box on the 352x192 foreground.png artwork for white-light neon outline selection */
  signBox?: PixelSignHitbox;
  tone: 'crimson' | 'amber' | 'frost' | 'slate';
  action: RoomHotspotAction;
}

export const PIXEL_ROOM_HOTSPOTS: PixelRoomHotspot[] = [
  {
    id: 'crt-catalog',
    code: 'BLOK // 01',
    shortNum: '01',
    label: 'SHOP // ANA MAĞAZA TABELASI',
    badge: 'TÜM ÜRÜNLER 100TL!',
    description: '6.446+ doğrulanmış FiveM Script, MLO ve Araç paketi. Parça başı sabit 100 TL.',
    spec: '3.561 Script · 1.298 MLO · 1.152 Araç · %100 Açık Kaynak',
    cta: 'Kataloğu Aç →',
    x: 68,
    y: 62,
    layer: 3,
    alwaysOpen: true,
    signBox: { px: 193, py: 112, pw: 10, ph: 35 }, // Vertical "SHOP" sign left of Restaurant
    tone: 'crimson',
    action: { type: 'route', href: '/katalog' },
  },
  {
    id: 'laptop-bulk',
    code: 'BLOK // 02',
    shortNum: '02',
    label: 'TABELA 66 // TOPLU ALIM',
    badge: '15+ ALIMA %50 İNDİRİM',
    description: 'Sepette 15 ve üzeri pakette otomatik yarı fiyat indirimi (paket başı 50 TL).',
    spec: 'Otomatik Sepet Hesaplama · İtemsatış 3D Secure',
    cta: 'Sepet Oluştur →',
    x: 54,
    y: 32,
    layer: 3,
    alwaysOpen: true,
    signBox: { px: 180, py: 42, pw: 22, ph: 26 }, // Yellow rooftop billboard
    tone: 'amber',
    action: { type: 'route', href: '/katalog' },
  },
  {
    id: 'sofa-studio',
    code: 'BLOK // 03',
    shortNum: '03',
    label: 'RESTAURANT // STÜDYO MERKEZİ',
    badge: 'STÜDYO & HAKKIMIZDA',
    description: 'Restricted Studio standartları, sıfır şifreleme politikası ve kalite karşılaştırması.',
    spec: 'Sıfır Escrow · Tam Kaynak Kod Teslimatı',
    cta: 'Stüdyoyu İncele →',
    x: 36,
    y: 35,
    layer: 3,
    signBox: { px: 238, py: 112, pw: 55, ph: 11 }, // "RESTAURANT" neon sign
    tone: 'crimson',
    action: { type: 'modal', modal: 'about' },
  },
  {
    id: 'aquarium-core',
    code: 'BLOK // 04',
    shortNum: '04',
    label: 'ÇEKİRDEK SUNUCU KULESİ',
    badge: '< 0.02ms MİMARİ',
    description: 'QBCore, Qbox ve ESX uyumlu, sıfır darboğazlı Lua/JS mühendislik standartları.',
    spec: 'Canlı Kod Örnekleri · Performans Telemetrisi',
    cta: 'Mimarîyi Aç →',
    x: 72,
    y: 26,
    layer: 3,
    signBox: { px: 229, py: 36, pw: 17, ph: 33 }, // Twin circular golden neon signs
    tone: 'frost',
    action: { type: 'modal', modal: 'engineering' },
  },
  {
    id: 'door-portal',
    code: 'BLOK // 05',
    shortNum: '05',
    label: 'SPK-02 GÜVENLİ GİRİŞ',
    badge: 'MÜŞTERİ PORTALI',
    description: 'Satın alınan paketler, lisans/teslimat geçmişi ve hesap yönetim paneli.',
    spec: '7/24 Anında Teslimat · Sipariş Takibi',
    cta: 'Portala Gir →',
    x: 91,
    y: 68,
    layer: 3,
    signBox: { px: 313, py: 125, pw: 23, ph: 26 }, // "SPK 02" sign & doorway on right
    tone: 'slate',
    action: { type: 'route', href: '/dashboard' },
  },
  {
    id: 'phone-discord',
    code: 'BLOK // 06',
    shortNum: '06',
    label: 'SOL KULE // BAR & DESTEK',
    badge: 'DISCORD & İTEMSATIŞ',
    description: '7/24 teknik destek hattı, topluluk sunucusu ve resmi İtemsatış mağazası.',
    spec: 'Doğrulanmış Kurumsal Mağaza · Hızlı Destek',
    cta: 'Bağlantıya Geç →',
    x: 9,
    y: 65,
    layer: 3,
    signBox: { px: 10, py: 121, pw: 24, ph: 14 }, // "BAR" sign on left building
    tone: 'amber',
    action: { type: 'route', href: '/discord' },
  },
  {
    id: 'clock-status',
    code: 'BLOK // 07',
    shortNum: '07',
    label: 'BEER NEON // TELEMETRİ KULESİ',
    badge: 'SİSTEM DURUMU',
    description: 'API, indirme sunucuları ve veritabanı düğümlerinin gerçek zamanlı çalışma durumu.',
    spec: '%99.98 Uptime · Canlı Telemetri',
    cta: 'Durumu Gör →',
    x: 82,
    y: 18,
    layer: 3,
    signBox: { px: 254, py: 54, pw: 39, ph: 35 }, // "BEER" + Neon bottle sign
    tone: 'crimson',
    action: { type: 'route', href: '/status' },
  },
  {
    id: 'shelf-faq',
    code: 'BLOK // 08',
    shortNum: '08',
    label: 'SOL KULE // ARŞİV REHBERİ',
    badge: 'ÇÖZÜMLER & SSS',
    description: 'Kategori dağılımı, teslimat süreci ve sıkça sorulan sorular.',
    spec: '6.446+ Paket Dağılımı · Merak Edilenler',
    cta: 'Rehberi Aç →',
    x: 43,
    y: 69,
    layer: 3,
    signBox: { px: 64, py: 74, pw: 9, ph: 31 }, // Vertical yellow neon sign on left building
    tone: 'slate',
    action: { type: 'modal', modal: 'faq' },
  },
];
