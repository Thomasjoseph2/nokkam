import { AppError, type ErrorDetail } from '../domain/errors';

export class NotFoundError extends AppError {
  readonly kind = 'NOT_FOUND' as const;
  constructor(resource: string, code = 'NOT_FOUND') {
    super(code, `${resource} not found`);
  }
}

export class ConflictError extends AppError {
  readonly kind = 'CONFLICT' as const;
  constructor(code: string, message: string, details?: ErrorDetail[]) {
    super(code, message, details);
  }
}

/** The actor is authenticated but not allowed to perform the action. */
export class ForbiddenError extends AppError {
  readonly kind = 'FORBIDDEN' as const;
  constructor(message = 'You are not allowed to perform this action', code = 'FORBIDDEN') {
    super(code, message);
  }
}

/** The request lacks valid credentials. */
export class UnauthenticatedError extends AppError {
  readonly kind = 'UNAUTHENTICATED' as const;
  constructor(message = 'Authentication required', code = 'UNAUTHENTICATED') {
    super(code, message);
  }
}

/** Optimistic-concurrency failure: the aggregate changed since it was loaded. */
export class ConcurrentModificationError extends ConflictError {
  constructor(resource: string) {
    super('CONFLICT', `${resource} was modified concurrently, please retry`);
  }
}
