import { NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const hwid = String(body.hwid || '').trim();
    const productName = String(body.product_name || 'R-AI').trim();

    // 1. Parametre kontrolü
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'E-posta ve şifre zorunludur.' },
        { status: 400 }
      );
    }

    if (!hwid) {
      return NextResponse.json(
        { success: false, message: 'İstemci HWID donanım kimliği tespit edilemedi.' },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminSupabase();

    // 2. Supabase Auth ile kullanıcı girişini doğrula
    const { data: authData, error: authError } = await adminSupabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData?.user) {
      return NextResponse.json(
        { success: false, message: 'E-posta adresi veya şifre hatalı.' },
        { status: 401 }
      );
    }

    const userId = authData.user.id;

    // 3. user_licenses tablosunda aktif lisansı sorgula
    const { data: license, error: licenseError } = await adminSupabase
      .from('user_licenses')
      .select('*')
      .eq('user_id', userId)
      .eq('product_name', productName)
      .maybeSingle();

    if (licenseError || !license) {
      return NextResponse.json(
        { success: false, message: `'${productName}' ürünü için hesabınızda lisans kaydı bulunamadı. Lütfen web panelinden aktivasyon kodunuzu giriniz.` },
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
      // Süresi dolmuşsa durumunu expired yap
      await adminSupabase.from('user_licenses').update({ status: 'expired' }).eq('id', license.id);
      return NextResponse.json(
        { success: false, message: 'Lisans süreniz sona ermiştir. Lütfen İtemsatış üzerinden yenileyiniz.' },
        { status: 403 }
      );
    }

    // 4. HWID (Donanım Cihaz Kilidi) Kontrolü
    if (!license.hwid) {
      // İlk giriş: HWID henüz kilitlenmemiş, bu cihazı kaydet ve kilitle
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
      // Farklı cihazdan giriş denemesi
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
        user: email,
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
