import type { ReactNode } from 'react';

export function EmptyState({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-card border border-dashed border-line bg-surface px-6 py-12 text-center">
      <h2 className="text-lg font-bold">{title}</h2>
      <div className="mx-auto mt-2 max-w-md text-ink-soft">{children}</div>
    </div>
  );
}
