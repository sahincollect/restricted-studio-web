import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
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
        cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
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

  // 1. /dashboard koruması: Giriş yapmamışsa /login'e yönlendir
  if (path.startsWith('/dashboard')) {
    if (!user) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', path);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // 2. /admin koruması: Giriş yapmamışsa veya yetkili değilse kontrol
  if (path.startsWith('/admin')) {
    const adminKey = request.nextUrl.searchParams.get('key');
    const expectedSecret = process.env.ADMIN_SECRET_KEY || 'RESTRICTED_ADMIN_SECRET_2026_V1';

    // Eğer URL'de geçerli admin anahtarı varsa geçişe izin ver
    if (adminKey && adminKey === expectedSecret) {
      return response;
    }

    // Aksi halde oturum açmış kullanıcı kontrolü yap
    if (!user) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', path);
      return NextResponse.redirect(redirectUrl);
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail && user.email?.toLowerCase() !== adminEmail.toLowerCase()) {
      // Yetkisi yoksa dashboard'a gönder
      return NextResponse.redirect(new URL('/dashboard?error=unauthorized', request.url));
    }
  }

  // 3. /login veya /register sayfalarına girildiğinde oturum zaten açıksa /dashboard'a yönlendir
  if ((path === '/login' || path === '/register') && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login', '/register'],
};
