import type { z } from 'zod';
import { ApiError } from '@/lib/api/errors';

export type FieldErrors = Record<string, string>;

export function zodFieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.');
    out[key] ??= issue.message;
  }
  return out;
}

export function describeError(error: unknown): { message: string; fields: FieldErrors } {
  if (error instanceof ApiError) {
    if (error.code === 'RATE_LIMITED') {
      return { message: 'Too many attempts. Please wait a minute and try again.', fields: {} };
    }
    return { message: error.message, fields: error.fieldErrors() };
  }
  return { message: 'Network error. Check your connection and try again.', fields: {} };
}
