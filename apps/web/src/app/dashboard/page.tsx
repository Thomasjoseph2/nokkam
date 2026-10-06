import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/features/auth/session';
import { homeFor } from '@/features/dashboard/nav-items';

export default async function DashboardIndex() {
  const user = await getCurrentUser();
  redirect(user ? homeFor(user) : '/login');
}
