import { Injectable } from '@nestjs/common';
import { AppConfig } from '../../../shared/config/app-config';
import { EmailSender } from '../../notifications/application/email-sender';
import { AuthEmails, type VerificationEmailInput } from '../application/ports/auth-emails';

@Injectable()
export class EmailAuthEmails extends AuthEmails {
  constructor(
    private readonly email: EmailSender,
    private readonly config: AppConfig,
  ) {
    super();
  }

  async sendEmailVerification(input: VerificationEmailInput): Promise<void> {
    const link = `${this.config.webUrl}/verify-email?token=${encodeURIComponent(input.rawToken)}`;
    await this.email.send({
      to: input.to,
      subject: 'Confirm your email for Nokkam',
      text: [
        `Hi ${input.displayName},`,
        '',
        'Confirm your email address to start joining local campaigns:',
        link,
        '',
        "If you didn't create a Nokkam account, you can ignore this email.",
      ].join('\n'),
    });
  }
}
