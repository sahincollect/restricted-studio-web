import { NextResponse } from 'next/server';
import { createAdminSupabase, resolveLoginIdentifier, normalizeUsername } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawIdentifier = String(body.identifier || '').trim();
    const password = String(body.password || '');

    if (!rawIdentifier) {
      return NextResponse.json(
        { success: false, message: 'Lütfen kullanıcı adı veya e-posta giriniz.' },
        { status: 400 }
      );
    }

    const isEmail = rawIdentifier.includes('@');
    const cleanUsername = isEmail ? rawIdentifier.split('@')[0] : rawIdentifier;
    const safeUsername = normalizeUsername(cleanUsername);

    if (!isEmail && safeUsername.length < 3) {
      return NextResponse.json(
        { success: false, message: 'Kullanıcı adı en az 3 geçerli karakterden oluşmalıdır.' },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Şifre en az 6 karakter olmalıdır.' },
        { status: 400 }
      );
    }

    const email = resolveLoginIdentifier(rawIdentifier);

    // Eğer SUPABASE_SERVICE_ROLE_KEY tanımlıysa, admin API üzerinden
    // email_confirm: true ile oluşturarak e-posta onayını ve rate limitleri tamamen baypas et
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const adminSupabase = createAdminSupabase();
        const { data, error } = await adminSupabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            username: cleanUsername,
            is_custom_username: !isEmail,
          },
        });

        if (error) {
          if (error.message.includes('already registered') || error.message.includes('unique')) {
            return NextResponse.json(
              { success: false, serviceRoleAvailable: true, message: 'Bu kullanıcı adı veya e-posta zaten kayıtlı. Lütfen giriş yapın.' },
              { status: 409 }
            );
          }
          return NextResponse.json(
            { success: false, serviceRoleAvailable: true, message: error.message },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          user: data.user,
          email,
          serviceRoleUsed: true,
        });
      } catch (adminErr: any) {
        // Fallback to client signup
      }
    }

    // Service role yoksa istemcinin signUp metoduna devret
    return NextResponse.json({
      success: false,
      serviceRoleAvailable: false,
      message: 'Service role key tanımlı değil; istemci üzerinden kayıt denenmeli.',
      email,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Kayıt sırasında bir hata oluştu.' },
      { status: 500 }
    );
  }
}
