import { Injectable } from '@nestjs/common';
import type { RequestMeta } from '../../../shared/application/actor';
import { AuditLog } from '../../../shared/application/audit-log';
import { Clock } from '../../../shared/application/clock';
import { TransactionManager } from '../../../shared/application/transaction-manager';
import type { User } from '../../users/domain/user';
import { UserRepository } from '../../users/domain/user.repository';
import { AccountTokenPurpose } from '../domain/account-token';
import { AccountTokenRepository } from '../domain/account-token.repository';
import { InvalidOrExpiredTokenError } from '../domain/auth.errors';
import { OpaqueTokenService } from './ports/opaque-token-service';

@Injectable()
export class VerifyEmailUseCase {
  constructor(
    private readonly tokens: AccountTokenRepository,
    private readonly users: UserRepository,
    private readonly opaqueTokens: OpaqueTokenService,
    private readonly transactions: TransactionManager,
    private readonly audit: AuditLog,
    private readonly clock: Clock,
  ) {}

  async execute(rawToken: string, meta: RequestMeta): Promise<User> {
    const now = this.clock.now();
    const token = await this.tokens.findByHash(
      this.opaqueTokens.hash(rawToken),
      AccountTokenPurpose.EMAIL_VERIFICATION,
    );
    if (!token || !token.isUsableAt(now)) throw new InvalidOrExpiredTokenError();

    // Consuming the token and verifying the user succeed or fail together.
    const user = await this.transactions.run(async () => {
      if (!(await this.tokens.consume(token.id, now))) throw new InvalidOrExpiredTokenError();
      const owner = await this.users.findById(token.userId);
      if (!owner) throw new InvalidOrExpiredTokenError();
      owner.verifyEmail(now);
      await this.users.update(owner);
      return owner;
    });

    await this.audit.record({
      actorId: user.id,
      action: 'auth.email.verified',
      resourceType: 'user',
      resourceId: user.id,
      requestId: meta.requestId,
      ip: meta.ip,
    });
    return user;
  }
}
