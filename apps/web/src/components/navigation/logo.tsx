import Link from 'next/link';
import { SITE_NAME } from '@/lib/config';

export function Logo({ href = '/' }: { href?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 font-extrabold tracking-tight text-ink"
    >
      <span
        aria-hidden
        className="grid size-8 place-items-center rounded-xl bg-brand-600 text-sm text-white"
      >
        N
      </span>
      <span className="text-lg">{SITE_NAME}</span>
    </Link>
  );
}
