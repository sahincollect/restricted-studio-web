import { redirect } from 'next/navigation';
import { verifyServerDashboardSession } from '@/lib/customer-session';
import DashboardClient from '@/components/DashboardClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  const session = await verifyServerDashboardSession();

  if (!session.authenticated || !session.user || !session.sessionMeta) {
    redirect('/login?redirect=/dashboard&clear_session=1&reason=session_expired');
  }

  return (
    <DashboardClient
      initialUser={session.user}
      initialLicenses={session.licenses}
      initialIsAdmin={session.isAdmin}
      initialSessionMeta={session.sessionMeta}
      needsCookieRefresh={session.needsRefresh}
    />
  );
}
