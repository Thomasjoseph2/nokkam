/**
 * HTTP response envelope used by every /api/v1 endpoint.
 *
 * Success: { "data": T, "meta"?: {...} }
 * Failure: { "error": { "code", "message", "details"?, "requestId"? } }
 */
export interface ApiSuccess<T, M = undefined> {
  data: T;
  meta?: M;
}

export interface ApiErrorDetail {
  /** Dot-path to the offending field, e.g. "offer.campaignPrice". */
  path?: string;
  message: string;
}

export interface ApiErrorBody {
  code: ErrorCode;
  message: string;
  details?: ApiErrorDetail[];
  requestId?: string;
}

export interface ApiFailure {
  error: ApiErrorBody;
}

export type ApiResponse<T, M = undefined> = ApiSuccess<T, M> | ApiFailure;

/**
 * Machine-readable error codes. Clients should branch on `code`, never on `message`.
 * Generic codes are listed first; module-specific codes follow.
 */
export const ErrorCode = {
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RULE_VIOLATION: 'RULE_VIOLATION',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',

  // auth / users
  EMAIL_ALREADY_REGISTERED: 'EMAIL_ALREADY_REGISTERED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  INVALID_OR_EXPIRED_TOKEN: 'INVALID_OR_EXPIRED_TOKEN',
  SESSION_REVOKED: 'SESSION_REVOKED',
} as const;
export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export interface CursorPageMeta {
  /** Opaque cursor for the next page; null when there are no more results. */
  nextCursor: string | null;
}
