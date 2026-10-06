import type { ApiErrorBody, ApiErrorDetail, ErrorCode } from '@nokkam/shared-types';

/** Error thrown by API helpers. Branch on `code`, never on `message`. */
export class ApiError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details: ApiErrorDetail[];
  readonly requestId?: string;

  constructor(status: number, body: Partial<ApiErrorBody> | undefined) {
    super(body?.message ?? 'Something went wrong. Please try again.');
    this.name = 'ApiError';
    this.status = status;
    this.code = body?.code ?? 'INTERNAL_ERROR';
    this.details = body?.details ?? [];
    this.requestId = body?.requestId;
  }

  /** Field errors keyed by path, for showing next to form inputs. */
  fieldErrors(): Record<string, string> {
    return Object.fromEntries(
      this.details.filter((d) => d.path).map((d) => [d.path as string, d.message]),
    );
  }
}
