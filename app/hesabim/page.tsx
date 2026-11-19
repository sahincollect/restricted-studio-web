import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { verifyServerDashboardSession } from '@/lib/customer-session';
import { getUserProfile } from '@/lib/account-store';
import {
  cleanupExpiredPendingShopierOrders,
  isPendingShopierOrderExpired,
  listOrdersForUser,
} from '@/lib/orders-store';
import AccountPortalClient from '@/components/AccountPortalClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Hesabım & Teslimat',
  robots: { index: false, follow: false },
};

export default async function HesabimPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; ref?: string }>;
}) {
  const session = await verifyServerDashboardSession();
  if (!session.authenticated || !session.user || !session.sessionMeta) {
    redirect('/login?redirect=/hesabim&clear_session=1&reason=session_expired');
  }

  const sp = await searchParams;
  const [{ profile }, initialOrders] = await Promise.all([
    getUserProfile(session.user),
    listOrdersForUser(session.user.id),
  ]);

  let orders = initialOrders;
  if (orders.some((o) => isPendingShopierOrderExpired(o))) {
    const cleaned = await cleanupExpiredPendingShopierOrders({
      force: true,
      candidateOrders: orders,
    });
    if (cleaned.cancelledRefs.length > 0 || cleaned.promotedRefs.length > 0) {
      orders = await listOrdersForUser(session.user.id);
    }
  }

  const initialTab =
    sp.tab === 'profile' ? 'profile' : sp.tab === 'security' ? 'security' : 'orders';

  return (
    <AccountPortalClient
      initialProfile={profile}
      initialOrders={orders}
      initialLicenseCount={session.licenses.length}
      initialSessionMeta={session.sessionMeta}
      initialTab={initialTab}
      initialOrderRef={sp.ref ? sp.ref.toUpperCase() : undefined}
    />
  );
}
