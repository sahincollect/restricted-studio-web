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
  label: string;
  badge: string;
  description: string;
  spec: string;
  cta: string;
  /** Percentage coordinates on the 16:9 room stage (0..100) */
  x: number;
  y: number;
  tone: 'crimson' | 'amber' | 'frost' | 'slate';
  action: RoomHotspotAction;
}

export const PIXEL_ROOM_HOTSPOTS: PixelRoomHotspot[] = [
  {
    id: 'crt-catalog',
    code: 'OBJ // 01',
    label: 'CRT TERMİNAL & KONSOL',
    badge: 'TÜM ÜRÜNLER 100TL!',
    description: '6.446+ doğrulanmış FiveM Script, MLO ve Araç paketi. Parça başı sabit 100 TL.',
    spec: '3.561 Script · 1.298 MLO · 1.152 Araç · %100 Açık Kaynak',
    cta: 'Kataloğu Aç →',
    x: 39,
    y: 66,
    tone: 'crimson',
    action: { type: 'route', href: '/katalog' },
  },
  {
    id: 'laptop-bulk',
    code: 'OBJ // 02',
    label: 'ÇALIŞMA MASASI & LAPTOP',
    badge: '15+ ALIMA %50 İNDİRİM',
    description: 'Sepette 15 ve üzeri pakette otomatik yarı fiyat indirimi (paket başı 50 TL).',
    spec: 'Otomatik Sepet Hesaplama · İtemsatış 3D Secure',
    cta: 'Sepet Oluştur →',
    x: 56,
    y: 68,
    tone: 'amber',
    action: { type: 'route', href: '/katalog' },
  },
  {
    id: 'sofa-studio',
    code: 'OBJ // 03',
    label: 'NOIR DİNLENME KOLTUĞU',
    badge: 'STÜDYO & HAKKIMIZDA',
    description: 'Restricted Studio standartları, sıfır şifreleme politikası ve kalite karşılaştırması.',
    spec: 'Sıfır Escrow · Tam Kaynak Kod Teslimatı',
    cta: 'Stüdyoyu İncele →',
    x: 48,
    y: 44,
    tone: 'crimson',
    action: { type: 'modal', modal: 'about' },
  },
  {
    id: 'aquarium-core',
    code: 'OBJ // 04',
    label: ' CAM KASA & ÇEKİRDEK ÜNİTE',
    badge: '< 0.02ms MİMARİ',
    description: 'QBCore, Qbox ve ESX uyumlu, sıfır darboğazlı Lua/JS mühendislik standartları.',
    spec: 'Canlı Kod Örnekleri · Performans Telemetrisi',
    cta: 'Mimarîyi Aç →',
    x: 68,
    y: 38,
    tone: 'frost',
    action: { type: 'modal', modal: 'engineering' },
  },
  {
    id: 'door-portal',
    code: 'OBJ // 05',
    label: 'GÜVENLİ ÇIKIŞ KAPISI',
    badge: 'MÜŞTERİ PORTALI',
    description: 'Satın alınan paketler, lisans/teslimat geçmişi ve hesap yönetim paneli.',
    spec: '7/24 Anında Teslimat · Sipariş Takibi',
    cta: 'Portala Gir →',
    x: 80,
    y: 62,
    tone: 'slate',
    action: { type: 'route', href: '/dashboard' },
  },
  {
    id: 'phone-discord',
    code: 'OBJ // 06',
    label: 'MASAÜSTÜ HAT & DESTEK',
    badge: 'DISCORD & İTEMSATIŞ',
    description: '7/24 teknik destek hattı, topluluk sunucusu ve resmi İtemsatış mağazası.',
    spec: 'Doğrulanmış Kurumsal Mağaza · Hızlı Destek',
    cta: 'Bağlantıya Geç →',
    x: 21,
    y: 46,
    tone: 'amber',
    action: { type: 'route', href: '/discord' },
  },
  {
    id: 'clock-status',
    code: 'OBJ // 07',
    label: 'NEON DUVAR SAATİ',
    badge: 'SİSTEM DURUMU',
    description: 'API, indirme sunucuları ve veritabanı düğümlerinin gerçek zamanlı çalışma durumu.',
    spec: '%99.98 Uptime · Canlı Telemetri',
    cta: 'Durumu Gör →',
    x: 74,
    y: 16,
    tone: 'crimson',
    action: { type: 'route', href: '/status' },
  },
  {
    id: 'shelf-faq',
    code: 'OBJ // 08',
    label: 'ARŞİV KİTAPLIĞI & KUPALAR',
    badge: 'ÇÖZÜMLER & SSS',
    description: 'Kategori dağılımı, teslimat süreci ve sıkça sorulan sorular.',
    spec: '6.446+ Paket Dağılımı · Merak Edilenler',
    cta: 'Rehberi Aç →',
    x: 86,
    y: 74,
    tone: 'slate',
    action: { type: 'modal', modal: 'faq' },
  },
];
