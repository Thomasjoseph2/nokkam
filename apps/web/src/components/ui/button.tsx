import Link from 'next/link';
import type { ComponentProps } from 'react';
import { cn } from './cn';

type Variant = 'primary' | 'accent' | 'secondary' | 'ghost';
type Size = 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors ' +
  'disabled:cursor-not-allowed disabled:opacity-60 select-none';

const variants: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800',
  accent: 'bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700',
  secondary: 'bg-surface text-ink ring-1 ring-line hover:bg-canvas',
  ghost: 'text-ink-soft hover:bg-ink/5',
};

// lg = 52px tall: comfortable thumb target for the primary mobile actions.
const sizes: Record<Size, string> = {
  md: 'h-11 px-5 text-sm',
  lg: 'h-13 px-7 text-base',
};

interface StyleProps {
  variant?: Variant;
  size?: Size;
  block?: boolean;
}

export function buttonClasses({ variant = 'primary', size = 'md', block }: StyleProps = {}) {
  return cn(base, variants[variant], sizes[size], block && 'w-full');
}

export function Button({
  variant,
  size,
  block,
  className,
  type = 'button',
  ...props
}: ComponentProps<'button'> & StyleProps) {
  return (
    <button
      type={type}
      className={cn(buttonClasses({ variant, size, block }), className)}
      {...props}
    />
  );
}

export function ButtonLink({
  variant,
  size,
  block,
  className,
  ...props
}: ComponentProps<typeof Link> & StyleProps) {
  return <Link className={cn(buttonClasses({ variant, size, block }), className)} {...props} />;
}
