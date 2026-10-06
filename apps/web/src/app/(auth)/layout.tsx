import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Logo } from '@/components/navigation/logo';

export const metadata: Metadata = { robots: { index: false, follow: true } };

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="px-4 pt-6 sm:px-8">
        <Logo />
      </header>
      <main id="main" className="flex flex-1 items-start justify-center px-4 py-10 sm:items-center">
        <div className="w-full max-w-md rounded-card bg-surface p-6 shadow-card ring-1 ring-line/70 sm:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
