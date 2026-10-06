import { UnauthenticatedError } from '../../../shared/application/errors';
import { RuleViolationError } from '../../../shared/domain/errors';

export class InvalidCredentialsError extends UnauthenticatedError {
  constructor() {
    super('Invalid email or password', 'INVALID_CREDENTIALS');
  }
}

export class AccessTokenExpiredError extends UnauthenticatedError {
  constructor() {
    super('Access token expired', 'TOKEN_EXPIRED');
  }
}

export class SessionRevokedError extends UnauthenticatedError {
  constructor() {
    super('Session is no longer valid, please sign in again', 'SESSION_REVOKED');
  }
}

export class InvalidOrExpiredTokenError extends RuleViolationError {
  constructor() {
    super('INVALID_OR_EXPIRED_TOKEN', 'This link is invalid or has expired');
  }
}
