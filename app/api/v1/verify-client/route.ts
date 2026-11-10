import { NextResponse } from 'next/server';
import { createAdminSupabase, resolveLoginIdentifier } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawCode = String(body.code || '').trim().toUpperCase();
    const rawIdentifier = String(body.email || body.username || '').trim();
    const password = String(body.password || '');
    const hwid = String(body.hwid || '').trim();
    const productName = String(body.product_name || 'R-AI').trim();

    if (!hwid) {
      return NextResponse.json(
        { success: false, message: 'İstemci HWID donanım kimliği tespit edilemedi.' },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminSupabase();
    let userId = '';
    let userDisplay = '';

    // YÖNTEM A: Aktivasyon Kodu ile Doğrulama (Siteden etkinleştirilmiş olma şartı var)
    const candidateCode = rawCode || (rawIdentifier.toUpperCase().startsWith('R-AI-') || rawIdentifier.toUpperCase().startsWith('RESTRICTED-') ? rawIdentifier.toUpperCase() : '');

    if (candidateCode) {
      const { data: codeData, error: codeErr } = await adminSupabase
        .from('redeem_codes')
        .select('*')
        .eq('code', candidateCode)
        .maybeSingle();

      if (codeErr || !codeData) {
        return NextResponse.json(
          { success: false, message: 'Girdiğiniz aktivasyon kodu geçersiz.' },
          { status: 404 }
        );
      }

      if (!codeData.is_used || !codeData.used_by) {
        return NextResponse.json(
          {
            success: false,
            message: 'Bu kod henüz web sitesinden etkinleştirilmemiştir! Lütfen önce restrictedstudio.shop adresinden kodu aktif edin.',
          },
          { status: 403 }
        );
      }

      userId = codeData.used_by;
      userDisplay = candidateCode;
    } else {
      // YÖNTEM B: E-posta / Kullanıcı Adı ve Şifre ile Doğrulama
      const email = resolveLoginIdentifier(rawIdentifier);
      if (!email || !password) {
        return NextResponse.json(
          { success: false, message: 'Lütfen sitede etkinleştirdiğiniz aktivasyon kodunu veya hesap bilgilerinizi giriniz.' },
          { status: 400 }
        );
      }

      const { data: authData, error: authError } = await adminSupabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authData?.user) {
        return NextResponse.json(
          { success: false, message: 'Kullanıcı adı/e-posta veya şifre hatalı.' },
          { status: 401 }
        );
      }

      userId = authData.user.id;
      userDisplay = authData.user.user_metadata?.username || email.replace('@restrictedstudio.local', '');
    }

    // 3. user_licenses tablosunda aktif lisansı sorgula
    const { data: license, error: licenseError } = await adminSupabase
      .from('user_licenses')
      .select('*')
      .eq('user_id', userId)
      .eq('product_name', productName)
      .maybeSingle();

    if (licenseError || !license) {
      return NextResponse.json(
        {
          success: false,
          message: `'${productName}' ürünü için aktif lisans bulunamadı. Lütfen önce restrictedstudio.shop üzerinden kodunuzu etkinleştiriniz.`,
        },
        { status: 403 }
      );
    }

    // A. Ban / Askıya alınma durumu kontrolü
    if (license.status === 'banned') {
      return NextResponse.json(
        { success: false, message: 'Bu lisans yönetici tarafından askıya alınmıştır/banlanmıştır.' },
        { status: 403 }
      );
    }

    if (license.status !== 'active') {
      return NextResponse.json(
        { success: false, message: 'Lisans durumu aktif değil.' },
        { status: 403 }
      );
    }

    // B. Süre dolma kontrolü
    const expiresAt = new Date(license.expires_at);
    const now = new Date();

    if (expiresAt <= now) {
      await adminSupabase.from('user_licenses').update({ status: 'expired' }).eq('id', license.id);
      return NextResponse.json(
        { success: false, message: 'Lisans süreniz sona ermiştir. Lütfen İtemsatış üzerinden yenileyiniz.' },
        { status: 403 }
      );
    }

    // 4. HWID (Donanım Cihaz Kilidi) Kontrolü
    if (!license.hwid) {
      const { error: updateHwidError } = await adminSupabase
        .from('user_licenses')
        .update({ hwid: hwid })
        .eq('id', license.id);

      if (updateHwidError) {
        return NextResponse.json(
          { success: false, message: 'HWID kaydı sırasında bir hata oluştu.' },
          { status: 500 }
        );
      }
    } else if (license.hwid !== hwid) {
      return NextResponse.json(
        {
          success: false,
          message: 'Farklı bir cihaz tespit edildi (HWID uyuşmazlığı). Lisansınız başka bir bilgisayara kilitli. Bilgisayar değiştirdiyseniz destek ekibimizle iletişime geçerek HWID sıfırlatınız.',
        },
        { status: 403 }
      );
    }

    // 5. Her şey onaylandı (200 OK)
    const remainingDays = Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    return NextResponse.json(
      {
        success: true,
        user: userDisplay,
        product: productName,
        status: 'active',
        hwid_locked: true,
        expires_at: license.expires_at,
        days_remaining: remainingDays,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Doğrulama sunucusunda beklenmeyen bir hata oluştu.' },
      { status: 500 }
    );
  }
}
