import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { type EmailMessage, EmailSender } from '../application/email-sender';

/** Development transport: writes emails to the log instead of sending them. */
@Injectable()
export class LogEmailSender extends EmailSender {
  constructor(private readonly logger: PinoLogger) {
    super();
    this.logger.setContext('Email');
  }

  async send(message: EmailMessage): Promise<void> {
    this.logger.info({ to: message.to, subject: message.subject }, `\n${message.text}\n`);
  }
}
