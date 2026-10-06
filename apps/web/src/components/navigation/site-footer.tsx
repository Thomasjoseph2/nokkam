import Link from 'next/link';
import { SITE_NAME } from '@/lib/config';
import { Container } from '../ui/container';

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <Container className="flex flex-col gap-6 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {SITE_NAME}. Honest feedback, real local customers.
        </p>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/#how-it-works" className="hover:text-ink">
            How it works
          </Link>
          <Link href="/#for-businesses" className="hover:text-ink">
            For businesses
          </Link>
          <Link href="/#our-promise" className="hover:text-ink">
            Our promise
          </Link>
        </nav>
      </Container>
    </footer>
  );
}
