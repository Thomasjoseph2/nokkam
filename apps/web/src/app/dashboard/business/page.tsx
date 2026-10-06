import { UserRole } from '@nokkam/shared-types';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/features/auth/session';
import { EmptyState } from '@/features/dashboard/components/empty-state';

export default async function BusinessHome() {
  const user = await getCurrentUser();
  if (!user?.roles.includes(UserRole.BUSINESS_OWNER)) redirect('/dashboard');
  return (
    <>
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Your business</h1>
      <p className="mt-1 text-ink-soft">Campaigns, participants and feedback</p>
      <div className="mt-6">
        <EmptyState title="Set up your business">
          Business profiles and campaign creation are coming next. You&apos;ll be able to set
          offers, capacity, group sizes and visiting hours here.
        </EmptyState>
      </div>
    </>
  );
}
