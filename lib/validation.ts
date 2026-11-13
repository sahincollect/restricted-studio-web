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
