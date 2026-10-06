import { Module } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { AppConfig } from '../../shared/config/app-config';
import { EmailSender } from './application/email-sender';
import { LogEmailSender } from './infrastructure/log-email-sender';
import { SmtpEmailSender } from './infrastructure/smtp-email-sender';

@Module({
  providers: [
    {
      provide: EmailSender,
      inject: [AppConfig, PinoLogger],
      useFactory: (config: AppConfig, logger: PinoLogger) =>
        config.email.transport === 'smtp'
          ? new SmtpEmailSender(config)
          : new LogEmailSender(logger),
    },
  ],
  exports: [EmailSender],
})
export class NotificationsModule {}
