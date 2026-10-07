import Link from 'next/link';
import type { ComponentProps } from 'react';
import { cn } from './cn';

type Variant = 'primary' | 'accent' | 'secondary' | 'ghost';
type Size = 'md' | 'lg';

const base =
  'group/btn inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap select-none ' +
  'transition-[transform,box-shadow,background-color,filter] duration-200 ease-out ' +
  'hover:-translate-y-px active:translate-y-0 active:scale-[0.98] ' +
  'disabled:pointer-events-none disabled:opacity-60';

// Filled variants: gradient + inset top highlight + colour-matched glow for depth.
const variants: Record<Variant, string> = {
  primary:
    'bg-gradient-brand text-white shadow-glow inset-ring inset-ring-white/15 ' +
    'hover:brightness-95 hover:shadow-[0_14px_34px_-10px_rgb(22_176_126/0.65)]',
  accent:
    'bg-gradient-accent text-white shadow-glow-accent inset-ring inset-ring-white/15 ' +
    'hover:brightness-95 hover:shadow-[0_14px_34px_-10px_rgb(255_122_26/0.65)]',
  secondary:
    'bg-surface/80 text-ink ring-1 ring-line shadow-card backdrop-blur hover:ring-brand-300 hover:bg-surface',
  ghost: 'text-ink-soft hover:bg-brand-50 hover:text-brand-800',
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
