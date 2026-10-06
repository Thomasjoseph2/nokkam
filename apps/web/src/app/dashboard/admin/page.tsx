import { type AdminUserSummaryDto, type CursorPageMeta, UserRole } from '@nokkam/shared-types';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/features/auth/session';
import { serverFetchWithMeta } from '@/lib/api/server';

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(iso));

export default async function AdminHome() {
  const user = await getCurrentUser();
  // UX check only; the API enforces ADMIN on /admin/* regardless.
  if (!user?.roles.includes(UserRole.ADMIN)) redirect('/dashboard');

  const { data: users } = await serverFetchWithMeta<AdminUserSummaryDto[], CursorPageMeta>(
    '/admin/users?limit=50',
    { authenticated: true },
  );

  return (
    <>
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Admin</h1>
      <p className="mt-1 text-ink-soft">Newest accounts</p>

      <ul className="mt-6 grid gap-3 md:hidden">
        {users.map((u) => (
          <li key={u.id} className="rounded-card bg-surface p-4 ring-1 ring-line/70">
            <p className="font-semibold">{u.displayName}</p>
            <p className="truncate text-sm text-muted">{u.email}</p>
            <p className="mt-2 text-xs text-ink-soft">
              {u.roles.join(', ')} · {u.status} · {u.emailVerified ? 'verified' : 'unverified'} ·{' '}
              {formatDate(u.createdAt)}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-6 hidden overflow-x-auto rounded-card bg-surface ring-1 ring-line/70 md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-muted">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">
                Name
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Email
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Roles
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Status
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Verified
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Joined
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-line/60 last:border-0">
                <td className="px-4 py-3 font-medium">{u.displayName}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{u.roles.join(', ')}</td>
                <td className="px-4 py-3">{u.status}</td>
                <td className="px-4 py-3">{u.emailVerified ? 'Yes' : 'No'}</td>
                <td className="px-4 py-3">{formatDate(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
