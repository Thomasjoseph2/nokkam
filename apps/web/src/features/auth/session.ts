import 'server-only';

import type { CurrentUserDto } from '@nokkam/shared-types';
import { cache } from 'react';
import { ApiError } from '@/lib/api/errors';
import { serverFetch } from '@/lib/api/server';

/** The signed-in user for this request, or null. Deduplicated per request. */
export const getCurrentUser = cache(async (): Promise<CurrentUserDto | null> => {
  try {
    return await serverFetch<CurrentUserDto>('/users/me', { authenticated: true });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
});
