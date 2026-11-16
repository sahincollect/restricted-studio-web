import { NextResponse } from 'next/server';
import { verifyAdminSecret } from '@/lib/admin-secret';
import {
  attachAdminElevatedCookies,
  resolveElevatedAdminSession,
} from '@/lib/admin-session';

export interface AdminAuthContext {
  authorized: boolean;
  actorId: string;
  viaSecretHeader: boolean;
  rotatedSub?: string;
  rotatedFamilyId?: string;
}

export async function verifyAdminAuth(request: Request): Promise<AdminAuthContext> {
  const elevated = await resolveElevatedAdminSession(request);
  if (elevated.authenticated && elevated.claims) {
    return {
      authorized: true,
      actorId: elevated.claims.sub,
      viaSecretHeader: false,
      rotatedSub: elevated.rotatedSub,
      rotatedFamilyId: elevated.rotatedFamilyId,
    };
  }

  if (verifyAdminSecret(request.headers.get('x-admin-secret'))) {
    return {
      authorized: true,
      actorId: 'cli-admin-secret',
      viaSecretHeader: true,
    };
  }

  return { authorized: false, actorId: 'unauthorized', viaSecretHeader: false };
}

export function finalizeAdminResponse(
  request: Request,
  auth: AdminAuthContext,
  payload: Record<string, unknown>,
  status = 200
) {
  const res = NextResponse.json(payload, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
  if (auth.rotatedSub) {
    attachAdminElevatedCookies(request, res, auth.rotatedSub, auth.rotatedFamilyId);
  }
  return res;
}
