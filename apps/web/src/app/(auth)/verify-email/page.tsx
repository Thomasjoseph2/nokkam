import type { Metadata } from 'next';
import { VerifyEmail } from '@/features/auth/components/verify-email';

export const metadata: Metadata = {
  title: 'Confirm your email',
  robots: { index: false, follow: false },
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { token } = await searchParams;
  return (
    <>
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight">Confirm your email</h1>
      <VerifyEmail token={typeof token === 'string' ? token : null} />
    </>
  );
}
