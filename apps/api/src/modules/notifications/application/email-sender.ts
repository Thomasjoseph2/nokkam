export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Outbound email channel. Business modules never talk to SMTP/SES/etc. directly;
 * future channels (SMS, WhatsApp, push, in-app) get their own ports alongside this one
 * and a NotificationDispatcher will route events to channels by user preference.
 */
export abstract class EmailSender {
  abstract send(message: EmailMessage): Promise<void>;
}
