import { NextResponse } from 'next/server';
import { guardApiRequest, parseJsonBodySafe } from '@/lib/security-server';
import {
  attachCustomerCookies,
  clearCustomerSessionCookies,
  issueCustomerSession,
  resolveCustomerSession,
} from '@/lib/customer-session';
import { getUserProfile, updateUserProfile } from '@/lib/account-store';
import { listOrdersForUser } from '@/lib/orders-store';
import { ProfileUpdateSchema, sanitizePlainText, validateAvatarInput } from '@/lib/validation';
import { writeAuditLog } from '@/lib/audit-log';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const guard = guardApiRequest(request, 'api_default');
  if (!guard.ok) return guard.response;

  const url = new URL(request.url);
  const summaryOnly = url.searchParams.get('summary') === '1';

  const session = await resolveCustomerSession(request);
  if (!session.authenticated || !session.user) {
    const res = NextResponse.json(
      { authenticated: false },
      { status: summaryOnly ? 200 : 401, headers: { 'Cache-Control': 'no-store' } }
    );
    if (session.clearCookies) clearCustomerSessionCookies(request, res);
    return res;
  }

  const [{ profile, storageBackend }, orders] = await Promise.all([
    getUserProfile(session.user),
    listOrdersForUser(session.user.id),
  ]);

  const res = NextResponse.json(
    summaryOnly
      ? {
          authenticated: true,
          profile: {
            displayName: profile.displayName,
            avatarUrl: profile.avatarUrl,
            authProviders: profile.authProviders,
            isGuest: profile.isGuest,
          },
          pendingOrdersCount: orders.filter(
            (o) => o.source !== 'support' && o.status !== 'delivered' && o.status !== 'cancelled'
          ).length,
        }
      : {
          authenticated: true,
          profile,
          storageBackend,
          orders,
        },
    { headers: { 'Cache-Control': 'no-store' } }
  );

  if (session.refreshedTokens) attachCustomerCookies(request, res, session.refreshedTokens);
  return res;
}

export async function PATCH(request: Request) {
  const guard = guardApiRequest(request, 'account_update', { checkSameOrigin: true });
  if (!guard.ok) return guard.response;

  const session = await resolveCustomerSession(request);
  if (!session.authenticated || !session.user) {
    const res = NextResponse.json(
      { success: false, message: 'Oturum doğrulaması gereklidir.' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    );
    if (session.clearCookies) clearCustomerSessionCookies(request, res);
    return res;
  }

  const parsed = await parseJsonBodySafe(request, 512_000);
  if (!parsed.ok) return parsed.response;

  const validated = ProfileUpdateSchema.safeParse(parsed.data);
  if (!validated.success) {
    return NextResponse.json(
      {
        success: false,
        message: validated.error.issues[0]?.message || 'Geçersiz profil bilgisi.',
      },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const data = validated.data;
  let validatedAvatar: string | null | undefined = undefined;
  if (data.avatarUrl !== undefined) {
    const av = validateAvatarInput(data.avatarUrl);
    if (!av.ok) {
      return NextResponse.json(
        { success: false, message: av.message },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }
    validatedAvatar = av.value;
  }

  const updated = await updateUserProfile(session.user, {
    displayName: sanitizePlainText(data.displayName, 48),
    username: data.username ? sanitizePlainText(data.username, 40) : undefined,
    discordHandle: sanitizePlainText(data.discordHandle, 64),
    serverName: sanitizePlainText(data.serverName, 80),
    bio: sanitizePlainText(data.bio, 240),
    preferredLocale: data.preferredLocale,
    avatarUrl: validatedAvatar,
  });

  await writeAuditLog({
    request,
    actorId: session.user.id,
    actorType: 'customer',
    action: 'CUSTOMER_PROFILE_UPDATED',
    metadata: { avatarUpdated: validatedAvatar !== undefined, persistent: updated.persistent },
  });

  const res = NextResponse.json(
    {
      success: true,
      profile: updated.profile,
      persistent: updated.persistent,
      message: 'Profil ayarlarınız kaydedildi.',
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );

  // Sync updated displayName into the active session cookies (preserving session family)
  await issueCustomerSession(request, res, {
    id: session.user.id,
    email: session.user.email,
    name: updated.profile.displayName,
    familyId: session.user.familyId,
  });

  return res;
}
