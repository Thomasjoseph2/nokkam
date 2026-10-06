import { Injectable } from '@nestjs/common';
import type { RequestMeta } from '../../../shared/application/actor';
import { AuditLog } from '../../../shared/application/audit-log';
import { Email } from '../../../shared/domain/email';
import { InvalidValueError } from '../../../shared/domain/errors';
import { UserRepository } from '../../users/domain/user.repository';
import { InvalidCredentialsError } from '../domain/auth.errors';
import { PasswordHasher } from './ports/password-hasher';
import type { AuthResult } from './register-user.use-case';
import { SessionIssuer } from './session-issuer';

export interface LoginUserInput {
  email: string;
  password: string;
}

@Injectable()
export class LoginUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly sessions: SessionIssuer,
    private readonly audit: AuditLog,
  ) {}

  async execute(input: LoginUserInput, meta: RequestMeta): Promise<AuthResult> {
    let email: Email;
    try {
      email = Email.create(input.email);
    } catch (error) {
      if (error instanceof InvalidValueError) throw new InvalidCredentialsError();
      throw error;
    }

    const user = await this.users.findByEmail(email);
    if (!user) {
      await this.hasher.verifyAgainstDummy(input.password);
      await this.recordFailure(null, 'unknown_email', meta);
      throw new InvalidCredentialsError();
    }

    if (!(await this.hasher.verify(user.passwordHash, input.password))) {
      await this.recordFailure(user.id, 'bad_password', meta);
      throw new InvalidCredentialsError();
    }

    // Checked only after the password, so suspension status is not disclosed to guessers.
    user.assertCanAuthenticate();

    const session = await this.sessions.issue(user, meta);
    await this.audit.record({
      actorId: user.id,
      action: 'auth.login.succeeded',
      resourceType: 'user',
      resourceId: user.id,
      requestId: meta.requestId,
      ip: meta.ip,
    });
    return { user, session };
  }

  private recordFailure(userId: string | null, reason: string, meta: RequestMeta): Promise<void> {
    return this.audit.record({
      actorId: userId,
      action: 'auth.login.failed',
      resourceType: 'user',
      resourceId: userId ?? undefined,
      metadata: { reason },
      requestId: meta.requestId,
      ip: meta.ip,
    });
  }
}
