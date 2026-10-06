import { Injectable, type OnModuleDestroy } from '@nestjs/common';
import { createTransport, type Transporter } from 'nodemailer';
import { AppConfig } from '../../../shared/config/app-config';
import { type EmailMessage, EmailSender } from '../application/email-sender';

@Injectable()
export class SmtpEmailSender extends EmailSender implements OnModuleDestroy {
  private readonly transporter: Transporter;

  constructor(private readonly config: AppConfig) {
    super();
    const { host, port, secure, user, password } = config.email.smtp;
    this.transporter = createTransport({
      host,
      port,
      secure,
      auth: user && password ? { user, pass: password } : undefined,
      // Real providers must use TLS; only the local catcher (no credentials) may stay plaintext.
      requireTLS: Boolean(user) && !secure,
    });
  }

  async send(message: EmailMessage): Promise<void> {
    await this.transporter.sendMail({ from: this.config.email.from, ...message });
  }

  onModuleDestroy(): void {
    this.transporter.close();
  }
}
