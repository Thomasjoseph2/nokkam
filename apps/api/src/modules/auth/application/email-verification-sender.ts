import { Injectable, Logger } from '@nestjs/common';
import { Clock } from '../../../shared/application/clock';
import { IdGenerator } from '../../../shared/application/id-generator';
import type { User } from '../../users/domain/user';
import { AccountToken, AccountTokenPurpose } from '../domain/account-token';
import { AccountTokenRepository } from '../domain/account-token.repository';
import { AuthSettings } from './auth-settings';
import { AuthEmails } from './ports/auth-emails';
import { OpaqueTokenService } from './ports/opaque-token-service';

/** Creates a fresh single-use verification token and emails the link. */
@Injectable()
export class EmailVerificationSender {
  private readonly logger = new Logger(EmailVerificationSender.name);

  constructor(
    private readonly tokens: AccountTokenRepository,
    private readonly opaqueTokens: OpaqueTokenService,
    private readonly emails: AuthEmails,
    private readonly ids: IdGenerator,
    private readonly clock: Clock,
    private readonly settings: AuthSettings,
  ) {}

  async send(user: User): Promise<void> {
    const rawToken = this.opaqueTokens.generate();
    await this.tokens.deleteOutstanding(user.id, AccountTokenPurpose.EMAIL_VERIFICATION);
    await this.tokens.insert(
      AccountToken.issue({
        id: this.ids.generate(),
        userId: user.id,
        purpose: AccountTokenPurpose.EMAIL_VERIFICATION,
        tokenHash: this.opaqueTokens.hash(rawToken),
        now: this.clock.now(),
        ttlMs: this.settings.emailVerificationTtlMs,
      }),
    );

    try {
      await this.emails.sendEmailVerification({
        to: user.email.value,
        displayName: user.displayName,
        rawToken,
      });
    } catch (error) {
      // Delivery failure must not fail the surrounding flow; the user can request a resend.
      this.logger.error({ err: error, userId: user.id }, 'Failed to send verification email');
    }
  }
}
