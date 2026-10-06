import { ButtonLink } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from '@/lib/config';
import { JsonLd } from '@/lib/seo/json-ld';

// Illustrative only — real campaigns arrive with Phase 2 discovery.
const EXAMPLES = [
  {
    title: 'Chicken Mandi',
    place: 'New restaurant · Kakkanad',
    regular: 250,
    offer: 99,
    distance: '1.2 km',
    spots: 38,
    when: 'Today 12–4 PM',
  },
  {
    title: 'Signature cold brew',
    place: 'New café · Edappally',
    regular: 300,
    offer: 149,
    distance: '1.5 km',
    spots: 12,
    when: 'Today 2–6 PM',
  },
  {
    title: 'Haircut & styling',
    place: 'New salon · Kaloor',
    regular: 500,
    offer: 249,
    distance: '3.1 km',
    spots: 28,
    when: 'Sat 10 AM–1 PM',
  },
];

const TESTER_STEPS = [
  { title: 'Discover', body: 'Browse new local places running campaigns near you.' },
  {
    title: 'Join solo or with friends',
    body: 'Grab a spot for yourself or bring a group of up to 10.',
  },
  {
    title: 'Visit & check in',
    body: 'Scan the QR at the counter and your offer unlocks instantly.',
  },
  { title: 'Share honest feedback', body: 'A few quick questions, seen only by the business.' },
];

const BUSINESS_POINTS = [
  {
    title: 'Real local customers',
    body: 'Verified visits from people who live nearby, not anonymous clicks.',
  },
  {
    title: 'You control capacity',
    body: 'Set spots, group sizes, dates and visiting hours that suit your kitchen or floor.',
  },
  {
    title: 'Private, actionable feedback',
    body: 'Questions you design. Answers only you see. Learn what to fix before you scale.',
  },
];

const rupees = (n: number) => `₹${n.toLocaleString('en-IN')}`;

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
      <section className="overflow-hidden">
        <Container className="grid gap-12 pt-10 pb-16 sm:pt-16 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:pt-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-700 ring-1 ring-accent-500/30">
              New places. Real offers. Honest voices.
            </p>
            <h1 className="mt-5 text-4xl leading-[1.08] font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Be the first to try new local spots, and help them get better.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink-soft text-pretty">
              Join a campaign, visit at a special tester price, and share private feedback with the
              owner. Your reward never depends on what you say.
            </p>
            <div className="mt-8 flex flex-col gap-3 xs:flex-row">
              <ButtonLink href="/register" size="lg" variant="accent">
                Start exploring
              </ButtonLink>
              <ButtonLink href="/register?as=business" size="lg" variant="secondary">
                I run a business
              </ButtonLink>
            </div>
          </div>

          <ul aria-label="Example campaigns" className="grid gap-4">
            {EXAMPLES.map((c) => (
              <li
                key={c.title}
                className="rounded-card bg-surface p-5 shadow-card ring-1 ring-line/70"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-muted">{c.place}</p>
                    <h2 className="mt-1 text-lg font-bold">{c.title}</h2>
                  </div>
                  <p className="shrink-0 text-right">
                    <span className="block text-sm text-muted line-through">
                      {rupees(c.regular)}
                    </span>
                    <span className="text-2xl font-extrabold text-accent-600">
                      {rupees(c.offer)}
                    </span>
                  </p>
                </div>
                <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
                  <span>{c.distance} away</span>
                  <span className="font-semibold text-brand-700">{c.spots} spots left</span>
                  <span>{c.when}</span>
                </p>
              </li>
            ))}
            <li className="text-center text-xs text-muted">Examples for illustration</li>
          </ul>
        </Container>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        aria-labelledby="how-heading"
        className="scroll-mt-20 bg-surface py-16 sm:py-24"
      >
        <Container>
          <h2 id="how-heading" className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            How it works
          </h2>
          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TESTER_STEPS.map((step, i) => (
              <li key={step.title} className="rounded-card bg-canvas p-6 ring-1 ring-line/70">
                <span className="grid size-10 place-items-center rounded-full bg-brand-600 font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-ink-soft">{step.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* For businesses */}
      <section
        id="for-businesses"
        aria-labelledby="biz-heading"
        className="scroll-mt-20 py-16 sm:py-24"
      >
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <div>
            <h2 id="biz-heading" className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Opening something new? Get real customers through the door.
            </h2>
            <p className="mt-4 text-lg text-ink-soft">
              Create a campaign in minutes. Locals visit at your tester price, and you get honest,
              private feedback to improve before the crowds arrive.
            </p>
            <ButtonLink href="/register?as=business" size="lg" className="mt-8">
              Create a business account
            </ButtonLink>
          </div>
          <ul className="grid gap-4">
            {BUSINESS_POINTS.map((p) => (
              <li
                key={p.title}
                className="rounded-card bg-surface p-6 shadow-card ring-1 ring-line/70"
              >
                <h3 className="text-lg font-bold">{p.title}</h3>
                <p className="mt-2 text-ink-soft">{p.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Promise */}
      <section id="our-promise" aria-labelledby="promise-heading" className="scroll-mt-20">
        <Container>
          <div className="rounded-card bg-brand-800 px-6 py-12 text-white sm:px-12">
            <h2 id="promise-heading" className="text-3xl font-extrabold tracking-tight">
              Our promise: honesty first
            </h2>
            <ul className="mt-6 grid gap-4 text-brand-50 sm:grid-cols-3">
              <li>
                <strong className="block text-white">Rewards never depend on ratings.</strong>
                You get the offer for visiting and answering, whatever you think.
              </li>
              <li>
                <strong className="block text-white">Feedback stays private.</strong>
                Only the business sees it. This is not a public review site.
              </li>
              <li>
                <strong className="block text-white">No fake reviews, ever.</strong>
                We don&apos;t sell or post ratings, and we act on abuse.
              </li>
            </ul>
          </div>
        </Container>
      </section>
    </>
  );
}
