import { Injectable } from '@nestjs/common';
import type { RequestMeta } from '../../../shared/application/actor';
import { AuditLog } from '../../../shared/application/audit-log';
import { Clock } from '../../../shared/application/clock';
import { IdGenerator } from '../../../shared/application/id-generator';
import { Email } from '../../../shared/domain/email';
import { type SelfRegistrationRole, User } from '../../users/domain/user';
import { EmailAlreadyRegisteredError } from '../../users/domain/user.errors';
import { UserRepository } from '../../users/domain/user.repository';
import { EmailVerificationSender } from './email-verification-sender';
import { PasswordHasher } from './ports/password-hasher';
import { type IssuedSession, SessionIssuer } from './session-issuer';

export interface RegisterUserInput {
  email: string;
  password: string;
  displayName: string;
  accountType: SelfRegistrationRole;
}

export interface AuthResult {
  user: User;
  session: IssuedSession;
}

@Injectable()
export class RegisterUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly sessions: SessionIssuer,
    private readonly verification: EmailVerificationSender,
    private readonly audit: AuditLog,
    private readonly ids: IdGenerator,
    private readonly clock: Clock,
  ) {}

  async execute(input: RegisterUserInput, meta: RequestMeta): Promise<AuthResult> {
    const email = Email.create(input.email);
    // Fast path for a friendly error; the unique index is the real guarantee under races.
    if (await this.users.findByEmail(email)) throw new EmailAlreadyRegisteredError();

    const user = User.register({
      id: this.ids.generate(),
      email,
      passwordHash: await this.hasher.hash(input.password),
      displayName: input.displayName,
      role: input.accountType,
      now: this.clock.now(),
    });
    await this.users.insert(user);

    await this.audit.record({
      actorId: user.id,
      action: 'auth.user.registered',
      resourceType: 'user',
      resourceId: user.id,
      metadata: { accountType: input.accountType },
      requestId: meta.requestId,
      ip: meta.ip,
    });

    await this.verification.send(user);
    return { user, session: await this.sessions.issue(user, meta) };
  }
}
