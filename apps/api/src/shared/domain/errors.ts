/**
 * Error taxonomy shared by every module.
 *
 * `kind` is a transport-agnostic category (the presentation layer maps it to an HTTP status);
 * `code` is a stable machine-readable identifier exposed to API clients.
 * Domain and application code throw these; they never throw framework HTTP exceptions.
 */
export type ErrorKind =
  'VALIDATION' | 'UNAUTHENTICATED' | 'FORBIDDEN' | 'NOT_FOUND' | 'CONFLICT' | 'RULE_VIOLATION';

export interface ErrorDetail {
  path?: string;
  message: string;
}

export abstract class AppError extends Error {
  abstract readonly kind: ErrorKind;

  protected constructor(
    readonly code: string,
    message: string,
    readonly details?: ErrorDetail[],
  ) {
    super(message);
    this.name = new.target.name;
  }
}

/** A value failed an invariant check (bad email, negative price, ...). */
export class InvalidValueError extends AppError {
  readonly kind = 'VALIDATION' as const;
  constructor(message: string, details?: ErrorDetail[], code = 'VALIDATION_FAILED') {
    super(code, message, details);
  }
}

/** A business rule prevents the requested operation (campaign full, illegal state transition, ...). */
export class RuleViolationError extends AppError {
  readonly kind = 'RULE_VIOLATION' as const;
  constructor(code: string, message: string, details?: ErrorDetail[]) {
    super(code, message, details);
  }
}
