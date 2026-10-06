import { RegistrableAccountType } from '@nokkam/shared-types';
import type { Metadata } from 'next';
import Link from 'next/link';
import { RegisterForm } from '@/features/auth/components/register-form';

export const metadata: Metadata = {
  title: 'Create your account',
  alternates: { canonical: '/register' },
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { as } = await searchParams;
  const initialType =
    as === 'business' ? RegistrableAccountType.BUSINESS_OWNER : RegistrableAccountType.TESTER;
  return (
    <>
      <h1 className="text-2xl font-extrabold tracking-tight">Create your account</h1>
      <p className="mt-1 mb-6 text-ink-soft">Free for testers. Takes less than a minute.</p>
      <RegisterForm initialType={initialType} />
      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-brand-700 hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
