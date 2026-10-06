'use client';

import {
  PASSWORD_MIN_LENGTH,
  RegistrableAccountType,
  registerRequestSchema,
} from '@nokkam/shared-types';
import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/cn';
import { FormField } from '@/components/ui/form-field';
import { authApi } from '../api';
import { describeError, type FieldErrors, zodFieldErrors } from '../form-errors';

const ACCOUNT_TYPES = [
  {
    value: RegistrableAccountType.TESTER,
    title: 'I want to try places',
    body: 'Join campaigns & get offers',
  },
  {
    value: RegistrableAccountType.BUSINESS_OWNER,
    title: 'I run a business',
    body: 'Create campaigns & get feedback',
  },
] as const;

export function RegisterForm({ initialType }: { initialType: RegistrableAccountType }) {
  const router = useRouter();
  const [accountType, setAccountType] = useState<RegistrableAccountType>(initialType);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<FieldErrors>({});

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = registerRequestSchema.safeParse({
      displayName: form.get('displayName'),
      email: form.get('email'),
      password: form.get('password'),
      accountType,
    });
    if (!parsed.success) {
      setFields(zodFieldErrors(parsed.error));
      return;
    }

    setPending(true);
    setError(null);
    setFields({});
    try {
      await authApi.register(parsed.data);
      router.replace('/dashboard');
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
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink-soft">Account type</legend>
        <div className="grid grid-cols-2 gap-2">
          {ACCOUNT_TYPES.map((type) => (
            <label
              key={type.value}
              className={cn(
                'cursor-pointer rounded-xl p-3 ring-1 transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500',
                accountType === type.value
                  ? 'bg-brand-50 ring-brand-600'
                  : 'bg-surface ring-line hover:bg-canvas',
              )}
            >
              <input
                type="radio"
                name="accountType"
                value={type.value}
                checked={accountType === type.value}
                onChange={() => setAccountType(type.value)}
                className="sr-only"
              />
              <span className="block text-sm font-semibold">{type.title}</span>
              <span className="mt-0.5 block text-xs text-muted">{type.body}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {error ? <Alert tone="error">{error}</Alert> : null}
      <FormField
        label="Your name"
        name="displayName"
        autoComplete="name"
        required
        error={fields.displayName}
      />
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
        autoComplete="new-password"
        required
        minLength={PASSWORD_MIN_LENGTH}
        hint={`At least ${PASSWORD_MIN_LENGTH} characters`}
        error={fields.password}
      />
      <Button type="submit" size="lg" variant="accent" block disabled={pending} className="mt-2">
        {pending ? 'Creating account…' : 'Create account'}
      </Button>
    </form>
  );
}
