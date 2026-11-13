import { NextResponse } from 'next/server';
import { guardApiRequest } from '@/lib/security-server';
import {
  attachCustomerCookies,
  clearCustomerSessionCookies,
  rotateCustomerRefreshToken,
} from '@/lib/customer-session';

export async function POST(request: Request) {
  const guard = guardApiRequest(request, 'auth_refresh', { checkSameOrigin: true });
  if (!guard.ok) return guard.response;

  const result = await rotateCustomerRefreshToken(request);
  if (!result.ok || !result.user || !result.tokens) {
    const res = NextResponse.json(
      {
        success: false,
        reuseDetected: Boolean(result.reuseDetected),
        message: result.reuseDetected
          ? 'Güvenlik ihlali şüphesi nedeniyle tüm oturumlarınız sonlandırıldı.'
          : 'Oturum süresi doldu. Lütfen tekrar giriş yapın.',
      },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    );
    clearCustomerSessionCookies(request, res);
    return res;
  }

  const res = NextResponse.json(
    {
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
      },
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );

  attachCustomerCookies(request, res, result.tokens);
  return res;
}
