import Link from 'next/link';
import { ButtonLink } from '../ui/button';
import { Container } from '../ui/container';
import { Logo } from './logo';

export function SiteHeader() {
  return (
    <header className="glass sticky top-0 z-30 border-b border-brand-100/80 shadow-[0_1px_0_rgb(255_255_255/0.6)_inset]">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav aria-label="Main" className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/#for-businesses"
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-brand-50 hover:text-brand-800 sm:inline-flex"
          >
            For businesses
          </Link>
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-brand-50 hover:text-brand-800"
          >
            Sign in
          </Link>
          <ButtonLink href="/register" size="md">
            Join free
          </ButtonLink>
        </nav>
      </Container>
    </header>
  );
}
