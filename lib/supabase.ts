import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://nknscxscbnucqrxqbgfg.supabase.co';
const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rbnNjeHNjYm51Y3FyeHFiZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQxNTEyNDEsImV4cCI6MjEwOTcyNzI0MX0.p6uOv4cpTA5wTswUo_oSuaxkgibI2kyjq1P1bcCVOLA';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// 1. İstemci (Browser) Tarafı Supabase Client
export function createClientSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY;
  return createBrowserClient(url, anonKey);
}

// 2. Sunucu Güvenli Yönetici (Service Role) Supabase Client - Asla istemciye sızmaz
export function createAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseServiceRoleKey || DEFAULT_ANON_KEY;
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
  // Kullanıcı adı girildiyse standart yerel domain ekle
  const safeUsername = clean.replace(/[^a-z0-9._-]/g, '');
  return `${safeUsername}@restrictedstudio.local`;
}

// 4. Kullanıcının Yönetici Olup Olmadığını Kontrol Eder
export function isAdminIdentity(email?: string | null): boolean {
  if (!email) return false;
  const lower = email.toLowerCase();
  const configuredAdmin = (process.env.ADMIN_EMAIL || 'emreador@gmail.com').toLowerCase();
  return (
    lower === configuredAdmin ||
    lower === 'emreador@gmail.com' ||
    lower === 'restricted@restrictedstudio.local'
  );
}
