'use client';

import type { ApiFailure, ApiSuccess } from '@nokkam/shared-types';
import { ApiError } from './errors';

const BASE = '/api/v1';
let refreshing: Promise<boolean> | null = null;

/** One refresh at a time, shared by every request that hit a 401 concurrently. */
function refreshSession(): Promise<boolean> {
  refreshing ??= fetch(`${BASE}/auth/refresh`, { method: 'POST', credentials: 'same-origin' })
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** Disable the automatic refresh-and-retry on 401 (used by auth endpoints themselves). */
  skipRefresh?: boolean;
}

/**
 * Browser-side API client. Calls the same-origin /api/v1 proxy, so HTTP-only auth cookies are
 * attached automatically and never touched by JavaScript.
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, skipRefresh, headers, ...init } = options;
  const send = () =>
    fetch(`${BASE}${path}`, {
      ...init,
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

  let res = await send();
  if (res.status === 401 && !skipRefresh && (await refreshSession())) {
    res = await send();
  }

  if (res.status === 204) return undefined as T;
  const json = (await res.json().catch(() => undefined)) as ApiSuccess<T> | ApiFailure | undefined;
  if (!res.ok || !json || 'error' in json) {
    throw new ApiError(res.status, json && 'error' in json ? json.error : undefined);
  }
  return json.data;
}
