import { Injectable, type OnModuleDestroy } from '@nestjs/common';
import { createTransport, type Transporter } from 'nodemailer';
import { AppConfig } from '../../../shared/config/app-config';
import { type EmailMessage, EmailSender } from '../application/email-sender';

@Injectable()
export class SmtpEmailSender extends EmailSender implements OnModuleDestroy {
  private readonly transporter: Transporter;

  constructor(private readonly config: AppConfig) {
    super();
    this.transporter = createTransport({
      host: config.email.smtp.host,
      port: config.email.smtp.port,
      secure: false,
    });
  }

  async send(message: EmailMessage): Promise<void> {
    await this.transporter.sendMail({ from: this.config.email.from, ...message });
  }

  onModuleDestroy(): void {
    this.transporter.close();
  }
}
