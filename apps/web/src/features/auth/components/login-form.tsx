'use client';

import { loginRequestSchema } from '@nokkam/shared-types';
import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { authApi } from '../api';
import { describeError, type FieldErrors, zodFieldErrors } from '../form-errors';

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<FieldErrors>({});

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = loginRequestSchema.safeParse({
      email: form.get('email'),
      password: form.get('password'),
    });
    if (!parsed.success) {
      setFields(zodFieldErrors(parsed.error));
      return;
    }

    setPending(true);
    setError(null);
    setFields({});
    try {
      await authApi.login(parsed.data);
      router.replace(redirectTo);
      router.refresh();
    } catch (err) {
      const described = describeError(err);
      setError(described.message);
      setFields(described.fields);
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {error ? <Alert tone="error">{error}</Alert> : null}
      <FormField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        error={fields.email}
      />
      <FormField
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        error={fields.password}
      />
      <Button type="submit" size="lg" block disabled={pending} className="mt-2">
        {pending ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}
