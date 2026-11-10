import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://nknscxscbnucqrxqbgfg.supabase.co';
// Anon key herkese açık (public) bir anahtardır; yalnızca istemci tarafı için varsayılan olarak tutulur.
const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rbnNjeHNjYm51Y3FyeHFiZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQxNTEyNDEsImV4cCI6MjEwOTcyNzI0MX0.p6uOv4cpTA5wTswUo_oSuaxkgibI2kyjq1P1bcCVOLA';

// 1. İstemci (Browser) Tarafı Supabase Client
export function createClientSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY;
  return createBrowserClient(url, anonKey);
}

// 2. Sunucu Güvenli Yönetici (Service Role) Supabase Client - Asla istemciye sızmaz.
// Service role anahtarı yoksa anon anahtara DÜŞÜLMEZ; açıkça hata verilir.
export function createAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY ortam değişkeni tanımlı değil.');
  }
  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// 3. Kullanıcı Adı veya E-posta Girişini Supabase Formatına Dönüştürür
export function resolveLoginIdentifier(identifier: string): string {
  const clean = String(identifier || '').trim().toLowerCase();
  if (!clean) return '';
  if (clean.includes('@')) return clean;
  const safeUsername = clean.replace(/[^a-z0-9._-]/g, '');
  return `${safeUsername}@restrictedstudio.local`;
}

// 4. Yönetici kontrolü.
// ÖNEMLİ: user_metadata kullanıcı tarafından düzenlenebilir olduğu için güvenilmez; kullanılmaz.
// Yalnızca ADMIN_EMAIL ortam değişkeni (ve sunucu tarafında yazılan app_metadata.is_admin) geçerlidir.
export function isAdminUser(user?: { email?: string | null; app_metadata?: Record<string, any> | null } | null): boolean {
  if (!user) return false;
  const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const email = (user.email || '').toLowerCase();
  if (adminEmail && email === adminEmail) return true;
  return user.app_metadata?.is_admin === true;
}
