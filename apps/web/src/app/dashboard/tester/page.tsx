import { getCurrentUser } from '@/features/auth/session';
import { EmptyState } from '@/features/dashboard/components/empty-state';

export default async function TesterHome() {
  const user = await getCurrentUser();
  return (
    <>
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
        Hi {user?.displayName.split(' ')[0]} 👋
      </h1>
      <p className="mt-1 text-ink-soft">Nearby campaigns</p>
      <div className="mt-6">
        <EmptyState title="No campaigns near you yet">
          Campaign discovery is coming soon. Once local businesses publish campaigns, they&apos;ll
          show up here with the offer, distance and spots left.
        </EmptyState>
      </div>
    </>
  );
}
