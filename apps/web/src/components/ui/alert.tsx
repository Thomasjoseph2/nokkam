import type { ReactNode } from 'react';
import { cn } from './cn';

const tones = {
  error: 'bg-danger-50 text-danger-600 ring-danger-600/20',
  success: 'bg-success-50 text-success-700 ring-success-700/20',
  info: 'bg-brand-50 text-brand-800 ring-brand-600/20',
  warning: 'bg-accent-50 text-accent-700 ring-accent-500/30',
} as const;

export function Alert({
  tone = 'info',
  children,
  className,
}: {
  tone?: keyof typeof tones;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('rounded-xl px-4 py-3 text-sm ring-1', tones[tone], className)}
    >
      {children}
    </div>
  );
}
