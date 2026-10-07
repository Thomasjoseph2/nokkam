import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Logo } from '@/components/navigation/logo';
import { LockIcon, ShieldCheckIcon, SparklesIcon } from '@/components/ui/icons';

export const metadata: Metadata = { robots: { index: false, follow: true } };

const REASSURANCES = [
  { icon: SparklesIcon, text: 'Real offers at new local places' },
  { icon: LockIcon, text: 'Feedback only the business can see' },
  { icon: ShieldCheckIcon, text: 'Rewards never depend on your rating' },
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.1fr]">
      {/* Brand panel (desktop): reassures at the moment of commitment. */}
      <aside className="relative isolate hidden overflow-hidden bg-gradient-deep p-12 text-white lg:flex lg:flex-col">
        <div
          aria-hidden
          className="absolute -right-24 -bottom-24 -z-10 size-96 animate-blob rounded-full bg-lagoon-400/20 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-dots opacity-25 [mask-image:linear-gradient(to_bottom,black,transparent)]"
        />
        <Logo tone="light" />
        <div className="my-auto max-w-md">
          <h2 className="text-4xl leading-tight font-extrabold tracking-tight text-balance">
            Discover what&apos;s new. <span className="text-brand-300">Help it grow.</span>
          </h2>
          <ul className="mt-10 grid gap-4">
            {REASSURANCES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-brand-50">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 text-lg text-brand-200 ring-1 ring-white/15">
                  <Icon />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="relative isolate flex flex-col overflow-hidden">
        <div aria-hidden className="absolute inset-0 -z-10 bg-aurora" />
        <div
          aria-hidden
          className="absolute -top-20 -right-20 -z-10 size-80 animate-blob rounded-full bg-brand-200/50 blur-3xl"
        />
        <header className="px-4 pt-6 sm:px-8 lg:hidden">
          <Logo />
        </header>
        <main
          id="main"
          className="flex flex-1 items-start justify-center px-4 py-10 sm:items-center"
        >
          <div className="glass w-full max-w-md animate-fade-up rounded-card p-6 shadow-lift ring-1 ring-white/80 sm:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
