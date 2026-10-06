'use client';

import { useEffect, useRef, useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { ButtonLink } from '@/components/ui/button';
import { authApi } from '../api';
import { describeError } from '../form-errors';

type State = { status: 'verifying' } | { status: 'done' } | { status: 'failed'; message: string };

/**
 * Consumes the token with a POST from the browser. Link scanners that merely GET the page
 * therefore cannot burn the single-use token.
 */
export function VerifyEmail({ token }: { token: string | null }) {
  const [state, setState] = useState<State>(
    token
      ? { status: 'verifying' }
      : { status: 'failed', message: 'This link is missing its token.' },
  );
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    authApi
      .verifyEmail(token)
      .then(() => setState({ status: 'done' }))
      .catch((err: unknown) => setState({ status: 'failed', message: describeError(err).message }));
  }, [token]);

  if (state.status === 'verifying') return <p className="text-ink-soft">Confirming your email…</p>;

  if (state.status === 'done') {
    return (
      <div className="flex flex-col gap-4">
        <Alert tone="success">Your email is confirmed. You&apos;re all set!</Alert>
        <ButtonLink href="/dashboard" size="lg" block>
          Go to my dashboard
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Alert tone="error">{state.message}</Alert>
      <p className="text-sm text-muted">You can request a new link from your dashboard.</p>
      <ButtonLink href="/dashboard" variant="secondary" block>
        Go to dashboard
      </ButtonLink>
    </div>
  );
}
