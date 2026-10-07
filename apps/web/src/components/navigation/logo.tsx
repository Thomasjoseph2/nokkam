import Link from 'next/link';
import { SITE_NAME } from '@/lib/config';
import { cn } from '../ui/cn';

/** `tone="light"` is for dark backgrounds such as the auth brand panel. */
export function Logo({ href = '/', tone = 'dark' }: { href?: string; tone?: 'dark' | 'light' }) {
  return (
    <Link
      href={href}
      className={cn(
        'group inline-flex items-center gap-2.5 font-extrabold tracking-tight',
        tone === 'light' ? 'text-white' : 'text-ink',
      )}
    >
      <span
        aria-hidden
        className="relative grid size-9 place-items-center overflow-hidden rounded-xl bg-gradient-brand text-white shadow-glow transition-transform duration-300 group-hover:rotate-[-6deg]"
      >
        {/* Leaf mark: growth + freshness, the core of the brand. */}
        <svg
          viewBox="0 0 24 24"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14" />
          <path d="M5 19l7-7" />
        </svg>
        <span className="absolute -top-1 -right-1 size-3 rounded-full bg-sprout-300/80 blur-[2px]" />
      </span>
      <span className="text-lg">{SITE_NAME}</span>
    </Link>
  );
}
