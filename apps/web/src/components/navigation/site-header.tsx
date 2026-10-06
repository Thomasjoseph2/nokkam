import Link from 'next/link';
import { ButtonLink } from '../ui/button';
import { Container } from '../ui/container';
import { Logo } from './logo';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-canvas/85 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav aria-label="Main" className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/#for-businesses"
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-ink-soft hover:bg-ink/5 sm:inline-flex"
          >
            For businesses
          </Link>
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-sm font-medium text-ink-soft hover:bg-ink/5"
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
