import 'server-only';

import type { ApiFailure, ApiSuccess } from '@nokkam/shared-types';
import { cookies } from 'next/headers';
import { API_URL } from '../config';
import { ApiError } from './errors';

interface ServerFetchOptions {
  /** Forward the visitor's auth cookies. Only for per-user, uncached data. */
  authenticated?: boolean;
  /** Seconds to cache public responses (ISR-style). Ignored for authenticated calls. */
  revalidate?: number;
}

/**
 * Server-side API client used by Server Components. Talks to the API directly (no proxy hop).
 * Authenticated calls are never cached, so one user's data can never be served to another.
 */
export async function serverFetchWithMeta<T, M = undefined>(
  path: string,
  options: ServerFetchOptions = {},
): Promise<{ data: T; meta: M }> {
  const init: RequestInit & { next?: { revalidate: number } } = {
    headers: { Accept: 'application/json' },
  };
  if (options.authenticated) {
    init.headers = { ...init.headers, Cookie: (await cookies()).toString() };
    init.cache = 'no-store';
  } else if (options.revalidate !== undefined) {
    init.next = { revalidate: options.revalidate };
  }

  const res = await fetch(`${API_URL}/api/v1${path}`, init);
  const json = (await res.json().catch(() => undefined)) as
    ApiSuccess<T, M> | ApiFailure | undefined;
  if (!res.ok || !json || 'error' in json) {
    throw new ApiError(res.status, json && 'error' in json ? json.error : undefined);
  }
  return { data: json.data, meta: json.meta as M };
}

export async function serverFetch<T>(path: string, options: ServerFetchOptions = {}): Promise<T> {
  return (await serverFetchWithMeta<T>(path, options)).data;
}
