import Link from 'next/link';
import { SITE_NAME } from '@/lib/config';
import { Container } from '../ui/container';
import { Logo } from './logo';

export function SiteFooter() {
  return (
    <footer className="relative mt-24 border-t border-line bg-surface">
      {/* Thin brand gradient rule ties the footer back to the palette. */}
      <div
        aria-hidden
        className="absolute inset-x-0 -top-px h-px bg-linear-to-r from-transparent via-brand-400 to-transparent"
      />
      <Container className="flex flex-col gap-6 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3">
          <Logo />
          <p>
            © {new Date().getFullYear()} {SITE_NAME}. Honest feedback, real local customers.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/#how-it-works" className="transition-colors hover:text-brand-700">
            How it works
          </Link>
          <Link href="/#for-businesses" className="transition-colors hover:text-brand-700">
            For businesses
          </Link>
          <Link href="/#our-promise" className="transition-colors hover:text-brand-700">
            Our promise
          </Link>
        </nav>
      </Container>
    </footer>
  );
}
