import type { ComponentType, ReactNode, SVGProps } from 'react';
import { ButtonLink } from '@/components/ui/button';
import { cn } from '@/components/ui/cn';
import { Container } from '@/components/ui/container';
import {
  ArrowRightIcon,
  BadgeCheckIcon,
  CheckIcon,
  ClockIcon,
  CompassIcon,
  LockIcon,
  MapPinIcon,
  MessageIcon,
  QrIcon,
  ShieldCheckIcon,
  SlidersIcon,
  SparklesIcon,
  UsersIcon,
} from '@/components/ui/icons';
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from '@/lib/config';
import { JsonLd } from '@/lib/seo/json-ld';

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

// Illustrative only — real campaigns arrive with Phase 2 discovery.
const EXAMPLES = [
  {
    title: 'Chicken Mandi',
    place: 'New restaurant · Kakkanad',
    emoji: '🍗',
    tile: 'from-accent-100 to-accent-200',
    regular: 250,
    offer: 99,
    distance: '1.2 km',
    spots: 38,
    when: 'Today 12–4 PM',
  },
  {
    title: 'Signature cold brew',
    place: 'New café · Edappally',
    emoji: '☕',
    tile: 'from-lagoon-100 to-lagoon-300',
    regular: 300,
    offer: 149,
    distance: '1.5 km',
    spots: 12,
    when: 'Today 2–6 PM',
  },
  {
    title: 'Haircut & styling',
    place: 'New salon · Kaloor',
    emoji: '✂️',
    tile: 'from-brand-100 to-brand-300',
    regular: 500,
    offer: 249,
    distance: '3.1 km',
    spots: 28,
    when: 'Sat 10 AM–1 PM',
  },
];

const TESTER_STEPS: { title: string; body: string; icon: IconType }[] = [
  {
    title: 'Discover',
    body: 'Browse new local places running campaigns near you.',
    icon: CompassIcon,
  },
  {
    title: 'Join solo or with friends',
    body: 'Grab a spot for yourself or bring a group of up to 10.',
    icon: UsersIcon,
  },
  {
    title: 'Visit & check in',
    body: 'Scan the QR at the counter and your offer unlocks instantly.',
    icon: QrIcon,
  },
  {
    title: 'Share honest feedback',
    body: 'A few quick questions, seen only by the business.',
    icon: MessageIcon,
  },
];

const BUSINESS_POINTS: { title: string; body: string; icon: IconType }[] = [
  {
    title: 'Real local customers',
    body: 'Verified visits from people who live nearby, not anonymous clicks.',
    icon: BadgeCheckIcon,
  },
  {
    title: 'You control capacity',
    body: 'Set spots, group sizes, dates and visiting hours that suit your kitchen or floor.',
    icon: SlidersIcon,
  },
  {
    title: 'Private, actionable feedback',
    body: 'Questions you design. Answers only you see. Learn what to fix before you scale.',
    icon: LockIcon,
  },
];

const PROMISES: { title: string; body: string; icon: IconType }[] = [
  {
    title: 'Rewards never depend on ratings.',
    body: 'You get the offer for visiting and answering, whatever you think.',
    icon: SparklesIcon,
  },
  {
    title: 'Feedback stays private.',
    body: 'Only the business sees it. This is not a public review site.',
    icon: LockIcon,
  },
  {
    title: 'No fake reviews, ever.',
    body: "We don't sell or post ratings, and we act on abuse.",
    icon: ShieldCheckIcon,
  },
];

const rupees = (n: number) => `₹${n.toLocaleString('en-IN')}`;
const percentOff = (regular: number, offer: number) => Math.round((1 - offer / regular) * 100);

function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        'inline-flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-brand-700 uppercase',
        className,
      )}
    >
      <span aria-hidden className="h-px w-6 bg-linear-to-r from-brand-500 to-lagoon-500" />
      {children}
    </p>
  );
}

function IconTile({ icon: Icon, className }: { icon: IconType; className?: string }) {
  return (
    <span
      className={cn(
        'grid size-12 place-items-center rounded-2xl bg-gradient-brand text-xl text-white shadow-glow inset-ring inset-ring-white/20',
        className,
      )}
    >
      <Icon />
    </span>
  );
}

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            { '@type': 'Organization', name: SITE_NAME, url: SITE_URL, description: SITE_TAGLINE },
            { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
          ],
        }}
      />

      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        {/* Layered background: aurora wash, drifting colour blobs, and a faded dot grid. */}
        <div aria-hidden className="absolute inset-0 -z-10 bg-aurora" />
        <div
          aria-hidden
          className="absolute -top-24 -left-24 -z-10 size-96 animate-blob rounded-full bg-brand-300/40 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute top-10 right-0 -z-10 size-[28rem] animate-blob rounded-full bg-lagoon-300/30 blur-3xl [animation-delay:-6s]"
        />
        <div
          aria-hidden
          className="absolute bottom-0 left-1/3 -z-10 size-72 animate-blob rounded-full bg-sprout-200/50 blur-3xl [animation-delay:-12s]"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-dots [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]"
        />
        {/* Fade into the next section instead of ending on a hard edge. */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-linear-to-b from-transparent to-surface"
        />

        <Container className="grid gap-14 pt-12 pb-20 sm:pt-16 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:pt-24 lg:pb-28">
          <div className="animate-fade-up">
            <p className="inline-flex items-center gap-2 rounded-full bg-surface/80 py-1 pr-3 pl-1.5 text-xs font-semibold text-brand-800 shadow-card ring-1 ring-brand-200 backdrop-blur">
              <span className="relative grid size-5 place-items-center rounded-full bg-gradient-brand">
                <span className="size-1.5 animate-pulse-ring rounded-full bg-white" />
              </span>
              New places. Real offers. Honest voices.
            </p>
            <h1 className="mt-6 text-4xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Be the first to try <span className="text-gradient-brand">new local spots</span>, and
              help them get better.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink-soft text-pretty">
              Join a campaign, visit at a special tester price, and share private feedback with the
              owner. Your reward never depends on what you say.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/register" size="lg" variant="accent">
                Start exploring
                <ArrowRightIcon className="transition-transform group-hover/btn:translate-x-0.5" />
              </ButtonLink>
              <ButtonLink href="/register?as=business" size="lg" variant="secondary">
                I run a business
              </ButtonLink>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-ink-soft">
              {['Free for testers', 'Private feedback', 'No fake reviews'].map((item) => (
                <li key={item} className="inline-flex items-center gap-1.5">
                  <span className="grid size-5 place-items-center rounded-full bg-brand-100 text-xs text-brand-700">
                    <CheckIcon strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative isolate">
            {/* Soft gradient halo grounds the floating cards. */}
            <div
              aria-hidden
              className="absolute inset-6 -z-10 rounded-[2.5rem] bg-linear-to-br from-brand-400/30 via-lagoon-400/20 to-sprout-300/30 blur-2xl"
            />
            <ul aria-label="Example campaigns" className="grid gap-4">
              {EXAMPLES.map((c, i) => (
                <li
                  key={c.title}
                  style={{ animationDelay: `${150 + i * 120}ms` }}
                  className={cn(
                    'animate-fade-up',
                    i === 1 && 'lg:translate-x-8',
                    i === 2 && 'lg:-translate-x-2',
                  )}
                >
                  <article className="glass group rounded-card p-5 shadow-lift ring-1 ring-white/80 transition duration-300 hover:-translate-y-1 hover:ring-brand-200">
                    <div className="flex items-start gap-4">
                      <span
                        aria-hidden
                        className={cn(
                          'grid size-12 shrink-0 place-items-center rounded-2xl bg-linear-to-br text-2xl',
                          c.tile,
                        )}
                      >
                        {c.emoji}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-muted">{c.place}</p>
                        <h2 className="mt-0.5 text-lg font-bold">{c.title}</h2>
                      </div>
                      <p className="shrink-0 text-right">
                        <span className="block text-sm text-muted line-through">
                          {rupees(c.regular)}
                        </span>
                        <span className="text-2xl font-extrabold text-accent-700">
                          {rupees(c.offer)}
                        </span>
                      </p>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium text-ink-soft">
                      <span className="rounded-full bg-accent-50 px-2.5 py-1 font-bold text-accent-700 ring-1 ring-accent-200">
                        {percentOff(c.regular, c.offer)}% off
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-canvas px-2.5 py-1 ring-1 ring-line">
                        <MapPinIcon className="text-brand-600" />
                        {c.distance}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-canvas px-2.5 py-1 ring-1 ring-line">
                        <ClockIcon className="text-brand-600" />
                        {c.when}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 font-bold text-brand-700 ring-1 ring-brand-200">
                        <span className="size-1.5 rounded-full bg-brand-500" />
                        {c.spots} spots left
                      </span>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-center text-xs text-muted">Examples for illustration</p>
          </div>
        </Container>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        aria-labelledby="how-heading"
        className="relative scroll-mt-20 border-b border-line/60 bg-surface py-20 sm:py-28"
      >
        <Container>
          <div className="max-w-2xl">
            <Eyebrow>For testers</Eyebrow>
            <h2
              id="how-heading"
              className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl"
            >
              How it works
            </h2>
            <p className="mt-3 text-lg text-ink-soft">
              Four simple steps from discovery to a better local scene.
            </p>
          </div>
          <div className="relative mt-12">
            {/* Connector line that links the steps on wide screens. */}
            <div
              aria-hidden
              className="absolute top-12 right-[12%] left-[12%] hidden h-px bg-linear-to-r from-brand-200 via-lagoon-300 to-brand-200 lg:block"
            />
            <ol className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {TESTER_STEPS.map((step, i) => (
                <li
                  key={step.title}
                  className="group relative overflow-hidden rounded-card bg-canvas p-6 ring-1 ring-line/70 transition duration-300 hover:-translate-y-1 hover:bg-surface hover:shadow-lift hover:ring-brand-200"
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute top-2 right-4 text-6xl leading-none font-extrabold text-brand-100 transition-colors group-hover:text-brand-200/70"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <IconTile icon={step.icon} className="relative" />
                  <h3 className="relative mt-5 text-lg font-bold">
                    <span className="sr-only">Step {i + 1}: </span>
                    {step.title}
                  </h3>
                  <p className="relative mt-2 text-ink-soft">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      {/* For businesses */}
      <section
        id="for-businesses"
        aria-labelledby="biz-heading"
        className="relative isolate scroll-mt-20 overflow-hidden py-20 sm:py-28"
      >
        <div
          aria-hidden
          className="absolute top-1/2 -right-40 -z-10 size-[32rem] -translate-y-1/2 rounded-full bg-lagoon-100 blur-3xl"
        />
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:items-center">
          <div>
            <Eyebrow>For businesses</Eyebrow>
            <h2
              id="biz-heading"
              className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl"
            >
              Opening something new?{' '}
              <span className="text-gradient-brand">Get real customers through the door.</span>
            </h2>
            <p className="mt-5 text-lg text-ink-soft">
              Create a campaign in minutes. Locals visit at your tester price, and you get honest,
              private feedback to improve before the crowds arrive.
            </p>
            <ButtonLink href="/register?as=business" size="lg" className="mt-9">
              Create a business account
              <ArrowRightIcon className="transition-transform group-hover/btn:translate-x-0.5" />
            </ButtonLink>
          </div>
          <ul className="grid gap-4">
            {BUSINESS_POINTS.map((p) => (
              <li
                key={p.title}
                className="group flex gap-5 rounded-card bg-surface p-6 shadow-card ring-1 ring-line/70 transition duration-300 hover:-translate-y-0.5 hover:shadow-lift hover:ring-brand-200"
              >
                <IconTile
                  icon={p.icon}
                  className="shrink-0 transition-transform duration-300 group-hover:scale-105"
                />
                <div>
                  <h3 className="text-lg font-bold">{p.title}</h3>
                  <p className="mt-1.5 text-ink-soft">{p.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Promise */}
      <section id="our-promise" aria-labelledby="promise-heading" className="scroll-mt-20">
        <Container>
          <div className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-deep px-6 py-14 text-white shadow-lift sm:px-12 sm:py-16">
            {/* Concentric rings echo a ripple: one honest voice spreading outward. */}
            <div
              aria-hidden
              className="absolute -top-32 -right-32 -z-10 size-96 rounded-full ring-1 ring-white/10"
            />
            <div
              aria-hidden
              className="absolute -top-16 -right-16 -z-10 size-64 rounded-full ring-1 ring-white/10"
            />
            <div
              aria-hidden
              className="absolute inset-0 -z-10 bg-dots opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent)]"
            />

            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold tracking-[0.14em] text-sprout-200 uppercase ring-1 ring-white/15">
              <ShieldCheckIcon /> Our promise
            </p>
            <h2
              id="promise-heading"
              className="mt-4 max-w-xl text-3xl font-extrabold tracking-tight sm:text-4xl"
            >
              Honesty first. <span className="text-brand-300">Always.</span>
            </h2>
            <ul className="mt-10 grid gap-4 sm:grid-cols-3">
              {PROMISES.map((p) => (
                <li
                  key={p.title}
                  className="rounded-2xl bg-white/[0.06] p-5 ring-1 ring-white/10 backdrop-blur-sm transition-colors hover:bg-white/10"
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-white/10 text-lg text-brand-200 ring-1 ring-white/15">
                    <p.icon />
                  </span>
                  <strong className="mt-4 block text-white">{p.title}</strong>
                  <span className="mt-1 block text-brand-100/90">{p.body}</span>
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-col gap-3 xs:flex-row">
              <ButtonLink href="/register" size="lg" variant="accent">
                Join free
                <ArrowRightIcon className="transition-transform group-hover/btn:translate-x-0.5" />
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
