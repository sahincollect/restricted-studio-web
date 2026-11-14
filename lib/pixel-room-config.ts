export const PIXEL_ROOM_PROMOS = {
  unitPrice: 'TÜM ÜRÜNLER 100TL!',
  bulkDiscount: '15+ ALIMA %50 İNDİRİM',
} as const;

export type RoomHotspotAction =
  | { type: 'route'; href: string; external?: boolean }
  | { type: 'modal'; modal: 'about' | 'solutions' | 'engineering' | 'faq' };

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
  /** Keep badge always visible (only for top 2 campaigns + mascot so screen stays uncluttered) */
  alwaysOpen?: boolean;
  tone: 'crimson' | 'amber' | 'frost' | 'slate';
  action: RoomHotspotAction;
}

export const PIXEL_ROOM_HOTSPOTS: PixelRoomHotspot[] = [
  {
    id: 'crt-catalog',
    code: 'BLOK // 01',
    shortNum: '01',
    label: 'ANA MAĞAZA VİTRİNİ',
    badge: 'TÜM ÜRÜNLER 100TL!',
    description: '6.446+ doğrulanmış FiveM Script, MLO ve Araç paketi. Parça başı sabit 100 TL.',
    spec: '3.561 Script · 1.298 MLO · 1.152 Araç · %100 Açık Kaynak',
    cta: 'Kataloğu Aç →',
    x: 68,
    y: 62,
    layer: 3,
    alwaysOpen: true,
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
    tone: 'amber',
    action: { type: 'route', href: '/katalog' },
  },
  {
    id: 'sofa-studio',
    code: 'BLOK // 03',
    shortNum: '03',
    label: 'MERKEZ KULE // STÜDYO',
    badge: 'STÜDYO & HAKKIMIZDA',
    description: 'Restricted Studio standartları, sıfır şifreleme politikası ve kalite karşılaştırması.',
    spec: 'Sıfır Escrow · Tam Kaynak Kod Teslimatı',
    cta: 'Stüdyoyu İncele →',
    x: 36,
    y: 35,
    layer: 2,
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
    tone: 'amber',
    action: { type: 'route', href: '/discord' },
  },
  {
    id: 'clock-status',
    code: 'BLOK // 07',
    shortNum: '07',
    label: 'UFUK TELEMETRİ KULESİ',
    badge: 'SİSTEM DURUMU',
    description: 'API, indirme sunucuları ve veritabanı düğümlerinin gerçek zamanlı çalışma durumu.',
    spec: '%99.98 Uptime · Canlı Telemetri',
    cta: 'Durumu Gör →',
    x: 82,
    y: 18,
    layer: 1,
    tone: 'crimson',
    action: { type: 'route', href: '/status' },
  },
  {
    id: 'shelf-faq',
    code: 'BLOK // 08',
    shortNum: '08',
    label: 'ÜST GEÇİT // ARŞİV REHBERİ',
    badge: 'ÇÖZÜMLER & SSS',
    description: 'Kategori dağılımı, teslimat süreci ve sıkça sorulan sorular.',
    spec: '6.446+ Paket Dağılımı · Merak Edilenler',
    cta: 'Rehberi Aç →',
    x: 43,
    y: 69,
    layer: 3,
    tone: 'slate',
    action: { type: 'modal', modal: 'faq' },
  },
];
