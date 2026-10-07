import type { ReactNode } from 'react';
import { SparklesIcon } from '@/components/ui/icons';

export function EmptyState({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="relative isolate overflow-hidden rounded-card bg-surface px-6 py-14 text-center shadow-card ring-1 ring-line/70">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-dots [mask-image:radial-gradient(ellipse_at_top,black_10%,transparent_65%)]"
      />
      <div
        aria-hidden
        className="absolute -top-20 left-1/2 -z-10 size-64 -translate-x-1/2 rounded-full bg-brand-200/40 blur-3xl"
      />
      <span
        aria-hidden
        className="mx-auto grid size-14 animate-float place-items-center rounded-2xl bg-gradient-brand text-2xl text-white shadow-glow inset-ring inset-ring-white/20"
      >
        <SparklesIcon />
      </span>
      <h2 className="mt-5 text-lg font-bold">{title}</h2>
      <div className="mx-auto mt-2 max-w-md text-ink-soft">{children}</div>
    </div>
  );
}
