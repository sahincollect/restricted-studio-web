import { NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase';
import { guardApiRequest } from '@/lib/security-server';
import {
  attachCustomerCookies,
  clearCustomerSessionCookies,
  resolveCustomerSession,
} from '@/lib/customer-session';

export async function GET(request: Request) {
  const guard = guardApiRequest(request, 'api_default');
  if (!guard.ok) return guard.response;

  try {
    const session = await resolveCustomerSession(request);
    if (!session.authenticated || !session.user) {
      const res = NextResponse.json(
        { success: false, message: 'Oturum bulunamadı veya süresi doldu.' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      );
      if (session.clearCookies) {
        clearCustomerSessionCookies(request, res);
      }
      return res;
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const res = NextResponse.json(
        {
          success: true,
          user: {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
          },
          licenses: [],
          isAdmin: false,
        },
        { headers: { 'Cache-Control': 'no-store' } }
      );
      if (session.refreshedTokens) attachCustomerCookies(request, res, session.refreshedTokens);
      return res;
    }

    const adminSupabase = createAdminSupabase();
    const { data: licenses, error: licError } = await adminSupabase
      .from('user_licenses')
      .select('id, product_name, hwid, status, expires_at, created_at')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (licError) {
      return NextResponse.json(
        { success: false, message: 'Lisans bilgileri şu anda yüklenemiyor.' },
        { status: 500, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const isAdmin = Boolean(adminEmail && session.user.email?.toLowerCase() === adminEmail);

    const res = NextResponse.json(
      {
        success: true,
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
        },
        licenses: licenses || [],
        isAdmin,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );

    if (session.refreshedTokens) {
      attachCustomerCookies(request, res, session.refreshedTokens);
    }

    return res;
  } catch {
    return NextResponse.json(
      { success: false, message: 'Sunucu hatası.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
