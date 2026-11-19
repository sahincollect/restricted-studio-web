import { z } from 'zod';

const CONTROL_CHARS_RE = /[\x00-\x1f\x7f]/g;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const USERNAME_RE = /^[a-zA-Z0-9çğıöşüÇĞİÖŞÜ._-]{3,40}$/;

/**
 * Strips control characters and unsafe HTML angle brackets for clean logging/rendering.
 */
export function sanitizePlainText(input: unknown, maxLen = 256): string {
  return String(input ?? '')
    .replace(CONTROL_CHARS_RE, '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLen);
}

const honeypotField = z.string().max(0, 'Geçersiz istek.').optional();
const turnstileField = z.string().max(2048).optional().nullable();

export const CustomerLoginSchema = z
  .object({
    identifier: z
      .string()
      .trim()
      .min(3, 'Geçersiz kimlik bilgileri.')
      .max(120, 'Geçersiz kimlik bilgileri.'),
    password: z.string().min(1, 'Geçersiz kimlik bilgileri.').max(128, 'Geçersiz kimlik bilgileri.'),
    turnstileToken: turnstileField,
    website_url: honeypotField,
  })
  .strict();

export const CustomerRegisterSchema = z
  .object({
    identifier: z
      .string()
      .trim()
      .min(3, 'Kullanıcı adı veya e-posta en az 3 karakter olmalıdır.')
      .max(120, 'Kullanıcı adı veya e-posta en fazla 120 karakter olabilir.')
      .refine((val) => (val.includes('@') ? EMAIL_RE.test(val) : USERNAME_RE.test(val)), {
        message: 'Geçerli bir kullanıcı adı (harf, rakam, ., _, -) veya e-posta adresi giriniz.',
      }),
    password: z
      .string()
      .min(8, 'Şifre en az 8 karakter olmalıdır.')
      .max(128, 'Şifre en fazla 128 karakter olabilir.'),
    kvkkAccepted: z
      .boolean()
      .refine((v) => v === true, { message: 'KVKK ve Kullanım Koşulları onayı gereklidir.' })
      .optional(),
    turnstileToken: turnstileField,
    website_url: honeypotField,
  })
  .strict();

export const ForgotPasswordSchema = z
  .object({
    email: z
      .string()
      .trim()
      .max(120)
      .refine((v) => EMAIL_RE.test(v), { message: 'Geçerli bir e-posta adresi giriniz.' }),
    turnstileToken: turnstileField,
    website_url: honeypotField,
  })
  .strict();

export const AnonymousAuthSchema = z
  .object({
    turnstileToken: turnstileField,
    website_url: honeypotField,
  })
  .strict();

export const RedeemCodeSchema = z
  .object({
    code: z
      .string()
      .trim()
      .transform((v) => v.toUpperCase())
      .refine((v) => /^[A-Z0-9-]{6,64}$/.test(v), {
        message: 'Geçersiz aktivasyon kodu biçimi.',
      }),
  })
  .strict();

export const VerifyClientSchema = z
  .object({
    code: z.string().trim().max(64).optional(),
    email: z.string().trim().max(120).optional(),
    username: z.string().trim().max(120).optional(),
    password: z.string().max(128).optional(),
    hwid: z.string().trim().min(4, 'Geçersiz HWID.').max(256, 'Geçersiz HWID.'),
    product_name: z.enum(['R-AI', 'RESTRICTED-FIVEM']).optional().default('R-AI'),
  })
  .strict();

export const AdminLoginSchema = z
  .object({
    username: z.string().trim().min(1, 'Geçersiz kimlik bilgileri.').max(128),
    password: z.string().min(1, 'Geçersiz kimlik bilgileri.').max(256),
    turnstileToken: turnstileField,
    website_url: honeypotField,
  })
  .strict();

export const AdminMfaVerifySchema = z
  .object({
    code: z
      .string()
      .trim()
      .transform((v) => v.replace(/\s+/g, ''))
      .refine((v) => /^\d{6}$/.test(v), { message: '6 haneli doğrulama kodu giriniz.' }),
  })
  .strict();

export const AdminActionSchema = z.discriminatedUnion('action', [
  z
    .object({
      action: z.literal('generate_codes'),
      product_name: z.enum(['R-AI', 'RESTRICTED-FIVEM']),
      duration_days: z.union([z.literal(30), z.literal(90), z.literal(365), z.literal(9999)]),
      count: z.number().int().min(1).max(500),
    })
    .strict(),
  z
    .object({
      action: z.literal('reset_hwid'),
      license_id: z.string().uuid('Geçersiz lisans kimliği.'),
    })
    .strict(),
  z
    .object({
      action: z.literal('toggle_ban'),
      license_id: z.string().uuid('Geçersiz lisans kimliği.'),
      status: z.enum(['active', 'banned']),
    })
    .strict(),
]);

const STORE_PRODUCT_ID_RE = /^[a-zA-Z0-9_-]{1,32}$/;

const optionalPriceNumber = z.union([
  z.null(),
  z.number().finite().min(0, 'Fiyat 0 veya daha büyük olmalıdır.').max(1_000_000),
]);

export const StoreAdminActionSchema = z.discriminatedUnion('action', [
  z
    .object({
      action: z.literal('upsert_price'),
      productId: z.string().trim().regex(STORE_PRODUCT_ID_RE, 'Geçersiz ürün kimliği.'),
      customPrice: optionalPriceNumber,
      comparePrice: optionalPriceNumber.optional(),
      hidden: z.boolean().optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('bulk_adjust'),
      group: z.enum(['all', 'ai', 'design', 'media', 'software', 'fivem']),
      mode: z.enum(['percent', 'fixed_delta', 'set_fixed', 'reset']),
      value: z.number().finite().min(-95).max(100_000).optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal('refresh_itemsatis'),
    })
    .strict(),
]);

/**
 * Escapes HTML special characters for safe server-side transactional email templates.
 */
export function escapeHtml(input: unknown): string {
  return String(input ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export const ServiceRequestSchema = z
  .object({
    serviceType: z.enum(['web-kurulum', 'discord-bot']),
    fullName: z
      .string()
      .trim()
      .min(2, 'Ad Soyad / Kurum adı en az 2 karakter olmalıdır.')
      .max(100, 'Ad Soyad / Kurum adı en fazla 100 karakter olabilir.'),
    email: z
      .string()
      .trim()
      .max(120, 'E-posta adresi en fazla 120 karakter olabilir.')
      .refine((v) => EMAIL_RE.test(v), { message: 'Geçerli bir e-posta adresi giriniz.' }),
    discordHandle: z
      .string()
      .trim()
      .max(80, 'Discord bilgisi en fazla 80 karakter olabilir.')
      .optional()
      .default(''),
    packageTier: z
      .string()
      .trim()
      .min(2, 'Lütfen bir hizmet paketi seçiniz.')
      .max(100, 'Paket seçimi geçersiz.'),
    budget: z
      .string()
      .trim()
      .min(2, 'Lütfen tahmini bütçe aralığı seçiniz.')
      .max(80, 'Bütçe alanı en fazla 80 karakter olabilir.'),
    timeline: z
      .string()
      .trim()
      .min(2, 'Lütfen hedef teslim süresini seçiniz.')
      .max(80, 'Teslim süresi en fazla 80 karakter olabilir.'),
    projectScope: z
      .string()
      .trim()
      .max(140, 'Alan adı veya sunucu bilgisi en fazla 140 karakter olabilir.')
      .optional()
      .default(''),
    selectedFeatures: z
      .array(z.string().trim().min(1).max(80))
      .max(12, 'En fazla 12 ek modül seçebilirsiniz.')
      .optional()
      .default([]),
    details: z
      .string()
      .trim()
      .min(10, 'Lütfen proje detaylarını en az 10 karakter ile açıklayın.')
      .max(2500, 'Proje açıklaması en fazla 2500 karakter olabilir.'),
    locale: z.enum(['tr', 'en', 'ru', 'fr']).optional().default('tr'),
    kvkkAccepted: z
      .boolean()
      .refine((v) => v === true, { message: 'KVKK Aydınlatma Metni onayı gereklidir.' })
      .optional(),
    turnstileToken: turnstileField,
    website_url: honeypotField,
  })
  .strict();

export function isSafeHttpsUrl(raw: unknown): boolean {
  if (typeof raw !== 'string') return false;
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > 512) return false;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:') return false;
    const host = parsed.hostname.toLowerCase();
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.startsWith('10.') ||
      host.startsWith('192.168.') ||
      host.startsWith('169.254.') ||
      host.endsWith('.local')
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function validateAvatarInput(
  raw: unknown
): { ok: true; value: string | null } | { ok: false; message: string } {
  if (raw === null || raw === undefined) return { ok: true, value: null };
  if (typeof raw !== 'string') return { ok: false, message: 'Geçersiz profil resmi biçimi.' };
  const trimmed = raw.trim();
  if (!trimmed) return { ok: true, value: null };

  if (/^preset:(obsidian|ember|crimson|minimal)$/i.test(trimmed)) {
    return { ok: true, value: trimmed.toLowerCase() };
  }

  if (isSafeHttpsUrl(trimmed)) {
    return { ok: true, value: trimmed };
  }

  const m = trimmed.match(/^data:image\/(png|jpeg|jpg|webp);base64,([A-Za-z0-9+/=]+)$/);
  if (!m) {
    return { ok: false, message: 'Profil resmi yalnızca PNG, JPG veya WEBP biçiminde olabilir.' };
  }

  const base64 = m[2];
  if (base64.length > 360_000) {
    return { ok: false, message: 'Profil resmi en fazla 256 KB boyutunda olabilir.' };
  }

  try {
    const buf = Buffer.from(base64, 'base64');
    if (buf.length < 12 || buf.length > 262_144) {
      return { ok: false, message: 'Profil resmi dosya boyutu sınırlar dışında.' };
    }
    const isPng = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
    const isJpeg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
    const isWebp =
      buf.slice(0, 4).toString('ascii') === 'RIFF' && buf.slice(8, 12).toString('ascii') === 'WEBP';

    if (!isPng && !isJpeg && !isWebp) {
      return { ok: false, message: 'Geçersiz veya bozuk görsel dosyası (imza doğrulanamadı).' };
    }
    const mime = isPng ? 'image/png' : isJpeg ? 'image/jpeg' : 'image/webp';
    return { ok: true, value: `data:${mime};base64,${base64}` };
  } catch {
    return { ok: false, message: 'Profil resmi işlenemedi.' };
  }
}

export const ShopierCheckoutSchema = z.discriminatedUnion('source', [
  z
    .object({
      source: z.literal('catalog'),
      itemIds: z
        .array(z.string().trim().regex(/^RS-CAT-\d{4,6}$/, 'Geçersiz katalog öğe kodu.'))
        .min(1, 'Sepetinizde en az 1 ürün bulunmalıdır.')
        .max(200, 'Tek siparişte en fazla 200 modül seçebilirsiniz.'),
      note: z.string().trim().max(400).optional().default(''),
    })
    .strict(),
  z
    .object({
      source: z.literal('store'),
      productId: z.string().trim().regex(STORE_PRODUCT_ID_RE, 'Geçersiz mağaza ürün kimliği.'),
      quantity: z.number().int().min(1).max(10).optional().default(1),
      note: z.string().trim().max(400).optional().default(''),
    })
    .strict(),
]);

export const OrderMessageSchema = z
  .object({
    body: z
      .string()
      .trim()
      .min(1, 'Mesaj boş olamaz.')
      .max(1500, 'Mesaj en fazla 1500 karakter olabilir.'),
  })
  .strict();

export const SupportThreadMessageSchema = z
  .object({
    referenceCode: z
      .string()
      .trim()
      .regex(/^RS-(?:ORD|MSG)-\d{6}-[A-Z0-9]{6}$/i, 'Geçersiz sohbet kodu.')
      .optional(),
    topic: z.string().trim().min(2, 'Konu en az 2 karakter olmalıdır.').max(80).optional(),
    body: z
      .string()
      .trim()
      .min(1, 'Mesaj boş olamaz.')
      .max(1500, 'Mesaj en fazla 1500 karakter olabilir.'),
  })
  .strict();

export const AdminOrderActionSchema = z.discriminatedUnion('mode', [
  z
    .object({
      mode: z.literal('reply'),
      body: z.string().trim().min(1, 'Mesaj metni gereklidir.').max(2000),
      nextStatus: z.enum(['pending_payment', 'paid', 'preparing', 'delivered', 'cancelled']).optional(),
    })
    .strict(),
  z
    .object({
      mode: z.literal('deliver'),
      licenseCode: z.string().trim().max(240).optional().default(''),
      downloadUrl: z.string().trim().max(512).optional().default(''),
      instructions: z
        .string()
        .trim()
        .min(3, 'Teslimat açıklaması veya kurulum notu giriniz.')
        .max(2500),
    })
    .strict(),
]);

export const ProfileUpdateSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(2, 'Görünen ad en az 2 karakter olmalıdır.')
      .max(48, 'Görünen ad en fazla 48 karakter olabilir.'),
    username: z
      .string()
      .trim()
      .regex(USERNAME_RE, 'Kullanıcı adı 3–40 karakter (harf, rakam, ., _, -) olmalıdır.')
      .optional(),
    discordHandle: z.string().trim().max(64).optional().default(''),
    serverName: z.string().trim().max(80).optional().default(''),
    bio: z.string().trim().max(240).optional().default(''),
    preferredLocale: z.enum(['tr', 'en', 'ru', 'fr']).optional(),
    avatarUrl: z.union([z.string().max(400_000), z.null()]).optional(),
  })
  .strict();

export const PasswordChangeSchema = z
  .object({
    currentPassword: z.string().max(128).optional().default(''),
    newPassword: z
      .string()
      .min(8, 'Yeni şifre en az 8 karakter olmalıdır.')
      .max(128, 'Yeni şifre en fazla 128 karakter olabilir.'),
  })
  .strict();
