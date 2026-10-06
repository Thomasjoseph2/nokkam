import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { Logo } from '@/components/navigation/logo';
import { Container } from '@/components/ui/container';
import { LogoutButton } from '@/features/auth/components/logout-button';
import { VerifyEmailBanner } from '@/features/auth/components/verify-email-banner';
import { getCurrentUser } from '@/features/auth/session';
import { DashboardBottomNav, DashboardNav } from '@/features/dashboard/components/dashboard-nav';
import { navItemsFor } from '@/features/dashboard/nav-items';

// Private area: never indexed, always rendered per request.
export const metadata: Metadata = { title: 'Dashboard', robots: { index: false, follow: false } };

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/dashboard');

  return (
    <div className="min-h-dvh pb-20 sm:pb-0">
      <header className="sticky top-0 z-20 border-b border-line/70 bg-canvas/90 backdrop-blur">
        <Container className="flex h-16 items-center justify-between gap-4">
          <Logo href="/dashboard" />
          <DashboardNav items={navItemsFor(user)} />
          <LogoutButton />
        </Container>
      </header>
      <main id="main">
        <Container className="py-6 sm:py-10">
          {!user.emailVerified ? <VerifyEmailBanner email={user.email} /> : null}
          <div className={user.emailVerified ? '' : 'mt-6'}>{children}</div>
        </Container>
      </main>
      <DashboardBottomNav items={navItemsFor(user)} />
    </div>
  );
}
