import { ButtonLink } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main id="main" className="grid min-h-dvh place-items-center px-4 text-center">
      <div>
        <p className="text-sm font-semibold text-accent-600">404</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
          We couldn&apos;t find that page
        </h1>
        <ButtonLink href="/" className="mt-6">
          Back home
        </ButtonLink>
      </div>
    </main>
  );
}
