import { ButtonLink } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main
      id="main"
      className="relative isolate grid min-h-dvh place-items-center overflow-hidden px-4 text-center"
    >
      <div aria-hidden className="absolute inset-0 -z-10 bg-aurora" />
      <div className="animate-fade-up">
        <p className="text-gradient-brand text-8xl font-extrabold tracking-tight">404</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
          We couldn&apos;t find that page
        </h1>
        <ButtonLink href="/" size="lg" className="mt-8">
          Back home
        </ButtonLink>
      </div>
    </main>
  );
}
