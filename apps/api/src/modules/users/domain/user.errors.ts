import { ConflictError, ForbiddenError } from '../../../shared/application/errors';
import { RuleViolationError } from '../../../shared/domain/errors';

export class EmailAlreadyRegisteredError extends ConflictError {
  constructor() {
    super('EMAIL_ALREADY_REGISTERED', 'An account with this email already exists');
  }
}

export class AccountSuspendedError extends ForbiddenError {
  constructor() {
    super('This account has been suspended', 'ACCOUNT_SUSPENDED');
  }
}

export class InvalidUserStateError extends RuleViolationError {
  constructor(message: string) {
    super('RULE_VIOLATION', message);
  }
}
