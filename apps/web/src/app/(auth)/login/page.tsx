import type { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from '@/features/auth/components/login-form';
import { safeRedirectPath } from '@/features/auth/safe-redirect';

export const metadata: Metadata = { title: 'Sign in', alternates: { canonical: '/login' } };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { next } = await searchParams;
  return (
    <>
      <h1 className="text-2xl font-extrabold tracking-tight">Welcome back</h1>
      <p className="mt-1 mb-6 text-ink-soft">Sign in to see campaigns near you.</p>
      <LoginForm redirectTo={safeRedirectPath(next)} />
      <p className="mt-6 text-center text-sm text-muted">
        New here?{' '}
        <Link href="/register" className="font-semibold text-brand-700 hover:underline">
          Create an account
        </Link>
      </p>
    </>
  );
}
