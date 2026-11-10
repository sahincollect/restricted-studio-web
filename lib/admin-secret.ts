import crypto from 'crypto';

// Admin gizli anahtarı doğrulama (yalnızca sunucu; ortam değişkeni zorunlu, sabit süreli karşılaştırma)
export function verifyAdminSecret(provided?: string | null): boolean {
  const expected = process.env.ADMIN_SECRET_KEY;
  if (!expected || !provided) return false;
  const a = crypto.createHash('sha256').update(provided).digest();
  const b = crypto.createHash('sha256').update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}
