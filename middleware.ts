import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  try {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nknscxscbnucqrxqbgfg.supabase.co';
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rbnNjeHNjYm51Y3FyeHFiZ2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQxNTEyNDEsImV4cCI6MjEwOTcyNzI0MX0.p6uOv4cpTA5wTswUo_oSuaxkgibI2kyjq1P1bcCVOLA';

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const path = request.nextUrl.pathname;

    // 1. /dashboard koruması: Oturum yoksa /login'e yönlendir
    if (path.startsWith('/dashboard') && !user) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', path);
      return NextResponse.redirect(redirectUrl);
    }

    // 2. /admin koruması: URL key varsa geçir, yoksa admin email oturumu ara
    if (path.startsWith('/admin')) {
      const adminKey = request.nextUrl.searchParams.get('key');
      const expectedSecret = process.env.ADMIN_SECRET_KEY || 'RESTRICTED_ADMIN_SECRET_2026_V1';

      if (adminKey && adminKey === expectedSecret) {
        return response;
      }

      if (user) {
        const adminEmail = (process.env.ADMIN_EMAIL || 'emreador@gmail.com').toLowerCase();
        const userEmail = user.email?.toLowerCase() || '';
        const isAllowedAdmin =
          userEmail === adminEmail ||
          userEmail === 'emreador@gmail.com' ||
          userEmail === 'restricted@restrictedstudio.local' ||
          Boolean(user.user_metadata?.is_admin);

        if (!isAllowedAdmin) {
          return NextResponse.redirect(new URL('/dashboard?error=unauthorized', request.url));
        }
      }
    }

    // /login veya /register sayfalarına girildiğinde oturum zaten açıksa /dashboard'a yönlendir
    if ((path === '/login' || path === '/register') && user) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return response;
  } catch (err) {
    // Edge runtime hatası olursa çökme (500 verme), sayfanın açılmasına izin ver
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login', '/register'],
};
