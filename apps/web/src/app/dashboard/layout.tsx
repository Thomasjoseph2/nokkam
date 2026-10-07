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
    <div className="relative isolate min-h-dvh pb-20 sm:pb-0">
      {/* Gentle mint wash at the top so the workspace feels fresh, not flat. */}
      <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-80 bg-aurora opacity-70" />
      <header className="glass sticky top-0 z-20 border-b border-brand-100/80">
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
