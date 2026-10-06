export interface VerificationEmailInput {
  to: string;
  displayName: string;
  rawToken: string;
}

/** Auth-specific outbound messages. The adapter decides templates and links. */
export abstract class AuthEmails {
  abstract sendEmailVerification(input: VerificationEmailInput): Promise<void>;
}
