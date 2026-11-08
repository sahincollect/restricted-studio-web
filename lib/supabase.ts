import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nknscxscbnucqrxqbgfg.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// 1. İstemci (Browser) Tarafı Supabase Client
export function createClientSupabase() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// 2. Sunucu Güvenli Yönetici (Service Role) Supabase Client - Asla istemciye sızmaz
export function createAdminSupabase() {
  const serviceKey = supabaseServiceRoleKey || supabaseAnonKey;
  return createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
