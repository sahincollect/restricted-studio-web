export const PIXEL_TRAIN_PROMO_TEXTS = {
  unitPrice: 'TÜM ÜRÜNLER 100TL!',
  bulkDiscount: '15+ ALIMA %50 İNDİRİM',
} as const;

export type PixelWagonTone = 'crimson' | 'amber' | 'frost' | 'slate';

export interface PixelTrainWagon {
  id: string;
  code: string;
  tag: string;
  banner: string;
  sub: string;
  spec: string;
  cta: string;
  href: string;
  tone: PixelWagonTone;
  highlight?: boolean;
}

export const PIXEL_TRAIN_WAGONS: PixelTrainWagon[] = [
  {
    id: 'promo-100tl',
    code: 'VAGON 01',
    tag: 'SABİT FİYAT',
    banner: PIXEL_TRAIN_PROMO_TEXTS.unitPrice,
    sub: 'Parça başı net 100 TL · %100 Açık Kaynak Lua / JS / MLO',
    spec: 'Sıfır şifreleme · QBCore · Qbox · ESX uyumlu',
    cta: 'Kataloğu Aç →',
    href: '/katalog',
    tone: 'crimson',
    highlight: true,
  },
  {
    id: 'promo-50off',
    code: 'VAGON 02',
    tag: 'TOPLU ALIM AVANTAJI',
    banner: PIXEL_TRAIN_PROMO_TEXTS.bulkDiscount,
    sub: 'Sepette 15+ pakette otomatik yarı fiyat indirimi (50 TL / adet)',
    spec: 'Otomatik sepet hesaplama · İtemsatış 3D Secure',
    cta: 'Sepet Oluştur →',
    href: '/katalog',
    tone: 'amber',
    highlight: true,
  },
  {
    id: 'catalog-vault',
    code: 'VAGON 03',
    tag: 'ANA ARŞİV',
    banner: '6.446+ DOĞRULANMIŞ PAKET',
    sub: '3.561 Script · 1.298 MLO Harita · 1.152 Araç Paketi',
    spec: '< 0.02ms resmon · Anında arama ve filtreleme',
    cta: 'Arşivi Keşfet →',
    href: '/katalog',
    tone: 'frost',
  },
  {
    id: 'client-portal',
    code: 'VAGON 04',
    tag: 'MÜŞTERİ PORTALI',
    banner: 'LİSANS & KONTROL PANELİ',
    sub: 'Anında teslimat, sipariş geçmişi ve teknik destek merkezi',
    spec: '7/24 Aktif Teslimat · Discord & İtemsatış Entegre',
    cta: 'Portala Gir →',
    href: '/dashboard',
    tone: 'slate',
  },
];
