import { NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, message: 'Oturum bulunamadı.' }, { status: 401 });
    }

    const token = authHeader.replace(/^Bearer\s+/i, '');
    const adminSupabase = createAdminSupabase();

    const { data: userData, error: userError } = await adminSupabase.auth.getUser(token);
    if (userError || !userData?.user) {
      return NextResponse.json({ success: false, message: 'Geçersiz oturum.' }, { status: 401 });
    }

    const { data: licenses, error: licError } = await adminSupabase
      .from('user_licenses')
      .select('id, product_name, hwid, status, expires_at, created_at')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false });

    if (licError) {
      return NextResponse.json({ success: false, message: licError.message }, { status: 500 });
    }

    const adminEmail = (process.env.ADMIN_EMAIL || 'emreador@gmail.com').toLowerCase();
    const isAdmin = userData.user.email?.toLowerCase() === adminEmail;

    return NextResponse.json({
      success: true,
      licenses: licenses || [],
      isAdmin,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: 'Sunucu hatası.' }, { status: 500 });
  }
}
