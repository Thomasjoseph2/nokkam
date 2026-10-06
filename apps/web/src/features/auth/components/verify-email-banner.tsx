'use client';

import { useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { authApi } from '../api';
import { describeError } from '../form-errors';

export function VerifyEmailBanner({ email }: { email: string }) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | string>('idle');
  return (
    <Alert
      tone="warning"
      className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
    >
      <span>
        Please confirm <strong>{email}</strong> to join campaigns.
        {state === 'sent' ? ' A new link is on its way.' : null}
        {state !== 'idle' && state !== 'sending' && state !== 'sent' ? ` ${state}` : null}
      </span>
      <button
        type="button"
        disabled={state === 'sending' || state === 'sent'}
        onClick={async () => {
          setState('sending');
          try {
            await authApi.resendVerification();
            setState('sent');
          } catch (err) {
            setState(describeError(err).message);
          }
        }}
        className="shrink-0 self-start font-semibold underline underline-offset-2 disabled:opacity-60 sm:self-auto"
      >
        {state === 'sending' ? 'Sending…' : 'Resend email'}
      </button>
    </Alert>
  );
}
